/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

type SeminarRow = {
  id: string;
  slug: string;
  title: string;
  speaker: string | null;
  speaker_image_url: string | null;
  description: string | null;
  image_url: string | null;
  scheduled_at: string | null;
  location: string | null;
  status: "draft" | "published";
};

const SeminarsTab = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<SeminarRow> | null>(null);
  const suparef = useRef(createClient());
  const [uploadingSpeaker, setUploadingSpeaker] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-seminars"],
    queryFn: async (): Promise<SeminarRow[]> => {
      const supabase = suparef.current;
      const { data, error } = await supabase
        .from("seminars")
        .select("id,slug,title,speaker,speaker_image_url,description,image_url,scheduled_at,location,status")
        .order("scheduled_at", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (v: Partial<SeminarRow>) => {
      const payload = {
        slug: v.slug!, title: v.title!, speaker: v.speaker ?? null,
        speaker_image_url: v.speaker_image_url ?? null,
        description: v.description ?? null, image_url: v.image_url ?? null,
        scheduled_at: v.scheduled_at || null, location: v.location ?? null,
        status: v.status ?? "draft",
      };
      const supabase = suparef.current;
      if (v.id) {
        const { error } = await supabase.from("seminars").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("seminars").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Tersimpan");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-seminars"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const supabase = suparef.current;
      const { error } = await supabase.from("seminars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dihapus");
      qc.invalidateQueries({ queryKey: ["admin-seminars"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "speaker_image_url" | "image_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["jpg", "jpeg", "png", "webp", "svg"];
    if (!allowed.includes(ext ?? "")) {
      toast.error("Format file harus berupa JPG, JPEG, PNG, WEBP, atau SVG");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    if (field === "speaker_image_url") setUploadingSpeaker(true);
    else setUploadingBanner(true);

    try {
      const supabase = suparef.current;
      const path = `seminars/${field}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("site_settings")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage.from("site_settings").getPublicUrl(path);
      setEditing((prev) => prev ? { ...prev, [field]: data.publicUrl } : null);
      toast.success("Gambar berhasil diunggah");
    } catch (err: any) {
      toast.error("Gagal mengunggah gambar: " + err.message);
    } finally {
      if (field === "speaker_image_url") setUploadingSpeaker(false);
      else setUploadingBanner(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing({ status: "draft" })} className="btn-hero inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
          <Plus size={14} /> Seminar baru
        </button>
      </div>
      {isLoading && <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Memuat…</div>}
      <div className="space-y-2">
        {data?.map((s) => (
          <div key={s.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
            <div>
              <p className="font-display font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-strong font-semibold">Slug:</span> /{s.slug}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-strong font-semibold">Speaker:</span> {s.speaker ?? "—"}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-strong font-semibold">Jadwal:</span> {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) : "tanggal belum diatur"}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-strong font-semibold">Status:</span> {s.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(s)} className="rounded-full bg-white/5 p-2 hover:bg-white/10"><Pencil size={14} /></button>
              <button onClick={() => setConfirmDelete({ id: s.id, title: s.title })} className="rounded-full bg-destructive/15 p-2 text-destructive hover:bg-destructive/25"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {!isLoading && (!data || data.length === 0) && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Belum ada seminar.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 p-4 backdrop-blur">
          <form
            onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
            className="glass-strong mx-auto my-6 w-full max-w-2xl space-y-4 rounded-3xl p-6"
          >
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit Seminar" : "Seminar Baru"}</h3>

            {/* Identitas */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Judul</label>
                <input className="inputCls" placeholder="Judul seminar" required value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Slug (huruf kecil, tanpa spasi)</label>
                <input className="inputCls" placeholder="contoh-slug-unik" required pattern="[a-z0-9-]+" value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
            </div>

            {/* Pembicara */}
            <div className="rounded-2xl border border-white/10 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informasi Pembicara</p>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Nama Pembicara</label>
                <input
                  className="inputCls"
                  placeholder="Misal: Dr. Budi Santoso — Pakar AI, Universitas Lampung"
                  value={editing.speaker ?? ""}
                  onChange={(e) => setEditing({ ...editing, speaker: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Foto Pembicara</label>
                {editing.speaker_image_url && (
                  <div className="flex items-center gap-3">
                    <div className="relative size-16 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center p-1">
                      <Image src={editing.speaker_image_url} alt="Speaker" width={64} height={64} className="h-full w-full object-cover rounded-lg" />
                    </div>
                    <button type="button" onClick={() => setEditing({ ...editing, speaker_image_url: null })} className="text-xs text-destructive hover:underline flex items-center gap-1">
                      <X size={12} /> Hapus Foto
                    </button>
                  </div>
                )}
                {!editing.speaker_image_url && (
                  <label className={`flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-muted-foreground transition ${
                    uploadingSpeaker ? "opacity-60" : "cursor-pointer hover:border-white/40 hover:text-foreground"
                  }`}>
                    {uploadingSpeaker ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploadingSpeaker ? "Mengunggah..." : "Upload foto pembicara (PNG/JPG/WebP/SVG, max 2MB)"}
                    <input
                      type="file" className="hidden" accept="image/*"
                      disabled={uploadingSpeaker}
                      onChange={(e) => handleUpload(e, "speaker_image_url")}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Waktu & Lokasi */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Tanggal & Waktu</label>
                <input
                  className="inputCls"
                  type="datetime-local"
                  value={editing.scheduled_at ? editing.scheduled_at.slice(0, 16) : ""}
                  onChange={(e) => setEditing({ ...editing, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Lokasi</label>
                <input className="inputCls" placeholder="Misal: Aula Gedung Teknik" value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
              </div>
            </div>

            {/* Media Banner */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Gambar Banner</label>
              {editing.image_url && (
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-36 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center p-1">
                    <Image src={editing.image_url} alt="Banner" width={144} height={80} className="h-full w-full object-cover rounded-lg" />
                  </div>
                  <button type="button" onClick={() => setEditing({ ...editing, image_url: null })} className="text-xs text-destructive hover:underline flex items-center gap-1">
                    <X size={12} /> Hapus Banner
                  </button>
                </div>
              )}
              {!editing.image_url && (
                <label className={`flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-muted-foreground transition ${
                  uploadingBanner ? "opacity-60" : "cursor-pointer hover:border-white/40 hover:text-foreground"
                }`}>
                  {uploadingBanner ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploadingBanner ? "Mengunggah..." : "Upload banner seminar (PNG/JPG/WebP/SVG, max 2MB)"}
                  <input
                    type="file" className="hidden" accept="image/*"
                    disabled={uploadingBanner}
                    onChange={(e) => handleUpload(e, "image_url")}
                  />
                </label>
              )}
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Deskripsi Seminar</label>
              <textarea
                rows={5}
                className="inputCls"
                placeholder="Deskripsi acara seminar..."
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Status</label>
              <select className="inputCls" value={editing.status ?? "draft"} onChange={(e) => setEditing({ ...editing, status: e.target.value as "draft" | "published" })}>
                <option className="bg-background" value="draft">Draft</option>
                <option className="bg-background" value="published">Published</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-white/10 px-4 py-2 text-sm">Batal</button>
              <button type="submit" disabled={save.isPending || uploadingSpeaker || uploadingBanner} className="btn-hero inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold">
                {save.isPending && <Loader2 size={14} className="animate-spin" />} Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Hapus Seminar"
        message={`Apakah kamu yakin ingin menghapus seminar "${confirmDelete?.title}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => { if (confirmDelete) del.mutate(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default SeminarsTab;
