# Kreativa CCTV Monitoring Dashboard

Sistem monitoring terpusat untuk memantau status jaringan kamera CCTV secara real-time. Aplikasi ini dibangun dengan arsitektur modern untuk memastikan kecepatan, keamanan, dan skalabilitas.

## 🚀 Fitur Utama

- **Real-time Monitoring**: Memantau status (Online/Offline) seluruh kamera CCTV secara terpusat.
- **Riwayat Aktivitas**: Mencatat setiap kejadian koneksi terputus dan tersambung kembali beserta waktu detailnya.
- **Detail Perangkat**: Menampilkan statistik komprehensif untuk masing-masing kamera (frekuensi kerusakan, waktu sinkronisasi terakhir).
- **Sistem Keamanan SSO**: Autentikasi menggunakan Google Single Sign-On (SSO) yang dikombinasikan dengan *Role-Based Access Control* (RBAC). Hanya email yang terdaftar di database sebagai admin yang dapat masuk.
- **Manajemen Pengguna (Aman)**: Fitur penambahan admin baru oleh sesama admin, namun penghapusan dikunci di tingkat database untuk mencegah penghapusan sepihak (keamanan tinggi).

## 🛠️ Teknologi yang Digunakan

Aplikasi ini mengimplementasikan prinsip *Clean Architecture* dan *Modern Web Stack*:
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) - Memberikan performa maksimal dengan Server Components.
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/) - *Type-safe code* untuk mencegah *runtime errors*.
- **Database**: [Neon Serverless Postgres](https://neon.tech/) - Skalabilitas tinggi dengan integrasi `@vercel/postgres`.
- **Autentikasi**: [NextAuth.js (v4)](https://next-auth.js.org/) - Sistem *session* berbasis JWT dan OAuth 2.0.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Desain UI yang modern, responsif, dan elegan.

## 📂 Struktur Proyek Terpenting

- `/app/admin` - Berisi halaman dashboard, riwayat, dan detail perangkat. Memisahkan logika UI (seperti `Sidebar.tsx` dan `Pagination.tsx`) untuk *Clean Code*.
- `/app/admin/users` - Modul manajemen pengguna khusus admin.
- `/app/api` - Endpoint API untuk webhook dari sistem Imou dan callback autentikasi.
- `/lib` - File konfigurasi inti (`auth.ts` untuk NextAuth dan `db.ts` untuk koneksi database).

## 🔒 Variabel Lingkungan (.env)

Sistem ini membutuhkan beberapa variabel lingkungan agar dapat berjalan. Harap jangan pernah mempublikasikan file `.env` Anda.

```env
# Database Neon
DATABASE_URL="..."

# Google SSO
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# (Opsional) Integrasi Lain
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."
```

## ⚙️ Cara Menjalankan di Lokal

1. Pastikan Anda telah menginstal Node.js dan clone repositori ini.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Salin file `.env.example` menjadi `.env` dan isi dengan kredensial Anda.
4. Jalankan server:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000` di browser.

---
*Dibuat untuk mempermudah pemantauan keamanan dengan sistem yang andal dan mudah diskalakan.*
