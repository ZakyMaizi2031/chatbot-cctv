import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Payload Imou Masuk:", JSON.stringify(body, null, 2));

    const data = body.data || body;
    
    const status = (data.status || body.status || '').toString().toLowerCase();
    const type = (data.type || body.type || body.msgType || '').toString().toLowerCase();

    // Deteksi event CCTV Offline
    const isOffline = 
      status === 'offline' || 
      status === '0' || 
      type.includes('offline') || 
      type.includes('devicestatus');

    if (isOffline) {
      const cname = data.deviceName || data.channelName || body.deviceName || 'CCTV Unknown';
      
      const time = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      });

      // Template pesan tanpa nama teknisi
      const message = 
`<b>⚠️ CCTV TIDAK BERFUNGSI</b>

📷 ${cname}
🕐 Terdeteksi: ${time}

Mohon segera dicek oleh teknisi.`;

      const teleRes = await sendTelegramAlert(message);
      
      if (!teleRes.ok) {
        console.error("Telegram API Error:", await teleRes.json());
      }
    }

    return NextResponse.json({ code: '0', msg: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
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