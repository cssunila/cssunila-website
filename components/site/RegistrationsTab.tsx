/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { createClient } from "@/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Loader2,
  User,
  Phone,
  Mail,
  Trophy,
  CreditCard,
  Calendar,
  ClipboardList,
  ExternalLink,
  ZoomIn,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { useAuth } from "@/hooks/use-auth";
import ConfirmModal from "./ConfirmModal";

type RegistrationAnswer = {
  field_key: string;
  field_label: string | null;
  value: string | null;
};

type AdminReg = {
  id: string;
  team_name: string;
  leader_name: string;
  leader_whatsapp: string;
  leader_email: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  verified_at: string | null;
  competition: { name: string; slug: string; id: string } | null;
  payments: { amount_idr: number; status: string; midtrans_order_id: string | null; paid_at: string | null; midtrans_payment_type: string | null };
  registration_answers: RegistrationAnswer[];
};

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-white/5 text-muted-foreground" },
  pending_payment: { label: "Menunggu Pembayaran", tone: "bg-amber-500/15 text-amber-300" },
  pending_verification: { label: "Menunggu Verifikasi", tone: "bg-blue-500/15 text-blue-300" },
  verified: { label: "Terverifikasi", tone: "bg-emerald-500/15 text-emerald-300" },
  rejected: { label: "Ditolak", tone: "bg-red-500/15 text-red-400" },
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic"];

function isImagePath(value: string): boolean {
  const ext = value.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.includes(ext);
}

function getStoragePublicUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from("registration-files").getPublicUrl(path);
  return data.publicUrl;
}

function ImagePreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 rounded-full bg-slate-900 border border-white/10 p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-xl"
        >
          <X size={16} />
        </button>
        <div className="relative w-full max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-slate-950">
          <Image
            src={url}
            alt="Preview"
            width={1920}
            height={1080}
            className="w-full h-full object-contain max-h-[85vh]"
          />
        </div>
      </div>
    </div>
  );
}

function RejectDialog({
  teamName,
  onConfirm,
  onCancel,
  isLoading,
}: {
  teamName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-950/98 backdrop-blur-xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/15">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Tolak Pendaftaran</h3>
            <p className="text-xs text-muted-foreground">{teamName}</p>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Berikan alasan penolakan yang jelas agar peserta dapat memahami keputusan ini.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Bukti pembayaran tidak valid / tidak terbaca..."
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition"
          autoFocus
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) {
                toast.error("Alasan penolakan tidak boleh kosong");
                return;
              }
              onConfirm(reason.trim());
            }}
            disabled={isLoading || !reason.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-60 transition cursor-pointer"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Tolak Pendaftaran
          </button>
        </div>
      </div>
    </div>
  );
}

