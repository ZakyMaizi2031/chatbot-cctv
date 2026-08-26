import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/lib/db';

// Base URL IMOU Open API - Singapore/APAC Region
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
    system: {
      ver: '1.0',
      appId: APP_ID,
      time,
      nonce,
      sign,
    },
    params,
    id: crypto.randomUUID(),
  };
}

// === Step 1: Ambil Access Token dari IMOU ===
async function getAccessToken(): Promise<string> {
  const body = buildRequestBody({});

  console.log('Requesting IMOU accessToken...', { appId: APP_ID });

  const res = await fetch(`${IMOU_BASE_URL}/accessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // Timeout: 10 detik
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`IMOU HTTP Error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  console.log('IMOU accessToken response:', JSON.stringify(json, null, 2));

  if (json.result?.code !== '0') {
    throw new Error(`IMOU AccessToken Error: ${json.result?.msg || JSON.stringify(json)}`);
  }

  return json.result.data.accessToken;
}

// === Step 2: Ambil Semua Device dari IMOU (dengan pagination) ===
async function getAllDevices(token: string) {
  const limit = 50; // batas per halaman
  let hasMore = true;
  const allDevices: { did: string; dname: string; status: string }[] = [];

  // IMOU API menggunakan parameter ini untuk deviceBaseList
  const body = buildRequestBody({ 
    token, 
    bindId: -1, 
    limit, 
    type: 'bindDevice' 
  });

  const res = await fetch(`${IMOU_BASE_URL}/deviceBaseList`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`IMOU DeviceBaseList HTTP Error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  console.log(`IMOU deviceBaseList response:`, JSON.stringify(json.result?.code));

  if (json.result?.code !== '0') {
    throw new Error(`IMOU DeviceBaseList Error: ${json.result?.msg || JSON.stringify(json)}`);
  }

  const deviceList = json.result?.data?.deviceList || [];

  for (const d of deviceList) {
    allDevices.push({
      did: d.deviceId || d.did || d.sn || '',
      dname: d.deviceName || d.name || d.dname || '',
      status: d.status === 1 || d.status === '1' || d.onLine === 1 || d.online === true ? 'online' : 'offline',
    });
  }

  return allDevices;
}

// === Main: GET /api/sync-devices ===
export async function GET() {
  try {
    if (!APP_ID || !APP_SECRET) {
      return NextResponse.json(
        { error: 'IMOU_APP_ID atau IMOU_APP_SECRET belum diisi di environment variables.' },
        { status: 500 }
      );
    }

    // 1. Dapatkan access token
    const token = await getAccessToken();

    // 2. Ambil semua device dari IMOU
    const devices = await getAllDevices(token);

    if (devices.length === 0) {
      return NextResponse.json({ message: 'Tidak ada device yang ditemukan dari IMOU.' });
    }

    // 3. UPSERT ke database Neon
    let newCount = 0;
    let updatedCount = 0;

    for (const device of devices) {
      if (!device.did) continue;

      const existing = await sql`
        SELECT device_id, device_name FROM devices WHERE device_id = ${device.did}
      `;

      if (existing.length === 0) {
        await sql`
          INSERT INTO devices (device_id, device_name, status, last_synced_at)
          VALUES (${device.did}, ${device.dname}, ${device.status}, NOW())
        `;
        newCount++;
      } else {
        const nameChanged = existing[0].device_name !== device.dname;
        await sql`
          UPDATE devices
          SET device_name = ${device.dname}, status = ${device.status}, last_synced_at = NOW()
          WHERE device_id = ${device.did}
        `;
        if (nameChanged) updatedCount++;
      }
    }

    return NextResponse.json({
      message: 'Sinkronisasi berhasil!',
      total_devices: devices.length,
      new_devices: newCount,
      updated_devices: updatedCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Sync Devices Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
