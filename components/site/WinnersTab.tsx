"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Plus, Trash2, Trophy, Medal, Star } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import ConfirmModal from "./ConfirmModal";
import Image from "next/image";
import { usePageVisibility, useToggleVisibility } from "@/hooks/use-page-visibility";

type WinnerRow = {
  id: string;
  competition_id: string;
  registration_id: string | null;
  rank: number;
  title: string;
  prize_money: string | null;
  status: "draft" | "published";
  registration?: {
    id: string;
    team_name: string;
  } | null;
};

type CompetitionOption = {
  id: string;
  name: string;
};

type RegistrationOption = {
  id: string;
  team_name: string;
  competition_id: string;
};

const WinnersTab = () => {
  const qc = useQueryClient();
  const { role, user } = useAuth();
  const suparef = useRef(createClient());
  const [selectedCompId, setSelectedCompId] = useState<string>("all");
  const { visibility } = usePageVisibility();
  const toggleVis = useToggleVisibility("juara");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string; compName: string } | null>(null);

  const [newWinner, setNewWinner] = useState<{
    competition_id: string;
    registration_id: string;
    rank: number;
    title: string;
    prize_money: string;
    status: "draft" | "published";
  }>({
    competition_id: "",
    registration_id: "",
    rank: 1,
    title: "Juara 1",
    prize_money: "",
    status: "draft"
  });

  const { data: allowedComps } = useQuery({
    queryKey: ["user-allowed-comps", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const supabase = suparef.current;
      const { data, error } = await supabase
        .from("user_competitions")
        .select("competition_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []).map((c) => c.competition_id);
    },
    enabled: !!user,
  });

  const { data: competitions } = useQuery({
    queryKey: ["admin-winners-competitions", role, allowedComps],
    queryFn: async (): Promise<CompetitionOption[]> => {
      const supabase = suparef.current;
      let query = supabase
        .from("competitions")
        .select("id, name");

      if (role === "lomba") {
        if (!allowedComps || allowedComps.length === 0) {
          return [];
        }
        query = query.in("id", allowedComps);
      }

      const { data, error } = await query.order("position");
      if (error) throw error;
      return data ?? [];
    },
    enabled: role !== null,
  });

  const { data: registrations } = useQuery({
    queryKey: ["admin-winners-registrations", role, allowedComps],
    queryFn: async (): Promise<RegistrationOption[]> => {
      const supabase = suparef.current;
      let query = supabase
        .from("registrations")
        .select("id, team_name, competition_id")
        .eq("status", "verified");

      if (role === "lomba") {
        if (!allowedComps || allowedComps.length === 0) {
          return [];
        }
        query = query.in("competition_id", allowedComps);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: role !== null,
  });

  // Query winners
  const { data: winners, isLoading } = useQuery({
    queryKey: ["admin-winners-list", role, allowedComps],
    queryFn: async (): Promise<WinnerRow[]> => {
      const supabase = suparef.current;
      let query = supabase
        .from("winners")
        .select(`
          id,
          competition_id,
          registration_id,
          rank,
          title,
          prize_money,
          status,
          registration:registrations(id, team_name)
        `);

      if (role === "lomba") {
        if (!allowedComps || allowedComps.length === 0) {
          return [];
        }
        query = query.in("competition_id", allowedComps);
      }

      const { data, error } = await query.order("rank", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as WinnerRow[];
    },
    enabled: role !== null,
  });

  const editStatus = useMutation({
    mutationFn: async (v: { status: 'draft' | 'published'; id: string }) => {
      const supabase = suparef.current;
      const { error } = await supabase.from("winners").update({ status: v.status }).eq("id", v.id);
      console.log(error);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status berhasil diubah");
      qc.invalidateQueries({ queryKey: ["admin-winners-list"] });
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const addWinner = useMutation({
    mutationFn: async (v: typeof newWinner) => {
      const supabase = suparef.current;
      const payload = {
        competition_id: v.competition_id,
        registration_id: v.registration_id || null,
        rank: Number(v.rank),
        title: v.title,
        prize_money: v.prize_money || null,
        status: v.status
      };
      const { error } = await supabase.from("winners").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Juara berhasil ditambahkan");
      setNewWinner({
        competition_id: selectedCompId !== "all" ? selectedCompId : "",
        registration_id: "",
        rank: 1,
        title: "Juara 1",
        prize_money: "",
        status: "draft"
      });
      qc.invalidateQueries({ queryKey: ["admin-winners-list"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteWinner = useMutation({
    mutationFn: async (id: string) => {
      const supabase = suparef.current;
      const { error } = await supabase.from("winners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Juara berhasil dihapus");
      qc.invalidateQueries({ queryKey: ["admin-winners-list"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredRegOptions = (registrations ?? []).filter(
    (r) => r.competition_id === newWinner.competition_id
  );

  const filteredWinners = (winners ?? []).filter((w) => {
    return selectedCompId === "all" || w.competition_id === selectedCompId;
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
        return <Star size={18} className="text-cyan-400" />;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => {
                setSelectedCompId("all");
                setNewWinner((w) => ({ ...w, competition_id: "" }));
              }}
              className={`rounded-full border px-3.5 py-1.5 cursor-pointer transition-colors ${selectedCompId === "all"
                  ? "border-cyan-strong/60 bg-cyan-strong/15 text-cyan-strong font-semibold"
                  : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                }`}
            >
              Semua Lomba
            </button>
            {competitions?.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCompId(c.id);
                  setNewWinner((w) => ({ ...w, competition_id: c.id }));
                }}
                className={`rounded-full border px-3.5 py-1.5 cursor-pointer transition-colors ${selectedCompId === c.id
                    ? "border-cyan-strong/60 bg-cyan-strong/15 text-cyan-strong font-semibold"
                    : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                  }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          {role === "admin" && (
            <button
              onClick={() => {
                const next = !visibility.juara;
                toggleVis.mutate(next, {
                  onSuccess: () => toast.success(next ? "Halaman Pengumuman ditampilkan" : "Halaman Pengumuman disembunyikan"),
                  onError: (e: Error) => toast.error(e.message),
                });
              }}
              disabled={toggleVis.isPending}
              title={visibility.juara ? "Sembunyikan halaman Pengumuman Juara" : "Tampilkan halaman Pengumuman Juara"}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                visibility.juara
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
              }`}
            >
              {toggleVis.isPending ? <Loader2 size={13} className="animate-spin" /> : visibility.juara ? <Eye size={13} /> : <EyeOff size={13} />}
              {visibility.juara ? "Pengumuman Ditampilkan" : "Pengumuman Disembunyikan"}
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass rounded-3xl p-6 h-fit space-y-4">
            <h3 className="font-display text-base font-bold text-foreground">
              Tambah Juara Lomba
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newWinner.competition_id) {
                  toast.error("Pilih cabang lomba terlebih dahulu");
                  return;
                }
                addWinner.mutate(newWinner);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Cabang Lomba</label>
                <select
                  className="inputCls"
                  required
                  value={newWinner.competition_id}
                  onChange={(e) =>
                    setNewWinner({
                      ...newWinner,
                      competition_id: e.target.value,
                      registration_id: "",
                    })
                  }
                >
                  <option className="bg-background" value="">-- Pilih Lomba --</option>
                  {competitions?.map((c) => (
                    <option className="bg-background" key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Tim Pemenang</label>
                <select
                  className="inputCls"
                  required
                  disabled={!newWinner.competition_id}
                  value={newWinner.registration_id}
                  onChange={(e) =>
                    setNewWinner({ ...newWinner, registration_id: e.target.value })
                  }
                >
                  <option className="bg-background" value="">
                    {!newWinner.competition_id
                      ? "-- Pilih lomba dulu --"
                      : filteredRegOptions.length === 0
                        ? "-- Tidak ada tim terverifikasi --"
                        : "-- Pilih Tim --"}
                  </option>
                  {filteredRegOptions.map((r) => (
                    <option className="bg-background" key={r.id} value={r.id}>
                      {r.team_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Peringkat (Angka)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className="inputCls"
                    required
                    value={newWinner.rank}
                    onChange={(e) =>
                      setNewWinner({ ...newWinner, rank: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Gelar Juara</label>
                  <input
                    className="inputCls"
                    placeholder="Misal: Juara 1"
                    required
                    value={newWinner.title}
                    onChange={(e) =>
                      setNewWinner({ ...newWinner, title: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Hadiah (opsional)</label>
                <input
                  className="inputCls"
                  placeholder="Misal: Rp 3.000.000 + Uang Pembinaan"
                  value={newWinner.prize_money}
                  onChange={(e) =>
                    setNewWinner({ ...newWinner, prize_money: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Status</label>
                <select className="inputCls" value={newWinner.status ?? "draft"} onChange={(e) => setNewWinner({ ...newWinner, status: e.target.value as "draft" | "published" })}>
                  <option className="bg-background" value="draft">Draft</option>
                  <option className="bg-background" value="published">Published</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={addWinner.isPending || !newWinner.competition_id || !newWinner.registration_id}
                className="btn-hero flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
              >
                {addWinner.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Simpan Juara
              </button>
            </form>
          </div>

          <div className="md:col-span-2 space-y-3">
            {isLoading && (
              <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Memuat data juara…
              </div>
            )}

            {!isLoading && filteredWinners.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
                Belum ada data juara yang ditentukan untuk filter ini.
              </div>
            )}

            {!isLoading &&
              filteredWinners.map((w) => {
                const compName = competitions?.find((c) => c.id === w.competition_id)?.name ?? "Lomba";
                return (
                  <div
                    key={w.id}
                    className="glass flex items-center justify-between gap-4 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 shrink-0">
                        {getRankIcon(w.rank)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-foreground text-sm">
                            {w.title}
                          </span>
                          <span className="text-[10px] bg-cyan-strong/15 text-cyan-strong px-2 py-0.5 rounded-full uppercase font-semibold">
                            {compName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Tim: <span className="text-foreground font-semibold">{w.registration?.team_name ?? "—"}</span>
                        </p>
                        {w.prize_money && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Hadiah: <span className="text-emerald-400 font-semibold">{w.prize_money}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p onClick={() => {
                        editStatus.mutate({status: w.status == 'draft' ? 'published' : 'draft', id: w.id})
                      }} className={`rounded-lg cursor-pointer px-2 py-1 text-xs sm:text-sm ${w.status == 'draft' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-strong/10 text-cyan-strong'}`}>{w.status}</p>
                      <button
                        onClick={() => {
                          setConfirmDelete({ id: w.id, title: w.title, compName });
                        }}
                        disabled={deleteWinner.isPending}
                        className="rounded-full bg-destructive/15 p-2 text-destructive hover:bg-destructive/25 shrink-0 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Hapus Juara"
        message={`Apakah kamu yakin ingin menghapus data juara "${confirmDelete?.title}" dari lomba ${confirmDelete?.compName}?`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => { if (confirmDelete) deleteWinner.mutate(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
};

export default WinnersTab;
