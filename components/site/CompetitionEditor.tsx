"use client"

import { Loader2 } from "lucide-react";
import HelpLabel from "./HelpLabel";
import { accentOptions, iconNames } from "@/lib/icons";

type CompRow = {
  id: string;
  slug: string;
  name: string;
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
  prize: string | null;
  rules: string[];
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
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 p-4 backdrop-blur">
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(); }}
        className="glass-strong mx-auto my-6 w-full max-w-2xl space-y-4 rounded-3xl p-6"
      >
        <h3 className="font-display text-lg font-bold">{value.id ? "Edit Lomba" : "Lomba Baru"}</h3>

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
          <input className={"inputCls"} placeholder="5v5 MOBA Tournament" value={value.tagline ?? ""} onChange={(e) => onChange({ ...value, tagline: e.target.value })} />
        </div>
        <div>
          <HelpLabel label="Deskripsi" hint="Paragraf penjelasan lengkap di halaman detail lomba." required />
          <textarea rows={3} className={"inputCls"} placeholder="Mobile Legends adalah game MOBA yang dimainkan oleh dua tim yang terdiri dari lima pemain." value={value.description ?? ""} onChange={(e) => onChange({ ...value, description: e.target.value })} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <HelpLabel label="Ikon" hint="Ikon yang muncul di kartu lomba." required />
            <select className={"inputCls"} value={value.icon ?? "Trophy"} onChange={(e) => onChange({ ...value, icon: e.target.value })}>
              {iconNames.map((n) => <option className="bg-background" key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <HelpLabel label="Warna Tema" hint="Warna aksen kartu (efek cahaya & badge)." required/>
            <select className={"inputCls"} value={value.accent ?? "cyan"} onChange={(e) => onChange({ ...value, accent: e.target.value })}>
              {accentOptions.map((a) => <option className="bg-background" key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <HelpLabel label="Biaya (Rp)" required hint="Nominal pembayaran per tim dalam Rupiah, hanya angka. Contoh: 150000." />
            <input className={"inputCls"} type="number" min={0} value={value.fee_idr ?? 0} onChange={(e) => onChange({ ...value, fee_idr: +e.target.value })} />
          </div>
          <div>
            <HelpLabel label="Kuota Tim" required hint="Jumlah maksimum tim yang bisa terdaftar." />
            <input className={"inputCls"} type="number" min={0} value={value.quota ?? 0} onChange={(e) => onChange({ ...value, quota: +e.target.value })} />
          </div>
          <div>
            <HelpLabel label="Urutan" required hint="Urutan tampil di halaman beranda. Angka lebih kecil tampil dulu." />
            <input className={"inputCls"} type="number" value={value.position ?? 0} onChange={(e) => onChange({ ...value, position: +e.target.value })} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <HelpLabel label="Ukuran Tim" required hint="Deskripsi komposisi tim. Contoh: '5 pemain + 1 cadangan'." />
            <input className={"inputCls"} placeholder="5 pemain + 1 cadangan" value={value.team_size ?? ""} onChange={(e) => onChange({ ...value, team_size: e.target.value })} />
          </div>
          <div>
            <HelpLabel label="Hadiah" required hint="Total/ringkasan hadiah. Contoh: 'Rp 8.000.000 + Trophy'." />
            <input className={"inputCls"} placeholder="Rp 8.000.000 + Trophy" value={value.prize ?? ""} onChange={(e) => onChange({ ...value, prize: e.target.value })} />
          </div>
        </div>

        <div>
          <HelpLabel label="Syarat & Ketentuan" required hint="Satu baris = satu poin syarat. Akan ditampilkan sebagai daftar di halaman detail." />
          <textarea rows={4} className={"inputCls"} value={rulesText} onChange={(e) => onChange({ ...value, rules: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} placeholder={"Peserta adalah pelajar SMA/SMK aktif\nSatu tim 5 pemain + 1 cadangan"} />
        </div>

        <div>
          <HelpLabel label="Timeline (tanggal | label)" required hint="Satu baris = satu tahap. Format: 'TANGGAL | KETERANGAN'. Contoh: '10 Okt 2026 | Pendaftaran dibuka'." />
          <textarea
            rows={4}
            className={"inputCls"}
            value={(value.timeline ?? []).map((t) => `${t.date} | ${t.label}`).join("\n")}
            onChange={(e) => {
              const lines = e.target.value.split("\n").map((l) => l.split("|").map((s) => s.trim())).filter((p) => p[0]);
              onChange({ ...value, timeline: lines.map((p) => ({ date: p[0] ?? "", label: p[1] ?? "" })) });
            }}
            placeholder={"10 Okt 2026 | Pendaftaran dibuka\n08 Nov 2026 | Babak penyisihan"}
          />
        </div>

        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/2 p-3 text-sm">
          <input type="checkbox" className="appearance-none shrink-0 size-3 rounded-2xl border-none bg-white/20 checked:bg-primary" checked={!!value.is_open} onChange={(e) => onChange({ ...value, is_open: e.target.checked })} />
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