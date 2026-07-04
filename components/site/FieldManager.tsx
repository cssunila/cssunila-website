"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Field = {
  id?: string;
  key: string;
  label: string;
  field_type: "text" | "textarea" | "number" | "email" | "tel" | "url" | "select" | "file";
  required: boolean;
  placeholder: string | null;
  options: string[] | null;
  position: number;
};

const FieldManager = ({ comp, onClose }: { comp: { id: string; name: string }; onClose: () => void }) => {
  const qc = useQueryClient();
  const suparef = useRef(createClient());

  const { data, isLoading } = useQuery({
    queryKey: ["admin-fields", comp.id],
    queryFn: async (): Promise<Field[]> => {
      const supabase = suparef.current;
      const { data, error } = await supabase
        .from("competition_fields")
        .select("id,key,label,field_type,required,placeholder,options,position")
        .eq("competition_id", comp.id)
        .order("position");
      if (error) throw error;
      return (data ?? []).map((f) => ({
        ...f,
        options: Array.isArray(f.options) ? (f.options as string[]) : null,
      })) as Field[];
    },
  });

  const [draft, setDraft] = useState<Field[]>([]);
  const items = draft.length || data?.length ? (draft.length ? draft : data ?? []) : [];

  if (data && draft.length === 0 && !isLoading) {
    setTimeout(() => setDraft(data), 0);
  }

  const persist = useMutation({
    mutationFn: async (rows: Field[]) => {
      const original = data ?? [];
      const keptIds = rows.filter((r) => r.id).map((r) => r.id!);
      const toDelete = original.filter((o) => o.id && !keptIds.includes(o.id)).map((o) => o.id!);
      const supabase = suparef.current;
      if (toDelete.length) {
        const { error } = await supabase.from("competition_fields").delete().in("id", toDelete);
        if (error) throw error;
      }
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const payload = {
          competition_id: comp.id,
          key: r.key.trim(),
          label: r.label.trim(),
          field_type: r.field_type,
          required: r.required,
          placeholder: r.placeholder ?? null,
          options: r.options && r.options.length ? r.options : null,
          position: i,
        };
        if (r.id) {
          const { error } = await supabase.from("competition_fields").update(payload).eq("id", r.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("competition_fields").insert(payload);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast.success("Form tersimpan");
      qc.invalidateQueries({ queryKey: ["admin-fields", comp.id] });
      setDraft([]);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function update(idx: number, patch: Partial<Field>) {
    setDraft((d) => d.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  }
  function remove(idx: number) {
    setDraft((d) => d.filter((_, i) => i !== idx));
  }
  function add() {
    setDraft((d) => [
      ...d,
      { key: `field_${d.length + 1}`, label: "Pertanyaan baru", field_type: "text", required: false, placeholder: null, options: null, position: d.length },
    ]);
  }
  function move(idx: number, dir: -1 | 1) {
    setDraft((d) => {
      const n = [...d];
      const j = idx + dir;
      if (j < 0 || j >= n.length) return n;
      [n[idx], n[j]] = [n[j], n[idx]];
      return n;
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 p-4 backdrop-blur">
      <div className="glass-strong mx-auto my-6 w-full max-w-3xl space-y-4 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">Form Pendaftaran</h3>
            <p className="text-xs text-muted-foreground">{comp.name} — atur input apa saja yang akan diisi peserta.</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-1.5 text-xs cursor-pointer">Tutup</button>
        </div>

        {isLoading && <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">Memuat…</div>}

        <div className="space-y-3">
          {items.map((f, idx) => (
            <div key={f.id ?? `new-${idx}`} className="glass rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1">
                  <button type="button" onClick={() => move(idx, -1)} className="text-muted-foreground hover:text-foreground"><GripVertical size={14} /></button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input className={"inputCls"} placeholder="Label pertanyaan" value={f.label} onChange={(e) => update(idx, { label: e.target.value })} />
                    <input className={"inputCls"} placeholder="key_unik (huruf kecil, no spasi)" pattern="[a-z0-9_]+" value={f.key} onChange={(e) => update(idx, { key: e.target.value })} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <select className={"inputCls"} value={f.field_type} onChange={(e) => update(idx, { field_type: e.target.value as Field["field_type"] })}>
                      <option className="bg-background" value="text">Teks pendek</option>
                      <option className="bg-background" value="textarea">Teks panjang</option>
                      <option className="bg-background" value="number">Angka</option>
                      <option className="bg-background" value="email">Email</option>
                      <option className="bg-background" value="tel">Nomor HP</option>
                      <option className="bg-background" value="url">URL / Link</option>
                      <option className="bg-background" value="select">Pilihan (dropdown)</option>
                      <option className="bg-background" value="file">Upload File</option>
                    </select>
                    <input className={"inputCls"} placeholder="Placeholder (opsional)" value={f.placeholder ?? ""} onChange={(e) => update(idx, { placeholder: e.target.value })} />
                    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/2 px-3 py-3 text-xs">
                      <input type="checkbox" className="appearance-none size-3 rounded-2xl border-none bg-white/20 checked:bg-primary" checked={f.required} onChange={(e) => update(idx, { required: e.target.checked })} />
                      Wajib diisi
                    </label>
                  </div>
                  {f.field_type === "select" && (
                    <input
                      className={"inputCls"}
                      placeholder="Pilihan dipisah koma. Contoh: SMA, SMK, Mahasiswa"
                      value={(f.options ?? []).join(", ")}
                      onChange={(e) => update(idx, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    />
                  )}
                </div>
                <button type="button" onClick={() => remove(idx)} className="rounded-full bg-destructive/15 p-2 text-destructive hover:bg-destructive/25"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <button type="button" onClick={add} className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/15 px-4 py-2 text-xs hover:bg-white/5">
            <Plus size={14} /> Tambah input
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full cursor-pointer border border-white/10 px-4 py-2 text-sm">Batal</button>
            <button
              type="button"
              disabled={persist.isPending}
              onClick={() => {
                const keys = new Set<string>();
                for (const f of items) {
                  if (!f.label.trim() || !f.key.trim()) { toast.error("Label dan key wajib diisi"); return; }
                  if (keys.has(f.key)) { toast.error(`Key duplikat: ${f.key}`); return; }
                  keys.add(f.key);
                }
                persist.mutate(items);
              }}
              className="btn-hero inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {persist.isPending && <Loader2 size={14} className="animate-spin" />} Simpan Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FieldManager;