"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import QR from "qrcode";
import { useAuth } from "@/hooks/use-auth";


type GroupComp = {
  id: string;
  name: string;
  slug: string;
  group_links: { link_url: string | null; qr_url: string | null; is_visible: boolean };
};

const GroupLinksTab = () => {
  const qc = useQueryClient();
  const { role, user } = useAuth();
  const suparef = useRef(createClient());

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
    queryKey: ["admin-groups", "group-visible", role, allowedComps],
    queryFn: async (): Promise<GroupComp[]> => {
      const supabase = suparef.current;
      let query = supabase
        .from("competitions")
        .select("id, name, slug, group_links(link_url, qr_url, is_visible)");

      if (role === "lomba") {
        if (!allowedComps || allowedComps.length === 0) {
          return [];
        }
        query = query.in("id", allowedComps);
      }

      const { data: list, error } = await query.order("position");
      if (error) throw error;
      return (list ?? []) as unknown as GroupComp[];
    },
    enabled: role !== null,
  });

  const save = useMutation({

    mutationFn: async (v: { competition_id: string; link_url: string; qr_url: string; is_visible: boolean }) => {
      if (!v.link_url.trim()) throw new Error("Link grup wajib diisi");
      const supabase = suparef.current;
      const { error } = await supabase.from("group_links").upsert(
        { competition_id: v.competition_id, link_url: v.link_url, qr_url: v.qr_url || null, is_visible: v.is_visible },
        { onConflict: "competition_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tersimpan"); qc.invalidateQueries({ queryKey: ["admin-groups"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Memuat…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {data?.map((c) => {
        const gl = c.group_links;
        return <GroupLinkRow key={c.id} comp={c} initial={gl ?? null} onSave={(v) => save.mutate({ competition_id: c.id, ...v })} />;
      })}
    </div>
  );
}

const GroupLinkRow = ({
  comp, initial, onSave
}: { comp: GroupComp; initial: { link_url: string | null; qr_url: string | null; is_visible: boolean } | null; onSave: (v: { link_url: string; qr_url: string; is_visible: boolean }) => void }) => {
  const [link, setLink] = useState<string>(initial?.link_url ?? "");
  const [qr, setQr] = useState<string>(initial?.qr_url ?? "");
  const [visible, setVisible] = useState<boolean>(initial?.is_visible ?? false);
  const [loading, setLoading] = useState<boolean>(false);
  const suparef = useRef(createClient());
  const qc = useQueryClient();


  const handleGambar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) {
      setLoading(false);
      toast.error("File tidak ditemukan");
      return;
    }

    if (file.size > 1024 * 1024) {
      setLoading(false);
      toast.error("Ukuran file maksimal 1MB");
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "png", "jpeg", "webp"].includes(fileExtension ?? "")) {
      setLoading(false);
      toast.error("Format file tidak diizinkan");
      return;
    }

    const filename = `group/${comp.slug}/${crypto.randomUUID()}-${comp.slug}.${fileExtension}`;

    const supabase = suparef.current;
    const { error } = await supabase.storage
      .from("site_settings")
      .upload(filename, file, { upsert: false, contentType: file.type });

    if (error) {
      setLoading(false);
      toast.error("Gagal mengupload gambar");
      return;
    };

    const { data: url } = await supabase.storage
      .from("site_settings")
      .getPublicUrl(filename);

    setQr(url.publicUrl);
    onSave({ link_url: link, qr_url: url.publicUrl, is_visible: visible });
    setLoading(false);
  }

  const handleSave = async () => {
    setLoading(true);
    if (!qr) {
      const qrCode = await QR.toDataURL(link, { margin: 3, width: 220 });
      const response = await fetch(qrCode);
      const blob = await response.blob();

      const supabase = suparef.current;
      const filename = `group/${comp.slug}/${crypto.randomUUID()}-${comp.slug}.png`;
      const { error } = await supabase.storage
        .from("site_settings")
        .upload(filename, blob, { upsert: false, contentType: "image/png" });

      if (error) {
        setLoading(false);
        toast.error("Gagal mengupload gambar");
        return;
      };

      const { data: url } = await supabase.storage
        .from("site_settings")
        .getPublicUrl(filename);

      setQr(url.publicUrl);
      onSave({ link_url: link, qr_url: url.publicUrl, is_visible: visible });
    } else {
      onSave({ link_url: link, qr_url: qr, is_visible: visible });
    }
    setLoading(false);
  }

  const toggleVis = useMutation({
    mutationFn: async (newValue: boolean) => {
      const supabase = suparef.current;
     
      const { error } = await supabase
        .from("group_links")
        .update({is_visible: newValue, updated_at: new Date().toISOString() })
        .eq("competition_id", comp.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-visible"] });
    },
  });


  return (
    <div className="glass rounded-2xl p-4">
      <p className="font-display font-semibold">{comp.name}</p>
      <p className="text-xs text-muted-foreground">/{comp.slug}</p>
      <div className="mt-3 flex flex-col gap-2">
        <div className="space-y-2">
          {loading ? <div className="flex items-center justify-start"><Loader2 className="animate-spin w-12 h-12" /></div> : qr &&
            <div className="flex items-center gap-3">
              <Image src={qr} alt="Gambar QR" width={100} height={100} className="object-contain w-24 h-24 rounded-lg" />
              <button type="button" onClick={() => setQr("")} className="text-xs text-destructive hover:underline flex items-center gap-1">
                <X size={12} /> Hapus Gambar
              </button>
            </div>
          }
          <input type="file" accept=".jpg,.png,.jpeg,.webp" className={"inputCls inputFile"} onChange={(e) => handleGambar(e)} />
        </div>
        <input className={"inputCls"} placeholder="Link grup (WA/Telegram)" value={link} onChange={(e) => setLink(e.target.value)} />

      </div>
      <div className="mt-3 flex justify-end gap-3">
        <button
          onClick={() => {
            const next = !visible;
            setVisible(next);
            toggleVis.mutate(next, {
              onSuccess: () => toast.success(next ? "Grup ditampilkan" : "Grup disembunyikan"),
              onError: (e: Error) => toast.error(e.message),
            });
          }}
          disabled={toggleVis.isPending}
          title={visible ? "Sembunyikan section Berita dari landing page" : "Tampilkan section Berita di landing page"}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${visible
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            : "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            }`}
        >
          {toggleVis.isPending ? <Loader2 size={13} className="animate-spin" /> : visible ? <Eye size={13} /> : <EyeOff size={13} />}
          {visible ? "Ditampilkan" : "Disembunyikan"}
        </button>
        <button disabled={loading || !link} onClick={() => handleSave()} className="btn-hero rounded-full px-4 py-1.5 text-xs font-semibold">Simpan</button>
      </div>
    </div>
  );
}

export default GroupLinksTab;