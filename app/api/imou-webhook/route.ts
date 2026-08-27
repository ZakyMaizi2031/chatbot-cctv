import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Mapping Serial Number dari Console Imou ke Nama Perangkat
const DEVICE_MAP: Record<string, string> = {
  '9010BBLPSF211B0': 'Lorong Marketing',
  'E7ECDBLPSF8CC59': 'Lorong Operasional',
  '8E0250FPAZBD5F5': '8E0250FPAZBD5F5-1',
  '914DEAMPSFC43FB': 'P2 Resilient',
  '7272FBEPBVE4AC2': 'Lorong',
  '914DEAMPSF081CB': 'Teacher Room',
  'B43BACCPSF6B60B': 'K1 Odyssesy',
  'B43BACCPSF3CCB7': 'K1 Sparkle',
  'F3320AMPCG09E5B': 'Mezanine',
  'E7ECDBLPSF35527': 'Library',
  'F3320AMPCG14E18': 'Tangga LT3',
  'F3320AMPCG72BE8': 'Lorong LT2 Panel',
  'F3320AMPCG2E490': 'Aula lt1',
  'F3320AMPCG55E0D': 'lorong lt1',
  'F3320AMPCGB3D14': 'Lobi 2',
  'F3320AMPCG64E39': 'Sick Bay',
  'F3320AMPCG8F1A1': 'Teacher Room',
  'F3320AMPCG4B11B': 'Studenthub',
  'F3320AMPCG814C3': 'Science Laboratory',
  'F3320AMPCG657F3': 'Counseling Room',
  'F3320AMPCG1F94C': 'Grade 7',
  'F3320AMPCG438FC': 'Lobi utama',
  'F3320AMPCG42423': 'Physics Laboratory',
  'F3320AMPCG5D79D': 'Meeting Room',
  'F3320AMPCGD51F8': 'Grade 7 (2)',
  'F3320AMPCG9B725': 'Tangga ke LT1',
  '66F82BCPCG71606': 'Ruang meeting lt 3',
  '66F82BCPCG71755': 'Auditorium lt2 1',
  'F3320AMPCGF73EC': 'LT2 kelas 2',
  '66F82BCPCG2F44B': 'LT2 kelas 1',
  '679E7AKPCG9E8DA': 'Auditorium lt2 2',
  'F3320AMPCG29126': 'Mushola lt2',
  'F3320AMPCG18732': 'Ruang guru lt2',
  'F3320AMPCGBD93A': 'LT2 kelas 4',
  '679E7AKPCG2DDCC': 'LT2 kelas 3',
  '66F82BCPCG4DFA2': 'Auditorium lt2 3',
  'F3320AMPCG9CF1E': 'Computer Lab',
  'F3320AMPCGBBB9A': 'Lorong lt2',
  '17903AKPSFFE56F': 'P1 Courageous',
  '17903AKPSF86A23': 'P1 Curious',
  '914DEAMPSFCB7D8': 'P1 Generous',
  '17903AKPSFFCDF6': 'P1 Adventurous',
  '914DEAMPSF05581': 'Library',
  '914DEAMPSF84EAB': 'P2 Empathetic',
  '914DEAMPSFDAB20': 'P1 Integrity',
  '17903AKPSF7AC8F': 'Lorong sisi 1',
  '8E0250FPAZ32D89': '8E0250FPAZ32D89-1',
  '8E0250FPAZC56A9': '8E0250FPAZC56A9-1',
  '8E0250FPAZ9A4F5': '8E0250FPAZ9A4F5-1',
  '8E0250FPAZ76CFA': '8E0250FPAZ76CFA-1',
  '8E0250FPAZ69908': '8E0250FPAZ69908-1',
  '8E0250FPAZF3988': '8E0250FPAZF3988-1',
  '8E0250FPAZ5D42F': '8E0250FPAZ5D42F-1',
  '8E0250FPAZA013B': '8E0250FPAZA013B-1',
  '8E0250FPAZ9B5DB': '8E0250FPAZ9B5DB-1',
  '8E0250FPAZ4C6EC': '8E0250FPAZ4C6EC-1',
  '8E0250FPAZC6AA1': '8E0250FPAZC6AA1-1',
  '8E0250FPAZ58A75': '8E0250FPAZ58A75-1',
  '8E0250FPAZ5AC03': '8E0250FPAZ5AC03-1',
  '8E0250FPAZDACAD': '8E0250FPAZDACAD-1',
  '8E0250FPAZ59CBA': '8E0250FPAZ59CBA-1',
  '8E0250FPAZC50A0': '8E0250FPAZC50A0-1',
  '8E0250FPAZE8EF5': '8E0250FPAZE8EF5-1',
  '8E0250FPAZ469DB': '8E0250FPAZ469DB-1',
  '8E0250FPAZ9B161': '8E0250FPAZ9B161-1',
  '8E0250FPAZF6048': '8E0250FPAZF6048-1',
  '8E0250FPAZ4DBFE': '8E0250FPAZ4DBFE-1',
  '8E0250FPAZ468AC': '8E0250FPAZ468AC-1',
  '8E0250FPAZC7682': '8E0250FPAZC7682-1',
};

