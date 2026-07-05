"use client"

import { ArrowLeft, Users, Wallet, Trophy, CalendarCheck, CheckCircle2, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { useAuth } from "@/hooks/use-auth";
import { getIcon } from "@/lib/icons";
import { use, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/supabase/client";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { dateActive } from "@/lib/formatTanggal";

type CompetitionDetail = {
    slug: string; name: string; tagline: string | null; description: string | null;
    icon: string | null; accent: string | null; fee_idr: number; quota: number;
    team_size: string | null; prize: string | null; is_open: boolean;
    pj_1: string; no_pj_1: string; pj_2: string; no_pj_2: string; banner: string;
    rules: string[]; timeline: { date: string; label: string }[];
};

type IconProps = {
    icon: string;
};

const DynamicIcon = ({ icon }: IconProps) => {
    const IconNew = getIcon(icon) as LucideIcon;
    return <IconNew size={36} className="text-cyan-strong" />;
};

const LombaDetail = ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = use(params);
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentUrl =
        pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    const suparef = useRef(createClient());

    const { data: c, isLoading } = useQuery({
        queryKey: ["comp-detail", slug],
        queryFn: async (): Promise<CompetitionDetail | null> => {
            const supabase = suparef.current;
            const { data, error } = await supabase
                .from("competitions")
                .select("slug,name,tagline,description,icon,accent,fee_idr,quota,team_size,prize,is_open,rules,timeline,pj_1,no_pj_1,pj_2,no_pj_2,banner")
                .eq("slug", slug)
                .maybeSingle();
            if (error) throw error;
            if (!data) return null;
            return {
                ...data,
                rules: Array.isArray(data.rules) ? (data.rules as string[]) : [],
                timeline: Array.isArray(data.timeline) ? (data.timeline as { date: string; label: string }[]) : [],
            };
        },
    });

    if (isLoading) {
        return (
            <div className="relative min-h-screen">
                <Navbar />
                <div className="glass mx-auto mt-40 max-w-2xl rounded-3xl p-10 text-center text-sm text-muted-foreground">Memuat…</div>
            </div>
        );
    }
    if (!c) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4 text-center">
                <div>
                    <h1 className="font-display text-4xl font-bold">Lomba tidak ditemukan</h1>
                    <Link href="/" className="mt-6 inline-block text-cyan-strong underline">Kembali ke beranda</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <Navbar />

            <section className="relative pt-32 pb-12 md:pt-44">
                <div className="mx-auto max-w-5xl px-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft size={14} /> Kembali
                    </Link>

                    <div className="mt-6 flex flex-col items-start gap-6 md:flex-row md:items-center">
                        <div className="glass-strong flex size-20 items-center justify-center rounded-3xl">
                            <DynamicIcon icon={c.icon ?? "Trophy"} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium uppercase tracking-widest text-cyan-strong">
                                    {c.tagline}
                                </span>
                                {!c.is_open && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                                        <Lock size={10} /> Pendaftaran Ditutup
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-2 font-display text-4xl font-bold sm:text-6xl">
                                {c.name}
                            </h1>
                        </div>
                    </div>

                    <p className="mt-8 max-w-3xl text-lg text-muted-foreground">
                        {c.description}
                    </p>

                    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: Wallet, label: "Biaya", value: `Rp ${c.fee_idr.toLocaleString("id-ID")}` },
                            { icon: Users, label: "Kuota", value: `${c.quota > 0 ? c.quota + ' tim' : 'Tidak ada batasan'}` },
                            { icon: Users, label: "Tim", value: c.team_size ?? "-" },
                            { icon: Trophy, label: "Hadiah", value: c.prize ?? "-" },
                        ].map((s) => (
                            <div key={s.label} className="glass rounded-2xl p-5">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                                    <s.icon size={14} /> {s.label}
                                </div>
                                <div className="mt-2 font-display text-base font-semibold">
                                    {s.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2">
                    <div className="glass rounded-3xl p-7">
                        <h2 className="font-display text-2xl font-bold">Syarat & Ketentuan</h2>
                        <ul className="mt-5 space-y-3">
                            {c.rules.length === 0 && (
                                <li className="text-sm text-muted-foreground">Belum ada syarat tersedia.</li>
                            )}
                            {c.rules.map((r) => (
                                <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                                    <CheckCircle2
                                        size={16}
                                        className="mt-0.5 shrink-0 text-cyan-strong"
                                    />
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {c.banner &&
                        <div className="flex justify-center items-center">
                            <Image src={c.banner} alt="banner" width={140} height={140} className="object-cover w-96 animate-floating-smooth" />
                        </div>
                    }
                </div>
            </section>

            <section className="py-12">
                <ol className="relative flex flex-col max-w-5xl mx-auto px-4">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-linear-to-b from-sapphire via-cyan-strong to-transparent md:left-1/2" />
                    {c.timeline.map((item, i) => (
                        <li
                            key={`${item.label}-${i}`}
                            className="relative group mb-8 md:mb-12 w-full"
                        >
                            <span
                                className={`absolute left-4 top-6 size-4 -translate-x-1/2 rounded-full border-2 group-hover:scale-125 transition-all duration-200 border-cyan-strong ${dateActive(item.date) ? "bg-cyan-strong" : "bg-cyan-strong/60"} shadow-[0_0_14px_var(--cyan-strong)] md:left-1/2`}
                                aria-hidden
                            />
                            <div
                                className={`glass group-hover:scale-105 transition-all duration-300 ml-10 p-5 rounded-2xl md:ml-0 md:w-[calc(50%-2.5rem)] ${i % 2 === 0
                                    ? "md:mr-auto md:text-right"
                                    : "md:ml-auto md:text-left"
                                    }`}
                            >
                                <div className="text-xs font-medium tracking-wider text-cyan-strong uppercase glass inline-flex justify-center items-center rounded-xl px-2.5 py-2">
                                    {item.date}
                                </div>
                                <h3 className="mt-1 group-hover:text-cyan-strong transition-all duration-200 font-display text-xl font-semibold">
                                    {item.label}
                                </h3>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="py-12">
                <div className="mx-auto max-w-md px-4 space-y-2">
                    <h2 className="font-display text-center text-3xl font-bold sm:text-4xl">Narahubung</h2>
                    <p className="text-center text-sm text-muted-foreground mb-8">Jika terdapat pertanyaan atau kendala pendaftaran terkait lomba.
                        Silahkan hubungin narahubung lomba {c.name}
                    </p>
                    <div className={`flex items-center ${c.pj_2 ? 'justify-between' : 'justify-center'} gap-5`}>
                        {c.pj_1 &&
                            <Link href={`https://wa.me`} className="flex items-center gap-3 group">
                                <Image src={"/assets/whatsapp.svg"} width={30} height={30} alt="icon whatsapp" />
                                <div>
                                    <p className="font-semibold">{c.pj_1}</p>
                                    <p className="text-sm text-muted-foreground group-hover:text-cyan-strong">{c.no_pj_1}</p>
                                </div>
                            </Link>
                        }
                        {c.pj_2 &&
                            <>
                                <div className="h-10 w-0.5 bg-muted"></div>
                                <Link href={`https://wa.me`} className="flex items-center gap-3 group">
                                    <Image src={"/assets/whatsapp.svg"} width={30} height={30} alt="icon whatsapp" />
                                    <div>
                                        <p className="font-semibold">{c.pj_2}</p>
                                        <p className="text-sm text-muted-foreground group-hover:text-cyan-strong">{c.no_pj_2}</p>
                                    </div>
                                </Link>
                            </>
                        }
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="mx-auto max-w-3xl px-4 text-center">
                    <div className="glass-strong relative overflow-hidden rounded-3xl p-10">
                        <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 size-64 -translate-x-1/2 rounded-full bg-cyan-strong/30 blur-3xl" />
                        {!c.is_open ? (
                            <>
                                <h2 className="font-display text-3xl font-bold sm:text-4xl">Pendaftaran Sedang Ditutup</h2>
                                <p className="mt-3 text-muted-foreground">
                                    Cabang ini belum membuka pendaftaran. Pantau pengumuman selanjutnya ya.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="font-display text-3xl font-bold sm:text-4xl">Siap untuk bertanding?</h2>
                                <p className="mt-3 text-muted-foreground">
                                    Daftarkan timmu sekarang. Pembayaran langsung dari website, tanpa ribet.
                                </p>
                                {user ? (
                                    <Link
                                        href={`/daftar/${c.slug}`}
                                        className="btn-hero hover:btn-hero-hover mt-7 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                ) : (
                                    <Link
                                        href={{
                                            pathname: "/auth",
                                            query: {
                                                redirect: currentUrl,
                                            },
                                        }}
                                        className="btn-hero hover:btn-hero-hover mt-7 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold"
                                    >
                                        {loading ? "Memuat…" : "Masuk dulu untuk mendaftar"}
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default LombaDetail;