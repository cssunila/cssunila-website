/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Shield, Ban, CheckCircle, Trash2, Pencil, X, CheckSquare, Square } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

type ManagedUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  institution: string | null;
  avatar_url: string | null;
  suspended: boolean;
  created_at: string;
  role: "admin" | "lomba" | "petugas" | "user";
  allowed_competitions: string[];
};

type CompetitionOption = {
  id: string;
  name: string;
};

const UsersTab = () => {
  const qc = useQueryClient();
  const suparef = useRef(createClient());
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState<ManagedUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ManagedUser | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async (): Promise<ManagedUser[]> => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Gagal mengambil data pengguna");
      return res.json();
    },
  });

  const { data: competitions } = useQuery({
    queryKey: ["admin-comps-options"],
    queryFn: async (): Promise<CompetitionOption[]> => {
      const supabase = suparef.current;
      const { data, error } = await supabase
        .from("competitions")
        .select("id, name")
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (payload: {
      userId: string;
      role: string;
      suspended: boolean;
      competitionIds: string[];
    }) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memperbarui pengguna");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Pengguna berhasil diperbarui");
      setEditingUser(null);
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menghapus pengguna");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Pengguna berhasil dihapus");
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleToggleSuspend = (user: ManagedUser) => {
    setConfirmSuspend(user);
  };

  const handleDeleteUser = (user: ManagedUser) => {
    setConfirmDelete(user);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    updateUserMutation.mutate(
      {
        userId: editingUser.id,
        role: editingUser.role,
        suspended: editingUser.suspended,
        competitionIds: editingUser.allowed_competitions,
      },
      {
        onSettled: () => setIsSaving(false),
      }
    );
  };

  const toggleCompetitionAccess = (compId: string) => {
    if (!editingUser) return;
    const current = editingUser.allowed_competitions;
    const updated = current.includes(compId)
      ? current.filter((id) => id !== compId)
      : [...current, compId];
    setEditingUser({ ...editingUser, allowed_competitions: updated });
  };

  // Filters
  const filteredUsers = (users ?? []).filter((u) => {
    const searchLower = search.toLowerCase();
    return (
      (u.full_name?.toLowerCase() || "").includes(searchLower) ||
      (u.email?.toLowerCase() || "").includes(searchLower) ||
      (u.whatsapp || "").includes(searchLower) ||
      (u.institution?.toLowerCase() || "").includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="inputCls pl-9"
            placeholder="Cari nama, email, atau whatsapp"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground shrink-0">
          Menampilkan <span className="font-semibold text-foreground">{filteredUsers.length}</span> dari <span className="font-semibold text-foreground">{users?.length ?? 0}</span> pengguna
        </p>
      </div>

      {isLoading && (
        <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-cyan-strong" /> Memuat data pengguna…
        </div>
      )}

      <div className="grid gap-3">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className={`glass rounded-2xl p-5 border transition-colors ${
              u.suspended ? "border-red-500/20 bg-red-500/5" : "border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-strong/10 text-cyan-strong font-display font-semibold shrink-0">
                  {u.full_name ? u.full_name.substring(0, 2).toUpperCase() : "US"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-bold text-foreground">{u.full_name || "Tanpa Nama"}</h4>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      u.role === "admin"
                        ? "bg-red-500/10 text-red-400"
                        : u.role === "lomba"
                        ? "bg-amber-500/10 text-amber-400"
                        : u.role === "petugas"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-white/5 text-muted-foreground"
                    }`}>
                      {u.role}
                    </span>
                    {u.suspended && (
                      <span className="text-[10px] font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Suspended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{u.email} · {u.whatsapp || "no whatsapp"} · {u.institution || "no instansi"}</p>
                  
                  {u.role === "lomba" && (
                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-muted-foreground">Akses Lomba:</span>
                      {u.allowed_competitions.length > 0 ? (
                        u.allowed_competitions.map((cid) => {
                          const comp = competitions?.find((c) => c.id === cid);
                          return (
                            <span key={cid} className="text-[10px] font-medium bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-foreground/80">
                              {comp?.name || "Lomba"}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[10px] italic text-red-400">Belum ada akses lomba yang diberikan</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setEditingUser(u)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-white/10 transition cursor-pointer"
                >
                  <Pencil size={12} /> Edit Akses
                </button>
                <button
                  onClick={() => handleToggleSuspend(u)}
                  className={`rounded-full p-2 transition cursor-pointer ${
                    u.suspended
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                  }`}
                  title={u.suspended ? "Aktifkan Akun" : "Tangguhkan Akun"}
                >
                  {u.suspended ? <CheckCircle size={14} /> : <Ban size={14} />}
                </button>
                <button
                  onClick={() => handleDeleteUser(u)}
                  disabled={deleteUserMutation.isPending}
                  className="rounded-full bg-red-500/10 text-red-400 p-2 hover:bg-red-500/20 transition cursor-pointer"
                  title="Hapus Pengguna Permanen"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && filteredUsers.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">
            Tidak ada data pengguna yang sesuai pencarian.
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 p-4 backdrop-blur">
          <form
            onSubmit={handleSaveEdit}
            className="glass-strong mx-auto my-8 w-full max-w-xl space-y-4 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold">Edit Hak Akses Pengguna</h3>
                <p className="text-xs text-muted-foreground">{editingUser.full_name || editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-full p-2 hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Peran (Role)</label>
              <select
                className="inputCls"
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
              >
                <option value="user" className="bg-slate-950 text-foreground">User (Peserta)</option>
                <option value="petugas" className="bg-slate-950 text-foreground">Petugas (Kelola Berita & Seminar)</option>
                <option value="lomba" className="bg-slate-950 text-foreground">Role Lomba (Kelola Lomba Tertentu)</option>
                <option value="admin" className="bg-slate-950 text-foreground">Admin (Akses Penuh)</option>
              </select>
            </div>

            {editingUser.role === "lomba" && (
              <div className="space-y-3 rounded-2xl border border-white/10 p-4 bg-white/5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Shield size={14} className="text-amber-400" />
                    Batasi Akses Lomba
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Pilih cabang lomba mana saja yang boleh dikelola oleh pengguna ini.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto pr-1">
                  {(competitions ?? []).map((comp) => {
                    const isChecked = editingUser.allowed_competitions.includes(comp.id);
                    return (
                      <button
                        type="button"
                        key={comp.id}
                        onClick={() => toggleCompetitionAccess(comp.id)}
                        className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition cursor-pointer ${
                          isChecked
                            ? "border-amber-500/50 bg-amber-500/5 text-amber-300 font-semibold"
                            : "border-white/5 hover:border-white/10 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isChecked ? <CheckSquare size={16} className="text-amber-400" /> : <Square size={16} />}
                        <span className="text-xs truncate">{comp.name}</span>
                      </button>
                    );
                  })}
                  {(competitions ?? []).length === 0 && (
                    <p className="text-xs text-red-400 italic">Lomba belum dibuat oleh admin</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm cursor-pointer hover:bg-white/5"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-hero inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                Simpan Akses
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!confirmSuspend}
        variant="warning"
        title={confirmSuspend?.suspended ? "Aktifkan Akun" : "Tangguhkan Akun"}
        message={`Apakah kamu yakin ingin ${confirmSuspend?.suspended ? 'mengaktifkan kembali' : 'menangguhkan'} akun ${confirmSuspend?.full_name || confirmSuspend?.email}?`}
        confirmLabel={confirmSuspend?.suspended ? "Ya, Aktifkan" : "Ya, Tangguhkan"}
        onConfirm={() => {
          if (confirmSuspend) {
            updateUserMutation.mutate({
              userId: confirmSuspend.id,
              role: confirmSuspend.role,
              suspended: !confirmSuspend.suspended,
              competitionIds: confirmSuspend.allowed_competitions,
            });
          }
          setConfirmSuspend(null);
        }}
        onCancel={() => setConfirmSuspend(null)}
      />

      <ConfirmModal
        open={!!confirmDelete}
        variant="danger"
        title="Hapus Pengguna"
        message={`PERINGATAN: Menghapus pengguna "${confirmDelete?.full_name || confirmDelete?.email}" akan menghapus seluruh data pendaftaran, pembayaran, dan akun secara permanen.`}
        confirmLabel="Ya, Hapus Permanen"
        onConfirm={() => {
          if (confirmDelete) deleteUserMutation.mutate(confirmDelete.id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default UsersTab;
