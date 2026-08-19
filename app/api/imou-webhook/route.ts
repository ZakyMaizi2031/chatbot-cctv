// app/api/imou-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();

    if (body.cid === -1 && body.msgType === "offline") {
        await sendTelegramAlert(body.cname, body.time);
    }

    return NextResponse.json({ result: "ok" }, { status: 200 });
}

async function sendTelegramAlert(cname: string, unixTime: number) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_GROUP_ID;
    const teknisi = process.env.TEKNISI_USERNAME; // contoh: "@budi_teknisi"

    const waktu = new Date(unixTime * 1000).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const pesan = `⚠️ CCTV TIDAK BERFUNGSI

📷 ${cname}
🕐 Terdeteksi: ${waktu}

Mohon segera dicek oleh teknisi.
${teknisi}`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: pesan,
        }),
    });
}