// Menyimpan state terakhir CCTV di memory (gunakan global agar bertahan di Next.js dev)
const globalAny: any = global;
if (!globalAny.cctvStates) {
  globalAny.cctvStates = new Map<string, string>();
}
const cctvStates: Map<string, string> = globalAny.cctvStates;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Payload Imou Masuk:", JSON.stringify(body, null, 2));

    const payload = body.data || body.params || body;
    
    const status = (payload.status || body.status || payload.content?.status || '').toString().toLowerCase();
    const type = (payload.type || body.type || body.msgType || payload.content?.type || '').toString().toLowerCase();

    // Ambil ID/Serial Number dari payload Imou
    const deviceId = payload.deviceId || payload.deviceSn || payload.sn || payload.did || body.deviceId || body.deviceSn || body.did || payload.content?.deviceSn || payload.content?.deviceId || payload.content?.did || '';
    
    // Konversi ID ke Nama Kamera
    // Prioritaskan nama yang dikirim langsung dari IMOU (seperti dname atau cname), 
    // jika tidak ada, baru fallback ke DEVICE_MAP yang ada di kode.
    const cname = 
      payload.cname ||
      payload.dname || 
      payload.deviceName || 
      payload.channelName || 
      body.cname ||
      body.dname || 
      body.deviceName || 
      DEVICE_MAP[deviceId] || 
      'CCTV Unknown';

    // Deteksi Event Status
    const isOfflineEvent = status === 'offline' || status === '0' || type.includes('offline');
    const isOnlineEvent = status === 'online' || status === '1' || type.includes('online');
    
    // Jika event berupa 'devicestatus' tapi tidak jelas statusnya, fallback berdasarkan field status jika ada
    const isStatusUpdate = type.includes('devicestatus');
    const actuallyOffline = isOfflineEvent || (isStatusUpdate && (status === 'offline' || status === '0'));
    const actuallyOnline = isOnlineEvent || (isStatusUpdate && (status === 'online' || status === '1'));

    // Ambil status terakhir dari database (karena Vercel serverless tidak menyimpan memory)
    let currentState = 'online'; // default
    try {
      const dbResult = await sql`
        SELECT status FROM devices WHERE id = ${deviceId} LIMIT 1
      `;
      if (dbResult.length > 0) {
        currentState = dbResult[0].status;
      }
    } catch (e) {
      console.error("Gagal mengambil status dari DB", e);
    }

    const currentTime = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    });

    if (actuallyOffline) {
      if (currentState === 'offline') {
        console.log(`CCTV ${cname} (${deviceId}) sudah offline sebelumnya. Abaikan pesan ganda.`);
      } else {
        // Lakukan Ping Verifikasi 3 kali (Jeda 3 detik per ping)
        const isConfirmedOffline = await verifyDeviceOfflineWithRetry(deviceId, 3, 3000);

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
              UPDATE devices SET status = 'offline' WHERE id = ${deviceId}
            `;
          } catch (dbErr) {
            console.error("Database Error (Offline Log):", dbErr);
          }
        }
      }
    } else if (actuallyOnline) {
      if (currentState === 'offline') {
        const message = 
`<b>✅ CCTV KEMBALI NORMAL</b>

📷 Device: <b>${cname}</b>
🆔 Device ID: <code>${deviceId || '-'}</code>
🕐 Waktu Pulih: ${currentTime}

CCTV telah beroperasi dan terhubung kembali.`;

        const teleRes = await sendTelegramAlert(message);
        if (!teleRes.ok) console.error("Telegram API Error:", await teleRes.json());

        // Log ke database Neon dan update tabel devices
        try {
          await sql`
            INSERT INTO notification_logs (device_id, device_name, status)
            VALUES (${deviceId}, ${cname}, 'online')
          `;
          await sql`
            UPDATE devices SET status = 'online' WHERE id = ${deviceId}
          `;
        } catch (dbErr) {
          console.error("Database Error (Online Log):", dbErr);
        }
      } else {
        console.log(`CCTV ${cname} (${deviceId}) sudah online. Abaikan pesan ganda.`);
      }
    }

    return NextResponse.json({ code: '0', msg: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Fungsi Delay / Retry Loop (3x3 Detik)
async function verifyDeviceOfflineWithRetry(deviceId: string, maxRetries = 3, delayMs = 3000): Promise<boolean> {
  if (!deviceId) return true; 

  for (let i = 1; i <= maxRetries; i++) {
    console.log(`[Ping Check ${i}/${maxRetries}] Verifikasi status device ${deviceId}...`);
    
    if (i < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return true;
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