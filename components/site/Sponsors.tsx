"use client"

import { createClient } from "@/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Sponsor = {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  position: number;
};

type MediaPartner = {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  position: number;
};

const Sponsors = () => {
  const suparef = useRef(createClient());
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [mediaPartners, setMediaPartners] = useState<MediaPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = suparef.current;
      const [{ data: sp }, { data: mp }] = await Promise.all([
        supabase.from("sponsors").select("*").order("position", { ascending: true }),
        supabase.from("media_partners").select("*").order("position", { ascending: true }),
      ]);
      setSponsors(sp ?? []);
      setMediaPartners(mp ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <section id="sponsor" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-cyan-strong">Didukung Oleh</span>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              <span className="gradient-text">Sponsor </span> &amp; Media Partner
            </h2>
          </div>
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="animate-spin h-4 w-4 text-cyan-strong" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memuat data...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (sponsors.length === 0 && mediaPartners.length === 0) return null;

  return (
    <section id="sponsor" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-cyan-strong">
            Didukung Oleh
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            <span className="gradient-text">Sponsor </span> & Media Partner
          </h2>
        </div>

        {/* Sponsors Grid */}
        {sponsors.length > 0 && (
          <div className="glass mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/5 sm:grid-cols-4">
            {sponsors.map((sp) => (
              <Link
                key={sp.id}
                href={sp.website || "#sponsor"}
                target={sp.website ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={sp.name}
                className="group flex h-24 flex-col items-center justify-center gap-2 bg-background/40 px-4 text-center transition hover:bg-white/5"
              >
                {sp.logo_url ? (
                  <Image
                    src={sp.logo_url}
                    alt={sp.name}
                    width={180}
                    height={100}
                    className="h-16 w-auto rounded-lg object-contain opacity-70 transition group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-cyan-strong">
                    <span className="font-bold">{sp.name}</span>
                  </div>
                )}
                {sp.name && (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {sp.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Media Partners */}
        {mediaPartners.length > 0 && (
          <div className="text-center">
            <p className="mb-5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Media Partner
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {mediaPartners.map((mp) => (
                <Link
                  key={mp.id}
                  href={mp.website || "#sponsor"}
                  target={mp.website ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  title={mp.name}
                  className="group flex flex-col items-center gap-1.5 transition"
                >
                  {mp.logo_url ? (
                    <Image
                      src={mp.logo_url}
                      alt={mp.name}
                      width={180}
                      height={100}
                      className="h-16 w-auto rounded-lg object-contain opacity-70 transition group-hover:opacity-100"
                    />
                  ) : (
                    <span className="font-display text-sm font-medium text-muted-foreground group-hover:text-foreground transition">
                      {mp.name}
                    </span>
                  )}
                  {mp.name && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {mp.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Sponsors;
