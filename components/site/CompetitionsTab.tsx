"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import CompetitionEditor from "./CompetitionEditor";
import FieldManager from "./FieldManager";
import ConfirmModal from "./ConfirmModal";

type CompRow = {
  id: string;
  slug: string;
  name: string;
  banner: string | null;
  tagline: string | null;
  fee_idr: number;
  quota: number;
  is_open: boolean;
  position: number;
};

type CompFull = CompRow & {
  description: string | null;
  icon: string | null;
  accent: string | null;
  team_size: string | null;
  rules: string[];
  pj_1: string | null;
  no_pj_1: string | null;
  pj_2: string | null;
  no_pj_2: string | null;
  juara_1: string | null;
  juara_2: string | null;
  juara_3: string | null;
  timeline: { date: string; label: string }[];
};

const CompetitionsTab = () => {
  const qc = useQueryClient();
  const { role, user } = useAuth();
  const [editing, setEditing] = useState<Partial<CompFull> | null>(null);
  const [managingFields, setManagingFields] = useState<{ id: string; name: string } | null>(null);
  const suparef = useRef(createClient());
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

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

  const { data, isLoading } = useQuery({
    queryKey: ["admin-comps", role, allowedComps],
    queryFn: async (): Promise<CompFull[]> => {
      const supabase = suparef.current;
      let query = supabase
        .from("competitions")
        .select("id,slug,name,tagline,fee_idr,quota,is_open,position,description,icon,accent,team_size,rules,timeline,pj_1,no_pj_1,pj_2,no_pj_2,banner,juara_1,juara_2,juara_3");

      if (role === "lomba") {
        if (!allowedComps || allowedComps.length === 0) {
          return [];
        }
        query = query.in("id", allowedComps);
      }

      const { data: list, error } = await query.order("position");
      if (error) throw error;
      return (list ?? []).map((c) => ({
        ...c,
        rules: Array.isArray(c.rules) ? (c.rules as string[]) : [],
        timeline: Array.isArray(c.timeline) ? (c.timeline as { date: string; label: string }[]) : [],
      })) as CompFull[];
    },
    enabled: role !== null,
  });

  const save = useMutation({
    mutationFn: async (v: Partial<CompFull>) => {
      const supabase = suparef.current;
      const payload = {
        slug: v.slug!, name: v.name!, tagline: v.tagline ?? null,
        fee_idr: v.fee_idr ?? 0, quota: v.quota ?? 0, is_open: !!v.is_open, position: v.position ?? 0,
        description: v.description ?? null,
        icon: v.icon ?? "Trophy",
        accent: v.accent ?? "cyan",
        banner: v.banner || null,
        pj_1: v.pj_1 ?? null,
        no_pj_1: v.no_pj_1 ?? null,
        pj_2: v.pj_2 ?? null,
        no_pj_2: v.no_pj_2 || null,
        juara_1: v.juara_1 || null,
        juara_2: v.juara_2 || null,
        juara_3: v.juara_3 || null,
        team_size: v.team_size ?? null,
        rules: v.rules ?? [],
        timeline: v.timeline ?? [],
      };
      if (v.id) {
        const { error } = await supabase.from("competitions").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("competitions").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Tersimpan");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-comps"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const supabase = suparef.current;
      const { error } = await supabase.from("competitions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dihapus");
      qc.invalidateQueries({ queryKey: ["admin-comps"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      {role !== "lomba" && (
        <div className="mb-4 flex justify-end">
          <button onClick={() => setEditing({ is_open: true, position: (data?.length ?? 0) + 1, accent: "cyan", icon: "Trophy", rules: [], timeline: [] })} className="btn-hero cursor-pointer inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
            <Plus size={14} /> Lomba baru
          </button>
        </div>
      )}
      {isLoading && <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Memuat…</div>}
      <div className="space-y-2">
        {data?.map((c) => (
          <div key={c.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
            <div>
              <p className="font-display font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-strong font-semibold">Slug:</span> /{c.slug}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-strong font-semibold">Harga:</span> Rp. {c.fee_idr.toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-strong font-semibold">Kuota:</span> {c.quota > 0 ? c.quota+' tim' : 'Tidak ada batasan'}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-strong font-semibold">Status:</span> <span className={c.is_open ? "text-emerald-300" : "text-amber-300"}>{c.is_open ? "buka" : "tutup"}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setManagingFields({ id: c.id, name: c.name })} title="Atur input form pendaftaran" className="rounded-full cursor-pointer text-primary bg-primary/25 p-2 hover:bg-primary/50"><Settings2 size={14} /></button>
              <button onClick={() => setEditing(c)} className="rounded-full cursor-pointer text-amber-500 bg-amber-500/15 p-2 hover:bg-amber-500/30"><Pencil size={14} /></button>
              {role !== "lomba" && (
                <button onClick={() => setConfirmDelete({ id: c.id, name: c.name })} className="rounded-full cursor-pointer bg-destructive/15 p-2 text-destructive hover:bg-destructive/25"><Trash2 size={14} /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <CompetitionEditor
          value={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={() => save.mutate(editing)}
          saving={save.isPending}
        />
      )}

      {managingFields && (
        <FieldManager comp={managingFields} onClose={() => setManagingFields(null)} />
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Hapus Lomba"
        message={`Apakah kamu yakin ingin menghapus lomba "${confirmDelete?.name}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => { if (confirmDelete) del.mutate(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default CompetitionsTab;