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

type CompetitionDetail = {
    slug: string; name: string; tagline: string | null; description: string | null;
    icon: string | null; accent: string | null; fee_idr: number; quota: number;
    team_size: string | null; prize: string | null; is_open: boolean;
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
                .select("slug,name,tagline,description,icon,accent,fee_idr,quota,team_size,prize,is_open,rules,timeline")
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
                            { icon: Users, label: "Kuota", value: `${c.quota > 0 ? c.quota+' tim' : 'Tidak ada batasan'}` },
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

                    <div className="glass rounded-3xl p-7">
                        <h2 className="font-display text-2xl font-bold">Timeline Lomba</h2>
                        <ol className="mt-5 space-y-4">
                            {c.timeline.length === 0 && (
                                <li className="text-sm text-muted-foreground">Belum ada timeline.</li>
                            )}
                            {c.timeline.map((t) => (
                                <li key={t.label} className="flex items-start gap-3">
                                    <div className="glass mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                                        <CalendarCheck size={14} className="text-cyan-strong" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium uppercase tracking-wider text-cyan-strong">
                                            {t.date}
                                        </div>
                                        <div className="font-display text-sm font-semibold">
                                            {t.label}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
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
                                    Cabang ini belum membuka pendaftaran. Pantau pengumuman panitia ya.
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