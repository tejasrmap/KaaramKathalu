function getFieldValue(field) {
  if (!field) return null;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return parseInt(field.integerValue, 10);
  if ('doubleValue' in field) return parseFloat(field.doubleValue);
  if ('booleanValue' in field) return field.booleanValue;
  if ('mapValue' in field) {
    const res = {};
    for (const [k, v] of Object.entries(field.mapValue.fields || {})) {
      res[k] = getFieldValue(v);
    }
    return res;
  }
  if ('arrayValue' in field) {
    return (field.arrayValue.values || []).map(getFieldValue);
  }
  return null;
}

// Fetch PhonePe OAuth Token helper
async function getOAuthToken(clientId, clientSecret, clientVersion, env) {
  const postData = new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: "client_credentials"
  }).toString();

  const host = env === 'production' 
    ? 'https://api.phonepe.com' 
    : 'https://api-preprod.phonepe.com';

  const response = await fetch(`${host}/apis/identity-manager/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: postData
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Failed to fetch OAuth token: ${response.status} - ${errBody}`);
  }

  const data = await response.json();
  return data.access_token;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId parameter' });
  }

  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
    
    if (!projectId || !firebaseApiKey) {
      return res.status(500).json({ error: 'Firebase configuration missing on the server.' });
    }

    // 1. Fetch Order from Firestore REST API with retry loop to handle replication delay (eventual consistency)
    const orderDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?key=${firebaseApiKey}`;
    
    let orderRes;
    let retries = 4;
    let delayMs = 300;
    
    for (let i = 0; i < retries; i++) {
      orderRes = await fetch(orderDocUrl);
      if (orderRes.ok) {
        break;
      }
      if (i < retries - 1) {
        console.warn(`Order ${orderId} not found in Firestore REST API yet, retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // exponential backoff
      }
    }
    
    if (!orderRes.ok) {
      return res.status(404).json({ error: `Order ${orderId} not found in database. Please try again.` });
    }
    
    const orderDataRaw = await orderRes.json();
    const fields = orderDataRaw.fields || {};
    
    // Parse order fields
    const status = fields.status?.stringValue;
    const total = getFieldValue(fields.total);

    if (status !== 'payment_pending') {
      return res.status(400).json({ error: `Order is not in payment_pending status. Current: ${status}` });
    }

    // 2. Fetch PhonePe V2 Credentials
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1';
    const env = process.env.PHONEPE_ENV || 'production';
    const appUrl = process.env.APP_URL || (req.headers.host ? `https://${req.headers.host}` : 'https://www.kaaramkathalu.in');

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'PhonePe V2 credentials are not configured on the server.' });
    }

    // 3. Generate OAuth Access Token
    let token;
    try {
      token = await getOAuthToken(clientId, clientSecret, clientVersion, env);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to authenticate with PhonePe OAuth server.' });
    }

    // 4. Request PhonePe V2 Checkout Pay Link
    const phonepeHost = env === 'production' 
      ? 'https://api.phonepe.com'
      : 'https://api-preprod.phonepe.com';
    
    const phonepeUrl = `${phonepeHost}/apis/pg/checkout/v2/pay`;
    
    const payload = {
      merchantOrderId: orderId,
      amount: Math.round(total * 100), // paise
      expireAfter: 1200,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: `Kaaram Kathalu Order ${orderId}`,
        merchantUrls: {
          redirectUrl: `${appUrl}/api/pay-callback?merchantOrderId=${orderId}`
        }
      }
    };

    const response = await fetch(phonepeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok && data.redirectUrl) {
      return res.status(200).json({ url: data.redirectUrl });
    } else {
      console.error("PhonePe V2 pay endpoint error:", data);
      const detailedError = data.message || (data.code ? `PhonePe V2 Error Code: ${data.code}` : null) || 'Failed to initiate payment with PhonePe';
      return res.status(400).json({ error: detailedError });
    }
  } catch (error) {
    console.error("Payment initialization error:", error);
    return res.status(500).json({ error: error.message || 'Internal server error during payment initialization' });
  }
}
