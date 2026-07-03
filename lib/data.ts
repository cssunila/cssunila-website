import { Gamepad2, Trophy, Brain, Code2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Competition = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: "cyan" | "sapphire" | "evergreen" | "twilight";
  fee: string;
  quota: string;
  teamSize: string;
  prize: string;
  rules: string[];
  timeline: { date: string; label: string }[];
};

export const competitions: Competition[] = [
  {
    slug: "mobile-legends",
    name: "Mobile Legends",
    tagline: "5v5 MOBA Tournament",
    description:
      "Pertarungan epik 5v5 untuk menentukan tim Mobile Legends terbaik. Format single elimination dengan grand final di panggung utama CSS 3.0.",
    icon: Gamepad2,
    accent: "sapphire",
    fee: "Rp 150.000 / tim",
    quota: "32 tim",
    teamSize: "5 pemain + 1 cadangan",
    prize: "Rp 8.000.000 + Trophy + Merch",
    rules: [
      "Peserta adalah pelajar SMA/SMK/Mahasiswa aktif (KTM/Kartu Pelajar wajib).",
      "Satu tim terdiri dari 5 pemain inti dan maksimal 1 pemain cadangan.",
      "Akun Mobile Legends minimal rank Epic.",
      "Format BO1 babak penyisihan, BO3 semifinal, BO5 grand final.",
      "Wajib hadir di technical meeting online.",
    ],
    timeline: [
      { date: "10 Okt 2026", label: "Pendaftaran dibuka" },
      { date: "05 Nov 2026", label: "Technical Meeting" },
      { date: "08 Nov 2026", label: "Babak Penyisihan" },
      { date: "15 Nov 2026", label: "Grand Final" },
    ],
  },
  {
    slug: "futsal",
    name: "Futsal",
    tagline: "Campus Futsal Cup",
    description:
      "Turnamen futsal antar kampus & sekolah dengan format grup dilanjut knockout. Lapangan vinyl premium dan wasit bersertifikat.",
    icon: Trophy,
    accent: "evergreen",
    fee: "Rp 350.000 / tim",
    quota: "16 tim",
    teamSize: "5 pemain inti + 5 cadangan",
    prize: "Rp 10.000.000 + Trophy",
    rules: [
      "Pemain berasal dari satu instansi yang sama (kampus/sekolah).",
      "Wajib menggunakan seragam tim seragam warna.",
      "Mengikuti peraturan FIFA Futsal terbaru.",
      "Membawa surat dispensasi/keterangan dari kampus.",
    ],
    timeline: [
      { date: "10 Okt 2026", label: "Pendaftaran dibuka" },
      { date: "06 Nov 2026", label: "Technical Meeting" },
      { date: "09 Nov 2026", label: "Babak Grup" },
      { date: "16 Nov 2026", label: "Grand Final" },
    ],
  },
  {
    slug: "lct-komputer",
    name: "Lomba Cepat Tepat Komputer",
    tagline: "Quiz Showdown",
    description:
      "Adu pengetahuan seputar dunia komputer, jaringan, dan teknologi terkini dalam format quiz cepat tepat tiga babak.",
    icon: Brain,
    accent: "cyan",
    fee: "Rp 120.000 / tim",
    quota: "24 tim",
    teamSize: "3 peserta",
    prize: "Rp 5.000.000 + Trophy + Sertifikat",
    rules: [
      "Peserta jenjang SMA/SMK sederajat.",
      "Tiap tim wajib didampingi satu guru pembimbing.",
      "Materi mencakup hardware, software, jaringan, dan teknologi terkini.",
      "Tiga babak: penyisihan tertulis, semifinal lisan, final rebutan.",
    ],
    timeline: [
      { date: "10 Okt 2026", label: "Pendaftaran dibuka" },
      { date: "07 Nov 2026", label: "Technical Meeting" },
      { date: "10 Nov 2026", label: "Babak Penyisihan" },
      { date: "14 Nov 2026", label: "Grand Final" },
    ],
  },
  {
    slug: "cpc",
    name: "Competitive Programming Creative",
    tagline: "Algorithm + Creative Build",
    description:
      "Kompetisi pemrograman 2 babak: algorithmic problem-solving dan creative product hack. Untuk coder yang ingin diuji secara teknis & ide.",
    icon: Code2,
    accent: "cyan",
    fee: "Rp 180.000 / tim",
    quota: "20 tim",
    teamSize: "2-3 peserta",
    prize: "Rp 12.000.000 + Internship Opportunity",
    rules: [
      "Bahasa pemrograman bebas (C++, Python, Java, Go, dll).",
      "Babak 1: 5 jam contest algoritma (online).",
      "Babak 2: 24 jam creative hack (on-site).",
      "Plagiarisme akan didiskualifikasi otomatis.",
    ],
    timeline: [
      { date: "10 Okt 2026", label: "Pendaftaran dibuka" },
      { date: "08 Nov 2026", label: "Technical Meeting" },
      { date: "11 Nov 2026", label: "Babak Online Algorithm" },
      { date: "15-16 Nov", label: "Creative Hack On-site" },
    ],
  },
];

