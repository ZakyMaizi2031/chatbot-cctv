import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Buat tabel notification_logs jika belum ada
    await sql`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(255) NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Buat tabel devices jika belum ada (untuk sinkronisasi dari IMOU API)
    await sql`
      CREATE TABLE IF NOT EXISTS devices (
        device_id VARCHAR(255) PRIMARY KEY,
        device_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'unknown',
        last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Bersihkan tabel (opsional, agar tidak duplikat jika dijalankan berulang)
    // await sql`TRUNCATE TABLE notification_logs`;

    // 3. Masukkan data testing lama
    // K1 Sparkle (B43BACCPSF3CCB7) - Offline
    // Pintu Timur (8E0250FPAZ4DBFE) - Offline
    await sql`
      INSERT INTO notification_logs (device_id, device_name, status, created_at)
      VALUES 
        ('B43BACCPSF3CCB7', 'K1 Sparkle', 'offline', NOW() - INTERVAL '1 day'),
        ('8E0250FPAZ4DBFE', 'Pintu Timur', 'offline', NOW() - INTERVAL '2 hours')
    `;

    return NextResponse.json({ message: 'Database setup and seeding completed!' });
  } catch (error) {
    console.error('Setup DB Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
