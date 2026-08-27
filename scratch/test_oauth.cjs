const https = require('https');

const clientId = "SU2608061506315644678565";
const clientSecret = "8b9996e6-d2b3-4cdb-bc07-39709dc88a34";

function fetchToken(clientVersionValue) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: clientId,
      client_version: clientVersionValue,
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

async function run() {
  console.log(`Attempting to get OAuth token with version '1'...`);
  let res = await fetchToken("1");
  console.log("Status:", res.status);
  console.log("Body:", JSON.stringify(res.body, null, 2));

  if (res.status !== 200) {
    console.log(`\nAttempting to get OAuth token with version 'v1'...`);
    res = await fetchToken("v1");
    console.log("Status:", res.status);
    console.log("Body:", JSON.stringify(res.body, null, 2));
  }
  
  if (res.status !== 200) {
    console.log(`\nAttempting to get OAuth token with version 'SU2608061506315644678565'...`);
    res = await fetchToken("SU2608061506315644678565");
    console.log("Status:", res.status);
    console.log("Body:", JSON.stringify(res.body, null, 2));
  }
}

run();
