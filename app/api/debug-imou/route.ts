import { NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_ID = (process.env.IMOU_APP_ID || '').trim();
const APP_SECRET = (process.env.IMOU_APP_SECRET || '').trim();
const IMOU_BASE_URL = 'https://openapi-sg.easy4ip.com/openapi';

function buildRequestBody(params: any = {}) {
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

export async function GET() {
  const results: Record<string, any> = {};

  try {
    // 1. Get Token
    const tokenRes = await fetch(`${IMOU_BASE_URL}/accessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildRequestBody({})),
    });
    const tokenJson = await tokenRes.json();
    const token = tokenJson.result?.data?.accessToken;
    
    if (!token) {
      return NextResponse.json({ error: 'Gagal dapat token', details: tokenJson });
    }

    // Daftar skenario parameter yang akan dicoba
    const scenarios = {
      'listDeviceDetailsByPage': { token, page: 1, pageSize: 1 } // Ambil 1 device saja untuk diinspeksi
    };

    for (const [name, params] of Object.entries(scenarios)) {
      const res = await fetch(`${IMOU_BASE_URL}/listDeviceDetailsByPage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequestBody(params)),
      });
      const json = await res.json();
      results['raw_device_data'] = json.result?.data?.deviceList?.[0] || 'Tidak ada device yang ditemukan';
    }

    return NextResponse.json({ token_sukses: true, results });

  } catch (e: any) {
    return NextResponse.json({ error: String(e) });
  }
}

