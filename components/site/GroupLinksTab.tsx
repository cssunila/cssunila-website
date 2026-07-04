"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import QR from "qrcode";
import { useAuth } from "@/hooks/use-auth";


type GroupComp = {
  id: string;
  name: string;
  slug: string;
  group_links: { link_url: string | null; qr_url: string | null };
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
    queryKey: ["admin-groups", role, allowedComps],
    queryFn: async (): Promise<GroupComp[]> => {
      const supabase = suparef.current;
      let query = supabase
        .from("competitions")
        .select("id, name, slug, group_links(link_url, qr_url)");

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
    mutationFn: async (v: { competition_id: string; link_url: string; qr_url: string }) => {
      if (!v.link_url.trim()) throw new Error("Link grup wajib diisi");
      const supabase = suparef.current;
      const { error } = await supabase.from("group_links").upsert(
        { competition_id: v.competition_id, link_url: v.link_url, qr_url: v.qr_url || null },
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
}: { comp: GroupComp; initial: { link_url: string | null; qr_url: string | null } | null; onSave: (v: { link_url: string; qr_url: string }) => void }) => {
  const [link, setLink] = useState<string>(initial?.link_url ?? "");
  const [qr, setQr] = useState<string>(initial?.qr_url ?? "");
  const [loading, setLoading] = useState<boolean>(false);
  const suparef = useRef(createClient());

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

    const filename = `${comp.slug}_qr_${crypto.randomUUID()}.${fileExtension}`;

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
    onSave({ link_url: link, qr_url: url.publicUrl });
    setLoading(false);
  }

  const handleSave = async () => {
    setLoading(true);
    const qr = await QR.toDataURL(link, { margin: 3, width: 220 });
    const response = await fetch(qr);
    const blob = await response.blob();

    const supabase = suparef.current;
    const filename = `${crypto.randomUUID()}-${comp.slug}.png`;
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
    onSave({ link_url: link, qr_url: url.publicUrl });
    setLoading(false);
  }


  return (
    <div className="glass rounded-2xl p-4">
      <p className="font-display font-semibold">{comp.name}</p>
      <p className="text-xs text-muted-foreground">/{comp.slug}</p>
      <div className="mt-3 flex flex-col gap-2">
        <div className="space-y-2">
          {loading ? <div className="flex items-center justify-start"><Loader2 className="animate-spin w-12 h-12" /></div> : qr && <Image src={qr} alt="Gambar QR" width={100} height={100} className="object-contain w-24 h-24 rounded-lg" />}
          <input type="file" accept=".jpg,.png,.jpeg,.webp" className={"inputCls inputFile"} onChange={(e) => handleGambar(e)} />
        </div>
        <input className={"inputCls"} placeholder="Link grup (WA/Telegram)" value={link} onChange={(e) => setLink(e.target.value)} />
      </div>
      <div className="mt-3 flex justify-end">
        <button disabled={loading || !link} onClick={() => handleSave()} className="btn-hero rounded-full px-4 py-1.5 text-xs font-semibold">Simpan</button>
      </div>
    </div>
  );
}

export default GroupLinksTab;