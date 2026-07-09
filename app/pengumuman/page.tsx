import { createClient } from "@/supabase/server";
import { ArrowLeft, Trophy, Medal, Star, Gift, Users } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Pengumuman Juara | CSS UNILA 3.0",
  description: "Pengumuman juara lomba CSS UNILA 3.0",
  openGraph: {
    title: "Pengumuman Juara | CSS UNILA 3.0",
    description: "Pengumuman juara lomba CSS UNILA 3.0",
  },
  keywords: ["CSS UNILA 3.0", "Pengumuman Juara", "Computer Science Showdown 3.0", "Himakom FMIPA UNILA"],
}

type WinnerItem = {
  id: string;
  rank: number;
  title: string;
  prize_money: string | null;
  status: 'draft' | 'published';
  competition: {
    name: string;
    slug: string;
  } | null;
  registration: {
    team_name: string;
    leader_name: string;
  } | null;
};

export default async function PengumumanPage() {
  const supabase = await createClient();

  // Check if page_visibility is disabled for juara
  const { data: visData } = await supabase
    .from("page_visibility")
    .select("is_visible")
    .eq("id", "juara")
    .single();

  if (visData && visData.is_visible === false) {
    notFound();
  }

  let winners: WinnerItem[] = [];
  let errorMsg = "";

  try {
    const { data, error } = await supabase
      .from("winners")
      .select(`
        id,
        rank,
        title,
        prize_money,
        status,
        competition:competitions(name, slug),
        registration:registrations(team_name, leader_name)
      `)
      .order("rank", { ascending: true });

    if (error) throw error;
    winners = (data ?? []) as unknown as WinnerItem[];
  } catch {
    errorMsg = "Gagal memuat data pengumuman juara.";
  }

  const groupedWinners: Record<string, WinnerItem[]> = {};
  winners.forEach((w) => {
    if(w.status == 'draft') return;
    
    const compName = w.competition?.name ?? "Lainnya";
    if (!groupedWinners[compName]) {
      groupedWinners[compName] = [];
    }
    groupedWinners[compName].push(w);
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Image src={"/assets/juara_1.png"} width={20} height={20} alt="logo juara" className="w-full h-auto object-contain pointer-events-none" />;
      case 2:
        return <Image src={"/assets/juara_2.png"} width={20} height={20} alt="logo juara" className="w-full h-auto object-contain pointer-events-none" />;
      case 3:
        return <Image src={"/assets/juara_3.png"} width={20} height={20} alt="logo juara" className="w-full h-auto object-contain pointer-events-none" />;
      default:
        return <Star className="text-cyan-400 size-6" />;
    }
  };

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-yellow-500/30 bg-yellow-500/5";
      case 2:
        return "border-slate-400/20 bg-slate-400/5";
      case 3:
        return "border-amber-600/20 bg-amber-600/5";
      default:
        return "border-cyan-500/10 bg-cyan-500/5";
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="pointer-events-none absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-sapphire/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 -z-10 h-72 w-72 rounded-full bg-cyan-strong/25 blur-3xl" />

      <main className="pt-32 pb-24 md:pt-40">
        <div className="mx-auto max-w-4xl px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>

          <header className="mb-12 text-center">
            <span className="glass mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest text-cyan-strong uppercase">
              <Trophy size={12} className="text-cyan-strong animate-bounce" />
              Pemenang Resmi
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Pengumuman <span className="gradient-text">Juara Lomba</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Selamat kepada para pemenang Computer Science Showdown (CSS 3.0). Perjuangan luar biasa melahirkan juara sejati.
            </p>
          </header>

          {errorMsg && (
            <div className="glass rounded-3xl p-10 text-center border border-red-500/20">
              <p className="text-red-400 text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {!errorMsg && (winners.length === 0 || Object.entries(groupedWinners).length === 0) && (
            <div className="glass rounded-3xl p-12 text-center text-muted-foreground border border-white/5">
              <Trophy size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-display text-lg font-semibold text-foreground/80">Pengumuman Belum Rilis</p>
              <p className="text-sm mt-1 max-w-xs mx-auto text-muted-foreground">
                Daftar pemenang akan segera dipublikasikan di sini setelah penilaian dewan juri selesai.
              </p>
            </div>
          )}

          {!errorMsg && winners.length > 0 && (
            <div className="space-y-12">
              {Object.entries(groupedWinners).map(([compName, winnerList]) => (
                <section key={compName} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="font-display text-xl font-bold sm:shrink-0 text-foreground tracking-wide">
                      {compName}
                    </h2>
                    <div className="h-px w-full bg-linear-to-r from-cyan-strong/30 to-transparent" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {winnerList.map((w) => (
                      <div
                        key={w.id}
                        className={`glass rounded-2xl p-5 border flex flex-col justify-between hover:scale-[1.01] transition-transform ${getRankBorder(
                          w.rank
                        )}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-lg font-extrabold text-foreground tracking-wide">
                              {w.title}
                            </span>
                            <div className="flex size-10 items-center justify-center rounded-xl bg-white/5">
                              {getRankIcon(w.rank)}
                            </div>
                          </div>

                          <div className="mt-4 flex items-start gap-2.5">
                            <Users size={16} className="text-cyan-strong shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Nama Tim / Instansi</p>
                              <p className="text-sm font-bold text-foreground mt-0.5">{w.registration?.team_name ?? "—"}</p>
                            </div>
                          </div>
                        </div>

                        {w.prize_money && (
                          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                              <Gift size={14} />
                              <span>{w.prize_money}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
