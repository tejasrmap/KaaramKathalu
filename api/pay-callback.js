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

  const appUrl = process.env.APP_URL || (req.headers.host ? `https://${req.headers.host}` : 'https://www.kaaramkathalu.in');
  
  let orderId = req.query.merchantOrderId || req.query.orderId || req.query.transactionId || req.query.id;
  let isS2SCallback = req.method === 'POST';

  try {
    // 1. If it's a POST request (S2S Callback), decode request body response payload to get orderId
    if (req.method === 'POST' && req.body) {
      let payload = req.body;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {}
      }
      
      const base64Response = payload.response;
      if (base64Response) {
        try {
          const decoded = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf-8'));
          const responseData = decoded.data || {};
          if (responseData.merchantOrderId) {
            orderId = responseData.merchantOrderId;
          }
        } catch (err) {
          console.error("Failed to decode S2S callback body payload:", err);
        }
      }
    }

    if (!orderId) {
      console.error("PhonePe callback received without a valid orderId. Method:", req.method, "Query:", req.query);
      if (isS2SCallback) {
        return res.status(400).json({ error: "Missing orderId" });
      } else {
        res.writeHead(302, { Location: `${appUrl}/checkout?status=failure` });
        res.end();
        return;
      }
    }

    // 2. Fetch PhonePe V2 Credentials & Generate Token
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1';
    const env = process.env.PHONEPE_ENV || 'production';

    if (!clientId || !clientSecret) {
      throw new Error("PhonePe V2 credentials missing on the server.");
    }

    const token = await getOAuthToken(clientId, clientSecret, clientVersion, env);

    // 3. Query PhonePe V2 Order Status API directly for verification (100% Secure)
    const phonepeHost = env === 'production' 
      ? 'https://api.phonepe.com'
      : 'https://api-preprod.phonepe.com';
    
    const statusUrl = `${phonepeHost}/apis/pg/checkout/v2/order/${orderId}/status`;
    const statusRes = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      }
    });

    if (!statusRes.ok) {
      const errText = await statusRes.text();
      throw new Error(`PhonePe status query failed for order ${orderId}: ${statusRes.status} - ${errText}`);
    }

    const statusData = await statusRes.json();
    const isSuccess = statusData.state === 'COMPLETED';
    const paymentId = (statusData.paymentDetails && statusData.paymentDetails.length > 0)
      ? statusData.paymentDetails[0].transactionId
      : 'PHONEPE-V2-' + Date.now();

    // 4. Fetch Order Document from Firestore
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
    const orderDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?key=${firebaseApiKey}`;

    const orderDocRes = await fetch(orderDocUrl);
    if (!orderDocRes.ok) {
      throw new Error(`Order ${orderId} document fetch returned status ${orderDocRes.status}`);
    }

    const orderDocRaw = await orderDocRes.json();
    const fields = orderDocRaw.fields || {};
    const currentStatus = fields.status?.stringValue;
    const total = getFieldValue(fields.total) || 0;
    const items = getFieldValue(fields.items) || [];
    const customer = getFieldValue(fields.customer) || {};

    // Prevent duplicate processing if already marked complete
    if (currentStatus === 'pending' || currentStatus === 'Shipped') {
      const existingWaybill = fields.waybill?.stringValue || '';
      if (isS2SCallback) {
        return res.status(200).json({ success: true, message: "Already processed" });
      } else {
        res.writeHead(302, { Location: `${appUrl}/checkout?status=success&id=${orderId}&waybill=${existingWaybill}` });
        res.end();
        return;
      }
    }

    if (isSuccess) {
      // ── PAYMENT SUCCESS FLOW ──
      console.log(`V2 Payment successful for order: ${orderId}. Starting shipment booking...`);
      let waybill = "";
      const delhiveryToken = process.env.VITE_DELHIVERY_API_TOKEN;

      // Book shipment in Delhivery
      if (delhiveryToken) {
        try {
          const itemsList = items.map(item => `${item.name} (x${item.quantity})`).join(', ') || "Andhra Delicacies";
          const totalWeightGrams = items.reduce((acc, item) => acc + (Number(item.weightGrams) || 500) * Number(item.quantity), 0);
          
          let cleanedPhone = (customer.phone || "7676644366").replace(/\D/g, '');
          if (cleanedPhone.length === 12 && cleanedPhone.startsWith('91')) cleanedPhone = cleanedPhone.substring(2);
          if (cleanedPhone.length === 11 && cleanedPhone.startsWith('0')) cleanedPhone = cleanedPhone.substring(1);
          if (cleanedPhone.length !== 10) cleanedPhone = "7676644366";

          let warehouseName = "Kaaram Kathalu";
          try {
            const settingsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/general?key=${firebaseApiKey}`;
            const settingsRes = await fetch(settingsUrl);
            if (settingsRes.ok) {
              const settingsData = await settingsRes.json();
              if (settingsData.fields?.delhiveryWarehouseName?.stringValue) {
                warehouseName = settingsData.fields.delhiveryWarehouseName.stringValue;
              }
            }
          } catch (e) {
            console.warn("Failed to load settings in callback, using default warehouse name:", e);
          }

          const delhiveryPayload = {
            format: 'json',
            data: JSON.stringify({
              shipments: [{
                waybill: "",
                order: orderId,
                product: itemsList,
                products_desc: itemsList,
                package_desc: itemsList,
                name: customer.name || "Customer",
                add: customer.address || "",
                city: customer.city || "",
                state: "Karnataka",
                pin: Number(customer.pincode) || 560043,
                phone: cleanedPhone,
                country: "India",
                consignee: {
                  name: customer.name || "Customer",
                  address: customer.address || "",
                  city: customer.city || "",
                  state: "Karnataka",
                  pincode: Number(customer.pincode) || 560043,
                  phone: cleanedPhone
                },
                payment_mode: "Pre-paid",
                package_type: "Prepaid",
                cod_amount: 0,
                total_amount: total,
                declared_value: total,
                actual_weight: totalWeightGrams,
                volumetric_weight: totalWeightGrams,
                length: 10,
                width: 10,
                height: 10,
                pickup_location: {
                  name: warehouseName,
                  add: "002 Ground Floor Spoorthi Vaibhava Apartment, 6th A Cross Trinity Enclave, Banjara Layout, Horamavu",
                  city: "Bangalore",
                  pin: 560043,
                  phone: "7676644366"
                }
              }]
            })
          };

          const response = await fetch(`https://track.delhivery.com/api/cmu/create.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${delhiveryToken}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(delhiveryPayload).toString()
          });

          if (response.ok) {
            const resData = await response.json();
            if (resData.success && resData.packages && resData.packages.length > 0) {
              waybill = resData.packages[0].waybill;
            } else if (resData.pickups && resData.pickups.length > 0 && resData.pickups[0].waybills && resData.pickups[0].waybills.length > 0) {
              const waybillObj = resData.pickups[0].waybills[0];
              if (waybillObj.status === 'Success' || waybillObj.waybill) {
                waybill = waybillObj.waybill;
              }
            }
          }
        } catch (delhiveryError) {
          console.error("Delhivery booking failed in payment callback:", delhiveryError);
        }
      }

      // Update Firestore Order status to paid ('Shipped' if waybill exists, else 'pending')
      const updatePayload = {
        fields: {
          customer: orderDocRaw.fields.customer,
          userId: orderDocRaw.fields.userId,
          items: orderDocRaw.fields.items,
          total: orderDocRaw.fields.total,
          shippingCost: orderDocRaw.fields.shippingCost,
          createdAt: orderDocRaw.fields.createdAt,
          status: { stringValue: waybill ? 'Shipped' : 'pending' },
          paymentId: { stringValue: paymentId },
          paidAt: { stringValue: new Date().toISOString() },
          ...(waybill ? {
            waybill: { stringValue: waybill },
            carrier: { stringValue: 'Delhivery' },
            shippedAt: { stringValue: new Date().toISOString() }
          } : {})
        }
      };

      const updateRes = await fetch(`${orderDocUrl}&updateMask.fieldPaths=status&updateMask.fieldPaths=paymentId&updateMask.fieldPaths=paidAt${waybill ? '&updateMask.fieldPaths=waybill&updateMask.fieldPaths=carrier&updateMask.fieldPaths=shippedAt' : ''}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!updateRes.ok) {
        console.error("Failed to update Firestore order status after successful V2 payment:", await updateRes.text());
      }

      if (isS2SCallback) {
        return res.status(200).json({ success: true, waybill: waybill });
      } else {
        res.writeHead(302, { Location: `${appUrl}/checkout?status=success&id=${orderId}&waybill=${waybill}` });
        res.end();
        return;
      }
    } else {
      // ── PAYMENT FAILURE FLOW ──
      console.warn(`V2 Payment failed/cancelled for order: ${orderId}. Restoring inventory stocks...`);

      // Restore product stock in Firestore
      for (const item of items) {
        if (item.docId && item.quantity) {
          try {
            const productUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${item.docId}?key=${firebaseApiKey}`;
            const prodRes = await fetch(productUrl);
            if (prodRes.ok) {
              const prodData = await prodRes.json();
              const currentStock = getFieldValue(prodData.fields?.stock) || 0;
              
              const updateProdPayload = {
                fields: {
                  stock: { integerValue: currentStock + Number(item.quantity) }
                }
              };

              await fetch(`${productUrl}&updateMask.fieldPaths=stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateProdPayload)
              });
            }
          } catch (restoreError) {
            console.error(`Failed to restore stock for product docId: ${item.docId}:`, restoreError);
          }
        }
      }

      // Update Firestore Order status to payment_failed
      const updateFailPayload = {
        fields: {
          customer: orderDocRaw.fields.customer,
          userId: orderDocRaw.fields.userId,
          items: orderDocRaw.fields.items,
          total: orderDocRaw.fields.total,
          shippingCost: orderDocRaw.fields.shippingCost,
          createdAt: orderDocRaw.fields.createdAt,
          status: { stringValue: 'payment_failed' }
        }
      };

      await fetch(`${orderDocUrl}&updateMask.fieldPaths=status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateFailPayload)
      });

      if (isS2SCallback) {
        return res.status(200).json({ success: true, state: statusData.state });
      } else {
        res.writeHead(302, { Location: `${appUrl}/checkout?status=failure&id=${orderId}` });
        res.end();
        return;
      }
    }
  } catch (error) {
    console.error("Error inside pay-callback serverless handler:", error);
    if (isS2SCallback) {
      return res.status(500).json({ error: error.message });
    } else {
      res.writeHead(302, { Location: `${appUrl}/checkout?status=failure` });
      res.end();
    }
  }
}