export const eventTimeline = [
  { start_date: "2026-07-03 11:40:00+00", end_date: "2026-07-08 11:40:00+00", label: "Pembukaan", status: "upcoming", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam dolore suscipit sunt cum quas. Fuga tenetur repudiandae at beatae sit. Distinctio doloribus laborum voluptate ipsa repudiandae voluptates aut itaque optio." },
  { start_date: "2026-07-09 11:40:00+00", end_date: "2026-07-11 11:40:00+00", label: "Pelaksanaan Lomba", status: "upcoming", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam dolore suscipit sunt cum quas. Fuga tenetur repudiandae at beatae sit. Distinctio doloribus laborum voluptate ipsa repudiandae voluptates aut itaque optio." },
  { start_date: "2026-07-12 11:40:00+00", end_date: null, label: "Penutupan", status: "upcoming", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam dolore suscipit sunt cum quas. Fuga tenetur repudiandae at beatae sit. Distinctio doloribus laborum voluptate ipsa repudiandae voluptates aut itaque optio." },
] as const;

export const news = [
  {
    slug: "css-30-resmi-dibuka",
    title: "CSS 3.0 Resmi Dibuka — Pendaftaran Mulai 1 Oktober",
    excerpt:
      "Edisi ketiga Computer Science Showdown kembali hadir dengan empat cabang lomba dan total hadiah lebih dari 35 juta rupiah.",
    date: "20 Sep 2026",
    category: "Pengumuman",
  },
  {
    slug: "talkshow-ai-2026",
    title: "Seminar AI & Future of Work — Mentor dari Industri",
    excerpt:
      "Hadirkan pembicara dari perusahaan teknologi nasional. Topik: peran AI dalam karir teknologi masa depan.",
    date: "18 Sep 2026",
    category: "Seminar",
  },
  {
    slug: "format-baru-cpc",
    title: "Format Baru CPC: Algorithm + Creative Hack",
    excerpt:
      "Tahun ini CPC menggabungkan kontes algoritma klasik dengan 24-jam creative build. Penuh tantangan, penuh peluang.",
    date: "12 Sep 2026",
    category: "Update Lomba",
  },
];

export const seminars = [
  {
    slug: "ai-future-of-work",
    title: "AI & The Future of Work",
    speaker: "Dr. Andika Pratama — Head of AI, Nusantech",
    date: "12 Nov 2026 · 09.00 WIB",
    location: "Auditorium Utama",
  },
  {
    slug: "cloud-native-engineering",
    title: "Cloud-Native Engineering 101",
    speaker: "Rifki Hadi — Principal Engineer, Cloudana",
    date: "13 Nov 2026 · 13.00 WIB",
    location: "Hall B",
  },
  {
    slug: "esports-industry",
    title: "Bangun Karier di Industri Esports",
    speaker: "Maya Larasati — Esports Manager, ArenaID",
    date: "14 Nov 2026 · 10.00 WIB",
    location: "Hall A",
  },
];

export const sponsors = [
  "Nusantech", "Cloudana", "ArenaID", "Sapphire Labs",
  "Cyan Studio", "Evergreen Co", "Frostbyte", "Indigo Pay",
];

export const mediaPartners = [
  "TechDaily", "Kampus Network", "CodeWeekly", "Esports Today",
  "DevPulse", "CampusVoice",
];