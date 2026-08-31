import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

export const maxDuration = 60; // Allow maximum 60 seconds execution time on Vercel Hobby

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
    const res = await fetch(`${IMOU_BASE_URL}/deviceOnline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json();
    
    if (json.result?.code !== '0' || !json.result?.data) {
      console.error(`IMOU API Error (deviceOnline) untuk ${deviceId}:`, JSON.stringify(json));
      return 'unknown';
    }

    const d = json.result.data;
    
    // API deviceOnline mengembalikan properti 'onLine' dengan nilai "1" (online) atau "0" (offline)
    const isOnline = 
      d.onLine === 1 || d.onLine === '1' || d.online === true ||
      String(d.online).toLowerCase() === 'online' ||
      String(d.onLine).toLowerCase() === 'online' ||
      d.status === 'online' || d.status === 1 || d.status === '1';
      
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
    console.log("INCOMING WEBHOOK PAYLOAD:", JSON.stringify(payload));
    
    const status = (payload.status || body.status || payload.content?.status || '').toString().toLowerCase();
    const type = (payload.type || body.type || payload.content?.type || '').toString().toLowerCase();
    const msgType = (payload.msgType || body.msgType || '').toString().toLowerCase();

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
    const isOfflineEvent = status === 'offline' || status === '0' || type.includes('offline') || msgType.includes('offline');
    const isOnlineEvent = status === 'online' || status === '1' || type.includes('online') || msgType.includes('online');
    
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
        console.log(`Mendeteksi CCTV ${cname} offline, memulai proses ping verifikasi (3x, jeda 15s)...`);
        
        let isConfirmedOffline = false;
        try {
          const token = await getAccessToken();
          if (token) {
            let finalStatus = 'unknown'; // Default ke unknown biar aman kalau IMOU error
            for (let i = 1; i <= 3; i++) {
              // Tunggu 15 detik per ping untuk nahan False Alarm
              await new Promise(resolve => setTimeout(resolve, 15000));
              
              const currentStatus = await checkDeviceStatus(token, deviceId);
              console.log(`Ping ${i} untuk ${cname}: status = ${currentStatus}`);
              
              if (currentStatus === 'online') {
                finalStatus = 'online';
                console.log(`Batal kirim notifikasi mati: CCTV ${cname} ternyata sudah online di ping ke-${i}`);
                break;
              } else if (currentStatus === 'offline') {
                finalStatus = 'offline';
              }
            }
            
            // HANYA kirim pesan jika beneran terbukti OFFLINE (menolak error 'unknown')
            isConfirmedOffline = (finalStatus === 'offline');
            if (finalStatus === 'unknown') {
              console.log(`Batal kirim notifikasi mati: IMOU API Error ('unknown' terus). Menghindari false alarm.`);
            }
          } else {
            // Fallback: Jika gagal dapat token, BATALKAN notifikasi untuk mencegah spam
            console.log("Token IMOU gagal didapat, membatalkan notifikasi untuk mencegah spam.");
            isConfirmedOffline = false;
          }
        } catch (pingErr) {
          console.error("Gagal melakukan ping ke IMOU API:", pingErr);
          isConfirmedOffline = false; // Fallback aman
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
      try {
        if (currentState === 'online') {
          // Hanya update last_synced_at secara diam-diam, tanpa kirim notifikasi
          await sql`
            UPDATE devices SET last_synced_at = NOW() WHERE device_id = ${deviceId}
          `;
          console.log(`[Silent Update] CCTV ${cname} ngirim webhook online, tapi di DB memang sudah online. Batal kirim notifikasi agar tidak spam.`);
        } else {
          // Gunakan UPDATE sebagai Atomic Lock untuk mencegah Race Condition webhook ganda
          const updateResult = await sql`
            UPDATE devices 
            SET status = 'online', last_synced_at = NOW()
            WHERE device_id = ${deviceId} 
              AND (status = 'offline' OR status IS NULL)
            RETURNING device_id
          `;
          
          if (updateResult.length === 0) {
            console.log(`[Race Condition/Duplicate] CCTV ${cname} sudah memproses event online.`);
          } else {
            const message = 
`<b>✅ CCTV KEMBALI NORMAL</b>

📷 Device: <b>${cname}</b>
🆔 Device ID: <code>${deviceId || '-'}</code>
🕐 Waktu Pulih: ${currentTime}

CCTV telah beroperasi dan terhubung kembali.`;

            const teleRes = await sendTelegramAlert(message);
            if (!teleRes.ok) console.error("Telegram API Error:", await teleRes.json());
            
            // Log ke database Neon
            try {
              await sql`
                INSERT INTO notification_logs (device_id, device_name, status)
                VALUES (${deviceId}, ${cname}, 'online')
              `;
            } catch (dbErr) {
              console.error("Database Error (Online Log):", dbErr);
            }
          }
        }
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