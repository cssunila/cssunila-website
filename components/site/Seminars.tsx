"use client"

import { createClient } from "@/supabase/client";
import { Mic, MapPin, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SeminarItem = {
    slug: string; title: string; speaker: string | null; description: string | null;
    image_url: string | null; scheduled_at: string | null; location: string | null;
};

const Seminars = () => {
    const [data, setData] = useState<SeminarItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const suparef = useRef(createClient());

    const loadData = async () => {
        const supabase = suparef.current;
        const { data, error } = await supabase
            .from("seminars")
            .select("slug,title,speaker,description,image_url,scheduled_at,location")
            .eq("status", "published")
            .order("scheduled_at", { ascending: true, nullsFirst: false });
        if (error || !data) {
            setData([]);
            setIsLoading(false);
            return;
        };
        setData(data as SeminarItem[]);
        setIsLoading(false);
    }

    useEffect(() => {
        (async () => {
            await loadData();
        })();
    }, []);

    return (
        <section id="seminar" className="relative py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-12 text-center">
                    <span className="text-xs font-medium uppercase tracking-widest text-cyan-strong">
                        Pengetahuan & Inspirasi
                    </span>
                    <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
                        <span className="gradient-text">Seminar</span> & Talkshow
                    </h2>
                </div>

                {isLoading && (
                    <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">Memuat seminar…</div>
                )}
                {!isLoading && (!data || data.length === 0) && (
                    <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">Belum ada seminar.</div>
                )}
                <div className="grid gap-5 md:grid-cols-3">
                    {data?.map((s) => (
                        <Link
                            key={s.slug}
                            href={`/seminar/${s.slug}`}
                            className="glass group relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:border-white/20 block"
                        >
                            <div className="glass flex size-12 items-center justify-center rounded-2xl group-hover:bg-cyan-strong/10 transition-colors">
                                <Mic size={20} className="text-cyan-strong" />
                            </div>
                            <h3 className="mt-5 font-display text-lg font-semibold leading-snug group-hover:text-cyan-strong transition-colors">
                                {s.title}
                            </h3>
                            {s.speaker && <p className="mt-2 text-sm text-muted-foreground">{s.speaker}</p>}
                            {s.description && <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-3">{s.description}</p>}
                            <div className="mt-5 space-y-1.5 text-xs text-muted-foreground">
                                {s.scheduled_at && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-cyan-strong" size={12} />
                                        {new Date(s.scheduled_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
                                    </div>
                                )}
                                {s.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="text-cyan-strong" size={12} /> {s.location}
                                    </div>
                                )}
                            </div>
                            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 group-hover:text-cyan-strong transition-colors">
                                Detail Seminar <ArrowUpRight size={14} />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Seminars;