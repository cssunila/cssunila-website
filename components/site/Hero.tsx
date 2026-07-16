import { ArrowRight, CalendarDays } from "lucide-react";
import Image from "next/image";

type HeroProps = {
  totalLomba: number;
  totalHadiah: string;
  totalPeserta: number;
  logo?: string;
  title?: string;
  sub?: string;
  tagline?: string;
  subtitle?: string;
  tema?: string;
};

const Hero = ({ totalLomba, totalHadiah, totalPeserta, logo, title, sub, tagline, subtitle, tema }: HeroProps) => {
  const siteLogo = logo || "/css-logo.png";
  const heroTitle = title || "CSS";
  const titleSub = sub || "3.0";
  const heroTagline = tagline || "Computer Science Showdown 2026";
  const heroSubtitle = subtitle || "Event teknologi & esports terbesar yang diadakan oleh himakom. Tersedia beberapa cabang lomba menarik dibidang akademik maupun non-akademik. Segera daftar dan buktikan kemampuanmu!";
  const heroTema = tema || "Dare to Grow Ready to Glow";

  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
      <Image
        src={siteLogo}
        alt="CSS LOGO BACKGROUND"
        aria-hidden
        priority
        loading="eager"
        width={1920}
        height={1088}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-background/50 via-background/80 to-background" />

      <div className="mx-auto max-w-7xl px-4 text-center">
        <span className="glass animate-pulse mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest text-cyan-strong uppercase">
          {heroTagline}
        </span>

        <h1 className="font-display text-shadow italic text-7xl font-bold leading-[0.95] tracking-tight sm:text-8xl lg:text-[9rem]">
          <span className="gradient-text">{heroTitle} </span>{" "}
          <span className="text-foreground">{titleSub} </span>
        </h1>
        <h3 className="text-shadow text-sm sm:text-md md:text-lg font-semibold tracking-tight my-6">&quot;{heroTema}&quot;</h3>
        <p className="mx-auto max-w-2xl text-md text-muted-foreground sm:text-lg">
          {heroSubtitle}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#lomba"
            className="btn-hero hover:btn-hero-hover inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            Daftar Lomba <ArrowRight size={16} />
          </a>
          <a
            href="#timeline"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-7 py-3.5 text-sm font-semibold text-foreground/90 backdrop-blur-md transition hover:bg-white/10"
          >
            <CalendarDays size={16} /> Lihat Timeline
          </a>
        </div>

        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            [totalLomba.toString(), "Cabang Lomba"],
            [totalHadiah, "Total Hadiah"],
            [totalPeserta >= 1000 ? `${(totalPeserta / 1000).toFixed(1)}k+` : totalPeserta.toString(), "Peserta"],
          ].map(([n, l]) => (
            <div key={l} className="glass rounded-2xl px-4 py-5">
              <dt className="font-display text-2xl font-bold gradient-text">{n}</dt>
              <dd className="mt-1 text-xs text-muted-foreground">{l}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="pointer-events-none absolute -left-20 top-1/3 -z-10 h-72 w-72 rounded-full bg-sapphire/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-10 bottom-10 -z-10 h-80 w-80 rounded-full bg-cyan-strong/25 blur-3xl animate-float [animation-delay:1.5s]" />
    </section>
  );
}

export default Hero;