"use client";

import { ArrowLeft, Home, Compass } from "lucide-react";
import Link from "next/link";


const NotFound = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20">
      {/* ambient orbs */}
      <div className="pointer-events-none absolute -left-24 top-1/4 -z-10 h-80 w-80 rounded-full bg-sapphire/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-16 bottom-10 -z-10 h-96 w-96 rounded-full bg-cyan-strong/25 blur-3xl animate-float [animation-delay:1.5s]" />
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="mx-auto max-w-2xl text-center">
        <span className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-cyan-strong">
          <Compass size={12} />
          Error 404 · Halaman tidak ditemukan
        </span>

        <h1 className="font-display text-[7rem] font-bold leading-none tracking-tight sm:text-[10rem]">
          <span className="gradient-text inline-block animate-[float-slow_6s_ease-in-out_infinite]">4</span>
          <span className="inline-block animate-[float-slow_6s_ease-in-out_infinite] text-foreground [animation-delay:.3s]">0</span>
          <span className="gradient-text inline-block animate-[float-slow_6s_ease-in-out_infinite] [animation-delay:.6s]">4</span>
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          Halaman yang kamu cari tidak ditemukan. Mungkin kamu salah mengetik alamat URL,
          Mohon periksa kembali.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/"
            className="btn-hero hover:btn-hero-hover inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            <Home size={16} /> Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white/5 px-7 py-3.5 text-sm font-semibold text-foreground/90 backdrop-blur-md transition hover:bg-white/10"
          >
            <ArrowLeft size={16} /> Halaman Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;