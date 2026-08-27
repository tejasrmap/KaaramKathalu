const https = require('https');

const projectId = "kaaaramkathalu";
const apiKey = "AIzaSyBpd4MAspcOA65TDS5EOMwuBMSgoypDZL4";
const orderId = "KK313735"; // The failed order ID in the screenshot

console.log(`Using Project ID: "${projectId}"`);
console.log(`Using API Key: "${apiKey.slice(0, 10) + '...'}"`);

function getJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error("Failed to parse response: " + data));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?key=${apiKey}`;
  console.log(`Fetching from URL: ${url}`);
  try {
    const res = await getJSON(url);
    console.log("REST API Response Status:", res.status);
    console.log("REST API Response Body:\n", JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

run();
