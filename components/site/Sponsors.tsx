import { DEFAULT_BLUR } from "@/lib/placeholderBlur";
import { createClient } from "@/supabase/server";
import Image from "next/image";
import Link from "next/link";

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

const Sponsors = async () => {
  let sponsors: Sponsor[] = [];
  let mediaPartners: MediaPartner[] = [];

  try {
    const supabase = await createClient();
    const { data: sp } = await supabase.from("sponsors").select("*").order("position", { ascending: true });
    const { data: mp } = await supabase.from("media_partners").select("*").order("position", { ascending: true });
    if (sp) sponsors = sp as Sponsor[];
    if (mp) mediaPartners = mp as MediaPartner[];
  } catch { }

  if (sponsors.length === 0 && mediaPartners.length === 0) return null;

  return (
    <section id="sponsor" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-cyan-strong">
            Didukung Oleh
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            <span className="gradient-text">{sponsors.length > 0 ? "Sponsor" : ""}</span> {(sponsors.length > 0 && mediaPartners.length > 0) ? " & " : ""} {mediaPartners.length > 0 ? "Media Partner" : ""}
          </h2>
        </div>

        {/* Sponsors Grid */}
        {sponsors.length > 0 && (
          <div className="glass mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/5 sm:grid-cols-5">
            {sponsors.map((sp) => (
              <Link
                key={sp.id}
                href={sp.website || "#sponsor"}
                target={sp.website ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={sp.name}
                className="group flex h-34 flex-col items-center justify-center gap-2 bg-background/40 px-4 py-5 text-center transition hover:bg-white/5"
              >
                {sp.logo_url ? (
                  <Image
                    src={sp.logo_url}
                    alt={sp.name}
                    width={180}
                    height={100}
                    blurDataURL={DEFAULT_BLUR}
                    placeholder="blur"
                    loading="lazy"
                    className="h-20 w-auto rounded-lg object-contain opacity-70 transition group-hover:opacity-100"
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
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
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
                      loading="lazy"
                      blurDataURL={DEFAULT_BLUR}
                      placeholder="blur"
                      className="h-20 w-auto rounded-lg object-contain opacity-70 transition group-hover:opacity-100"
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
