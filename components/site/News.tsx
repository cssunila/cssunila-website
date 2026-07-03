"use client"

import { createClient } from "@/supabase/client";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NewsItem = {
    slug: string; title: string; excerpt: string | null; category: string | null;
    image_url: string | null; published_at: string | null;
};

const News = () => {
    const [data, setData] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const suparef = useRef(createClient());

    const loadData = async () => {
        const supabase = suparef.current;
        const { data, error } = await supabase
            .from("news")
            .select("slug,title,excerpt,category,image_url,published_at")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(6);
        if (error || !data) {
            setData([]);
            setIsLoading(false);
            return;
        };
        setData(data as NewsItem[]);
        setIsLoading(false);
    }

    useEffect(() => {
        (async () => {
            await loadData();
        })();
    }, []);

    return (
        <section id="berita" className="relative py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <span className="text-xs font-medium uppercase tracking-widest text-cyan-strong">
                            Update Terbaru
                        </span>
                        <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
                            Berita & <span className="gradient-text">Pengumuman</span>
                        </h2>
                    </div>
                </div>

                {isLoading && (
                    <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">Memuat berita…</div>
                )}
                {!isLoading && (!data || data.length === 0) && (
                    <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">Belum ada berita.</div>
                )}

                <div className="grid gap-5 md:grid-cols-3">
                    {data?.map((n) => (
                        <Link
                            key={n.slug}
                            href={`/berita/${n.slug}`}
                            className="glass group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:border-white/20"
                        >
                            {n.image_url && (
                                <Image src={n.image_url} alt={n.title} className="mb-4 h-40 w-full rounded-2xl object-cover" loading="lazy" />
                            )}

                            <div className="flex items-center gap-3">
                                {n.category && (
                                    <span className="rounded-full bg-cyan-strong/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-strong">
                                        {n.category}
                                    </span>
                                )}
                                {n.published_at && (
                                    <time className="text-xs text-muted-foreground">
                                        {new Date(n.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                    </time>
                                )}
                            </div>

                            <h3 className="mt-4 font-display text-lg font-semibold leading-snug group-hover:text-cyan-strong transition-colors">
                                {n.title}
                            </h3>

                            <p className="mt-2 flex-1 text-sm text-muted-foreground">
                                {n.excerpt}
                            </p>

                            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 group-hover:text-cyan-strong transition-colors">
                                Baca Selengkapnya <ArrowUpRight size={14} />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default News;