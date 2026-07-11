import { ArrowLeft, FileText, ScrollText } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
    title: "Syarat & Ketentuan",
    description: "Aturan main penggunaan platform pendaftaran lomba CSS 3.0.",
    openGraph: {
      title: "Syarat & Ketentuan — CSS 3.0",
      description: "Aturan main penggunaan platform pendaftaran lomba CSS 3.0.",
    }
}

const sections = [
  {
    title: "1. Penerimaan Ketentuan",
    body: "Dengan mengakses dan menggunakan situs CSS 3.0, kamu setuju untuk terikat pada seluruh syarat dan ketentuan di halaman ini. Jika kamu tidak menyetujui salah satu ketentuan, mohon untuk tidak menggunakan layanan kami.",
  },
  {
    title: "2. Akun Peserta",
    body: "Kamu wajib memberikan data yang akurat, terkini, dan lengkap saat mendaftar akun. Kamu bertanggung jawab menjaga kerahasiaan kredensial akun serta seluruh aktivitas yang terjadi di dalamnya.",
  },
  {
    title: "3. Pendaftaran Lomba",
    body: "Peserta wajib membaca panduan tiap kategori lomba sebelum mendaftar. Data pendaftaran yang telah dikirim menjadi tanggung jawab peserta. Panitia berhak mendiskualifikasi peserta yang memberikan data palsu.",
  },
  {
    title: "4. Pembayaran",
    body: "Seluruh pembayaran diproses melalui payment gateway resmi. Biaya pendaftaran yang telah dibayarkan bersifat non-refundable, kecuali terdapat pembatalan sepihak dari panitia karena kondisi force majeure.",
  },
  {
    title: "5. Hak Kekayaan Intelektual",
    body: "Seluruh karya yang dilombakan tetap menjadi milik peserta. Namun, peserta memberikan izin kepada panitia CSS 3.0 untuk menggunakan karya tersebut dalam keperluan dokumentasi, publikasi, dan promosi event.",
  },
  {
    title: "6. Perilaku Pengguna",
    body: "Dilarang menggunakan platform untuk aktivitas ilegal, menyebarkan konten SARA, ujaran kebencian, spam, atau tindakan yang merugikan pengguna lain. Pelanggaran dapat berakibat pemblokiran akun tanpa pemberitahuan.",
  },
  {
    title: "7. Perubahan Ketentuan",
    body: "Panitia berhak mengubah, menambah, atau menghapus bagian dari ketentuan ini sewaktu-waktu. Perubahan berlaku sejak dipublikasikan di halaman ini. Silakan periksa secara berkala.",
  },
  {
    title: "8. Batasan Tanggung Jawab",
    body: "Layanan disediakan sebagaimana adanya (as-is). CSS 3.0 tidak bertanggung jawab atas kerugian tidak langsung yang timbul akibat gangguan teknis di luar kendali kami.",
  },
  {
    title: "9. Kontak",
    body: "Untuk pertanyaan mengenai ketentuan ini, silakan hubungi kami melalui cssunila@gmail.com.",
  },
];

const TermsPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-24 top-32 -z-10 h-80 w-80 rounded-full bg-sapphire/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-16 top-1/2 -z-10 h-96 w-96 rounded-full bg-cyan-strong/20 blur-3xl animate-float [animation-delay:2s]" />

      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-sapphire to-cyan-strong shadow-[var(--shadow-glow)]">
            <ScrollText className="size-6 text-background" />
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-cyan-strong">
            <FileText size={10} /> Legal
          </span>
        </div>

        <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Syarat & <span className="gradient-text">Ketentuan</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Terakhir diperbarui: 3 Juli 2026. Mohon baca dokumen ini dengan seksama sebelum
          menggunakan platform CSS 3.0.
        </p>

        <div className="mt-12 space-y-4">
          {sections.map((s, i) => (
            <article
              key={i}
              className="glass group rounded-2xl p-6 transition hover:border-cyan-strong/40 sm:p-7"
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

        <div className="mt-12 rounded-2xl border border-border/60 bg-white/5 p-6 text-center text-xs text-muted-foreground">
          Dengan melanjutkan menggunakan platform ini, kamu dianggap telah membaca dan
          menyetujui seluruh ketentuan di atas.
        </div>
      </div>
    </div>
  );
}

export default TermsPage;