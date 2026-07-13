/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ArrowDown, ArrowRight, Loader2, X } from "lucide-react";
import HelpLabel from "./HelpLabel";
import { accentOptions, iconNames } from "@/lib/icons";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import Image from "next/image";
import Link from "next/link";

type CompRow = {
  id: string;
  slug: string;
  banner: string | null;
  name: string;
  tagline: string | null;
  fee_idr: number;
  quota: number;
  is_open: boolean;
  position: number;
};

type CompFull = CompRow & {
  description: string[];
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
  panduan: string | null;
  timeline: { date: string; label: string }[];
};

const CompetitionEditor = ({
  value, onChange, onClose, onSave, saving,
}: {
  value: Partial<CompFull>;
  onChange: (v: Partial<CompFull>) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) => {
  const rulesText = (value.rules ?? []).join("\n");
  const descriptionText = (value.description ?? []).join("\n");
  const [timelineText, setTimelineText] = useState(
    (value.timeline ?? [])
      .map((t) => `${t.date}${t.label ? ` | ${t.label}` : ""}`)
      .join("\n")
  );
  const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
  const [loadingUploadFile, setLoadingUploadFile] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const suparef = useRef(createClient());

  const loadFile = async (path: string | null) => {
    try {
      if(!path) {
        setPreview(null);
        return;
      }
      
      setLoadingUploadFile(true);
      const supabase = suparef.current;
      const { data } = await supabase.storage.from("site_settings")
        .getPublicUrl(path);

      setPreview(data.publicUrl);
    } catch {
      setPreview(null);
    } finally {
      setLoadingUploadFile(false);
    }
  }

  useEffect(() => {
    (async() => {
      await loadFile(value.panduan ?? null);
    })()
  }, []);

  const parseTimeline = (text: string) => {
    return text
      .split("\n")
      .map((line) => {
        const [date = "", ...rest] = line.split("|");

        return {
          date: date.trim(),
          label: rest.join("|").trim(),
        };
      })
      .filter((item) => item.date || item.label);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, value: Partial<CompFull>) => {
    const file = e.target.files?.[0];
    setLoadingUpload(true);
    if (!file) {
      setLoadingUpload(false);
      toast.error("File tidak ditemukan");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["jpg", "jpeg", "png", "webp", "svg"];
    if (!allowed.includes(ext ?? "")) {
      setLoadingUpload(false);
      toast.error("Format file harus berupa JPG, JPEG, PNG, WEBP, atau SVG");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLoadingUpload(false);
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    try {
      const supabase = suparef.current;
      const path = `competitions/banner-${value.slug}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("site_settings")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage.from("site_settings").getPublicUrl(path);
      onChange({ ...value, banner: data.publicUrl });
      toast.success("Gambar berhasil diunggah");
    } catch (err: any) {
      toast.error("Gagal mengunggah gambar: " + err.message);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleUploadFilePdf = async (e: React.ChangeEvent<HTMLInputElement>, value: Partial<CompFull>) => {
    const file = e.target.files?.[0];
    setLoadingUploadFile(true);
    if (!file) {
      setLoadingUploadFile(false);
      toast.error("File tidak ditemukan");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["pdf"];
    if (!allowed.includes(ext ?? "")) {
      setLoadingUploadFile(false);
      toast.error("Format file harus berupa PDF");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setLoadingUploadFile(false);
      toast.error("Ukuran file maksimal 3MB");
      return;
    }

    try {
      const supabase = suparef.current;
      const path = `competitions/panduan-${value.slug}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("site_settings")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (error) throw error;

      onChange({ ...value, panduan: path });
      await loadFile(path);
      toast.success("File berhasil diunggah");
    } catch (err: any) {
      toast.error("Gagal mengunggah file: " + err.message);
    } finally {
      setLoadingUploadFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 p-4 backdrop-blur">
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(); }}
        className="glass-strong mx-auto my-6 w-full max-w-2xl space-y-4 rounded-3xl p-6"
      >
        <h3 className="font-display text-lg font-bold">{value.id ? "Edit Lomba" : "Lomba Baru"}</h3>

        <div>
          <HelpLabel label="Banner" hint="Banner lomba, file ext yang diperbolehkan: jpg, jpeg, png, webp, dan svg" />
          {value.banner &&
            <div className="flex items-center gap-2">
              <Image src={value.banner ?? ""} alt="Logo Banner" width={70} height={70} className="object-contain w-16 h-16 my-1" />
              <button type="button" onClick={() => onChange({ ...value, banner: null })} className="text-xs text-destructive hover:underline flex items-center gap-1">
                <X size={12} /> Hapus Banner
              </button>
            </div>
          }
          {loadingUpload ? <Loader2 size={14} className="animate-spin" /> : (
            <input
              type="file"
              className="inputCls inputFile"
              accept=".png,.jpg,.jpeg,.svg,.webp"
              onChange={(e) => handleUpload(e, value)}
            />
          )}
        </div>
        <div>
          <HelpLabel label="Panduan Lomba" hint="Panduan lomba, file yang diperbolehkan hanya PDF" />
          {preview &&
            <div className="flex items-center gap-2 mb-2">
              <Link target="_blank" href={preview ?? ""} className="text-cyan-strong text-sm bg-cyan-strong/10 px-2.5 py-1 rounded-lg border border-cyan-strong">Preview</Link>
              <button type="button" onClick={() => {onChange({ ...value, panduan: null }); setPreview(null)}} className="text-xs text-destructive hover:underline flex items-center gap-1">
                <X size={12} /> Hapus Panduan
              </button>
            </div>
          }

          {loadingUploadFile ? <Loader2 size={14} className="animate-spin" /> : (
            <input
              type="file"
              className="inputCls inputFile"
              accept=".pdf"
              onChange={(e) => handleUploadFilePdf(e, value)}
            />
          )}
        </div>
        <div>
          <HelpLabel label="Nama Lomba" hint="Nama yang ditampilkan ke peserta, misal 'Mobile Legends'." required />
          <input className={"inputCls"} placeholder="Mobile Legends" required value={value.name ?? ""} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </div>
        <div>
          <HelpLabel label="Slug URL" hint="Bagian alamat halaman setelah /lomba/. Huruf kecil, tanpa spasi, pakai tanda strip. Contoh: 'mobile-legends'." required />
          <input className={"inputCls"} required pattern="[a-z0-9-]+" value={value.slug ?? ""} onChange={(e) => onChange({ ...value, slug: e.target.value })} placeholder="mobile-legends" />
        </div>
        <div>
          <HelpLabel label="Tagline" hint="Subjudul singkat di kartu lomba. Contoh: '5v5 MOBA Tournament'." required />
          <input className={"inputCls"} required placeholder="5v5 MOBA Tournament" value={value.tagline ?? ""} onChange={(e) => onChange({ ...value, tagline: e.target.value })} />
        </div>
        <div>
          <HelpLabel label="Deskripsi" hint="Paragraf penjelasan lengkap di halaman detail lomba. Tekan enter untuk membuat setiap paragraf baru." required />
          <textarea rows={3} className={"inputCls"} required placeholder="Mobile Legends adalah game MOBA yang dimainkan oleh dua tim yang terdiri dari lima pemain." value={descriptionText} onChange={(e) => onChange({ ...value, description: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <HelpLabel label="Ikon" hint="Ikon yang muncul di kartu lomba." required />
            <select className={"inputCls"} value={value.icon ?? "Trophy"} onChange={(e) => onChange({ ...value, icon: e.target.value })}>
              {iconNames.map((n) => <option className="bg-background" key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <HelpLabel label="Warna Tema" hint="Warna aksen kartu (efek cahaya & badge)." required />
            <select className={"inputCls"} value={value.accent ?? "cyan"} onChange={(e) => onChange({ ...value, accent: e.target.value })}>
              {accentOptions.map((a) => <option className="bg-background" key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <HelpLabel label="Biaya (Rp)" required hint="Nominal pembayaran per tim dalam Rupiah, hanya angka. Contoh: 150000." />
            <input className={"inputCls"} type="number" min={1} value={value.fee_idr ?? 0} onChange={(e) => onChange({ ...value, fee_idr: + e.target.value })} />
          </div>
          <div>
            <HelpLabel label="Kuota Tim" required hint="Jumlah maksimum tim yang bisa terdaftar. Jika tidak ada batasan kuota, isi dengan angka 0." />
            <input className={"inputCls"} type="number" min={0} value={value.quota ?? 0} onChange={(e) => onChange({ ...value, quota: + e.target.value })} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <HelpLabel label="Juara 1" hint="Penghargaan untuk juara 1 (opsional). Contoh: Uang tunai 100000 + Sertifikat." />
            <input className={"inputCls"} placeholder="Uang tunai 100000 + Sertifikat." type="text" min={0} value={value.juara_1 ?? ""} onChange={(e) => onChange({ ...value, juara_1: e.target.value })} />
          </div>
          <div>
            <HelpLabel label="Juara 2" hint="Penghargaan untuk juara 2 (opsional). Contoh: Uang tunai 50000 + Sertifikat." />
            <input className={"inputCls"} placeholder="Uang tunai 50000 + Sertifikat." type="text" min={0} value={value.juara_2 ?? ""} onChange={(e) => onChange({ ...value, juara_2: e.target.value })} />
          </div>
          <div>
            <HelpLabel label="Juara 3" hint="Penghargaan untuk juara 3 (opsional). Contoh: Uang tunai 20000 + Sertifikat." />
            <input className={"inputCls"} placeholder="Uang tunai 20000 + Sertifikat." type="text" min={0} value={value.juara_3 ?? ""} onChange={(e) => onChange({ ...value, juara_3: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <HelpLabel label="Ukuran Tim" required hint="Deskripsi komposisi tim. Contoh: '5 pemain + 1 cadangan'." />
            <input className={"inputCls"} required placeholder="5 pemain + 1 cadangan" value={value.team_size ?? ""} onChange={(e) => onChange({ ...value, team_size: e.target.value })} />
          </div>
          <div>
            <HelpLabel label="Urutan" required hint="Urutan tampil di halaman beranda. Angka lebih kecil tampil dulu." />
            <input className={"inputCls"} type="number" value={value.position ?? 0} onChange={(e) => onChange({ ...value, position: +e.target.value })} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <HelpLabel label="Penanggung Jawab 1" required hint="Penanggung Jawab Lomba. Contoh: Bangraff." />
            <input className={"inputCls"} required placeholder="Contoh: Bangraff" value={value.pj_1 ?? ""} onChange={(e) => onChange({ ...value, pj_1: e.target.value })} />
          </div>
          <div>
            <HelpLabel label="Whatsapp Penanggung Jawab 1" required hint="Nomor Whatsapp tanpa spasi. Contoh: '0858xxxxx'." />
            <input className={"inputCls"} required placeholder="Contoh: 08533xxxxx" value={value.no_pj_1 ?? ""} onChange={(e) => onChange({ ...value, no_pj_1: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <HelpLabel label="Penanggung Jawab 2" hint="Penanggung Jawab Lomba. Contoh: Bangraff." />
            <input className={"inputCls"} placeholder="Contoh: Bangraff" value={value.pj_2 ?? ""} onChange={(e) => onChange({ ...value, pj_2: e.target.value })} />
          </div>
          <div>
            <HelpLabel label="Whatsapp Penanggung Jawab 2" hint="Nomor Whatsapp tanpa spasi. Contoh: '0858xxxxx'." />
            <input className={"inputCls"} placeholder="Contoh: 08533xxxxx" value={value.no_pj_2 ?? ""} onChange={(e) => onChange({ ...value, no_pj_2: e.target.value })} />
          </div>
        </div>

        <div>
          <HelpLabel label="Syarat & Ketentuan" required hint="Satu baris = satu poin syarat. Akan ditampilkan sebagai daftar di halaman detail." />
          <textarea rows={4} required className={"inputCls"} value={rulesText} onChange={(e) => onChange({ ...value, rules: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} placeholder={"Peserta adalah pelajar SMA/SMK aktif\nSatu tim 5 pemain + 1 cadangan"} />
        </div>

        <div>
          <HelpLabel label="Timeline (tanggal | label)" hint="Satu baris = satu tahap. Format: 'TANGGAL | KETERANGAN'. Contoh: '10 Okt 2026 | Pendaftaran dibuka'." />
          <textarea
            rows={4}
            className="inputCls"
            value={timelineText}
            onChange={(e) => {
              const text = e.target.value;
              setTimelineText(text);
              onChange({
                ...value,
                timeline: parseTimeline(text),
              });
            }}
            onKeyDown={(e) => {
              const textarea = e.currentTarget;
              const text = textarea.value;
              const cursor = textarea.selectionStart;

              const lineStart = text.lastIndexOf("\n", cursor - 1) + 1;
              const lineEndIndex = text.indexOf("\n", cursor);
              const lineEnd = lineEndIndex === -1 ? text.length : lineEndIndex;

              const currentLine = text.slice(lineStart, lineEnd);
              const cursorInLine = cursor - lineStart;

              if (
                e.key === "ArrowRight" &&
                !currentLine.includes("|") &&
                cursorInLine === currentLine.length
              ) {
                e.preventDefault();

                const newText = text.slice(0, cursor) + " | " + text.slice(cursor);

                setTimelineText(newText);

                onChange({
                  ...value,
                  timeline: parseTimeline(newText),
                });

                setTimeout(() => {
                  textarea.selectionStart = textarea.selectionEnd = cursor + 3;
                }, 0);
              }

              if (e.key === "ArrowDown") {
                e.preventDefault();

                const newText = text.slice(0, lineEnd) + "\n" + text.slice(lineEnd);

                setTimelineText(newText);

                onChange({
                  ...value,
                  timeline: parseTimeline(newText),
                });

                setTimeout(() => {
                  textarea.selectionStart = textarea.selectionEnd = lineEnd + 1;
                }, 0);
              }
            }}
            placeholder={
              "10 Oktober 2026 08:00 | Pembukaan\n08 November 2026 13:00 | Babak penyisihan"
            }
          />
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">Tip: tekan <ArrowRight size={10} /> untuk berpindah ke label & tekan <ArrowDown size={10} /> untuk menambah timeline baru.</p>
        </div>

        <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/2 p-3 text-sm">
          <input type="checkbox" className="appearance-none mt-1 shrink-0 size-3 rounded-2xl border-none bg-white/20 checked:bg-primary" checked={!!value.is_open} onChange={(e) => onChange({ ...value, is_open: e.target.checked })} />
          <span>
            <strong>Pendaftaran dibuka</strong>
            <span className="ml-2 text-xs text-muted-foreground">Jika dimatikan, peserta melihat pesan &quot;pendaftaran ditutup&quot;.</span>
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full cursor-pointer border border-white/10 px-4 py-2 text-sm">Batal</button>
          <button type="submit" disabled={saving} className="btn-hero cursor-pointer inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold">
            {saving && <Loader2 size={14} className="animate-spin" />} Simpan
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompetitionEditor;