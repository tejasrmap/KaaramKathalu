import crypto from 'crypto';

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
        delayMs *= 2; // exponential backoff: 300ms -> 600ms -> 1200ms
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
    const userId = fields.userId?.stringValue || 'KK-USER-GUEST';
    
    const customer = getFieldValue(fields.customer) || {};
    const customerPhone = customer.phone || '7676644366';

    if (status !== 'payment_pending') {
      return res.status(400).json({ error: `Order is not in payment_pending status. Current: ${status}` });
    }

    // 2. Build PhonePe Payment Request Payload
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const phonepeApiKey = process.env.PHONEPE_API_KEY;
    const keyIndex = process.env.PHONEPE_KEY_INDEX || '1';
    const env = process.env.PHONEPE_ENV || 'production';
    
    // Fallback to vercel system url or window origin if APP_URL is not set
    const appUrl = process.env.APP_URL || (req.headers.host ? `https://${req.headers.host}` : 'https://www.kaaramkathalu.in');

    if (!merchantId || !phonepeApiKey) {
      return res.status(500).json({ error: 'PhonePe credentials are not configured on the server.' });
    }

    const payload = {
      merchantId: merchantId,
      merchantTransactionId: orderId,
      merchantUserId: userId,
      amount: Math.round(total * 100), // PhonePe expects amount in paise
      redirectUrl: `${appUrl}/api/pay-callback`,
      redirectMode: "POST",
      callbackUrl: `${appUrl}/api/pay-callback`,
      mobileNumber: customerPhone.replace(/\D/g, '').slice(-10),
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    // 3. Generate SHA256 verify signature
    const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToSign = base64 + "/pg/v1/pay" + phonepeApiKey;
    const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    // 4. Request PhonePe Gateway URL
    const phonepeHost = env === 'production' 
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    
    const phonepeUrl = `${phonepeHost}/pg/v1/pay`;
    const response = await fetch(phonepeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({ request: base64 })
    });

    const data = await response.json();
    if (data.success && data.data && data.data.instrumentResponse && data.data.instrumentResponse.redirectInfo) {
      return res.status(200).json({ url: data.data.instrumentResponse.redirectInfo.url });
    } else {
      console.error("PhonePe pay endpoint error:", data);
      const detailedError = data.message || (data.code ? `PhonePe Gateway Error Code: ${data.code}` : null) || 'Failed to initiate payment with PhonePe';
      return res.status(400).json({ error: detailedError });
    }
  } catch (error) {
    console.error("Payment initialization error:", error);
    return res.status(500).json({ error: error.message || 'Internal server error during payment initialization' });
  }
}
