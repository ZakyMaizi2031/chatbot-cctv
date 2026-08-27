import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

// Base URL IMOU Open API
const IMOU_BASE_URL = 'https://openapi-sg.easy4ip.com/openapi';
const APP_ID = (process.env.IMOU_APP_ID || '').trim();
const APP_SECRET = (process.env.IMOU_APP_SECRET || '').trim();

// === Helper: Buat system header + signature IMOU ===
function buildRequestBody(params: Record<string, unknown> = {}) {
  const time = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  const signRaw = `time:${time},nonce:${nonce},appSecret:${APP_SECRET}`;
  const sign = crypto.createHash('md5').update(signRaw).digest('hex');

  return {
    system: { ver: '1.0', appId: APP_ID, time, nonce, sign },
    params,
    id: crypto.randomUUID(),
  };
}

// === Helper: Ambil Access Token IMOU ===
async function getAccessToken(): Promise<string> {
  if (!APP_ID || !APP_SECRET) return '';
  try {
    const body = buildRequestBody({});
    const res = await fetch(`${IMOU_BASE_URL}/accessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json();
    return json.result?.data?.accessToken || '';
  } catch (error) {
    console.error("Gagal mendapatkan Access Token IMOU:", error);
    return '';
  }
}

// === Helper: Cek Status Realtime Device ===
async function checkDeviceStatus(token: string, deviceId: string): Promise<'online'|'offline'|'unknown'> {
  try {
    const body = buildRequestBody({ token, deviceId });
    const res = await fetch(`${IMOU_BASE_URL}/deviceBaseDetail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json();
    if (json.result?.code !== '0') return 'unknown';
    
    const d = json.result?.data;
    if (!d) return 'unknown';

    const isOnline = 
      d.deviceStatus === 'online' || d.deviceStatus === 1 || 
      d.status === 'online' || d.status === 1 || d.status === '1' || 
      d.onLine === 1 || d.onLine === '1' || d.online === true;
      
    return isOnline ? 'online' : 'offline';
  } catch (error) {
    console.error(`Gagal ngeping status device ${deviceId}:`, error);
    return 'unknown';
  }
}

// Mapping Serial Number dari Console Imou ke Nama Perangkat
const DEVICE_MAP: Record<string, string> = {};



export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Payload Imou Masuk:", JSON.stringify(body, null, 2));

    const payload = body.data || body.params || body;
    
    const status = (payload.status || body.status || payload.content?.status || '').toString().toLowerCase();
    const type = (payload.type || body.type || body.msgType || payload.content?.type || '').toString().toLowerCase();

    // Ambil ID/Serial Number dari payload Imou
    const deviceId = payload.deviceId || payload.deviceSn || payload.sn || payload.did || body.deviceId || body.deviceSn || body.did || payload.content?.deviceSn || payload.content?.deviceId || payload.content?.did || '';
    
    // Ambil status dan nama terakhir dari database
    let currentState = 'online'; // default
    let dbDeviceName = '';
    try {
      const dbResult = await sql`
        SELECT status, device_name FROM devices WHERE device_id = ${deviceId} LIMIT 1
      `;
      if (dbResult.length > 0) {
        currentState = dbResult[0].status;
        dbDeviceName = dbResult[0].device_name;
      }
    } catch (e) {
      console.error("Gagal mengambil status dari DB", e);
    }

    // Konversi ID ke Nama Kamera
    // Prioritaskan nama dari IMOU webhook, jika tidak ada, ambil dari database
    const cname = 
      payload.cname ||
      payload.dname || 
      payload.deviceName || 
      payload.channelName || 
      body.cname ||
      body.dname || 
      body.deviceName || 
      dbDeviceName || 
      'CCTV Unknown';

    // Deteksi Event Status
    const isOfflineEvent = status === 'offline' || status === '0' || type.includes('offline');
    const isOnlineEvent = status === 'online' || status === '1' || type.includes('online');
    
    // Jika event berupa 'devicestatus' tapi tidak jelas statusnya, fallback berdasarkan field status jika ada
    const isStatusUpdate = type.includes('devicestatus');
    const actuallyOffline = isOfflineEvent || (isStatusUpdate && (status === 'offline' || status === '0'));
    const actuallyOnline = isOnlineEvent || (isStatusUpdate && (status === 'online' || status === '1'));

    const currentTime = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    });

    if (actuallyOffline) {
      if (currentState === 'offline') {
        console.log(`CCTV ${cname} (${deviceId}) sudah offline sebelumnya. Abaikan pesan ganda.`);
      } else {
        console.log(`Mendeteksi CCTV ${cname} offline, memulai proses ping verifikasi (3x, jeda 2s)...`);
        
        let isConfirmedOffline = false;
        try {
          const token = await getAccessToken();
          if (token) {
            let finalStatus = 'offline';
            for (let i = 1; i <= 3; i++) {
              // Tunggu 2 detik
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const currentStatus = await checkDeviceStatus(token, deviceId);
              console.log(`Ping ${i} untuk ${cname}: status = ${currentStatus}`);
              
              if (currentStatus === 'online') {
                finalStatus = 'online';
                console.log(`Batal kirim notifikasi mati: CCTV ${cname} ternyata sudah online di ping ke-${i}`);
                break;
              }
            }
            isConfirmedOffline = (finalStatus === 'offline');
          } else {
            // Fallback: Jika gagal dapat token, anggap offline saja
            console.log("Token IMOU gagal didapat, fallback anggap offline.");
            isConfirmedOffline = true;
          }
        } catch (pingErr) {
          console.error("Gagal melakukan ping ke IMOU API:", pingErr);
          isConfirmedOffline = true; // Fallback
        }

        if (isConfirmedOffline) {
          const message = 
`<b>⚠️ CCTV TIDAK BERFUNGSI</b>

📷 Device: <b>${cname}</b>
🆔 Device ID: <code>${deviceId || '-'}</code>
🕐 Terdeteksi: ${currentTime}

Mohon segera dicek oleh teknisi.`;

          const teleRes = await sendTelegramAlert(message);
          if (!teleRes.ok) console.error("Telegram API Error:", await teleRes.json());
          
          // Log ke database Neon dan update tabel devices
          try {
            await sql`
              INSERT INTO notification_logs (device_id, device_name, status)
              VALUES (${deviceId}, ${cname}, 'offline')
            `;
            await sql`
              UPDATE devices SET status = 'offline' WHERE device_id = ${deviceId}
            `;
          } catch (dbErr) {
            console.error("Database Error (Offline Log):", dbErr);
          }
        }
      }
    } else if (actuallyOnline) {
      // PENGECUALIAN: Sesuai permintaan, selalu kirim notifikasi ke Telegram jika ada event online
      // agar teknisi tidak bingung (meskipun di database mungkin tercatat sudah online karena race condition).
      const message = 
`<b>✅ CCTV KEMBALI NORMAL</b>

📷 Device: <b>${cname}</b>
🆔 Device ID: <code>${deviceId || '-'}</code>
🕐 Waktu Pulih: ${currentTime}

CCTV telah beroperasi dan terhubung kembali.`;

      const teleRes = await sendTelegramAlert(message);
      if (!teleRes.ok) console.error("Telegram API Error:", await teleRes.json());
      else console.log(`Berhasil kirim notifikasi ONLINE ke Telegram untuk ${cname}`);

      // Update database
      try {
        if (currentState === 'offline') {
          // Hanya tambahkan riwayat ke tabel logs jika sebelumnya tercatat offline
          await sql`
            INSERT INTO notification_logs (device_id, device_name, status)
            VALUES (${deviceId}, ${cname}, 'online')
          `;
        }
        
        // Selalu pastikan status perangkat di tabel devices adalah online
        await sql`
          UPDATE devices SET status = 'online' WHERE device_id = ${deviceId}
        `;
      } catch (dbErr) {
        console.error("Database Error (Online Log):", dbErr);
      }
    }

    return NextResponse.json({ code: '0', msg: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



// Fungsi Kirim Pesan ke Telegram
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