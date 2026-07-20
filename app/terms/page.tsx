import { ArrowLeft, FileText, ScrollText } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
    title: "Syarat & Ketentuan",
    description: "Aturan penggunaan platform pendaftaran lomba CSS Unila 3.0 — Computer Science Showdown Universitas Lampung.",
    openGraph: {
      title: "Syarat & Ketentuan — CSS Unila 3.0",
      description: "Aturan penggunaan platform pendaftaran lomba CSS Unila 3.0.",
    }
}

const sections = [
  {
    title: "1. Penerimaan Ketentuan",
    body: "Dengan mengakses dan menggunakan platform CSS Unila 3.0, kamu menyatakan bahwa kamu telah membaca, memahami, dan setuju untuk terikat pada seluruh syarat dan ketentuan yang tercantum di halaman ini, termasuk Kebijakan Privasi kami. Jika kamu tidak menyetujui salah satu ketentuan, mohon untuk tidak menggunakan layanan kami.",
  },
  {
    title: "2. Deskripsi Layanan",
    body: `CSS Unila 3.0 (Computer Science Showdown) adalah platform web resmi yang dioperasikan oleh Himpunan Mahasiswa Ilmu Komputer Universitas Lampung untuk keperluan:
- Pendaftaran dan pengelolaan peserta lomba di bidang ilmu komputer dan teknologi
- Penyebaran informasi, berita, dan pengumuman terkait event
- Pemrosesan pembayaran biaya pendaftaran lomba
- Komunikasi antara panitia dan peserta`,
  },
  {
    title: "3. Akun Peserta",
    body: `Kamu dapat membuat akun menggunakan email/password atau melalui Google OAuth. Kamu wajib:
- Memberikan data yang akurat, terkini, dan lengkap
- Menjaga kerahasiaan password dan tidak membagikannya kepada pihak lain
- Segera memberitahu kami jika terjadi akses tidak sah ke akun kamu
- Bertanggung jawab atas seluruh aktivitas yang terjadi di bawah akunmu

Satu orang hanya diperbolehkan memiliki satu akun aktif. Pembuatan akun duplikat dapat berakibat pemblokiran.`,
  },
  {
    title: "4. Login dengan Google",
    body: `Apabila kamu memilih untuk masuk menggunakan akun Google, kamu memberikan izin kepada platform CSS Unila 3.0 untuk mengakses nama tampilan dan alamat email dari akun Google kamu semata-mata untuk keperluan pembuatan dan pengelolaan akun di platform ini. Kami tidak akan mengakses data Google lainnya di luar yang disebutkan. Kamu dapat mencabut izin ini kapan saja melalui pengaturan akun Google kamu.`,
  },
  {
    title: "5. Pendaftaran Lomba",
    body: `Peserta wajib:
- Membaca dan memahami panduan serta persyaratan tiap kategori lomba sebelum mendaftar
- Memastikan kebenaran seluruh data yang diinput pada formulir pendaftaran
- Mengunggah berkas yang valid dan sesuai ketentuan

Panitia berhak mendiskualifikasi peserta yang terbukti memberikan data palsu atau melanggar ketentuan lomba tanpa pengembalian biaya.`,
  },
  {
    title: "6. Pembayaran",
    body: `Seluruh pembayaran diproses melalui Midtrans sebagai payment gateway resmi. Ketentuan pembayaran:
- Biaya pendaftaran yang telah dibayarkan bersifat non-refundable, kecuali terdapat pembatalan sepihak dari panitia
- Peserta wajib menyelesaikan pembayaran dalam batas waktu yang telah ditentukan
- Bukti pembayaran harus disimpan sebagai referensi
- Jika terdapat kendala pembayaran, peserta wajib segera menghubungi panitia`,
  },
  {
    title: "7. Hak Kekayaan Intelektual",
    body: "Seluruh karya yang dilombakan tetap menjadi milik peserta dan tim yang menciptakannya. Namun, dengan mendaftar, peserta memberikan lisensi terbatas kepada panitia CSS Unila 3.0 untuk menggunakan, mereproduksi, dan menampilkan karya tersebut dalam keperluan dokumentasi, publikasi media sosial, dan promosi event tanpa kompensasi tambahan.",
  },
  {
    title: "8. Perilaku Pengguna",
    body: `Pengguna dilarang menggunakan platform untuk:
- Aktivitas ilegal atau melanggar peraturan perundang-undangan yang berlaku
- Menyebarkan konten SARA, ujaran kebencian, atau konten yang merendahkan martabat orang lain
- Melakukan spam, phishing, atau upaya peretasan sistem
- Membuat akun palsu atau menyamar sebagai orang lain
- Tindakan apapun yang merugikan pengguna lain atau integritas kompetisi

Pelanggaran dapat berakibat pemblokiran akun secara permanen tanpa pemberitahuan.`,
  },
  {
    title: "9. Notifikasi",
    body: "Dengan mengizinkan notifikasi browser, kamu menyetujui bahwa platform dapat mengirimkan pemberitahuan terkait status pendaftaran, pembayaran, dan pengumuman resmi event langsung ke perangkatmu. Kamu dapat menonaktifkan notifikasi kapan saja melalui pengaturan browser.",
  },
  {
    title: "10. Batasan Tanggung Jawab",
    body: "Layanan disediakan sebagaimana adanya (as-is). CSS Unila 3.0 tidak bertanggung jawab atas: (a) kerugian tidak langsung akibat gangguan teknis di luar kendali kami, (b) konten atau tindakan pihak ketiga yang terhubung dengan platform, (c) kerugian akibat keterlambatan atau kegagalan layanan pihak ketiga seperti payment gateway.",
  },
  {
    title: "11. Penghentian Layanan",
    body: "Panitia berhak menangguhkan atau menghentikan akses pengguna ke platform apabila terjadi pelanggaran ketentuan ini. Panitia juga berhak menghentikan atau mengubah layanan sewaktu-waktu dengan pemberitahuan yang wajar.",
  },
  {
    title: "12. Hukum yang Berlaku",
    body: "Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia. Segala sengketa yang timbul akan diselesaikan secara musyawarah, atau apabila tidak tercapai kesepakatan, diselesaikan melalui jalur hukum yang berlaku di wilayah Lampung.",
  },
  {
    title: "13. Perubahan Ketentuan",
    body: "Panitia berhak mengubah, menambah, atau menghapus bagian dari ketentuan ini sewaktu-waktu. Perubahan signifikan akan diinformasikan melalui email terdaftar atau notifikasi platform minimal 7 hari sebelum berlaku. Dengan terus menggunakan platform setelah perubahan, kamu dianggap menyetujui ketentuan yang diperbarui.",
  },
  {
    title: "14. Kontak & Pertanyaan",
    body: "Untuk pertanyaan mengenai ketentuan ini, silakan hubungi kami melalui:\nEmail: cssunila25@gmail.com\nAtau kunjungi halaman Kontak kami.",
  },
];

const TermsPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden pt-20 md:pt-24 pb-26 md:pb-30">
      <div className="pointer-events-none absolute -left-24 top-32 -z-10 h-80 w-80 rounded-full bg-sapphire/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-16 top-1/2 -z-10 h-96 w-96 rounded-full bg-cyan-strong/20 blur-3xl animate-float [animation-delay:2s]" />

      <div className="mx-auto max-w-3xl px-4">
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
          Syarat &amp; <span className="gradient-text">Ketentuan</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Terakhir diperbarui: 20 Juli 2026. Mohon baca dokumen ini dengan seksama sebelum
          menggunakan platform CSS Unila 3.0.
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
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {s.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border/60 bg-white/5 p-6 text-center text-xs text-muted-foreground">
          Dengan melanjutkan menggunakan platform ini, kamu dianggap telah membaca dan
          menyetujui seluruh ketentuan di atas serta{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground transition">
            Kebijakan Privasi
          </Link>{" "}
          kami.
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          CSS Unila 3.0 — Computer Science Showdown Universitas Lampung &middot;{" "}
          <Link href="mailto:cssunila25@gmail.com" className="underline underline-offset-4 hover:text-foreground transition">
            cssunila25@gmail.com
          </Link>
        </p>
      </div>
    </div>
  );
}

export default TermsPage;