function AnswerValue({
  value,
  onImageClick,
}: {
  value: string;
  onImageClick: (url: string) => void;
}) {
  const isStoragePath = !value.startsWith("http") && value.includes("/");
  const isExternalUrl = value.startsWith("http");

  if (isStoragePath) {
    const publicUrl = getStoragePublicUrl(value);
    if (isImagePath(value)) {
      return (
        <div
          className="mt-1 cursor-pointer group relative w-36 h-24 overflow-hidden rounded-xl border border-white/10 hover:border-cyan-strong/40 transition-colors"
          onClick={() => onImageClick(publicUrl)}
        >
          <Image
            src={publicUrl}
            alt="Lampiran"
            width={144}
            height={96}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
            <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </div>
      );
    }
    return (
      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-cyan-strong hover:underline"
      >
        <ExternalLink size={12} /> Lihat File
      </a>
    );
  }

  if (isExternalUrl) {
    if (isImagePath(value)) {
      return (
        <div
          className="mt-1 cursor-pointer group relative w-36 h-24 overflow-hidden rounded-xl border border-white/10 hover:border-cyan-strong/40 transition-colors"
          onClick={() => onImageClick(value)}
        >
          <Image
            src={value}
            width={144}
            height={96}
            alt="Lampiran"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
            <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </div>
      );
    }
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-cyan-strong hover:underline"
      >
        <ExternalLink size={12} /> Buka Tautan
      </a>
    );
  }

  return <p className="text-sm text-foreground font-medium wrap-break-word">{value}</p>;
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  colorClass?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p
          className={`text-sm font-semibold wrap-break-word ${colorClass ?? "text-foreground"} ${mono ? "font-mono text-xs" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailModal({
  reg,
  onClose,
  onVerify,
  onReject,
  isPending,
}: {
  reg: AdminReg;
  onClose: () => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}) {
  const payment = reg.payments;
  const status = STATUS_LABELS[reg.status] ?? STATUS_LABELS.draft;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const paymentStatusColor =
    payment?.status === "success"
      ? "text-emerald-300"
      : payment?.status === "pending"
        ? "text-amber-400"
        : "text-muted-foreground";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl p-6 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex flex-col gap-2 mb-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>
                  {status.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(reg.created_at).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">{reg.team_name}</h2>
              <p className="mt-0.5 text-sm font-medium text-cyan-strong">{reg.competition?.name ?? "—"}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="mt-6 space-y-6">
            {/* Leader Info */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User size={12} /> Data Ketua Tim
              </h3>
              <div className="glass rounded-2xl p-4 space-y-3">
                <InfoRow icon={<User size={14} />} label="Nama Ketua" value={reg.leader_name} />
                <InfoRow icon={<Phone size={14} />} label="WhatsApp" value={reg.leader_whatsapp} />
                {reg.leader_email && (
                  <InfoRow icon={<Mail size={14} />} label="Email" value={reg.leader_email} />
                )}
              </div>
            </section>

            {/* Payment Info */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <CreditCard size={12} /> Informasi Pembayaran
              </h3>
              <div className="glass rounded-2xl p-4 space-y-3">
                <InfoRow
                  icon={<CreditCard size={14} />}
                  label="Nominal"
                  value={`Rp. ${(payment?.amount_idr ?? 0).toLocaleString("id-ID")}`}
                />
                <InfoRow
                  icon={<Wallet size={14} />}
                  label="Metode Payment"
                  value={payment?.midtrans_payment_type ?? "-"}
                />
                <InfoRow
                  icon={<Trophy size={14} />}
                  label="Status Bayar"
                  value={payment?.status ?? "—"}
                  colorClass={paymentStatusColor}
                />
                {payment?.midtrans_order_id && (
                  <InfoRow icon={<ClipboardList size={14} />} label="Order ID" value={payment.midtrans_order_id} mono />
                )}
                {payment?.paid_at && (
                  <InfoRow
                    icon={<Calendar size={14} />}
                    label="Dibayar Pada"
                    value={new Date(payment.paid_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                )}
              </div>
            </section>

            {reg.registration_answers && reg.registration_answers.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ClipboardList size={12} /> Data Pendaftaran Lomba
                </h3>
                <div className="glass rounded-2xl p-4 space-y-5">
                  {reg.registration_answers.map((ans, i) => (
                    <div key={i}>
                      <p className="text-xs text-muted-foreground mb-1">
                        {ans.field_label || ans.field_key}
                      </p>
                      {ans.value ? (
                        <AnswerValue
                          value={ans.value}
                          onImageClick={setPreviewUrl}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground italic">—</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {reg.rejection_reason && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">
                  Alasan Penolakan
                </h3>
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-sm text-red-300">{reg.rejection_reason}</p>
                </div>
              </section>
            )}

            {reg.verified_at && reg.status === "verified" && (
              <p className="text-xs text-muted-foreground">
                Diverifikasi pada {new Date(reg.verified_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {reg.status === "pending_verification" && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3 border-t border-white/10 pt-5">
              <button
                onClick={() => onVerify(reg.id)}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-60 transition cursor-pointer"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Verifikasi Pendaftaran
              </button>
              <button
                onClick={() => onReject(reg.id)}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-60 transition cursor-pointer"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Tolak Pendaftaran
              </button>
            </div>
          )}
        </div>
      </div>

      {previewUrl && (
        <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </>
  );
}

const RegistrationsTab = () => {
  const qc = useQueryClient();
  const { role, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [competitionFilter, setCompetitionFilter] = useState<string>("all");
  const [selectedReg, setSelectedReg] = useState<AdminReg | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminReg | null>(null);
  const suparef = useRef(createClient());
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "verify" | "reject";
    regId: string;
    teamName: string;
  } | null>(null);
  const [pendingRejectReg, setPendingRejectReg] = useState<AdminReg | null>(null);

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
    queryKey: ["admin-regs", role, allowedComps],
    queryFn: async (): Promise<AdminReg[]> => {
      const supabase = suparef.current;
      let query = supabase
        .from("registrations")
        .select(
          "id, team_name, leader_name, leader_whatsapp, leader_email, status, rejection_reason, created_at, verified_at, competition:competitions(id,name,slug), payments(amount_idr,status,midtrans_order_id,midtrans_payment_type,paid_at), registration_answers(field_key,field_label,value)"
        );

      if (role === "lomba") {
        if (!allowedComps || allowedComps.length === 0) {
          return [];
        }
        query = query.in("competition_id", allowedComps);
      }

      const { data: regData, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (regData ?? []) as unknown as AdminReg[];
    },
    enabled: role !== null,
  });

  const verify = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: "verified" | "rejected"; reason?: string }) => {
      const supabase = suparef.current;
      const { error } = await supabase
        .from("registrations")
        .update({
          status,
          rejection_reason: status === "rejected" ? reason ?? null : null,
          verified_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status diperbarui");
      qc.invalidateQueries({ queryKey: ["admin-regs"] });
      setSelectedReg(null);
      setRejectTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleVerify = (id: string, teamName: string) => {
    setConfirmModal({ open: true, type: "verify", regId: id, teamName });
  };

  const handleRejectRequest = (reg: AdminReg) => {
    setPendingRejectReg(reg);
    setConfirmModal({ open: true, type: "reject", regId: reg.id, teamName: reg.team_name });
  };

  const handleRejectConfirm = (id: string, reason: string) => {
    verify.mutate({ id, status: "rejected", reason });
  };

  const handleConfirmModalProceed = () => {
    if (!confirmModal) return;
    if (confirmModal.type === "verify") {
      verify.mutate({ id: confirmModal.regId, status: "verified" });
    } else if (confirmModal.type === "reject" && pendingRejectReg) {
      setRejectTarget(pendingRejectReg);
    }
    setConfirmModal(null);
    setPendingRejectReg(null);
  };

  const exportToPdf = () => {
    if (rows.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    let y = 50;

    const drawHeader = () => {
      doc.setFillColor(11, 18, 32);
      doc.rect(40, y, w - 80, 50, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("LAPORAN PENDAFTAR CSS 3.0", 50, y + 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Unduh: ${new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`, 50, y + 40);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("CSS 3.0", w - 50, y + 30, { align: "right" });

      y += 70;
    };

    drawHeader();

    const grouped: Record<string, typeof rows> = {};
    rows.forEach((r) => {
      const cName = r.competition?.name ?? "Tanpa Kategori";
      if (!grouped[cName]) grouped[cName] = [];
      grouped[cName].push(r);
    });

    Object.entries(grouped).forEach(([cName, list]) => {
      if (y > h - 180) {
        doc.addPage();
        y = 50;
        drawHeader();
      }

      doc.setFillColor(30, 41, 59);
      doc.rect(40, y, w - 80, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Cabang Lomba: ${cName.toUpperCase()}`, 50, y + 15);
      y += 34;

      doc.setFillColor(241, 245, 249);
      doc.rect(40, y, w - 80, 20, "F");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("No", 45, y + 13);
      doc.text("Nama Tim / Instansi", 75, y + 13);
      doc.text("Ketua", 225, y + 13);
      doc.text("WhatsApp", 345, y + 13);
      doc.text("Biaya & Status", 445, y + 13);
      y += 20;

      list.forEach((r, idx) => {
        if (y > h - 60) {
          doc.addPage();
          y = 50;
          drawHeader();

          doc.setFillColor(241, 245, 249);
          doc.rect(40, y, w - 80, 20, "F");
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("No", 45, y + 13);
          doc.text("Nama Tim / Instansi", 75, y + 13);
          doc.text("Ketua", 225, y + 13);
          doc.text("WhatsApp", 345, y + 13);
          doc.text("Biaya & Status", 445, y + 13);
          y += 20;
        }

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(40, y, w - 80, 20, "F");
        }

        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        doc.text(String(idx + 1), 45, y + 13);

        const teamText = doc.splitTextToSize(r.team_name, 140);
        doc.text(teamText, 75, y + 13);

        const leaderText = doc.splitTextToSize(r.leader_name, 110);
        doc.text(leaderText, 225, y + 13);

        doc.text(r.leader_whatsapp, 345, y + 13);

        const amount = r.payments?.amount_idr ?? 0;
        const pStatus = r.payments?.status || "—";
        const feeText = `Rp ${amount.toLocaleString("id-ID")} (${pStatus})`;
        doc.text(feeText, 445, y + 13);

        const linesCount = Math.max(teamText.length, leaderText.length);
        y += Math.max(20, linesCount * 10 + 5);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(40, y, w - 40, y);
      });

      y += 20;
    });

    doc.save(`Laporan_Pendaftar_CSS3.0_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Laporan PDF berhasil diunduh");
  };

  const competitions = Array.from(
    new Map(
      (data ?? [])
        .filter((r) => r.competition)
        .map((r) => [r.competition!.id, r.competition!])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const rows = (data ?? []).filter((r) => {
    const statusOk = statusFilter === "all" || r.status === statusFilter;
    const compOk = competitionFilter === "all" || r.competition?.id === competitionFilter;
    return statusOk && compOk;
  });

  const statusFilters = [
    { title: "Semua Status", filter: "all" },
    { title: "Pending Payment", filter: "pending_payment" },
    { title: "Pending Verifikasi", filter: "pending_verification" },
    { title: "Terverifikasi", filter: "verified" },
    { title: "Ditolak", filter: "rejected" },
  ];

  return (
    <div>
      <div className="mb-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Filter Cabang Lomba
        </p>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setCompetitionFilter("all")}
            className={`rounded-full border px-3.5 py-1.5 cursor-pointer transition-colors ${competitionFilter === "all"
                ? "border-cyan-strong/60 bg-cyan-strong/15 text-cyan-strong font-semibold"
                : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
          >
            Semua Lomba
          </button>
          {competitions.map((c) => (
            <button
              key={c.id}
              onClick={() => setCompetitionFilter(c.id)}
              className={`rounded-full border px-3.5 py-1.5 cursor-pointer transition-colors ${competitionFilter === c.id
                  ? "border-cyan-strong/60 bg-cyan-strong/15 text-cyan-strong font-semibold"
                  : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Filter Status
        </p>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {statusFilters.map((f) => (
            <button
              key={f.filter}
              onClick={() => setStatusFilter(f.filter)}
              className={`rounded-full border px-3.5 py-1.5 cursor-pointer transition-colors ${statusFilter === f.filter
                  ? "border-white/30 bg-white/10 text-foreground font-semibold"
                  : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                }`}
            >
              {f.title}
            </button>
          ))}
        </div>
      </div>

      {!isLoading && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="text-foreground font-semibold">{rows.length}</span> dari{" "}
            <span className="text-foreground font-semibold">{data?.length ?? 0}</span> pendaftaran
          </p>
          <button
            onClick={exportToPdf}
            className="inline-flex items-center gap-1.5 rounded-full bg-cyan-strong/20 px-4 py-2 text-xs font-semibold text-cyan-strong hover:bg-cyan-strong/30 transition cursor-pointer"
          >
            <ExternalLink size={12} /> Export Laporan (PDF)
          </button>
        </div>
      )}

      {isLoading && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Memuat data…
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => {
          const status = STATUS_LABELS[r.status] ?? STATUS_LABELS.draft;
          const payment = r.payments;

          return (
            <div
              key={r.id}
              className="glass rounded-2xl p-5 hover:border-white/20 border border-white/5 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="shrink-0 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <h4 className="mt-0.5 font-display text-base font-bold text-foreground truncate">
                    {r.team_name}
                  </h4>
                  <p className="text-sm font-medium text-cyan-strong">{r.competition?.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ketua: {r.leader_name} · {r.leader_whatsapp}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bayar: Rp {(payment?.amount_idr ?? 0).toLocaleString("id-ID")} ·{" "}
                    <span className={payment?.status === "success" ? "text-emerald-400" : "text-amber-400"}>
                      {payment?.status ?? "—"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>
                    {status.label}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedReg(r)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-white/10 transition cursor-pointer"
                    >
                      <Eye size={12} /> Detail
                    </button>

                    {r.status === "pending_verification" && (
                      <>
                        <button
                          onClick={() => handleVerify(r.id, r.team_name)}
                          disabled={verify.isPending}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-60 cursor-pointer transition"
                        >
                          <CheckCircle2 size={12} /> Verifikasi
                        </button>
                        <button
                          onClick={() => handleRejectRequest(r)}
                          disabled={verify.isPending}
                          className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-60 cursor-pointer transition"
                        >
                          <XCircle size={12} /> Tolak
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!isLoading && rows.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            Tidak ada data pendaftaran yang sesuai filter.
          </div>
        )}
      </div>

      {selectedReg && (
        <DetailModal
          reg={selectedReg}
          onClose={() => setSelectedReg(null)}
          onVerify={(id) => {
            const reg = data?.find((r) => r.id === id);
            handleVerify(id, reg?.team_name ?? "");
          }}
          onReject={(id) => {
            const reg = data?.find((r) => r.id === id);
            if (reg) handleRejectRequest(reg);
          }}
          isPending={verify.isPending}
        />
      )}

      {rejectTarget && (
        <RejectDialog
          teamName={rejectTarget.team_name}
          onConfirm={(reason) => handleRejectConfirm(rejectTarget.id, reason)}
          onCancel={() => setRejectTarget(null)}
          isLoading={verify.isPending}
        />
      )}

      <ConfirmModal
        open={!!confirmModal?.open}
        variant="warning"
        title={confirmModal?.type === "verify" ? "Konfirmasi Verifikasi" : "Konfirmasi Penolakan"}
        message={
          confirmModal?.type === "verify"
            ? `Anda akan memverifikasi pendaftaran tim "${confirmModal.teamName}". Tindakan ini bersifat permanen dan tidak dapat diubah lagi. Lanjutkan?`
            : `Anda akan menolak pendaftaran tim "${confirmModal?.teamName}". Tindakan ini bersifat permanen dan tidak dapat diubah lagi. Lanjutkan?`
        }
        confirmLabel={confirmModal?.type === "verify" ? "Ya, Verifikasi" : "Ya, Tolak"}
        cancelLabel="Batal"
        onConfirm={handleConfirmModalProceed}
        onCancel={() => { setConfirmModal(null); setPendingRejectReg(null); }}
      />
    </div>
  );
};

export default RegistrationsTab;