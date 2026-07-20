# CSS UNILA 3.0 — Computer Science Showdown

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Midtrans](https://img.shields.io/badge/Payment-Midtrans-navy?style=for-the-badge)](https://midtrans.com/)

**CSS UNILA 3.0** (Computer Science Showdown) adalah platform resmi berbasis web yang dirancang khusus untuk mengelola rangkaian event teknologi dan olahraga yang diselenggarakan oleh Himpunan Mahasiswa Ilmu Komputer (Himakom) Universitas Lampung. Platform ini memudahkan peserta untuk melakukan pendaftaran kompetisi, melakukan pembayaran secara instan melalui Payment Gateway, serta mempermudah panitia dalam mengelola data lomba secara realtime.

---

## 🚀 Fitur Utama

### 1. Portal Kompetisi & Pendaftaran Dinamis
* **Cabang Lomba Dinamis:** Mendukung pendaftaran lomba individu maupun tim dengan formulir input yang menyesuaikan kategori lomba secara dinamis.
* **Unggah Berkas Aman:** Upload file bukti identitas/persyaratan langsung ke Supabase Storage dengan kebijakan keamanan Row Level Security (RLS) yang membatasi hak akses berkas per user.

### 2. Integrasi Payment Gateway (Midtrans)
* **Pembayaran Instan:** Menggunakan **Midtrans Snap SDK** untuk memfasilitasi berbagai opsi pembayaran (QRIS, E-Wallet, Bank Transfer).
* **Verifikasi Otomatis:** Status pembayaran otomatis ter-update secara realtime menggunakan system callback dan webhook ke server.

### 3. Sistem Notifikasi Dua Lapis
* **Notifikasi Lonceng (In-App):** Menggunakan Supabase Realtime untuk memperbarui pemberitahuan di navbar peserta saat terjadi perubahan status verifikasi oleh admin.
* **Web Push Notifications:** Notifikasi pop-up langsung ke perangkat pengguna (desktop & mobile) meskipun tab browser sedang ditutup, memanfaatkan Service Worker dan Web Push API.

### 4. Dashboard Admin & Panel Kendali
* **Manajemen Konten (CMS):** Kontrol penuh atas pengaturan website (`site_settings`), berita/pengumuman, seminar, serta daftar sponsor dan media partner.
* **Manajemen Peserta:** Verifikasi pendaftaran, tolak pendaftaran dengan alasan kustom, serta kelola role user (Admin, Petugas, Lomba).
* **Audit Activity Logs:** Log aktivitas admin dan perubahan status krusial dicatat otomatis ke database menggunakan PostgreSQL trigger untuk keamanan pelaporan data.

---

## 🛠️ Teknologi & Libs

### Frontend
* **Core:** Next.js 16 (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS (Modern Grid, glassmorphism UI effects)
* **UI Components:** Shadcn UI, Radix UI primitives, Lucide React (Icons)
* **State & Data Fetching:** TanStack React Query v5, Supabase SSR client
* **PDF Utility:** JsPDF (untuk ekspor laporan / sertifikat)

### Backend & Database (Supabase)
* **Database:** PostgreSQL dengan RLS (Row Level Security) ketat
* **Autentikasi:** Supabase Auth + Google OAuth
* **Serverless Functions:** API Routes Next.js
* **Storage:** Supabase Storage (Buckets: `registration-files` & `site_settings`)

---

## 📂 Struktur Database (`css_schema.sql`)

Seluruh struktur database diatur secara otomatis menggunakan file schema SQL `css_schema.sql` yang berisi:
* **Tabel Inti:** `profiles`, `competitions`, `competition_fields`, `registrations`, `registration_answers`, `payments`, `winners`, `timeline_items`, `news`, `seminars`, `sponsors`, `media_partners`, `page_visibility`.
* **Keamanan:** 25+ Kebijakan **Row Level Security (RLS)** untuk menjamin user hanya dapat mengakses dan memodifikasi data milik mereka sendiri.
* **Logika Database (Postgres Trigger):**
  * `on_auth_user_created`: Otomatis membuat profile & role user saat signup Google/Email.
  * `on_registration_change`: Memicu notifikasi in-app ketika pendaftaran baru dibuat/diverifikasi.
  * Triggers logging aktivitas otomatis ke tabel `export_logs` dengan penanganan pengecualian (`EXCEPTION WHEN OTHERS`) agar transaksi pendaftaran utama tidak terganggu.

---

## ⚙️ Persiapan & Instalasi Lokal

### 1. Clone Project
```bash
git clone https://github.com/Raflysaputra23/cssunila3.0.git
cd cssunila3.0
```

### 2. Instal Dependensi
Gunakan `pnpm` untuk instalasi dependensi:
```bash
pnpm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Buat file `.env` di root direktori dan sesuaikan nilainya:

```env
# SUPABASE CONFIG
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-pub-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MIDTRANS CONFIG
NEXT_PUBLIC_MIDTRANS_MERCHANT_ID=your-merchant-id
NEXT_PUBLIC_MIDTRANS_SERVER_KEY_PROD=your-prod-server-key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PROD=your-prod-client-key
NEXT_PUBLIC_MIDTRANS_SERVER_KEY_SAND=your-sandbox-server-key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SAND=your-sandbox-client-key
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false # set true untuk production

# DOMAIN APP
NEXT_PUBLIC_DOMAIN_URL=http://localhost:3000

# GOOGLE OAUTH
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-client-secret

# WEB PUSH NOTIFICATIONS
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 4. Setup Database Supabase
1. Masuk ke dashboard Supabase Anda.
2. Buka **SQL Editor** -> Buat Query Baru.
3. Salin seluruh konten dari file `css_schema.sql` dan jalankan (Run).
4. Pastikan tabel, function, trigger, dan policies telah sukses dibuat.

### 5. Jalankan Aplikasi
Jalankan dev server secara lokal:
```bash
pnpm dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🌐 Panduan Deployment

### Vercel / Netlify
1. Hubungkan repository GitHub Anda ke Vercel.
2. Tambahkan seluruh Environment Variables di atas pada menu Settings di dashboard Vercel.
3. Gunakan build command: `npm run build` atau `next build`.
4. Sesuaikan `NEXT_PUBLIC_DOMAIN_URL` dengan domain production baru Anda (contoh: `https://cssunila.com`).

### Google OAuth Verification
Agar autentikasi Google OAuth disetujui oleh Google Verification Center, pastikan:
1. File `google_service.json` sudah dikonfigurasi dengan redirect URI mengarah ke callback Supabase: `https://[project-id].supabase.co/auth/v1/callback`.
2. Halaman Kebijakan Privasi dan Syarat & Ketentuan aktif dan dapat diakses publik tanpa login.
3. Tampilkan link persetujuan privasi di form pendaftaran/halaman login (sudah terintegrasi di `FormAuth.tsx`).

---

## 👥 Kontributor & Pengembang

* **M. Rafly Saputra** — *Lead Developer & Database Architect* — [@Raflysaputra23](https://github.com/Raflysaputra23)

---
*Dibuat dengan 💻 & ☕ oleh Himakom FMIPA Universitas Lampung.*