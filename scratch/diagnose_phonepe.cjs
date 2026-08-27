const https = require('https');
const crypto = require('crypto');

const merchantId = "M22XSTGDZZKE1";
const phonepeApiKey = "8b9996e6-d2b3-4cdb-bc07-39709dc88a34";
const keyIndex = "1";
const orderId = "KK" + Math.floor(100000 + Math.random() * 900000);

const payload = {
  merchantId: merchantId,
  merchantTransactionId: orderId,
  merchantUserId: "TEST_USER_123",
  amount: 100, // 1 Rs in paise
  redirectUrl: "https://www.kaaramkathalu.in/api/pay-callback",
  redirectMode: "POST",
  callbackUrl: "https://www.kaaramkathalu.in/api/pay-callback",
  mobileNumber: "9999999999",
  paymentInstrument: {
    type: "PAY_PAGE"
  }
};

const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');

function generateChecksum(endpointPath) {
  const stringToSign = base64 + endpointPath + phonepeApiKey;
  const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
  return sha256 + "###" + keyIndex;
}

function postJSON(url, checksum, requestData) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify({ request: requestData });

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'Content-Length': Buffer.byteLength(postData)
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

    req.on('error', (e) => { resolve({ status: 500, body: e.message }); });
    req.write(postData);
    req.end();
  });
}

const tests = [
  { name: "Hermes Checkout V1 Pay", url: "https://api.phonepe.com/apis/hermes/checkout/v1/pay", path: "/checkout/v1/pay" },
  { name: "Hermes PG Checkout V1 Pay", url: "https://api.phonepe.com/apis/hermes/pg/checkout/v1/pay", path: "/pg/checkout/v1/pay" }
];

async function run() {
  for (const t of tests) {
    console.log(`\n--- Testing: ${t.name} ---`);
    console.log(`URL: ${t.url}`);
    const checksum = generateChecksum(t.path);
    const res = await postJSON(t.url, checksum, base64);
    console.log("Status:", res.status);
    console.log("Body:", typeof res.body === 'object' ? JSON.stringify(res.body, null, 2) : res.body);
  }
}

run();
