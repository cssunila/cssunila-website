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
  Star,
  Newspaper,
  Link as LinkIcon,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

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

type Sponsor = {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  position: number;
};

type MediaPartner = {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
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
  const [editingSponsor, setEditingSponsor] = useState<Partial<Sponsor> | null>(null);
  const [editingMediaPartner, setEditingMediaPartner] = useState<Partial<MediaPartner> | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [confirmDeleteTimeline, setConfirmDeleteTimeline] = useState<TimelineItem | null>(null);
  const [confirmDeleteSponsor, setConfirmDeleteSponsor] = useState<Sponsor | null>(null);
  const [confirmDeleteMediaPartner, setConfirmDeleteMediaPartner] = useState<MediaPartner | null>(null);

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

  // ── Sponsors queries & mutations ─────────────────────────────────────────
  const { data: sponsorsData, isLoading: sponsorsLoading } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: async (): Promise<Sponsor[]> => {
      const { data, error } = await suparef.current
        .from("sponsors")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveSponsor = useMutation({
    mutationFn: async (v: Partial<Sponsor>) => {
      const supabase = suparef.current;
      const payload = {
        name: v.name!,
        logo_url: v.logo_url ?? null,
        website: v.website ?? null,
        position: v.position ?? (sponsorsData?.length ?? 0) + 1,
      };
      if (v.id) {
        const { error } = await supabase.from("sponsors").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sponsors").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Sponsor berhasil disimpan");
      setEditingSponsor(null);
      qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteSponsor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await suparef.current.from("sponsors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sponsor dihapus");
      qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorderSponsor = useMutation({
    mutationFn: async (items: Sponsor[]) => {
      const supabase = suparef.current;
      for (let i = 0; i < items.length; i++) {
        const { error } = await supabase.from("sponsors").update({ position: i + 1 }).eq("id", items[i].id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sponsors"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const moveSponsor = (index: number, dir: "up" | "down") => {
    if (!sponsorsData) return;
    const items = [...sponsorsData];
    const ti = dir === "up" ? index - 1 : index + 1;
    if (ti < 0 || ti >= items.length) return;
    [items[index], items[ti]] = [items[ti], items[index]];
    reorderSponsor.mutate(items);
  };

  // ── Media Partners queries & mutations ───────────────────────────────────
  const { data: mediaPartnersData, isLoading: mediaPartnersLoading } = useQuery({
    queryKey: ["admin-media-partners"],
    queryFn: async (): Promise<MediaPartner[]> => {
      const { data, error } = await suparef.current
        .from("media_partners")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveMediaPartner = useMutation({
    mutationFn: async (v: Partial<MediaPartner>) => {
      const supabase = suparef.current;
      const payload = {
        name: v.name!,
        logo_url: v.logo_url ?? null,
        website: v.website ?? null,
        position: v.position ?? (mediaPartnersData?.length ?? 0) + 1,
      };
      if (v.id) {
        const { error } = await supabase.from("media_partners").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("media_partners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Media partner berhasil disimpan");
      setEditingMediaPartner(null);
      qc.invalidateQueries({ queryKey: ["admin-media-partners"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMediaPartner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await suparef.current.from("media_partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Media partner dihapus");
      qc.invalidateQueries({ queryKey: ["admin-media-partners"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorderMediaPartner = useMutation({
    mutationFn: async (items: MediaPartner[]) => {
      const supabase = suparef.current;
      for (let i = 0; i < items.length; i++) {
        const { error } = await supabase.from("media_partners").update({ position: i + 1 }).eq("id", items[i].id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-media-partners"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const moveMediaPartner = (index: number, dir: "up" | "down") => {
    if (!mediaPartnersData) return;
    const items = [...mediaPartnersData];
    const ti = dir === "up" ? index - 1 : index + 1;
    if (ti < 0 || ti >= items.length) return;
    [items[index], items[ti]] = [items[ti], items[index]];
    reorderMediaPartner.mutate(items);
  };

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    bucket: "sponsors" | "media-partners",
    onDone: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) {
      toast.error("Format gambar tidak valid (png/jpg/webp/svg)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }
    setUploadingLogo(bucket);
    const supabase = suparef.current;
    const fileName = `${bucket}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site_settings").upload(fileName, file, { upsert: false, contentType: file.type });
    if (error) {
      toast.error("Gagal upload logo: " + error.message);
      setUploadingLogo(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("site_settings").getPublicUrl(fileName);
    onDone(urlData.publicUrl);
    toast.success("Logo berhasil diunggah");
    setUploadingLogo(null);
  };

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
                      setConfirmDeleteTimeline(item as TimelineItem);
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
              <div className="grid grid-cols-1 md:grid-cols-2 mt-1 items-center gap-3 rounded-2xl border border-white/10 p-4 justify-between">
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
      <div className="border-t border-white/10 pt-8" />

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 size-9 items-center justify-center rounded-xl bg-amber-500/10">
              <Star size={16} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Sponsor</h3>
              <p className="text-xs text-muted-foreground">Tambah, edit, hapus, dan atur urutan sponsor yang tampil di landing page</p>
            </div>
          </div>
          <button
            onClick={() => setEditingSponsor({ name: "", logo_url: "", website: "", position: (sponsorsData?.length ?? 0) + 1 })}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-500/25 cursor-pointer transition"
          >
            <Plus size={14} /> Tambah Sponsor
          </button>
        </div>

        {sponsorsLoading && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Memuat sponsor…
          </div>
        )}
        {!sponsorsLoading && (sponsorsData ?? []).length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Belum ada sponsor. Klik &quot;Tambah Sponsor&quot; untuk memulai.
          </div>
        )}

        <div className="space-y-3">
          {(sponsorsData ?? []).map((sp, index) => (
            <div key={sp.id} className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                {/* Reorder */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => moveSponsor(index, "up")} disabled={index === 0 || reorderSponsor.isPending} className="rounded-lg p-1 hover:bg-white/10 disabled:opacity-30 cursor-pointer transition">
                    <ChevronUp size={12} />
                  </button>
                  <button onClick={() => moveSponsor(index, "down")} disabled={index === (sponsorsData?.length ?? 0) - 1 || reorderSponsor.isPending} className="rounded-lg p-1 hover:bg-white/10 disabled:opacity-30 cursor-pointer transition">
                    <ChevronDown size={12} />
                  </button>
                </div>
                {/* Logo preview */}
                {sp.logo_url ? (
                  <div className="size-10 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                    <Image src={sp.logo_url} alt={sp.name} width={40} height={40} className="h-8 w-auto object-contain" />
                  </div>
                ) : (
                  <div className="size-10 shrink-0 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                    <ImageIcon size={14} className="text-muted-foreground" />
                  </div>
                )}
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{sp.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {sp.website && <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">{sp.website}</span>}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditingSponsor(sp)} className="rounded-full p-2 hover:bg-white/10 text-foreground/70 hover:text-foreground cursor-pointer transition">
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => { setConfirmDeleteSponsor(sp as Sponsor); }}
                    disabled={deleteSponsor.isPending}
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

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 size-9 items-center justify-center rounded-xl bg-purple-500/10">
              <Newspaper size={16} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Media Partner</h3>
              <p className="text-xs text-muted-foreground">Tambah, edit, hapus, dan atur urutan media partner yang tampil di landing page</p>
            </div>
          </div>
          <button
            onClick={() => setEditingMediaPartner({ name: "", logo_url: "", website: "", position: (mediaPartnersData?.length ?? 0) + 1 })}
            className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-4 py-2 text-sm font-semibold text-purple-400 hover:bg-purple-500/25 cursor-pointer transition"
          >
            <Plus size={14} /> Tambah Media Partner
          </button>
        </div>

        {mediaPartnersLoading && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Memuat media partner…
          </div>
        )}
        {!mediaPartnersLoading && (mediaPartnersData ?? []).length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Belum ada media partner. Klik &quot;Tambah Media Partner&quot; untuk memulai.
          </div>
        )}

        <div className="space-y-3">
          {(mediaPartnersData ?? []).map((mp, index) => (
            <div key={mp.id} className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                {/* Reorder */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => moveMediaPartner(index, "up")} disabled={index === 0 || reorderMediaPartner.isPending} className="rounded-lg p-1 hover:bg-white/10 disabled:opacity-30 cursor-pointer transition">
                    <ChevronUp size={12} />
                  </button>
                  <button onClick={() => moveMediaPartner(index, "down")} disabled={index === (mediaPartnersData?.length ?? 0) - 1 || reorderMediaPartner.isPending} className="rounded-lg p-1 hover:bg-white/10 disabled:opacity-30 cursor-pointer transition">
                    <ChevronDown size={12} />
                  </button>
                </div>
                {/* Logo preview */}
                {mp.logo_url ? (
                  <div className="size-10 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                    <Image src={mp.logo_url} alt={mp.name} width={40} height={40} className="h-8 w-auto object-contain" />
                  </div>
                ) : (
                  <div className="size-10 shrink-0 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                    <ImageIcon size={14} className="text-muted-foreground" />
                  </div>
                )}
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{mp.name}</p>
                  {mp.website && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{mp.website}</p>}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditingMediaPartner(mp)} className="rounded-full p-2 hover:bg-white/10 text-foreground/70 hover:text-foreground cursor-pointer transition">
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => { setConfirmDeleteMediaPartner(mp as MediaPartner); }}
                    disabled={deleteMediaPartner.isPending}
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

      {editingSponsor !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 p-4 backdrop-blur">
          <form
            onSubmit={(e) => { e.preventDefault(); saveSponsor.mutate(editingSponsor); }}
            className="glass-strong mx-auto my-8 w-full max-w-lg space-y-4 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold">
                {editingSponsor.id ? "Edit Sponsor" : "Tambah Sponsor"}
              </h3>
              <button type="button" onClick={() => setEditingSponsor(null)} className="rounded-full p-2 hover:bg-white/10 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Nama Sponsor</label>
              <input
                className="inputCls" required
                placeholder="Misal: Nusantech, Cloudana"
                value={editingSponsor.name ?? ""}
                onChange={(e) => setEditingSponsor((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Website (opsional)</label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="inputCls pl-9"
                  placeholder="https://example.com"
                  value={editingSponsor.website ?? ""}
                  onChange={(e) => setEditingSponsor((p) => ({ ...p, website: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Logo</label>
              {editingSponsor.logo_url && (
                <div className="mb-2 flex items-center gap-3">
                  <Image src={editingSponsor.logo_url} alt="preview" width={80} height={40} className="h-10 w-auto object-contain rounded-xl border border-white/10 bg-white/5 p-1" />
                  <button type="button" onClick={() => setEditingSponsor((p) => ({ ...p, logo_url: "" }))} className="text-xs text-destructive hover:underline cursor-pointer">Hapus Logo</button>
                </div>
              )}
              <label className={`flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-muted-foreground transition ${
                uploadingLogo === "sponsors" ? "opacity-60" : "cursor-pointer hover:border-white/40 hover:text-foreground"
              }`}>
                {uploadingLogo === "sponsors" ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                {uploadingLogo === "sponsors" ? "Mengunggah..." : "Upload logo (PNG/JPG/WebP/SVG, max 2MB)"}
                <input
                  type="file" className="hidden" accept="image/*"
                  required
                  disabled={uploadingLogo === "sponsors"}
                  onChange={(e) => handleLogoUpload(e, "sponsors", (url) => setEditingSponsor((p) => ({ ...p, logo_url: url })))}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingSponsor(null)} className="rounded-full border border-white/10 px-4 py-2 text-sm cursor-pointer hover:bg-white/5">Batal</button>
              <button type="submit" disabled={saveSponsor.isPending} className="btn-hero inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold cursor-pointer disabled:opacity-60">
                {saveSponsor.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {editingMediaPartner !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 p-4 backdrop-blur">
          <form
            onSubmit={(e) => { e.preventDefault(); saveMediaPartner.mutate(editingMediaPartner); }}
            className="glass-strong mx-auto my-8 w-full max-w-lg space-y-4 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold">
                {editingMediaPartner.id ? "Edit Media Partner" : "Tambah Media Partner"}
              </h3>
              <button type="button" onClick={() => setEditingMediaPartner(null)} className="rounded-full p-2 hover:bg-white/10 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Nama Media Partner</label>
              <input
                className="inputCls" required
                placeholder="Misal: TechDaily, CodeWeekly"
                value={editingMediaPartner.name ?? ""}
                onChange={(e) => setEditingMediaPartner((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Website (opsional)</label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="inputCls pl-9"
                  placeholder="https://example.com"
                  value={editingMediaPartner.website ?? ""}
                  onChange={(e) => setEditingMediaPartner((p) => ({ ...p, website: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground after:content-['*'] after:ml-1 after:text-red-500">Logo</label>
              {editingMediaPartner.logo_url && (
                <div className="mb-2 flex items-center gap-3">
                  <Image src={editingMediaPartner.logo_url} alt="preview" width={80} height={40} className="h-10 w-auto object-contain rounded-xl border border-white/10 bg-white/5 p-1" />
                  <button type="button" onClick={() => setEditingMediaPartner((p) => ({ ...p, logo_url: "" }))} className="text-xs text-destructive hover:underline cursor-pointer">Hapus Logo</button>
                </div>
              )}
              <label className={`flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-muted-foreground transition ${
                uploadingLogo === "media-partners" ? "opacity-60" : "cursor-pointer hover:border-white/40 hover:text-foreground"
              }`}>
                {uploadingLogo === "media-partners" ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                {uploadingLogo === "media-partners" ? "Mengunggah..." : "Upload logo (PNG/JPG/WebP/SVG, max 2MB)"}
                <input
                  type="file" className="hidden" accept="image/*"
                  required
                  disabled={uploadingLogo === "media-partners"}
                  onChange={(e) => handleLogoUpload(e, "media-partners", (url) => setEditingMediaPartner((p) => ({ ...p, logo_url: url })))}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingMediaPartner(null)} className="rounded-full border border-white/10 px-4 py-2 text-sm cursor-pointer hover:bg-white/5">Batal</button>
              <button type="submit" disabled={saveMediaPartner.isPending} className="btn-hero inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold cursor-pointer disabled:opacity-60">
                {saveMediaPartner.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDeleteTimeline}
        title="Hapus Timeline"
        message={`Apakah kamu yakin ingin menghapus item timeline "${confirmDeleteTimeline?.label}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => { if (confirmDeleteTimeline) deleteTimeline.mutate(confirmDeleteTimeline.id); setConfirmDeleteTimeline(null); }}
        onCancel={() => setConfirmDeleteTimeline(null)}
      />

      <ConfirmModal
        open={!!confirmDeleteSponsor}
        title="Hapus Sponsor"
        message={`Apakah kamu yakin ingin menghapus sponsor "${confirmDeleteSponsor?.name}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => { if (confirmDeleteSponsor) deleteSponsor.mutate(confirmDeleteSponsor.id); setConfirmDeleteSponsor(null); }}
        onCancel={() => setConfirmDeleteSponsor(null)}
      />

      <ConfirmModal
        open={!!confirmDeleteMediaPartner}
        title="Hapus Media Partner"
        message={`Apakah kamu yakin ingin menghapus media partner "${confirmDeleteMediaPartner?.name}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => { if (confirmDeleteMediaPartner) deleteMediaPartner.mutate(confirmDeleteMediaPartner.id); setConfirmDeleteMediaPartner(null); }}
        onCancel={() => setConfirmDeleteMediaPartner(null)}
      />
    </div>
  );
};

export default SiteSettingsTab;
