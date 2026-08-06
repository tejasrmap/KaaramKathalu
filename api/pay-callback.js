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

  const appUrl = process.env.APP_URL || (req.headers.host ? `https://${req.headers.host}` : 'https://www.kaaramkathalu.in');

  try {
    // 1. Verify Callback Checksum Signature from PhonePe
    let bodyResponse = '';
    
    // Express/Vercel body parsing compatibility
    if (typeof req.body === 'string') {
      bodyResponse = req.body;
    } else if (req.body && req.body.response) {
      bodyResponse = req.body.response;
    } else {
      // If POST body is empty, redirect user back to checkout failure state
      console.warn("PhonePe callback received empty body payload");
      res.writeHead(302, { Location: `${appUrl}/checkout?status=failure` });
      res.end();
      return;
    }

    const xVerifyHeader = req.headers['x-verify'];
    const phonepeApiKey = process.env.PHONEPE_API_KEY;
    const keyIndex = process.env.PHONEPE_KEY_INDEX || '1';

    if (bodyResponse && xVerifyHeader && phonepeApiKey) {
      const stringToVerify = bodyResponse + phonepeApiKey;
      const sha256 = crypto.createHash('sha256').update(stringToVerify).digest('hex');
      const calculatedChecksum = sha256 + "###" + keyIndex;

      if (calculatedChecksum !== xVerifyHeader) {
        console.error("PhonePe callback signature verification failed!");
        return res.status(401).send("Unauthorized callback payload");
      }
    }

    // 2. Decode Payload and Extract Details
    const decoded = JSON.parse(Buffer.from(bodyResponse, 'base64').toString('utf-8'));
    const isSuccess = decoded.success && decoded.code === 'PAYMENT_SUCCESS';
    const orderId = decoded.data?.merchantTransactionId;
    const paymentId = decoded.data?.transactionId || 'PHONEPE-' + Date.now();

    if (!orderId) {
      console.error("PhonePe decoded payload missing merchantTransactionId:", decoded);
      res.writeHead(302, { Location: `${appUrl}/checkout?status=failure` });
      res.end();
      return;
    }

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
    const orderDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?key=${firebaseApiKey}`;

    // 3. Fetch Order Doc from Firestore
    const orderDocRes = await fetch(orderDocUrl);
    if (!orderDocRes.ok) {
      console.error(`Order ${orderId} document fetch returned status ${orderDocRes.status}`);
      res.writeHead(302, { Location: `${appUrl}/checkout?status=failure` });
      res.end();
      return;
    }

    const orderDocRaw = await orderDocRes.json();
    const fields = orderDocRaw.fields || {};
    const currentStatus = fields.status?.stringValue;
    const total = getFieldValue(fields.total) || 0;
    const items = getFieldValue(fields.items) || [];
    const customer = getFieldValue(fields.customer) || {};

    // Prevent duplicate processing if already updated
    if (currentStatus === 'pending' || currentStatus === 'Shipped') {
      const existingWaybill = fields.waybill?.stringValue || '';
      res.writeHead(302, { Location: `${appUrl}/checkout?status=success&id=${orderId}&waybill=${existingWaybill}` });
      res.end();
      return;
    }

    if (isSuccess) {
      // ── PAYMENT SUCCESS FLOW ──
      console.log(`Payment successful for order: ${orderId}. Starting shipment booking...`);
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

      // Update Firestore Order status
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
        console.error("Failed to update Firestore order status after successful payment:", await updateRes.text());
      }

      res.writeHead(302, { Location: `${appUrl}/checkout?status=success&id=${orderId}&waybill=${waybill}` });
      res.end();
      return;
    } else {
      // ── PAYMENT FAILURE FLOW ──
      console.warn(`Payment failed/cancelled for order: ${orderId}. Restoring inventory stocks...`);

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

      res.writeHead(302, { Location: `${appUrl}/checkout?status=failure&id=${orderId}` });
      res.end();
      return;
    }
  } catch (error) {
    console.error("Error inside pay-callback serverless handler:", error);
    res.writeHead(302, { Location: `${appUrl}/checkout?status=failure` });
    res.end();
  }
}
