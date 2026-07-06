import { Wrench, Instagram, Mail } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-4">
      <div className="pointer-events-none absolute -left-24 top-1/4 -z-10 h-80 w-80 rounded-full bg-sapphire/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-16 bottom-10 -z-10 h-96 w-96 rounded-full bg-cyan-strong/25 blur-3xl animate-float [animation-delay:1.5s]" />

      <div className="mx-auto max-w-xl">
        <div className="glass-strong rounded-3xl p-8 text-center sm:p-12">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-sapphire to-cyan-strong shadow-[var(--shadow-glow)]">
            <Wrench className="size-9 text-background animate-[spin_4s_ease-in-out_infinite]" />
          </div>

          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-cyan-strong">
            <span className="size-1.5 rounded-full bg-cyan-strong animate-pulse" />
            Sedang Perawatan
          </span>

          <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Kami sedang <span className="gradient-text">melakukan perawatan</span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
            Tim CSS 3.0 sedang meningkatkan sistem agar pengalamanmu makin lancar.
            Halaman ini akan kembali online sebentar lagi — terima kasih atas kesabarannya!
          </p>

          {/* progress bar */}
          <div className="mx-auto mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-11/12 rounded-full bg-linear-to-r from-sapphire via-cyan-strong to-sapphire bg-[length:200%_100%] animate-shimmer" />
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:cssunila@gmail.com"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-5 py-2.5 text-xs font-semibold text-foreground/90 backdrop-blur-md transition hover:bg-white/10"
            >
              <Mail size={14} /> cssunila@gmail.com
            </a>
            <a
              href="https://instagram.com/cssunila"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-5 py-2.5 text-xs font-semibold text-foreground/90 backdrop-blur-md transition hover:bg-white/10"
            >
              <Instagram size={14} /> @cssunila
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Maintenance;