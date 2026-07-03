"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Globe,
  LayoutTemplate,
  Calendar,
  Pencil,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

type SiteSetting = {
  id: string;
  value: string;
};

type TimelineItem = {
  id: string;
  start_date: string | null;
  end_date: string | null;
  label: string;
  description: string;
  position: number;
};

const SETTING_KEYS = [
  "hero_tagline",
  "hero_subtitle",
  "about_title",
  "about_description_1",
  "about_description_2",
  "about_highlights",
  "site_logo",
  "site_favicon",
  "site_title_main",
  "site_title_sub",
];

const SiteSettingsTab = () => {
  const qc = useQueryClient();
  const suparef = useRef(createClient());

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [highlightInput, setHighlightInput] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingFavicon, setLoadingFavicon] = useState(false);

  const [editingTimeline, setEditingTimeline] = useState<Partial<TimelineItem> | null>(null);

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async (): Promise<SiteSetting[]> => {
      const supabase = suparef.current;
      const { data, error } = await supabase.from("site_settings").select("id, value");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    (async () => {
      if (settingsData) {
        const map: Record<string, string> = {};
        settingsData.forEach((s) => { map[s.id] = s.value; });
        setSettings(map);
        try {
          const parsed = JSON.parse(map["about_highlights"] ?? "[]");
          if (Array.isArray(parsed)) setHighlights(parsed);
        } catch { setHighlights([]); }
      }
    })()
  }, [settingsData]);

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ["admin-timeline-items"],
    queryFn: async (): Promise<TimelineItem[]> => {
      const supabase = suparef.current;
      const { data, error } = await supabase
        .from("timeline_items")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const supabase = suparef.current;
      const rows = Object.entries(data).map(([id, value]) => ({ id, value }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pengaturan berhasil disimpan");
      qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveTimeline = useMutation({
    mutationFn: async (v: Partial<TimelineItem>) => {
      const supabase = suparef.current;
      const payload = {
        start_date: v.start_date || null,
        end_date: v.end_date || null,
        label: v.label!,
        description: v.description ?? "",
        position: v.position ?? (timelineData?.length ?? 0) + 1,
      };
      if (v.id) {
        const { error } = await supabase.from("timeline_items").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("timeline_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Timeline berhasil disimpan");
      setEditingTimeline(null);
      qc.invalidateQueries({ queryKey: ["admin-timeline-items"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTimeline = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await suparef.current.from("timeline_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item timeline dihapus");
      qc.invalidateQueries({ queryKey: ["admin-timeline-items"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorderTimeline = useMutation({
    mutationFn: async (items: TimelineItem[]) => {
      const supabase = suparef.current;
      for (let i = 0; i < items.length; i++) {
        const { error } = await supabase
          .from("timeline_items")
          .update({ position: i + 1 })
          .eq("id", items[i].id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-timeline-items"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const moveItem = (index: number, dir: "up" | "down") => {
    if (!timelineData) return;
    const newItems = [...timelineData];
    const targetIndex = dir === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    reorderTimeline.mutate(newItems);
  };

  const handleGambar = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (key == 'site_logo') setLoadingLogo(true);
    if (key == 'site_favicon') setLoadingFavicon(true);
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("File tidak ditemukan")
      if (key == 'site_logo') setLoadingLogo(false);
      if (key == 'site_favicon') setLoadingFavicon(false);
      return;
    }

    let acceptExtension = [];
    if (key == 'site_logo') acceptExtension = ['png', 'jpg', 'jpeg', 'webp'];
    else acceptExtension = ['png', 'ico', 'webp'];

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!acceptExtension.includes(fileExtension ?? '')) {
      toast.error("Format gambar tidak diizinkan")
      if (key == 'site_logo') setLoadingLogo(false);
      if (key == 'site_favicon') setLoadingFavicon(false);
      return;
    }

    if (file.size > 1024 * 1024 * 1) {
      toast.error("Ukuran gambar tidak boleh lebih dari 1MB")
      if (key == 'site_logo') setLoadingLogo(false);
      if (key == 'site_favicon') setLoadingFavicon(false);
      return;
    }

    const supabase = suparef.current;
    const nameRandom = crypto.randomUUID();
    const fileName = `settings/${key}/${nameRandom}_${file.name}.${fileExtension}`;

    const { error } = await supabase.storage
      .from('site_settings')
      .upload(fileName, file, { upsert: false, contentType: file.type });

    if (error) {
      toast.error("Gagal mengunggah gambar");
      if (key == 'site_logo') setLoadingLogo(false);
      if (key == 'site_favicon') setLoadingFavicon(false);
      return;
    }

    toast.success("Gambar berhasil diunggah");
    await loadGambar(fileName, key);
    if (key == 'site_logo') setLoadingLogo(false);
    if (key == 'site_favicon') setLoadingFavicon(false);
  }

  const loadGambar = async (fileName: string, key: string) => {
    const supabase = suparef.current;
    const { data: imageUrl } = supabase.storage
      .from('site_settings')
      .getPublicUrl(fileName);

    setSettings((prev) => ({ ...prev, [key]: imageUrl.publicUrl }));
  }

  const handleSaveSettings = () => {
    const final = {
      ...settings,
      about_highlights: JSON.stringify(highlights),
    };
    saveSettings.mutate(final);
  };

  const formatTanggal = (date: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-8">
      <div className="glass rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 size-9 items-center justify-center rounded-xl bg-cyan-strong/10">
            <Globe size={16} className="text-cyan-strong" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Identitas Website</h3>
            <p className="text-xs text-muted-foreground">Judul utama, logo, dan favicon tab browser website Anda</p>
          </div>
        </div>

        {settingsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Memuat…
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Judul Utama</label>
                <input
                  className="inputCls"
                  placeholder="Contoh: CSS"
                  value={settings["site_title_main"] ?? ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, site_title_main: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sub-Judul (Teks Gradien)</label>
                <input
                  className="inputCls"
                  placeholder="Contoh: 3.0"
                  value={settings["site_title_sub"] ?? ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, site_title_sub: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Logo Website</label>
                {settings["site_logo"] && <Image src={settings["site_logo"] ?? ""} alt="Logo Website" width={70} height={70} className="object-contain w-16 h-16 my-1" />}
                <input type="hidden" name="site_logo" value={settings["site_logo"] ?? ""} />
                {loadingLogo ? <Loader2 size={14} className="animate-spin" /> : (
                  <input
                    type="file"
                    className="inputCls inputFile"
                    accept=".png,.jpg,.jpeg,.gif,.webp"
                    onChange={(e) => handleGambar(e, "site_logo")}
                  />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Favicon Tab Browser</label>
                {settings["site_favicon"] && <Image src={settings["site_favicon"] ?? ""} alt="Favicon Tab Browser" width={70} height={70} className="object-contain w-16 h-16 my-1" />}
                <input type="hidden" name="site_favicon" value={settings["site_favicon"] ?? ""} />
                {loadingFavicon ? <Loader2 size={14} className="animate-spin" /> : (
                  <input
                    type="file"
                    className="inputCls inputFile"
                    accept=".png,.ico"
                    onChange={(e) => handleGambar(e, "site_favicon")}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 size-9 items-center justify-center rounded-xl bg-cyan-strong/10">
            <LayoutTemplate size={16} className="text-cyan-strong" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Hero Section</h3>
            <p className="text-xs text-muted-foreground">Tagline dan subjudul</p>
          </div>
        </div>

        {settingsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Memuat…
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Tagline</label>
              <input
                className="inputCls"
                placeholder="Computer Science Showdown 2026"
                value={settings["hero_tagline"] ?? ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, hero_tagline: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Subjudul / Deskripsi Hero</label>
              <textarea
                className="inputCls"
                rows={3}
                placeholder="Deskripsi singkat event..."
                value={settings["hero_subtitle"] ?? ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, hero_subtitle: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="glass rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 size-9 items-center justify-center rounded-xl bg-sapphire/10">
            <LayoutTemplate size={16} className="text-sapphire" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">About Section</h3>
            <p className="text-xs text-muted-foreground">Judul, deskripsi, dan poin-poin keunggulan di section Tentang CSS</p>
          </div>
        </div>

        {settingsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Memuat…
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Judul Section</label>
              <input
                className="inputCls"
                placeholder="Apa itu Computer Science Showdown 3.0?"
                value={settings["about_title"] ?? ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, about_title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Paragraf 1</label>
              <textarea
                className="inputCls"
                rows={4}
                placeholder="Deskripsi paragraf pertama tentang event..."
                value={settings["about_description_1"] ?? ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, about_description_1: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Paragraf 2</label>
              <textarea
                className="inputCls"
                rows={4}
                placeholder="Deskripsi paragraf kedua tentang event..."
                value={settings["about_description_2"] ?? ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, about_description_2: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Poin Keuntungan</label>
              </div>
              <div className="space-y-2">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 glass rounded-xl px-3 py-2 text-sm text-foreground flex items-center gap-2">
                      <span className="size-1.5 shrink-0 rounded-full bg-cyan-strong" />
                      {h}
                    </div>
                    <button
                      type="button"
                      onClick={() => setHighlights((prev) => prev.filter((_, j) => j !== i))}
                      className="rounded-full p-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="inputCls flex-1"
                  placeholder="Tambah poin keunggulan…"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && highlightInput.trim()) {
                      e.preventDefault();
                      setHighlights((prev) => [...prev, highlightInput.trim()]);
                      setHighlightInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!highlightInput.trim()}
                  onClick={() => {
                    if (highlightInput.trim()) {
                      setHighlights((prev) => [...prev, highlightInput.trim()]);
                      setHighlightInput("");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-strong/15 px-4 py-2 text-xs font-semibold text-cyan-strong hover:bg-cyan-strong/25 disabled:opacity-50 cursor-pointer transition"
                >
                  <Plus size={14} /> Tambah
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">Tip: tekan Enter untuk menambahkan poin dengan cepat</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saveSettings.isPending || settingsLoading}
          className="btn-hero inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60 cursor-pointer"
        >
          {saveSettings.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Simpan Pengaturan Hero & About
        </button>
      </div>

      <div className="border-t border-white/10 pt-8" />

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 size-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <Calendar size={16} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Timeline Acara</h3>
              <p className="text-xs text-muted-foreground">Tambah, edit, hapus, dan atur urutan item timeline di landing page</p>
            </div>
          </div>
          <button
            onClick={() => setEditingTimeline({ start_date: "", end_date: "", label: "", description: "", position: (timelineData?.length ?? 0) + 1 })}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/25 cursor-pointer transition"
          >
            <Plus size={14} /> Tambah Item
          </button>
        </div>

        {timelineLoading && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Memuat timeline…
          </div>
        )}

        {!timelineLoading && (!timelineData || timelineData.length === 0) && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Belum ada item timeline. Klik &quot;Tambah Item&quot; untuk memulai.
          </div>
        )}

        <div className="space-y-3">
          {(timelineData ?? []).map((item, index) => (
            <div
              key={item.id}
              className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex flex-col gap-1 shrink-0 mt-0.5">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0 || reorderTimeline.isPending}
                      className="rounded-lg p-1 hover:bg-white/10 disabled:opacity-30 cursor-pointer transition"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={index === (timelineData?.length ?? 0) - 1 || reorderTimeline.isPending}
                      className="rounded-lg p-1 hover:bg-white/10 disabled:opacity-30 cursor-pointer transition"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-strong glass px-2.5 py-1 rounded-lg shrink-0">
                        {`${item.start_date ? formatTanggal(item.start_date) : ""}${item.end_date ? ' - ' + formatTanggal(item.end_date) : ""}`}
                      </span>
                      <span className="font-display font-semibold text-sm text-foreground">
                        {item.label}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingTimeline(item)}
                    className="rounded-full p-2 hover:bg-white/10 text-foreground/70 hover:text-foreground cursor-pointer transition"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus "${item.label}"?`)) {
                        deleteTimeline.mutate(item.id);
                      }
                    }}
                    disabled={deleteTimeline.isPending}
                    className="rounded-full p-2 text-destructive hover:bg-destructive/15 cursor-pointer transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingTimeline !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 p-4 backdrop-blur">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveTimeline.mutate(editingTimeline);
            }}
            className="glass-strong mx-auto my-8 w-full max-w-lg space-y-4 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold">
                {editingTimeline.id ? "Edit Item Timeline" : "Tambah Item Timeline"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTimeline(null)}
                className="rounded-full p-2 hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Tanggal / Periode</label>
              <div className="flex mt-1 p-2 px-3 glass rounded-2xl items-center gap-3 justify-between">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Start</label>
                  <input
                    className="inputCls"
                    type="datetime-local"
                    required
                    value={editingTimeline.start_date ? editingTimeline.start_date.slice(0, 16) : ""}
                    onChange={(e) => setEditingTimeline((prev) => ({ ...prev, start_date: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End (Opsional)</label>
                  <input
                    className="inputCls"
                    type="datetime-local"
                    value={editingTimeline.end_date ? editingTimeline.end_date.slice(0, 16) : ""}
                    onChange={(e) => setEditingTimeline((prev) => ({ ...prev, end_date: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Judul / Label</label>
              <input
                className="inputCls"
                required
                placeholder="Misal: Pembukaan, Pelaksanaan Lomba"
                value={editingTimeline.label ?? ""}
                onChange={(e) => setEditingTimeline((prev) => ({ ...prev, label: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Deskripsi (opsional)</label>
              <textarea
                className="inputCls"
                rows={3}
                placeholder="Deskripsi singkat tentang tahapan acara ini..."
                value={editingTimeline.description ?? ""}
                onChange={(e) => setEditingTimeline((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTimeline(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm cursor-pointer hover:bg-white/5"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saveTimeline.isPending}
                className="btn-hero inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {saveTimeline.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SiteSettingsTab;
