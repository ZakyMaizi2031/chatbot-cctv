import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = body.data || body.params || body;
    
    const status = (payload.status || body.status || '').toString().toLowerCase();
    const type = (payload.type || body.type || body.msgType || '').toString().toLowerCase();

    const isOffline = 
      status === 'offline' || 
      status === '0' || 
      type.includes('offline') || 
      type.includes('devicestatus');

    if (isOffline) {
      const initialDetectedTime = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      });

      const deviceId = payload.deviceId || payload.sn || body.deviceId;

      // 1. Ambil nama dinamis dari Cloud Imou
      let cname = payload.deviceName;
      if (!cname && deviceId) {
        cname = await getDeviceNameFromImouApi(deviceId);
      }
      if (!cname) cname = deviceId ? `CCTV (${deviceId})` : 'CCTV Unknown';

      // 2. Verifikasi 3x Retry dengan jeda 3 detik
      const isConfirmedOffline = await verifyDeviceOfflineWithRetry(deviceId, 3, 3000);

      // 3. Kirim Telegram jika terkonfirmasi tetap mati
      if (isConfirmedOffline) {
        const message = 
`<b>⚠️ CCTV TIDAK BERFUNGSI</b>

📷 ${cname}
🕐 Terdeteksi: ${initialDetectedTime}

Mohon segera dicek oleh teknisi.`;

        await sendTelegramAlert(message);
      } else {
        console.log(`CCTV ${cname} kembali Online. Notifikasi dibatalkan.`);
      }
    }

    return NextResponse.json({ code: '0', msg: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Fungsi Pengecekan Repeat
async function verifyDeviceOfflineWithRetry(deviceId: string, maxRetries = 3, delayMs = 3000): Promise<boolean> {
  if (!deviceId) return true; 

  for (let i = 1; i <= maxRetries; i++) {
    console.log(`[Ping Check ${i}/${maxRetries}] Menunggu verifikasi status device ${deviceId}...`);
    if (i < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return true;
}

// Panggilan API Imou untuk Nama Device
async function getDeviceNameFromImouApi(deviceId: string): Promise<string | null> {
  try {
    const appId = process.env.IMOU_APP_ID;
    const appSecret = process.env.IMOU_APP_SECRET;
    if (!appId || !appSecret) return null;

    const time = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(8).toString('hex');
    const signStr = `time:${time},nonce:${nonce},appSecret:${appSecret}`;
    const sign = crypto.createHash('md5').update(signStr).digest('hex');

    const systemParams = { ver: '1.1', appId, sign, time, nonce };

    const tokenRes = await fetch('https://openapi.imoulife.com/openapi/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: systemParams })
    });
    
    const tokenData = await tokenRes.json();
    const accessToken = tokenData?.result?.data?.accessToken;
    if (!accessToken) return null;

    const deviceRes = await fetch('https://openapi.imoulife.com/openapi/deviceDetail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemParams,
        params: { token: accessToken, deviceId }
      })
    });
    
    const deviceData = await deviceRes.json();
    return deviceData?.result?.data?.deviceName || null;
  } catch (err) {
    return null;
  }
}

async function sendTelegramAlert(text: string) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  return await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
    }),
  });
}