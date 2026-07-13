import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";
import {
    ArrowLeft,
    Mail,
    Instagram,
    MapPin,
    Clock,
    Github,
    Linkedin,
    Globe,
    Code2,
    HelpCircle,
    Send,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi panitia CSS 3.0 atau tim developer untuk pertanyaan, kendala pendaftaran, atau kerja sama sponsorship.",
  openGraph: {
    title: "Kontak — CSS 3.0",
    description: "Butuh bantuan? Hubungi panitia CSS 3.0 dan tim developer platform.",
  }
}

const channels = [
    {
        icon: Mail,
        label: "Email CSS",
        value: "cssunila25@gmail.com",
        href: "mailto:cssunila25@gmail.com",
        hint: "Balasan dalam 1×24 jam kerja",
    },
    {
        icon: Instagram,
        label: "Instagram",
        value: "@cssunila",
        href: "https://www.instagram.com/cssunila",
        hint: "Info & pengumuman harian",
    }
];

const developer = {
    name: "Tim Developer CSS 3.0",
    role: "Full-Stack Developer · Platform Team",
    bio: "Membangun & merawat platform website CSS 3.0 — mulai dari perancangan sistem, payment gateway, hingga keseluruhan aplikasi website. Fokus pada pengalaman pengguna yang cepat, aman, dan elegan.",
    stack: ["Next JS", "TanStack Start", "TypeScript", "Supabase", "Tailwind CSS"],
    socials: [
        { icon: Github, label: "GitHub", href: "https://github.com/Raflysaputra23" },
        { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
        { icon: Globe, label: "Portfolio", href: "https://bangraffff.vercel.app" },
        { icon: Mail, label: "Email", href: "mailto:raflysaputra231220@gmail.com" },
    ],
};

const faqs = [
    {
        q: "Bagaimana jika pembayaran sudah dilakukan tapi status masih pending?",
        a: "Tunggu maksimal 15 menit. Jika belum berubah, hubungi WhatsApp CS dengan menyertakan bukti transfer dan email akunmu.",
    },
    {
        q: "Saya tidak menerima email pembayaran success setelah pembayaran berhasil.",
        a: "Cek folder Spam/Promotions.",
    },
    {
        q: "Apakah bisa mengubah data anggota tim setelah mendaftar?",
        a: "Bisa, dengan mengirim permintaan resmi ke email panitia paling lambat H-3 sebelum Technical Meeting.",
    },
    {
        q: "Bagaimana cara menjadi sponsor atau media partner?",
        a: "Kirim proposal atau company profile ke cssunila25@gmail.com dengan subjek [SPONSORSHIP CSS 3.0]. atau hubungi panitia kami secara langsung.",
    },
];

const KontakPage = () => {
    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <Navbar />

            <div className="overflow-hidden py-20 pt-26 sm:py-28">
                <div className="pointer-events-none absolute -left-20 top-24 -z-10 h-96 w-96 rounded-full bg-cyan-strong/25 blur-3xl animate-float" />
                <div className="pointer-events-none absolute -right-24 top-1/2 -z-10 h-104 w-104 rounded-full bg-sapphire/25 blur-3xl animate-float [animation-delay:2s]" />

                <div className="mx-auto max-w-6xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft size={14} /> Kembali ke Beranda
                    </Link>

                    {/* Hero */}
                    <div className="mt-5 max-w-2xl">
                        <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                            Ada kendala? <br />
                            <span className="gradient-text">Kami di sini</span> untukmu.
                        </h1>
                        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                            Tim panitia dan developer CSS 3.0 siap membantu — dari pertanyaan
                            teknis, kendala pembayaran, hingga peluang kerja sama.
                        </p>
                    </div>

                    {/* Channels */}
                    <div className="mt-14 grid gap-4 sm:grid-cols-2">
                        {channels.map((c) => (
                            <Link
                                key={c.label}
                                href={c.href}
                                target={"_blank"}
                                rel="noreferrer"
                                className="glass group flex items-start gap-4 rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-cyan-strong/40 sm:p-6"
                            >
                                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-sapphire/80 to-cyan-strong/70 transition group-hover:shadow-[var(--shadow-glow)]">
                                    <c.icon className="size-5 text-background" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                                        {c.label}
                                    </div>
                                    <div className="mt-1 truncate font-display text-base font-semibold text-foreground sm:text-lg">
                                        {c.value}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {c.hint}
                                    </div>
                                </div>
                                <Send
                                    size={16}
                                    className="mt-1 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-strong"
                                />
                            </Link>
                        ))}
                    </div>

                    {/* Address + hours */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-center gap-3">
                                <MapPin className="size-5 text-cyan-strong" />
                                <h3 className="font-display text-base font-semibold">
                                    Lokasi
                                </h3>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Jl. Prof.Dr. Ir. Sumatri Brojonegoro No.1 Gedong Meneng, Kec. Rajabasa, Kota Bandar Lampung, Indonesia
                            </p>
                        </div>
                    </div>

                    {/* Developer profile */}
                    <div className="mt-24">
                        <div className="text-center">
                            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-cyan-strong">
                                <Code2 size={14} /> Tim Developer
                            </span>
                            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                                Di balik <span className="gradient-text">platform</span> ini.
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                                Ada bug atau saran teknis? Sapa langsung tim yang membangun
                                platform CSS 3.0.
                            </p>
                        </div>

                        <div className="mt-10 overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-sapphire/20 via-background to-cyan-strong/15 p-8 sm:p-10">
                            <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
                                <div className="relative mx-auto md:mx-0">
                                    <div className="absolute -inset-3 -z-10 rounded-full bg-linear-to-br from-sapphire/50 to-cyan-strong/40 blur-2xl" />
                                    <div className="flex size-32 items-center justify-center rounded-3xl bg-linear-to-br from-sapphire to-cyan-strong shadow-[var(--shadow-glow)]">
                                        <Code2 className="size-14 text-background" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-display text-2xl font-bold sm:text-3xl">
                                        {developer.name}
                                    </h3>
                                    <div className="mt-1 text-sm font-medium text-cyan-strong">
                                        {developer.role}
                                    </div>
                                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                                        {developer.bio}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {developer.stack.map((s) => (
                                            <span
                                                key={s}
                                                className="rounded-full border border-border/60 bg-white/5 px-3 py-1 text-[11px] font-medium text-foreground/80"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {developer.socials.map((s) => (
                                            <Link
                                                key={s.label}
                                                href={s.href}
                                                target={"_blank"}
                                                rel="noreferrer"
                                                aria-label={s.label}
                                                className="glass flex size-10 items-center justify-center rounded-full text-foreground/80 transition hover:text-cyan-strong"
                                            >
                                                <s.icon size={16} />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="mt-24">
                        <div className="text-center">
                            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-cyan-strong">
                                <HelpCircle size={14} /> Pertanyaan Umum
                            </span>
                            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                                Sebelum <span className="gradient-text">menghubungi</span>.
                            </h2>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-2">
                            {faqs.map((f) => (
                                <article
                                    key={f.q}
                                    className="glass rounded-2xl p-6 transition hover:border-cyan-strong/40"
                                >
                                    <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
                                        {f.q}
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        {f.a}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="mt-20 rounded-3xl border border-border/60 bg-white/5 p-8 text-center sm:p-10">
                        <p className="text-sm text-muted-foreground">
                            Masih butuh bantuan? Kirim email dan tim kami akan segera membalas.
                        </p>
                        <a
                            href="mailto:cssunila25@gmail.com"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-strong to-sapphire px-6 py-3 text-sm font-semibold text-background shadow-[var(--shadow-glow)] transition hover:opacity-90"
                        >
                            <Mail size={16} /> cssunila25@gmail.com
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default KontakPage;