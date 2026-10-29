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

// Helper to ensure full complete address is formatted for courier labels and sorting
function formatFullDeliveryAddress(address, city, state, pin) {
  let addr = (address || "").trim();
  const c = (city || "").trim();
  const s = (state || "").trim();
  const p = (pin ? String(pin).trim() : "");

  if (!addr) {
    return [c, s, p].filter(Boolean).join(', ');
  }

  if (c && !new RegExp(`\\b${c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(addr)) {
    addr += `, ${c}`;
  }

  if (s && !new RegExp(`\\b${s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(addr)) {
    addr += `, ${s}`;
  }

  if (p && !addr.includes(p)) {
    addr += ` - ${p}`;
  }

  return addr;
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

function resolveCanonicalAppUrl(req) {
  let raw = (process.env.APP_URL || (req.headers.host ? `https://${req.headers.host}` : 'https://www.kaaramkathalu.in'))
    .trim()
    .replace(/\/+$/, '');
  if (raw === 'https://kaaramkathalu.in' || raw === 'http://kaaramkathalu.in') {
    return 'https://www.kaaramkathalu.in';
  }
  return raw;
}

function extractMerchantOrderId(req) {
  const fromQuery = req.query?.merchantOrderId || req.query?.orderId || req.query?.transactionId || req.query?.id;
  if (fromQuery) return String(fromQuery).trim();

  if (!req.body) return null;

  let payload = req.body;
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (trimmed.startsWith('{')) {
      try {
        payload = JSON.parse(trimmed);
      } catch {}
    } else if (trimmed.includes('=')) {
      const params = new URLSearchParams(trimmed);
      const formId = params.get('merchantOrderId') || params.get('transactionId') || params.get('orderId') || params.get('id');
      if (formId) return formId.trim();
      const respParam = params.get('response');
      if (respParam) {
        payload = { response: respParam };
      }
    }
  }

  if (payload && typeof payload === 'object') {
    // 1. PhonePe PG Checkout V2 S2S Webhook JSON: { event: "checkout.order.completed", payload: { merchantOrderId: "KK..." } }
    if (payload.payload?.merchantOrderId) {
      return String(payload.payload.merchantOrderId).trim();
    }
    // 2. Nested data object
    if (payload.data?.merchantOrderId) {
      return String(payload.data.merchantOrderId).trim();
    }
    if (payload.data?.merchantTransactionId) {
      return String(payload.data.merchantTransactionId).trim();
    }
    // 3. Direct top-level properties (ignore PhonePe internal OMO* orderId)
    if (payload.merchantOrderId) {
      return String(payload.merchantOrderId).trim();
    }
    if (payload.merchantTransactionId) {
      return String(payload.merchantTransactionId).trim();
    }
    if (payload.transactionId) {
      return String(payload.transactionId).trim();
    }
    if (payload.orderId && !String(payload.orderId).startsWith('OMO')) {
      return String(payload.orderId).trim();
    }
    // 4. PhonePe V1 Base64 S2S payload fallback
    if (payload.response && typeof payload.response === 'string') {
      try {
        const decoded = JSON.parse(Buffer.from(payload.response, 'base64').toString('utf-8'));
        const responseData = decoded.data || decoded.payload || decoded || {};
        const v1Id = responseData.merchantOrderId || responseData.merchantTransactionId;
        if (v1Id) return String(v1Id).trim();
      } catch (err) {
        console.error("Failed to decode base64 S2S callback payload:", err);
      }
    }
  }

  return null;
}

async function adjustProductInventory(projectId, firebaseApiKey, items, deltaMultiplier) {
  for (const item of items) {
    if (!item.docId || !item.quantity) continue;
    try {
      const productUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${item.docId}?key=${firebaseApiKey}`;
      const prodRes = await fetch(productUrl);
      if (!prodRes.ok) continue;

      const prodData = await prodRes.json();
      const qtyDelta = Number(item.quantity) * deltaMultiplier;
      const itemWeight = String(item.weightGrams || item.selectedWeight || 500);
      const rawWeightStocks = prodData.fields?.weightStocks?.mapValue?.fields;

      if (rawWeightStocks && rawWeightStocks[itemWeight] !== undefined) {
        const updatedMapFields = { ...rawWeightStocks };
        const prevVariantStock = getFieldValue(rawWeightStocks[itemWeight]) || 0;
        updatedMapFields[itemWeight] = {
          integerValue: String(Math.max(0, prevVariantStock + qtyDelta))
        };

        const availableWeights = getFieldValue(prodData.fields?.availableWeights) || [250, 500, 1000];
        let totalStock = 0;
        let hasVariantStocks = false;
        for (const w of availableWeights) {
          const wf = updatedMapFields[String(w)];
          if (wf !== undefined && wf !== null) {
            totalStock += getFieldValue(wf) || 0;
            hasVariantStocks = true;
          }
        }
        const fallbackTotal = Math.max(0, (getFieldValue(prodData.fields?.stock) || 0) + qtyDelta);

        await fetch(`${productUrl}&updateMask.fieldPaths=weightStocks&updateMask.fieldPaths=stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              weightStocks: { mapValue: { fields: updatedMapFields } },
              stock: { integerValue: String(hasVariantStocks ? totalStock : fallbackTotal) }
            }
          })
        });
      } else {
        const currentStock = getFieldValue(prodData.fields?.stock) || 0;
        await fetch(`${productUrl}&updateMask.fieldPaths=stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              stock: { integerValue: String(Math.max(0, currentStock + qtyDelta)) }
            }
          })
        });
      }
    } catch (invErr) {
      console.error(`Failed to adjust stock for product docId ${item.docId}:`, invErr);
    }
  }
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

  const appUrl = resolveCanonicalAppUrl(req);
  const isBrowserFormPost =
    req.method === 'POST' &&
    String(req.headers['content-type'] || '').includes('application/x-www-form-urlencoded') &&
    String(req.headers['accept'] || '').includes('text/html');
  const wantsJson =
    req.query?.format === 'json' ||
    (req.method === 'POST' && !isBrowserFormPost);

  const orderId = extractMerchantOrderId(req);

  try {
    if (!orderId) {
      console.error("PhonePe callback received without a valid orderId. Method:", req.method, "Query:", req.query);
      if (wantsJson) {
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
    
    const statusUrl = `${phonepeHost}/apis/pg/checkout/v2/order/${encodeURIComponent(orderId)}/status`;
    const statusRes = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      }
    });

    if (!statusRes.ok) {
      const errText = await statusRes.text();
      if ((statusRes.status === 400 || statusRes.status === 404) && errText.includes('ORDER_NOT_FOUND')) {
        console.warn(`PhonePe order not found for ${orderId}: ${errText}`);
        if (wantsJson) {
          return res.status(200).json({ success: false, state: 'ORDER_NOT_FOUND', orderId });
        } else {
          res.writeHead(302, { Location: `${appUrl}/checkout?status=failure&id=${orderId}` });
          res.end();
          return;
        }
      }
      throw new Error(`PhonePe status query failed for order ${orderId}: ${statusRes.status} - ${errText}`);
    }

    const statusData = await statusRes.json();
    const ppState = String(statusData.state || '').toUpperCase();
    const isSuccess = ppState === 'COMPLETED';
    const isPending = ppState === 'PENDING';
    const paymentId = (statusData.paymentDetails && statusData.paymentDetails.length > 0 && statusData.paymentDetails[0].transactionId)
      ? statusData.paymentDetails[0].transactionId
      : (statusData.orderId || 'PHONEPE-V2-' + Date.now());

    // 4. Fetch Order Document from Firestore
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
    const orderDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${encodeURIComponent(orderId)}?key=${firebaseApiKey}`;

    const orderDocRes = await fetch(orderDocUrl);
    if (!orderDocRes.ok) {
      if (orderDocRes.status === 404 && wantsJson) {
        return res.status(404).json({ error: `Order ${orderId} not found in database.` });
      }
      throw new Error(`Order ${orderId} document fetch returned status ${orderDocRes.status}`);
    }

    const orderDocRaw = await orderDocRes.json();
    const fields = orderDocRaw.fields || {};
    const currentStatus = fields.status?.stringValue || '';
    const existingWaybill = fields.waybill?.stringValue || '';
    const total = getFieldValue(fields.total) || 0;
    const items = getFieldValue(fields.items) || [];
    const customer = getFieldValue(fields.customer) || {};

    const alreadyPaidStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'pending'];

    // Prevent duplicate shipment/status overwrites if already marked paid/processed
    if (isSuccess && alreadyPaidStatuses.includes(currentStatus)) {
      const normalizedStatus = currentStatus === 'pending' ? 'Processing' : currentStatus;
      if (!fields.paymentId?.stringValue || currentStatus === 'pending') {
        const backfillFields = {
          paymentId: { stringValue: fields.paymentId?.stringValue || paymentId },
          paidAt: { stringValue: fields.paidAt?.stringValue || new Date().toISOString() },
          ...(currentStatus === 'pending' ? { status: { stringValue: 'Processing' } } : {})
        };
        const mask = `updateMask.fieldPaths=paymentId&updateMask.fieldPaths=paidAt${currentStatus === 'pending' ? '&updateMask.fieldPaths=status' : ''}`;
        await fetch(`${orderDocUrl}&${mask}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: backfillFields })
        }).catch(err => console.warn("Failed to backfill paymentId on processed order:", err));
      }

      if (wantsJson) {
        return res.status(200).json({
          success: true,
          alreadyProcessed: true,
          state: 'COMPLETED',
          status: normalizedStatus,
          waybill: existingWaybill,
          paymentId: fields.paymentId?.stringValue || paymentId
        });
      } else {
        res.writeHead(302, { Location: `${appUrl}/checkout?status=success&id=${orderId}&waybill=${existingWaybill}` });
        res.end();
        return;
      }
    }

    const orderTotalWeight = getFieldValue(fields.totalWeightGrams);

    if (isSuccess) {
      // ── PAYMENT SUCCESS FLOW ──
      console.log(`V2 Payment successful for order: ${orderId}. Starting shipment booking...`);

      // If order was previously marked payment_failed (which restored stock), re-deduct stock now
      if (currentStatus === 'payment_failed') {
        await adjustProductInventory(projectId, firebaseApiKey, items, -1);
      }

      let waybill = existingWaybill;
      const delhiveryToken = process.env.VITE_DELHIVERY_API_TOKEN;

      // Book shipment in Delhivery if not already booked
      if (delhiveryToken && !waybill) {
        try {
          const BOX_WEIGHT_GRAMS = 100;
          const itemsWeightGrams = items.reduce((acc, item) => {
            const itemWeight = Number(item.weightGrams) || Number(item.selectedWeight) || (item.product && (Number(item.product.weightGrams) || Number(item.product.selectedWeight))) || 500;
            const qty = Number(item.quantity) || 1;
            return acc + (itemWeight * qty);
          }, 0);
          const totalWeightGrams = orderTotalWeight ? Number(orderTotalWeight) : (itemsWeightGrams > 0 ? itemsWeightGrams + BOX_WEIGHT_GRAMS : 500);

          const totalQuantity = items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0) || 1;
          
          const itemsList = items.map(item => {
            const itemWeight = Number(item.weightGrams) || Number(item.selectedWeight) || 500;
            const qty = Number(item.quantity) || 1;
            return `${item.name || 'Andhra Delicacy'} (${itemWeight}g x${qty})`;
          }).join(', ') || "Andhra Delicacies";

          const orderItems = items.map((item, idx) => {
            const itemWeight = Number(item.weightGrams) || Number(item.selectedWeight) || 500;
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            const name = item.name || (item.product && item.product.name) || "Andhra Podi/Pickle";
            return {
              name: name,
              sku: `KK-${item.id || item.docId || idx + 1}`,
              item_description: `${name} (${itemWeight}g)`,
              units: qty,
              quantity: qty,
              unit_price: price,
              price: price,
              total_amount: price * qty,
              discount: 0,
              tax: 0,
              hsn_code: "21039090",
              category_name: "Food Products",
              commodity_value: price * qty
            };
          });
          
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

          const orderDateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

          const orderShippingMode = getFieldValue(fields.shippingMode);
          const isExpressShipping = orderShippingMode === 'Express';

          const delhiveryPayload = {
            format: 'json',
            data: JSON.stringify({
              shipments: [{
                waybill: "",
                order: String(orderId),
                product: itemsList,
                products_desc: itemsList,
                package_desc: itemsList,
                category_of_goods: "Food Products",
                order_type: "ESSENTIALS",
                product_type: "B2C",
                shipping_mode: isExpressShipping ? "Express" : "Surface",

                name: customer.name || "Customer",
                add: formatFullDeliveryAddress(
                  customer.address,
                  customer.city || "Bangalore",
                  customer.state || "Karnataka",
                  customer.pincode || 560043
                ),
                city: customer.city || "Bangalore",
                state: customer.state || "Karnataka",
                pin: Number(customer.pincode) || 560043,
                phone: cleanedPhone,
                country: "India",
                consignee: {
                  name: customer.name || "Customer",
                  address: formatFullDeliveryAddress(
                    customer.address,
                    customer.city || "Bangalore",
                    customer.state || "Karnataka",
                    customer.pincode || 560043
                  ),
                  city: customer.city || "Bangalore",
                  state: customer.state || "Karnataka",
                  pincode: Number(customer.pincode) || 560043,
                  phone: cleanedPhone,
                  country: "India"
                },

                // Weight fields
                weight: String(totalWeightGrams),
                total_weight: totalWeightGrams,
                actual_weight: totalWeightGrams,
                volumetric_weight: totalWeightGrams,
                chargeable_weight: totalWeightGrams,
                gross_weight: totalWeightGrams,

                // Dimensions (cm)
                length: 15,
                width: 15,
                height: 10,
                shipment_length: 15,
                shipment_width: 15,
                shipment_height: 10,
                dimensions: "15x15x10",

                // Amounts & Quantities
                quantity: totalQuantity,
                item_count: totalQuantity,
                payment_mode: "Pre-paid",
                package_type: "Prepaid",
                cod_amount: 0,
                total_amount: total,
                sub_total: total,
                declared_value: total,
                commodity_value: total,
                tax_value: 0,
                order_date: orderDateStr,

                // Detailed item breakdowns
                order_items: orderItems,
                products: orderItems,

                // Seller / Return details
                seller_name: "Kaaram Kathalu",
                seller_add: "002 Ground Floor Spoorthi Vaibhava Apartment, 6th A Cross Trinity Enclave, Banjara Layout, Horamavu",
                seller_inv: String(orderId),
                seller_inv_date: new Date().toISOString().split('T')[0],
                return_name: warehouseName,
                return_add: "002 Ground Floor Spoorthi Vaibhava Apartment, 6th A Cross Trinity Enclave, Banjara Layout, Horamavu",
                return_city: "Bangalore",
                return_state: "Karnataka",
                return_pin: 560043,
                return_phone: "7676644366",
                return_country: "India"
              }],
              pickup_location: {
                name: warehouseName,
                add: "002 Ground Floor Spoorthi Vaibhava Apartment, 6th A Cross Trinity Enclave, Banjara Layout, Horamavu",
                city: "Bangalore",
                pin: 560043,
                phone: "7676644366"
              }
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

      // Update Firestore Order status to paid ('Shipped' if waybill exists, else 'Processing')
      const newStatus = waybill ? 'Shipped' : 'Processing';
      const updatePayload = {
        fields: {
          status: { stringValue: newStatus },
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

      if (wantsJson) {
        return res.status(200).json({
          success: true,
          state: 'COMPLETED',
          status: newStatus,
          waybill: waybill,
          paymentId: paymentId
        });
      } else {
        res.writeHead(302, { Location: `${appUrl}/checkout?status=success&id=${orderId}&waybill=${waybill}` });
        res.end();
        return;
      }
    } else if (isPending) {
      // ── PAYMENT STILL PENDING FLOW (DO NOT MARK FAILED OR RESTORE STOCK YET) ──
      console.log(`V2 Payment still PENDING for order: ${orderId}. Keeping current status (${currentStatus}).`);
      if (wantsJson) {
        return res.status(200).json({
          success: true,
          state: 'PENDING',
          status: currentStatus || 'payment_pending',
          waybill: existingWaybill
        });
      } else {
        res.writeHead(302, { Location: `${appUrl}/checkout?status=pending&id=${orderId}` });
        res.end();
        return;
      }
    } else {
      // ── PAYMENT FAILURE FLOW (FAILED / EXPIRED) ──
      if (alreadyPaidStatuses.includes(currentStatus)) {
        if (wantsJson) {
          return res.status(200).json({ success: true, state: ppState, status: currentStatus });
        } else {
          res.writeHead(302, { Location: `${appUrl}/checkout?status=success&id=${orderId}&waybill=${existingWaybill}` });
          res.end();
          return;
        }
      }

      // Only restore stock and mark payment_failed once (when transitioning from payment_pending)
      if (currentStatus === 'payment_pending') {
        console.warn(`V2 Payment failed/cancelled (${ppState}) for order: ${orderId}. Restoring inventory stocks...`);
        await adjustProductInventory(projectId, firebaseApiKey, items, 1);

        await fetch(`${orderDocUrl}&updateMask.fieldPaths=status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              status: { stringValue: 'payment_failed' }
            }
          })
        });
      }

      if (wantsJson) {
        return res.status(200).json({ success: true, state: ppState, status: 'payment_failed' });
      } else {
        res.writeHead(302, { Location: `${appUrl}/checkout?status=failure&id=${orderId}` });
        res.end();
        return;
      }
    }
  } catch (error) {
    console.error("Error inside pay-callback serverless handler:", error);
    if (wantsJson) {
      return res.status(500).json({ error: error.message });
    } else {
      res.writeHead(302, { Location: `${appUrl}/checkout?status=failure${orderId ? `&id=${orderId}` : ''}` });
      res.end();
    }
  }
}
