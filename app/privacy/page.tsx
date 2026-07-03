import { ArrowLeft, ShieldCheck, Lock, Database, Cookie, UserCheck, Mail } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Kebijakan Privasi — CSS 3.0",
    description: "Bagaimana CSS 3.0 mengumpulkan, menggunakan, dan melindungi data pribadi peserta.",
    openGraph: {
      title: "Kebijakan Privasi — CSS 3.0",
      description: "Bagaimana CSS 3.0 mengumpulkan, menggunakan, dan melindungi data pribadi peserta.",
    }
}

const highlights = [
  {
    icon: Database,
    title: "Data yang Dikumpulkan",
    body: "Nama, email, nomor kontak, institusi, dan berkas pendukung yang kamu unggah saat pendaftaran lomba.",
  },
  {
    icon: Lock,
    title: "Keamanan",
    body: "Data disimpan pada infrastruktur cloud terenkripsi dengan Row Level Security dan otentikasi ketat.",
  },
  {
    icon: UserCheck,
    title: "Kontrol Pengguna",
    body: "Kamu berhak mengakses, memperbaharui, atau meminta penghapusan data pribadi kapan saja.",
  },
  {
    icon: Cookie,
    title: "Cookie",
    body: "Kami menggunakan cookie esensial untuk sesi login dan preferensi tampilan — bukan untuk iklan.",
  },
];

const sections = [
  {
    title: "1. Informasi yang Kami Kumpulkan",
    body: "Kami mengumpulkan informasi yang kamu berikan secara langsung saat membuat akun, mendaftar lomba, atau berkomunikasi dengan panitia. Informasi ini meliputi identitas diri, institusi asal, kontak, dan berkas pendukung.",
  },
  {
    title: "2. Bagaimana Kami Menggunakan Data",
    body: "Data digunakan untuk: memproses pendaftaran lomba, verifikasi identitas peserta, komunikasi terkait event, penerbitan sertifikat, dan pelaporan dokumentasi kegiatan.",
  },
  {
    title: "3. Berbagi Data dengan Pihak Ketiga",
    body: "Kami tidak menjual data pribadi kamu. Data hanya dibagikan kepada penyedia layanan resmi (payment gateway, penyimpanan cloud) sebatas yang diperlukan untuk operasional platform.",
  },
  {
    title: "4. Penyimpanan & Retensi Data",
    body: "Data akan disimpan selama akun aktif dan hingga 1 tahun setelah event berakhir untuk keperluan audit dan dokumentasi. Setelah periode tersebut, data akan dianonimkan atau dihapus.",
  },
  {
    title: "5. Hak Peserta",
    body: "Kamu berhak: (a) mengakses data pribadi, (b) memperbaiki data yang tidak akurat, (c) meminta penghapusan akun, dan (d) menarik persetujuan pengolahan data kapan saja.",
  },
  {
    title: "6. Keamanan Data",
    body: "Kami menerapkan langkah teknis dan organisatoris untuk melindungi data — enkripsi in-transit (TLS), enkripsi at-rest, kontrol akses berbasis peran, serta audit log berkala.",
  },
  {
    title: "7. Perubahan Kebijakan",
    body: "Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diinformasikan melalui email atau notifikasi pada platform.",
  },
];

const PrivacyPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-20 top-40 -z-10 h-80 w-80 rounded-full bg-cyan-strong/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-24 top-2/3 -z-10 h-96 w-96 rounded-full bg-sapphire/25 blur-3xl animate-float [animation-delay:2s]" />

      <div className="mx-auto max-w-4xl">
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
          Terakhir diperbarui: 3 Juli 2026. Privasi kamu adalah prioritas kami. Halaman ini
          menjelaskan bagaimana data kamu diperlakukan di platform CSS 3.0.
        </p>

        {/* Highlights grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
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
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {s.body}
              </p>
            </article>
          ))}
        </div>

        {/* Contact card */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-sapphire/15 via-transparent to-cyan-strong/15 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Ada pertanyaan?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tim CSS 3.0 siap membantu kamu terkait data pribadi.
              </p>
            </div>
            <a
              href="mailto:cssunila@gmail.com"
              className="btn-hero hover:btn-hero-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
            >
              <Mail size={14} /> Hubungi Kami
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;