const https = require('https');
const crypto = require('crypto');

const merchantId = "PGMERCHANT";
const phonepeApiKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const keyIndex = "1";
const env = "sandbox"; 
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
const stringToSign = base64 + "/pg/v1/pay" + phonepeApiKey;
const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
const checksum = sha256 + "###" + keyIndex;

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
          reject(new Error("Failed to parse response: " + data));
        }
      });
    });

    req.on('error', (e) => { reject(e); });
    req.write(postData);
    req.end();
  });
}

async function run() {
  const phonepeHost = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  
  const phonepeUrl = `${phonepeHost}/pg/v1/pay`;
  console.log(`Sending post to: ${phonepeUrl}`);

  try {
    const res = await postJSON(phonepeUrl, checksum, base64);
    console.log("Response Status:", res.status);
    console.log("Response Body:\n", JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error("Error calling PhonePe:", err);
  }
}

run();
