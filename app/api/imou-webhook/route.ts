import { NextResponse } from 'next/server';

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
      // 1. Simpan Waktu Awal Pertama Kali Terdeteksi Offline
      const initialDetectedTime = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      });

      const deviceId = payload.deviceId || body.deviceId;
      const cname = payload.deviceName || payload.channelName || body.deviceName || 'CCTV Unknown';

      // 2. Lakukan Ping 3 Kali (Jeda 3 Detik per Ping)
      const isConfirmedOffline = await verifyDeviceOfflineWithRetry(deviceId, 3, 3000);

      // 3. Kirim Alert Menggunakan Waktu Pengecekan Pertama Awal
      if (isConfirmedOffline) {
        const message = 
`<b>⚠️ CCTV TIDAK BERFUNGSI</b>

📷 ${cname}
🕐 Terdeteksi: ${initialDetectedTime}

Mohon segera dicek oleh teknisi.`;

        await sendTelegramAlert(message);
      } else {
        console.log(`CCTV ${cname} hanya mengalami fluktuasi sementara. Alert dibatalkan.`);
      }
    }

    return NextResponse.json({ code: '0', msg: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Fungsi Pengecekan 3x Loop dengan Jeda 3000ms (3 Detik)
async function verifyDeviceOfflineWithRetry(deviceId: string, maxRetries = 3, delayMs = 3000): Promise<boolean> {
  if (!deviceId) return true; 

  for (let i = 1; i <= maxRetries; i++) {
    console.log(`[Ping Check ${i}/${maxRetries}] Memeriksa status device ${deviceId}...`);
    
    const isStillOffline = await checkImouDeviceStatusApi(deviceId);

    // Jika pada salah satu ping kamera ternyata Online kembali, langsung batalkan
    if (!isStillOffline) {
      return false; 
    }

    // Tunggu 3 detik sebelum ping berikutnya
    if (i < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return true; // Terbukti offline selama 3x ping berturut-turut
}

async function checkImouDeviceStatusApi(deviceId: string): Promise<boolean> {
  // Placeholder pengecekan status ke OpenAPI Imou
  return true; 
}

async function sendTelegramAlert(text: string) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  return await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
    }),
  });
}