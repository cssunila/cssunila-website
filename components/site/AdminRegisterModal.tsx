/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { createClient } from "@/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Image from "next/image";
import {
  X,
  Loader2,
  ChevronLeft,
  UserPlus,
  QrCode,
  MessageCircle,
  CheckCircle2,
  Upload,
  AlertTriangle,
  Trophy,
} from "lucide-react";

type FieldRow = {
  id: string;
  key: string;
  label: string;
  field_type: "text" | "textarea" | "number" | "email" | "tel" | "url" | "select" | "file";
  placeholder: string | null;
  required: boolean;
  options: string[] | null;
  position: number;
};

type CompetitionOption = {
  id: string;
  name: string;
  slug: string;
  fee_idr: number;
  is_open: boolean;
  is_multi_slot: boolean;
  slot: number;
  quota: number;
  competition_fields: FieldRow[];
};

const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  );
}

export type ResumePayData = {
  regId: string;
  compId: string;
  paymentId: string;
  amount: number;
  teamName: string;
  leaderName: string;
  leaderWa: string;
  leaderEmail: string;
  compName: string;
  slot: number;
};

interface AdminRegisterModalProps {
  onClose: () => void;
  resumePay?: ResumePayData | null;
}

export default function AdminRegisterModal({ onClose, resumePay }: AdminRegisterModalProps) {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const suparef = useRef(createClient());

  const [step, setStep] = useState<1 | 2 | 3>(resumePay ? 3 : 1);
  const [selectedCompId, setSelectedCompId] = useState<string>(resumePay?.compId ?? "");

  const [teamName, setTeamName] = useState(resumePay?.teamName ?? "");
  const [leaderName, setLeaderName] = useState(resumePay?.leaderName ?? "");
  const [leaderWa, setLeaderWa] = useState(resumePay?.leaderWa ?? "");
  const [leaderEmail, setLeaderEmail] = useState(resumePay?.leaderEmail ?? "");
  const [slotCount, setSlotCount] = useState(resumePay?.slot ?? 1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const [createdRegId, setCreatedRegId] = useState<string>(resumePay?.regId ?? "");
  const [createdPaymentId, setCreatedPaymentId] = useState<string>(resumePay?.paymentId ?? "");
  const [createdAmount, setCreatedAmount] = useState(resumePay?.amount ?? 0);
  const [showConfirmPay, setShowConfirmPay] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const { data: allowedCompIds } = useQuery({
    queryKey: ["admin-allowed-comps-modal", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const supabase = suparef.current;
      const { data } = await supabase
        .from("user_competitions")
        .select("competition_id")
        .eq("user_id", user.id);
      return (data ?? []).map((c) => c.competition_id as string);
    },
    enabled: !!user,
  });

  const { data: competitions = [], isLoading: compsLoading } = useQuery({
    queryKey: ["admin-comps-modal"],
    queryFn: async (): Promise<CompetitionOption[]> => {
      const supabase = suparef.current;
      const { data, error } = await supabase
        .from("competitions")
        .select(
          "id, name, slug, fee_idr, is_open, is_multi_slot, slot, quota, competition_fields(id,key,label,field_type,placeholder,required,options,position)"
        )
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((c) => ({
        ...c,
        competition_fields: ([...(c.competition_fields ?? [])] as FieldRow[]).sort(
          (a, b) => a.position - b.position
        ),
      }));
    },
  });

  const visibleComps = competitions.filter((c) => {
    if (role === "admin") return true;
    return allowedCompIds?.includes(c.id);
  });

  const selectedComp = competitions.find((c) => c.id === selectedCompId) ?? null;

  const { data: { qrisBankUrl, rekeningBank } = { qrisBankUrl: "", rekeningBank: "" } } = useQuery({
    queryKey: ["site-qris-url"],
    queryFn: async (): Promise<{ qrisBankUrl: string, rekeningBank: string }> => {
      const supabase = suparef.current;
      const { data } = await supabase
        .from("site_settings")
        .select("id, value")
        .in("id", ["qris_bank_url", "rekening_bank"]);

      const qrisBankUrl = data?.find((s) => s.id === "qris_bank_url");
      const rekeningBank = data?.find((s) => s.id === "rekening_bank");

      return {
        qrisBankUrl: qrisBankUrl?.value ?? "",
        rekeningBank: rekeningBank?.value ?? "",
      };
    },
  });

  const uploadFieldFile = async (fieldKey: string, file: File) => {
    if (!user || !selectedComp) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimum 2 MB");
      return;
    }

    const extAccept = ["jpg", "jpeg", "png", "webp", "pdf"];
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    if (!extAccept.includes(ext)) {
      toast.error("Ekstensi file tidak didukung (jpg/png/webp/pdf)");
      return;
    }

    setUploading((u) => ({ ...u, [fieldKey]: true }));
    try {
      const path = `${selectedComp.slug}/${user.id}/${fieldKey}-${crypto.randomUUID()}.${ext}`;
      const supabase = suparef.current;
      const { error } = await supabase.storage
        .from("registration-files")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;

      setAnswers((a) => ({ ...a, [fieldKey]: path }));
      toast.success(`File "${file.name}" terunggah`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading((u) => ({ ...u, [fieldKey]: false }));
    }
  }

  const submitReg = useMutation({
    mutationFn: async () => {
      if (!selectedComp || !user) throw new Error("Data belum siap");
      if (!teamName.trim() || !leaderName.trim() || !leaderWa.trim() || !leaderEmail.trim())
        throw new Error("Lengkapi nama tim, pendaftar, WhatsApp, dan email");

      const supabase = suparef.current;
      const { data: register } = await supabase
        .from("registrations")
        .select("id")
        .eq("competition_id", selectedComp.id)
        .in("status", ["verified", "pending_verification"]);

      if (register && selectedComp.quota > 0) {
        if (register.length >= selectedComp.quota) {
          throw new Error("Pendaftaran sudah penuh!");
        }
      }

      for (const f of selectedComp.competition_fields) {
        if (f.required && !answers[f.key]?.trim())
          throw new Error(`Field "${f.label}" wajib diisi`);
      }

      const { data: reg, error: e1 } = await supabase
        .from("registrations")
        .insert({
          competition_id: selectedComp.id,
          user_id: user.id,
          team_name: teamName.trim(),
          leader_name: leaderName.trim(),
          leader_whatsapp: leaderWa.trim(),
          leader_email: leaderEmail.trim(),
          slot: slotCount,
          status: "pending_payment",
          is_manual: true,
        })
        .select("id")
        .single();
      if (e1) throw e1;

      const answerRows = selectedComp.competition_fields.map((f) => ({
        registration_id: reg.id,
        field_id: f.id,
        field_key: f.key,
        field_label: f.label,
        value: answers[f.key]?.trim() ?? null,
      }));
      if (answerRows.length) {
        const { error: e2 } = await supabase.from("registration_answers").insert(answerRows);
        if (e2) throw e2;
      }

      const amount = selectedComp.fee_idr * slotCount;
      const { data: pay, error: e3 } = await supabase
        .from("payments")
        .insert({
          registration_id: reg.id,
          user_id: user.id,
          amount_idr: amount,
          status: "pending",
          midtrans_payment_type: "manual_admin",
        })
        .select("id")
        .single();
      if (e3) throw e3;

      return { regId: reg.id, paymentId: pay.id, amount };
    },
    onSuccess: ({ regId, paymentId, amount }) => {
      setCreatedRegId(regId);
      setCreatedPaymentId(paymentId);
      setCreatedAmount(amount);
      setStep(3);
      qc.invalidateQueries({ queryKey: ["admin-regs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const confirmPayment = useMutation({
    mutationFn: async () => {
      if (!proofFile) throw new Error("Pilih foto bukti pembayaran terlebih dahulu");
      if (!user) throw new Error("Sesi tidak valid");

      setUploadingProof(true);
      if (proofFile.size > 2 * 1024 * 1024) {
        throw new Error("Ukuran file maksimum 2 MB");
      }

      const supabase = suparef.current;
      const ext = proofFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const proofPath = `bukti-bayar/${user.id}/${createdRegId}-${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("registration-files")
        .upload(proofPath, proofFile, { upsert: false, contentType: proofFile.type });
      if (upErr) throw upErr;

      const { error: payErr } = await supabase
        .from("payments")
        .update({
          status: "success",
          paid_at: new Date().toISOString(),
          payment_proof: proofPath,
          midtrans_payment_type: "manual_admin",
        })
        .eq("id", createdPaymentId);
      if (payErr) throw payErr;

      const { error: regErr } = await supabase
        .from("registrations")
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq("id", createdRegId);
      if (regErr) throw regErr;

      if (createdRegId) {
        fetch("/api/email/send-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationId: createdRegId }),
        }).catch((err) => console.error("[Admin Register] Error sending email:", err));
      }
    },
    onSuccess: () => {
      toast.success("Pendaftaran berhasil diverifikasi!");
      qc.invalidateQueries({ queryKey: ["admin-regs"] });
      setUploadingProof(false);
      onClose();
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setUploadingProof(false);
    },
  });

  function sendWhatsApp() {
    const compName = selectedComp?.name ?? resumePay?.compName ?? "Lomba";
    const waNumber = leaderWa.replace(/[^0-9]/g, "").replace(/^0/, "62");
    let msg = encodeURIComponent(
      `Halo ${leaderName},\n\nBerikut adalah pembayaran untuk pendaftaran *${compName}* — *${teamName}*.\n\nNominal:\n*Rp. ${createdAmount.toLocaleString("id-ID")}* ${slotCount > 1 ? `- ${slotCount} Slot` : ''}\n\n`
    );

    if (qrisBankUrl) {
      msg += encodeURIComponent(
        `Silakan scan QRIS berikut:\n${qrisBankUrl}\n`
      );
    }
    if (rekeningBank) {
      msg += encodeURIComponent(
        `Rekening tujuan:\n*${rekeningBank}*\n\n`
      );
    }

    msg += encodeURIComponent(
      `*Pastikan membayar sesuai nominal yang tertera.*\n\nSetelah membayar, konfirmasi ke panitia lomba CSS 3.0 dan sertakan bukti pembayarannya.\n\nTerima kasih`
    );

    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
  }


  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/98 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-strong/15">
              <UserPlus size={16} className="text-cyan-strong" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Daftarkan Peserta</h2>
              <p className="text-[11px] text-muted-foreground">
                Langkah {step} dari 3 —{" "}
                {step === 1 ? "Pilih Lomba" : step === 2 ? "Data Peserta" : "Konfirmasi Bayar"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-0 px-6 pt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-1 items-center">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${s <= step
                  ? "bg-cyan-strong text-slate-950"
                  : "bg-white/10 text-muted-foreground"
                  }`}
              >
                {s < step ? <CheckCircle2 size={14} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${s < step ? "bg-cyan-strong" : "bg-white/10"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pilih cabang lomba untuk peserta yang akan didaftarkan secara manual.
              </p>

              {compsLoading && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" /> Memuat lomba…
                </div>
              )}

              <div className="grid gap-2.5">
                {visibleComps.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCompId(c.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all cursor-pointer ${selectedCompId === c.id
                      ? "border-cyan-strong/60 bg-cyan-strong/10"
                      : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Rp. {c.fee_idr.toLocaleString("id-ID")} ·{" "}
                          <span className={c.is_open ? "text-emerald-400" : "text-amber-400"}>
                            {c.is_open ? "Buka" : "Tutup"}
                          </span>
                        </p>
                      </div>
                      {selectedCompId === c.id && (
                        <CheckCircle2 size={18} className="text-cyan-strong shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
                {!compsLoading && visibleComps.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Tidak ada lomba yang tersedia.
                  </p>
                )}
              </div>

              <button
                disabled={!selectedCompId}
                onClick={() => setStep(2)}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-cyan-strong px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-strong/90 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Lanjut
              </button>
            </div>
          )}

          {step === 2 && selectedComp && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitReg.mutate();
              }}
              className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl bg-cyan-strong/10 border border-cyan-strong/20 p-3">
                <Trophy size={16} className="text-cyan-strong shrink-0" />
                <p className="text-sm font-semibold text-cyan-strong">{selectedComp.name}</p>
                <span className="ml-auto text-xs text-muted-foreground font-medium">
                  Rp. {(selectedComp.fee_idr * slotCount).toLocaleString("id-ID")}
                </span>
              </div>

              <div>
                <FieldLabel label="Nama Tim" required />
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Radar"
                  maxLength={100}
                  className="inputCls w-full"
                />
              </div>
              <div>
                <FieldLabel label="Nama Lengkap (Peserta Perwakilan)" required />
                <input
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Nama lengkap"
                  maxLength={100}
                  className="inputCls w-full"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel label="WhatsApp (Peserta Perwakilan)" required />
                  <input
                    value={leaderWa}
                    onChange={(e) => setLeaderWa(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    maxLength={20}
                    className="inputCls w-full"
                  />
                </div>
                <div>
                  <FieldLabel label="Email (Peserta Perwakilan)" required />
                  <input
                    type="email"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    className="inputCls w-full"
                  />
                </div>
              </div>

              {selectedComp.is_multi_slot && (
                <div>
                  <FieldLabel label="Jumlah Slot" />
                  <select
                    value={slotCount}
                    onChange={(e) => setSlotCount(Number(e.target.value))}
                    className="inputCls w-full"
                  >
                    {Array.from({ length: selectedComp.slot }).map((_, i) => (
                      <option className="bg-background" key={i + 1} value={i + 1}>
                        {i + 1} Slot
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="my-4 h-px bg-white/10" />

              {selectedComp.competition_fields.map((f) => (
                <div key={f.id}>
                  <FieldLabel label={f.label} required={f.required} />
                  {f.field_type === "textarea" ? (
                    <textarea
                      value={answers[f.key] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                      placeholder={f.placeholder ?? ""}
                      rows={4}
                      maxLength={2000}
                      required={f.required}
                      className="inputCls w-full resize-none"
                    />
                  ) : f.field_type === "select" ? (
                    <select
                      value={answers[f.key] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                      required={f.required}
                      className="inputCls w-full"
                    >
                      <option value="">— Pilih —</option>
                      {(f.options ?? []).map((opt: string) => (
                        <option className="bg-background" key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.field_type === "file" ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition">
                          {uploading[f.key] ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Upload size={13} />
                          )}
                          {answers[f.key] ? "Ganti File" : "Pilih File (Max 2 MB)"}
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            className="hidden"
                            required={f.required}
                            disabled={uploading[f.key]}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadFieldFile(f.key, file);
                            }}
                          />
                        </label>
                        {answers[f.key] && (
                          <span className="text-xs text-emerald-400 font-medium">✓ Terunggah {answers[f.key]}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Tip: File yang diterima &quot;.jpg&quot;, &quot;.jpeg&quot;, &quot;.png&quot;, &quot;.webp&quot;, &quot;.pdf&quot;. Max 2mb</p>
                    </div>
                  ) : (
                    <input
                      type={f.field_type}
                      value={answers[f.key] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                      placeholder={f.placeholder ?? ""}
                      required={f.required}
                      maxLength={500}
                      className="inputCls w-full"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
                >
                  <ChevronLeft size={14} /> Kembali
                </button>
                <button
                  type="submit"
                  disabled={submitReg.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-strong px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-strong/90 disabled:opacity-60 transition cursor-pointer"
                >
                  {submitReg.isPending && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {submitReg.isPending ? "Mendaftarkan…" : "Daftarkan"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                Peserta berhasil didaftarkan! Sekarang lanjutkan konfirmasi pembayaran.
              </div>
              <fieldset className="bg-background/10 border border-white/15 rounded-2xl p-4 space-y-2">
                <legend className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Detail Pendaftaran</legend>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Nama Tim</label>
                  <input
                    readOnly
                    className="inputCls"
                    value={teamName}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Nama Pendaftar</label>
                  <input
                    readOnly
                    className="inputCls"
                    value={leaderName}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">No. WhatsApp Pendaftar</label>
                  <input
                    readOnly
                    className="inputCls"
                    value={leaderWa}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email Pendaftar</label>
                  <input
                    readOnly
                    className="inputCls"
                    value={leaderEmail}
                  />
                </div>
              </fieldset>

              {/* QRIS */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <QrCode size={12} /> QRIS Pembayaran
                </p>
                {qrisBankUrl ? (
                  <div className="mx-auto w-fit rounded-2xl border border-white/10 bg-white p-3 shadow-lg">
                    <Image
                      src={qrisBankUrl}
                      alt="QRIS Bank"
                      width={220}
                      height={220}
                      className="rounded-xl object-contain"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300 flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    QRIS bank belum diupload.
                  </div>
                )}

                {selectedComp && (
                  <div className="mt-3 flex flex-col items-center justify-center gap-2">
                    {rekeningBank && <p className="text-sm text-muted-foreground font-semibold tracking-wider">{rekeningBank}</p>}
                    <h2 className="text-lg font-semibold text-center">{selectedComp.name}</h2>
                    <div className="flex items-center justify-center gap-3">
                      <p className="px-2.5 py-1.5 bg-cyan-strong/10 text-cyan-strong border border-cyan-strong/30 text-sm rounded-lg">
                        Rp. {createdAmount.toLocaleString("id-ID")}
                      </p>
                      {slotCount > 1 &&
                        <p className="px-2.5 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-sm rounded-lg">
                          {slotCount} slot
                        </p>
                      }
                    </div>
                  </div>
                )}
              </div>

              {(qrisBankUrl || rekeningBank) && leaderWa && (
                <button
                  onClick={sendWhatsApp}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer border border-emerald-500/20"
                >
                  <MessageCircle size={15} />
                  Kirim QRIS via WhatsApp ke {leaderName}
                </button>
              )}

              {!showConfirmPay && (
                <button
                  onClick={() => setShowConfirmPay(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-cyan-strong/20 px-5 py-3 text-sm font-semibold text-cyan-strong hover:bg-cyan-strong/30 transition cursor-pointer border border-cyan-strong/20"
                >
                  <CheckCircle2 size={15} />
                  Sudah Dibayar — Verifikasi Sekarang
                </button>
              )}

              {showConfirmPay && (
                <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <AlertTriangle size={15} className="shrink-0" />
                    <p className="text-sm font-semibold">Pastikan peserta sudah membayar!</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload foto bukti pembayaran, lalu klik konfirmasi. Tindakan ini akan langsung
                    mengubah status menjadi <strong>Terverifikasi</strong>.
                  </p>

                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-white/10 transition">
                      <Upload size={13} />
                      {proofFile ? proofFile.name : "Upload Bukti Bayar"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setProofFile(f);
                        }}
                      />
                    </label>
                    {proofFile && (
                      <p className="mt-1 text-xs text-emerald-400">✓ {proofFile.name}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmPay(false)}
                      className="flex-1 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-white/5 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      disabled={confirmPayment.isPending || uploadingProof || !proofFile}
                      onClick={() => confirmPayment.mutate()}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/25 px-4 py-2.5 text-sm font-bold text-emerald-300 hover:bg-emerald-500/35 disabled:opacity-60 transition cursor-pointer border border-emerald-500/20"
                    >
                      {confirmPayment.isPending || uploadingProof ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Konfirmasi Terverifikasi
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition cursor-pointer py-1"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
