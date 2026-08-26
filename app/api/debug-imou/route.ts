import { NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_ID = (process.env.IMOU_APP_ID || '').trim();
const APP_SECRET = (process.env.IMOU_APP_SECRET || '').trim();

// Daftar semua kemungkinan URL IMOU yang perlu dicoba
const CANDIDATE_URLS = [
  'https://api-sg.imoulife.com/openapi/public/api',
  'https://api.imoulife.com/openapi/public/api',
  'https://openapi.imoulife.com/openapi/public/api',
  'https://api-cn.imoulife.com/openapi/public/api',
];

function buildRequestBody() {
  const time = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2, 10);
  const signRaw = `time:${time},nonce:${nonce},appSecret:${APP_SECRET}`;
  const sign = crypto.createHash('md5').update(signRaw).digest('hex');
  return {
    system: { ver: '1.0', appId: APP_ID, time, nonce, sign },
    params: {},
    id: crypto.randomUUID(),
  };
}

export async function GET() {
  const results: Record<string, string> = {};

  for (const baseUrl of CANDIDATE_URLS) {
    const url = `${baseUrl}/accessToken`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequestBody()),
        signal: AbortSignal.timeout(7000),
      });
      const text = await res.text();
      results[baseUrl] = `HTTP ${res.status}: ${text.substring(0, 200)}`;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results[baseUrl] = `ERROR: ${msg}`;
    }
  }

  return NextResponse.json({
    appId: APP_ID ? `${APP_ID.substring(0, 6)}***` : 'KOSONG!',
    appSecret: APP_SECRET ? `${APP_SECRET.substring(0, 4)}***` : 'KOSONG!',
    results,
  });
}
