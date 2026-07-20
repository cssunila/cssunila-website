import { ArrowLeft, ShieldCheck, Lock, Database, Cookie, UserCheck, Mail, Globe, Bell } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Kebijakan Privasi",
    description: "Bagaimana CSS Unila 3.0 mengumpulkan, menggunakan, dan melindungi data pribadi peserta, termasuk data yang diperoleh melalui Google OAuth.",
    openGraph: {
      title: "Kebijakan Privasi — CSS Unila 3.0",
      description: "Bagaimana CSS Unila 3.0 mengumpulkan, menggunakan, dan melindungi data pribadi peserta.",
    }
}

const highlights = [
  {
    icon: Database,
    title: "Data yang Dikumpulkan",
    body: "Nama, email, foto profil (dari Google), nomor kontak, institusi, dan berkas pendukung yang kamu unggah saat pendaftaran lomba.",
  },
  {
    icon: Lock,
    title: "Keamanan",
    body: "Data disimpan pada infrastruktur cloud terenkripsi dengan Row Level Security dan otentikasi ketat (Supabase Auth).",
  },
  {
    icon: UserCheck,
    title: "Kontrol Pengguna",
    body: "Kamu berhak mengakses, memperbaharui, atau meminta penghapusan data pribadi kapan saja melalui email panitia.",
  },
  {
    icon: Cookie,
    title: "Cookie & Sesi",
    body: "Kami menggunakan cookie esensial untuk sesi login dan preferensi tampilan — bukan untuk iklan atau pelacakan pihak ketiga.",
  },
  {
    icon: Globe,
    title: "Login Google",
    body: "Saat kamu masuk menggunakan akun Google, kami hanya mengakses nama dan alamat email dari profil publikmu — tidak lebih.",
  },
  {
    icon: Bell,
    title: "Notifikasi",
    body: "Dengan mengizinkan notifikasi browser, endpoint perangkatmu disimpan agar kami bisa mengirimkan notifikasi terkait lomba.",
  },
];

const sections = [
  {
    title: "1. Informasi yang Kami Kumpulkan",
    body: `Kami mengumpulkan informasi dalam dua cara:

a) Informasi yang kamu berikan langsung — saat membuat akun menggunakan email/password atau Google OAuth, mendaftar lomba, atau berkomunikasi dengan panitia. Informasi ini meliputi: nama lengkap, alamat email, institusi asal, nomor kontak, dan berkas pendukung.

b) Informasi yang kami terima dari Google — apabila kamu memilih untuk masuk menggunakan akun Google, kami menerima nama tampilan dan alamat email dari akun Google kamu. Kami TIDAK meminta atau menyimpan akses ke Gmail, Google Drive, kontak, atau layanan Google lainnya.`,
  },
  {
    title: "2. Bagaimana Kami Menggunakan Data",
    body: `Data yang kami kumpulkan digunakan semata-mata untuk keperluan operasional platform CSS Unila, yaitu:
- Memproses dan memverifikasi pendaftaran lomba
- Mengirimkan notifikasi terkait status pendaftaran, pembayaran, dan pengumuman event
- Komunikasi resmi antara peserta dan panitia
- Menerbitkan sertifikat dan dokumentasi kegiatan
- Peningkatan keamanan dan performa platform

Kami tidak menggunakan data kamu untuk keperluan iklan, profiling komersial, atau dijual kepada pihak ketiga.`,
  },
  {
    title: "3. Penggunaan Data dari Google OAuth",
    body: `Apabila kamu memilih untuk masuk menggunakan akun Google:
- Kami hanya mengakses nama dan alamat email dari akun Google kamu (scope: profile, email)
- Informasi ini digunakan untuk membuat dan mengelola akunmu di platform CSS Unila
- Kami TIDAK mengakses, membaca, atau menyimpan data lain dari akun Google kamu (termasuk Gmail, Kontak, Drive, atau Kalender)
- Kamu dapat mencabut akses ini kapan saja melalui pengaturan akun Google kamu di myaccount.google.com
- Data yang diperoleh dari Google tidak dibagikan kepada pihak ketiga manapun`,
  },
  {
    title: "4. Berbagi Data dengan Pihak Ketiga",
    body: `Kami tidak menjual atau menyewakan data pribadi kamu. Data hanya dibagikan kepada penyedia layanan teknis yang membantu operasional platform, yaitu:
- Supabase (database dan autentikasi) — sebagai penyimpan data terenkripsi
- Midtrans (payment gateway) — hanya data yang diperlukan untuk memproses pembayaran
- Google (OAuth provider) — untuk proses autentikasi login saja

Seluruh pihak ketiga ini terikat oleh kebijakan privasi dan keamanan data mereka masing-masing.`,
  },
  {
    title: "5. Penyimpanan & Retensi Data",
    body: "Data akan disimpan selama akun aktif dan hingga 1 tahun setelah event berakhir untuk keperluan audit dan dokumentasi. Setelah periode tersebut, data akan dianonimkan atau dihapus secara permanen.",
  },
  {
    title: "6. Notifikasi Push Browser",
    body: "Apabila kamu mengizinkan notifikasi browser (Web Push), kami menyimpan token/endpoint perangkatmu di database kami. Data ini hanya digunakan untuk mengirimkan notifikasi terkait lomba (seperti status pendaftaran dan pengumuman). Kamu dapat mencabut izin ini kapan saja melalui pengaturan browser.",
  },
  {
    title: "7. Hak Peserta",
    body: `Kamu memiliki hak-hak berikut atas data pribadimu:
(a) Hak Akses — meminta salinan data pribadi yang kami simpan
(b) Hak Koreksi — memperbaiki data yang tidak akurat atau tidak lengkap
(c) Hak Penghapusan — meminta penghapusan akun dan seluruh data terkait
(d) Hak Portabilitas — meminta data dalam format yang dapat dibaca mesin
(e) Hak Penarikan Persetujuan — mencabut persetujuan pemrosesan data kapan saja

Untuk menggunakan hak-hak ini, hubungi kami di cssunila25@gmail.com.`,
  },
  {
    title: "8. Keamanan Data",
    body: "Kami menerapkan langkah teknis dan organisatoris untuk melindungi data — enkripsi in-transit (TLS/HTTPS), enkripsi at-rest, kontrol akses berbasis peran (Row Level Security), serta audit log aktivitas secara berkala.",
  },
  {
    title: "9. Anak di Bawah Umur",
    body: "Platform ini ditujukan bagi pengguna berusia 17 tahun ke atas. Kami tidak secara sengaja mengumpulkan data dari anak di bawah usia 17 tahun tanpa persetujuan orang tua/wali.",
  },
  {
    title: "10. Perubahan Kebijakan",
    body: "Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diinformasikan melalui email atau notifikasi pada platform setidaknya 7 hari sebelum berlaku.",
  },
];

const PrivacyPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden pt-20 md:pt-24 pb-26 md:pb-30">
      <div className="pointer-events-none absolute -left-20 top-40 -z-10 h-80 w-80 rounded-full bg-cyan-strong/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-24 top-2/3 -z-10 h-96 w-96 rounded-full bg-sapphire/25 blur-3xl animate-float [animation-delay:2s]" />

      <div className="mx-auto max-w-4xl px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-sapphire to-cyan-strong shadow-[var(--shadow-glow)]">
            <ShieldCheck className="size-6 text-background" />
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-cyan-strong">
            <Lock size={10} /> Privasi
          </span>
        </div>

        <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Kebijakan <span className="gradient-text">Privasi</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Terakhir diperbarui: 20 Juli 2026. Privasi kamu adalah prioritas kami. Halaman ini
          menjelaskan bagaimana data kamu diperlakukan di platform CSS Unila 3.0, termasuk
          data yang diperoleh melalui login Google.
        </p>

        {/* Highlights grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="glass group rounded-2xl p-5 transition hover:border-cyan-strong/40"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/5 text-cyan-strong ring-1 ring-inset ring-white/10 transition group-hover:bg-gradient-to-br group-hover:from-sapphire group-hover:to-cyan-strong group-hover:text-background">
                  <Icon size={18} />
                </span>
                <h3 className="font-display text-sm font-semibold tracking-wide">
                  {title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        {/* Detail sections */}
        <div className="mt-12 space-y-4">
          {sections.map((s, i) => (
            <article
              key={i}
              className="glass rounded-2xl p-6 transition hover:border-cyan-strong/40 sm:p-7"
            >
              <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                {s.title}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {s.body}
              </p>
            </article>
          ))}
        </div>

        {/* Contact card */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-sapphire/15 via-transparent to-cyan-strong/15 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Ada pertanyaan tentang privasi?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Hubungi Data Protection Officer kami. Kami akan merespons dalam 3 hari kerja.
              </p>
            </div>
            <Link
              href="mailto:cssunila25@gmail.com"
              className="btn-hero hover:btn-hero-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
            >
              <Mail size={14} /> cssunila25@gmail.com
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          CSS Unila 3.0 — Computer Science Showdown Universitas Lampung &middot;{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground transition">
            Syarat &amp; Ketentuan
          </Link>
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;