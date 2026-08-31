const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

let envContent = '';
try { envContent += fs.readFileSync('.env.local', 'utf8') + '\n'; } catch(e) {}
try { envContent += fs.readFileSync('.env', 'utf8') + '\n'; } catch(e) {}

let APP_ID = '';
let APP_SECRET = '';

const idMatch = envContent.match(/IMOU_APP_ID=([^\r\n]+)/);
if (idMatch) APP_ID = idMatch[1].trim();

const secMatch = envContent.match(/IMOU_APP_SECRET=([^\r\n]+)/);
if (secMatch) APP_SECRET = secMatch[1].trim();

function generateSignature(time, nonce, secret) {
  const str = `time:${time},nonce:${nonce},appSecret:${secret}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

function fetchJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let chunks = '';
      res.on('data', chunk => chunks += chunk);
      res.on('end', () => resolve(JSON.parse(chunks)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('APP_ID:', APP_ID);
  if (!APP_ID || !APP_SECRET) {
    console.log("Credentials not found");
    return;
  }

  const time = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  const sign = generateSignature(time, nonce, APP_SECRET);

  const tokenData = await fetchJson('https://openapi-sg.easy4ip.com/openapi/accessToken', {
    system: { ver: '1.0', appId: APP_ID, sign, time, nonce }, id: nonce
  });
  
  const token = tokenData.result?.data?.accessToken;
  if (!token) {
    console.log("Failed to get token", tokenData);
    return;
  }
  
  console.log("Got token");

  // listDeviceDetailsByPage page 1
  let time1 = Math.floor(Date.now() / 1000).toString();
  let nonce1 = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  let sign1 = generateSignature(time1, nonce1, APP_SECRET);
  const list1 = await fetchJson('https://openapi-sg.easy4ip.com/openapi/listDeviceDetailsByPage', {
    system: { ver: '1.0', appId: APP_ID, sign: sign1, time: time1, nonce: nonce1 },
    id: nonce1,
    params: { token, page: 1, pageSize: 100 }
  });
  console.log("Page 1 length:", list1.result?.data?.deviceList?.length);
  
  // listDeviceDetailsByPage page 2
  let time2 = Math.floor(Date.now() / 1000).toString();
  let nonce2 = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  let sign2 = generateSignature(time2, nonce2, APP_SECRET);
  const list2 = await fetchJson('https://openapi-sg.easy4ip.com/openapi/listDeviceDetailsByPage', {
    system: { ver: '1.0', appId: APP_ID, sign: sign2, time: time2, nonce: nonce2 },
    id: nonce2,
    params: { token, page: 2, pageSize: 100 }
  });
  console.log("Page 2 length:", list2.result?.data?.deviceList?.length);

  // deviceBaseDetail
  let time3 = Math.floor(Date.now() / 1000).toString();
  let nonce3 = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  let sign3 = generateSignature(time3, nonce3, APP_SECRET);
  const detail = await fetchJson('https://openapi-sg.easy4ip.com/openapi/deviceBaseDetail', {
    system: { ver: '1.0', appId: APP_ID, sign: sign3, time: time3, nonce: nonce3 },
    id: nonce3,
    params: { token, deviceId: '8E0250FPAZ9A4F5' }
  });
  console.log("deviceBaseDetail result:", JSON.stringify(detail, null, 2));
}

run();
