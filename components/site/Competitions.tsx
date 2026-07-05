"use client"

import { ArrowUpRight, Users, Wallet, Trophy, Lock } from "lucide-react";
import { getIcon, accentGlow } from "@/lib/icons";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/supabase/client";
import Link from "next/link";

type CompCard = {
    slug: string; name: string; tagline: string | null; description: string | null;
    icon: string | null; accent: string | null; fee_idr: number; quota: number;
    team_size: string | null; prize: string | null; is_open: boolean;
};

const Competitions = () => {
    const [data, setData] = useState<CompCard[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const suparef = useRef(createClient());

    const loadData = async () => {
        const supabase = suparef.current;
        const { data, error } = await supabase
            .from("competitions")
            .select("slug,name,tagline,description,icon,accent,fee_idr,quota,team_size,prize,is_open")
            .order("position");
        if (error || !data) {
            setData([]);
            setIsLoading(false);
            return;
        };
        setData(data as CompCard[]);
        setIsLoading(false);
    }

    useEffect(() => {
        (async () => {
            await loadData();
        })();
    }, []);

    return (
        <section id="lomba" className="relative py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-12 text-center">
                    <span className="text-xs font-medium uppercase tracking-widest text-cyan-strong">
                        {data?.length ?? ""} Cabang
                    </span>
                    <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
                        Lomba <span className="gradient-text">CSS 3.0</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                        Dari esports hingga akademik — temukan kompetisi yang sesuai dengan
                        passion-mu.
                    </p>
                </div>

                {isLoading && (
                    <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">Memuat lomba…</div>
                )}

                {!isLoading && (!data || data.length === 0) && (
                    <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">Belum ada lomba.</div>
                )}

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {data?.map((c) => {
                        const Icon = getIcon(c.icon);
                        const accent = c.accent ?? "cyan";
                        return (
                            <article
                                key={c.slug}
                                className="glass group flex flex-col relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:border-white/20"
                            >
                                <div
                                    className={`pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-linear-to-br blur-3xl transition group-hover:scale-110 ${accentGlow[accent] ?? accentGlow.cyan}`}
                                />
                                <div className="flex items-center justify-between gap-3">
                                    <div className="glass group-hover:bg-cyan-strong/10 transition-colors shrink-0 flex size-12 items-center justify-center rounded-2xl">
                                        <Icon size={22} className="text-cyan-strong" />
                                    </div>
                                    {c.is_open ? (
                                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                            {c.tagline}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                                            <Lock size={10} /> Tutup
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-5 group-hover:text-cyan-strong transition-colors font-display text-xl font-semibold">{c.name}</h3>
                                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                    {c.description}
                                </p>

                                <dl className="mt-5 mb-5 space-y-1.5 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Wallet size={12} className="text-cyan-strong" /> <span>Rp. {c.fee_idr.toLocaleString("id-ID")} / tim</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={12} className="text-cyan-strong" /> <span>{c.team_size ?? "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trophy size={12} className="text-cyan-strong" /> <span className="truncate">Rp. {parseInt(c.prize ?? "0").toLocaleString("id-ID")}</span>
                                    </div>
                                </dl>

                                <Link
                                    href={`/lomba/${c.slug}`}
                                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground group-hover:text-cyan-strong transition hover:gap-2.5"
                                >
                                    Lihat Detail <ArrowUpRight size={14} />
                                </Link>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default Competitions;