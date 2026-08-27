const https = require('https');

const clientId = "SU2608061506315644678565";
const clientSecret = "8b9996e6-d2b3-4cdb-bc07-39709dc88a34";
const clientVersion = "1";
const orderId = "KK" + Math.floor(100000 + Math.random() * 900000);

function fetchToken() {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: clientId,
      client_version: clientVersion,
      client_secret: clientSecret,
      grant_type: "client_credentials"
    }).toString();

    const options = {
      hostname: "api.phonepe.com",
      path: "/apis/identity-manager/v1/oauth/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => { reject(e); });
    req.write(postData);
    req.end();
  });
}

function initiatePayment(token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      merchantOrderId: orderId,
      amount: 100, // 1 Rs in paise
      expireAfter: 1200,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Kaaram Kathalu Test Order " + orderId,
        merchantUrls: {
          redirectUrl: "https://www.kaaramkathalu.in/api/pay-callback"
        }
      }
    });

    const options = {
      hostname: "api.phonepe.com",
      path: "/apis/pg/checkout/v2/pay",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `O-Bearer ${token}`,
        "Content-Length": Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => { reject(e); });
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log("Fetching token...");
  const tokenRes = await fetchToken();
  if (tokenRes.status !== 200 || !tokenRes.body.access_token) {
    console.error("Token fetch failed:", tokenRes.body);
    return;
  }

  const token = tokenRes.body.access_token;
  console.log("Token obtained successfully.");

  console.log("Initiating payment...");
  const payRes = await initiatePayment(token);
  console.log("Response Status:", payRes.status);
  console.log("Response Body:\n", JSON.stringify(payRes.body, null, 2));
}

run();
