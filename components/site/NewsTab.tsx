/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";
import { usePageVisibility, useToggleVisibility } from "@/hooks/use-page-visibility";

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  status: "draft" | "published";
  image_url: string | null;
  content: string | null;
  drive_link: string | null;
  gallery: string[] | null;
};

const NewsTab = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<NewsRow> | null>(null);
  const suparef = useRef(createClient());
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const { visibility } = usePageVisibility();
  const toggleVis = useToggleVisibility("berita");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async (): Promise<NewsRow[]> => {
      const supabase = suparef.current;
      const { data, error } = await supabase.from("news").select("id,slug,title,excerpt,category,status,image_url,content,drive_link,gallery").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (v: Partial<NewsRow>) => {
      const payload = {
        slug: v.slug!, title: v.title!, excerpt: v.excerpt ?? null, category: v.category ?? null,
        status: v.status ?? "draft", image_url: v.image_url ?? null, content: v.content ?? null,
        drive_link: v.drive_link ?? null,
        gallery: (v.gallery ?? []).filter(Boolean),
        published_at: v.status === "published" ? new Date().toISOString() : null,
      };
      const supabase = suparef.current;
      if (v.id) {
        const { error } = await supabase.from("news").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Tersimpan");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-news"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const supabase = suparef.current;
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dihapus");
      qc.invalidateQueries({ queryKey: ["admin-news"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingBanner(true);
    try {
      const supabase = suparef.current;
      const path = `news/banners/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("site_settings")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage.from("site_settings").getPublicUrl(path);
      setEditing((prev) => prev ? { ...prev, image_url: data.publicUrl } : null);
      toast.success("Banner berhasil diunggah");
    } catch (err: any) {
      toast.error("Gagal mengunggah banner: " + err.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["jpg", "jpeg", "png", "webp", "svg"];
    if (!allowed.includes(ext ?? "")) {
      toast.error("Format file harus berupa JPG, JPEG, PNG, WEBP, atau SVG");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("Ukuran file maksimal 1MB per gambar");
      return;
    }

    setUploadingGallery(true);
    try {
      const supabase = suparef.current;
      const path = `news/gallery/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("site_settings")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage.from("site_settings").getPublicUrl(path);
      setEditing((prev) => {
        if (!prev) return null;
        const currentGallery = prev.gallery ?? [];
        return {
          ...prev,
          gallery: [...currentGallery, data.publicUrl]
        };
      });
      toast.success("Gambar galeri berhasil diunggah");
    } catch (err: any) {
      toast.error("Gagal mengunggah gambar galeri: " + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            const next = !visibility.berita;
            toggleVis.mutate(next, {
              onSuccess: () => toast.success(next ? "Section Berita ditampilkan" : "Section Berita disembunyikan"),
              onError: (e: Error) => toast.error(e.message),
            });
          }}
          disabled={toggleVis.isPending}
          title={visibility.berita ? "Sembunyikan section Berita dari landing page" : "Tampilkan section Berita di landing page"}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            visibility.berita
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          }`}
        >
          {toggleVis.isPending ? <Loader2 size={13} className="animate-spin" /> : visibility.berita ? <Eye size={13} /> : <EyeOff size={13} />}
          {visibility.berita ? "Ditampilkan" : "Disembunyikan"}
        </button>
        <button onClick={() => setEditing({ status: "draft", gallery: [] })} className="btn-hero inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
          <Plus size={14} /> Berita baru
        </button>
      </div>
      {isLoading && <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Memuat…</div>}
      <div className="space-y-2">
        {data?.map((n) => (
          <div key={n.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
            <div>
              <p className="font-display font-semibold">{n.title}</p>
              <p className="text-xs text-muted-foreground">/{n.slug} · {n.category ?? "—"} · {n.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(n)} className="rounded-full bg-white/5 p-2 hover:bg-white/10"><Pencil size={14} /></button>
              <button onClick={() => setConfirmDelete({ id: n.id, title: n.title })} className="rounded-full bg-destructive/15 p-2 text-destructive hover:bg-destructive/25"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {!isLoading && (!data || data.length === 0) && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Belum ada berita.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 p-4 backdrop-blur">
          <form
            onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
            className="glass-strong mx-auto my-6 w-full max-w-2xl space-y-4 rounded-3xl p-6"
          >
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit Berita" : "Berita Baru"}</h3>

            {/* Identitas */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Judul</label>
                <input className="inputCls" placeholder="Judul berita" required value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Slug (huruf kecil, tanpa spasi)</label>
                <input className="inputCls" placeholder="contoh-slug-unik" required pattern="[a-z0-9-]+" value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Kategori</label>
                <input className="inputCls" placeholder="Misal: Pengumuman" value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Status</label>
                <select className="inputCls" value={editing.status ?? "draft"} onChange={(e) => setEditing({ ...editing, status: e.target.value as "draft" | "published" })}>
                  <option className="bg-background" value="draft">Draft</option>
                  <option className="bg-background" value="published">Published</option>
                </select>
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
                  {uploadingBanner ? "Mengunggah..." : "Upload banner berita (PNG/JPG/WebP/SVG, max 2MB)"}
                  <input
                    type="file" className="hidden" accept="image/*"
                    disabled={uploadingBanner}
                    onChange={(e) => handleBannerUpload(e)}
                  />
                </label>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Link Google Drive (Opsional)</label>
              <input className="inputCls" placeholder="https://drive.google.com/..." value={editing.drive_link ?? ""} onChange={(e) => setEditing({ ...editing, drive_link: e.target.value })} />
            </div>

            {/* Galeri */}
            <div className="space-y-3 rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Galeri Foto Dokumentasi</p>
                <span className="text-[10px] text-muted-foreground">Max 1MB per foto</span>
              </div>

              {/* Grid of uploaded images */}
              <div className="grid grid-cols-4 gap-2">
                {(editing.gallery ?? []).map((url, i) => (
                  <div key={i} className="group relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                    <Image src={url} alt={`Gallery ${i + 1}`} width={80} height={60} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const g = [...(editing.gallery ?? [])].filter((_, j) => j !== i);
                        setEditing({ ...editing, gallery: g });
                      }}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-destructive hover:bg-black/80 transition"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload input button */}
              <label className={`flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-2.5 text-xs text-muted-foreground transition ${
                uploadingGallery ? "opacity-60" : "cursor-pointer hover:border-white/40 hover:text-foreground"
              }`}>
                {uploadingGallery ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                {uploadingGallery ? "Mengunggah..." : "Tambah Foto ke Galeri (PNG/JPG/WebP/SVG, max 1MB)"}
                <input
                  type="file" className="hidden" accept="image/*"
                  disabled={uploadingGallery}
                  onChange={(e) => handleGalleryUpload(e)}
                />
              </label>
            </div>

            {/* Konten */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Ringkasan</label>
              <textarea className="inputCls" rows={2} placeholder="Ringkasan singkat berita..." value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Konten Lengkap</label>
              <textarea className="inputCls" rows={8} placeholder="Isi berita selengkapnya... (bisa multi-paragraf, tekan Enter untuk paragraf baru)" value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-white/10 px-4 py-2 text-sm">Batal</button>
              <button type="submit" disabled={save.isPending || uploadingBanner || uploadingGallery} className="btn-hero inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold">
                {save.isPending && <Loader2 size={14} className="animate-spin" />} Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Hapus Berita"
        message={`Apakah kamu yakin ingin menghapus berita "${confirmDelete?.title}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => { if (confirmDelete) del.mutate(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default NewsTab;