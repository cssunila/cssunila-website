"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Inbox,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  Download,
  Loader2,
  X,
  QrCode,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { createClient } from "@/supabase/client";
import downloadTicket from "@/lib/download-ticket";
import GroupLinkPanel from "@/components/site/GroupLinkPanel";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

type Row = {
  id: string;
  team_name: string;
  leader_name: string;
  leader_whatsapp: string;
  slot: number;
  status: string;
  rejection_reason: string;
  created_at: string;
  competition: { id: string; slug: string; name: string; kategori_peserta: "tim" |  "individu" } | null;
  payments:
  | {
    id: string;
    amount_idr: number;
    status: string;
    midtrans_token: string | null;
    midtrans_order_id: string | null;
  }
  | {
    id: string;
    amount_idr: number;
    status: string;
    midtrans_token: string | null;
    midtrans_order_id: string | null;
  }[]
  | null;
};

type SnapResult = {
  token: string;
  redirect_url: string;
  client_key: string;
  is_production: boolean;
};

const statusMeta: Record<
  string,
  { label: string; tone: string; icon: typeof Clock }
> = {
  draft: {
    label: "Draft",
    tone: "bg-white/5 text-muted-foreground",
    icon: Clock,
  },
  pending_payment: {
    label: "Menunggu Pembayaran",
    tone: "bg-amber-500/15 text-amber-300",
    icon: Wallet,
  },
  pending_verification: {
    label: "Menunggu Verifikasi",
    tone: "bg-sapphire/15 text-sapphire",
    icon: Clock,
  },
  verified: {
    label: "Terverifikasi",
    tone: "bg-emerald-500/15 text-emerald-300",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Ditolak",
    tone: "bg-destructive/15 text-destructive",
    icon: XCircle,
  },
};

const HistoryPage = () => {
  const { role, loading, user } = useAuth();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<{ registrationId: string; midtransToken: string } | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const suparef = useRef(createClient());
  const qc = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role === "admin") {
      router.replace("/admin");
    }
  }, [role, loading, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("midtrans-snap")) return;

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION;
    const isProd = (isProduction ?? "false").toLowerCase() === "true";

    const s = document.createElement("script");
    s.id = "midtrans-snap";
    s.src = isProd
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    const clientKeySand = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SAND;
    const clientKeyProd = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PROD;
    const clientKey = isProd ? clientKeyProd : clientKeySand;
    if (clientKey) {
      s.setAttribute("data-client-key", clientKey);
    }

    document.head.appendChild(s);
  }, []);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["user-registrations", user?.id],
    queryFn: async (): Promise<Row[]> => {
      if (!user) return [];

      const supabase = suparef.current;
      const { data, error } = await supabase
        .from("registrations")
        .select(
          "id, team_name, leader_name, leader_whatsapp, status, rejection_reason, created_at, slot, competition:competitions(id, slug, name, kategori_peserta), payments(id, amount_idr, status, midtrans_token, midtrans_order_id)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
    enabled: !!user
  });

  const { data: { qrisBankUrl, rekeningBank, metodePay } = { qrisBankUrl: "", rekeningBank: "", metodePay: "midtrans" } } = useQuery({
    queryKey: ["site-qris-url"],
    queryFn: async (): Promise<{ qrisBankUrl: string, rekeningBank: string, metodePay: "midtrans" | "manual" }> => {
      const supabase = suparef.current;
      const { data } = await supabase
        .from("site_settings")
        .select("id, value")
        .in("id", ["qris_bank_url", "rekening_bank", "site_metode_payment"]);

      const qrisBankUrl = data?.find((s) => s.id === "qris_bank_url");
      const rekeningBank = data?.find((s) => s.id === "rekening_bank");
      const metodePay = data?.find((s) => s.id === "site_metode_payment")

      return {
        qrisBankUrl: qrisBankUrl?.value ?? "",
        rekeningBank: rekeningBank?.value ?? "",
        metodePay: metodePay?.value ?? "",
      };
    },
  });

  const pay = useMutation({
    mutationFn: async ({
      registrationId,
      forceNew,
    }: {
      registrationId: string;
      forceNew?: boolean;
    }) => {
      if (metodePay === "manual") throw new Error("Metode pembayaran tidak aktif");

      setPayingId(registrationId);
      const response = await fetch("/api/midtrans/snap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationId, forceNew }),
      });

      const res = (await response.json()) as SnapResult & {
        message?: string;
      };

      if (!response.ok) throw new Error(res.message ?? "Gagal membuat transaksi Midtrans");

      const w = window as unknown as {
        snap?: {
          pay: (
            token: string,
            opts: Record<string, (r?: unknown) => void>
          ) => void;
        };
        Snap?: {
          pay: (
            token: string,
            opts: Record<string, (r?: unknown) => void>
          ) => void;
        };
      };

      for (let i = 0; i < 30 && !w.snap && !w.Snap; i++) {
        await new Promise((r) => setTimeout(r, 200));
      }

      const snap = w.snap ?? w.Snap;

      if (!snap) {
        if (res.redirect_url) window.open(res.redirect_url, "_blank");
        return;
      }

      await new Promise<void>((resolve) => {
        snap.pay(res.token, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil, menunggu verifikasi");
            resolve();
          },
          onPending: () => {
            toast.info("Pembayaran tertunda");
            resolve();
          },
          onError: () => {
            toast.error("Pembayaran gagal");
            resolve();
          },
          onClose: () => resolve(),
        });
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["user-registrations", user?.id] });
      setPayingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const payManual = useMutation({
    mutationFn: async (
      { registrationId, paymentId }: { registrationId: string; paymentId: string }
    ) => {
      if (metodePay === "midtrans") throw new Error("Metode pembayaran tidak aktif");
      if (!proofFile) throw new Error("Pilih foto bukti pembayaran terlebih dahulu");
      if (!user) throw new Error("Sesi tidak valid");

      setUploadingProof(true);
      if (proofFile.size > 2 * 1024 * 1024) {
        throw new Error("Ukuran file maksimum 2 MB");
      }

      const validExts = ["jpg", "jpeg", "png"];
      const fileExt = proofFile.name.split(".").pop()?.toLowerCase() ?? "";
      if (!validExts.includes(fileExt)) {
        throw new Error("Ekstensi file harus .jpg, .jpeg, atau .png");
      }

      const supabase = suparef.current;
      const ext = proofFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const proofPath = `bukti-bayar/${user.id}/${registrationId}-${crypto.randomUUID()}.${ext}`;

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
          midtrans_payment_type: "manual",
        })
        .eq("id", paymentId);
      if (payErr) throw payErr;

      const { error: regErr } = await supabase
        .from("registrations")
        .update({ status: "pending_verification" })
        .eq("id", registrationId);
      if (regErr) throw regErr;

      fetch("/api/email/send-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      }).catch((err) => console.error("[Manual Pay] Error sending email:", err));
    },
    onSuccess: () => {
      toast.success("Pendaftaran berhasil dibayar!");
      qc.invalidateQueries({ queryKey: ["user-registrations", user?.id] });
      setUploadingProof(false);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setUploadingProof(false);
    },
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <section className="pt-30 md:pt-32 pb-26 md:pb-30">
        <div className="mx-auto max-w-5xl px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> Beranda
          </Link>

          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Riwayat <span className="gradient-text">Pendaftaran</span>
          </h1>

          <p className="mt-2 text-muted-foreground">
            Status semua lomba yang kamu daftarkan akan muncul di sini.
          </p>

          <div className="mt-10 space-y-3">
            {isLoading && (
              <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
                Memuat…
              </div>
            )}

            {!isLoading && (!rows || rows.length === 0) && (
              <div className="glass rounded-3xl p-12 text-center">
                <Inbox size={32} className="mx-auto text-muted-foreground" />

                <p className="mt-4 font-display text-lg font-semibold">
                  Belum ada pendaftaran
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Pilih cabang lomba dan daftarkan timmu untuk mulai.
                </p>

                <Link
                  href="/"
                  className="btn-hero mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold"
                >
                  Lihat Lomba
                </Link>
              </div>
            )}

            {rows?.map((r) => {
              const meta = statusMeta[r.status] ?? statusMeta.draft;
              const Icon = meta.icon;

              const paymentsArr = Array.isArray(r.payments)
                ? r.payments
                : r.payments
                  ? [r.payments]
                  : [];
              const payment = paymentsArr[0];
              const amount = payment?.amount_idr ?? 0;

              return (
                <article key={r.id} className="glass rounded-2xl p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      <h3 className="mt-0.5 font-display text-lg font-semibold">
                        {r.competition?.kategori_peserta === "tim" ? r.team_name : r.leader_name}
                      </h3>

                      <p className="text-sm text-cyan-strong">
                        {r.competition?.name ?? "—"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Rp. {amount.toLocaleString("id-ID")}{r.slot > 1 && ` - ${r.slot} Slot`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}
                      >
                        <Icon size={12} /> {meta.label}
                      </span>

                      {/* Metode pembayaran midtrans */}
                      {r.status === "pending_payment" && metodePay === "midtrans" && (
                        <button
                          onClick={() => {
                            if (payment?.midtrans_token) {
                              setModalData({
                                registrationId: r.id,
                                midtransToken: payment.midtrans_token,
                              });
                            } else {
                              pay.mutate({ registrationId: r.id });
                            }
                          }}
                          disabled={payingId === r.id}
                          className="btn-hero inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold disabled:opacity-60"
                        >
                          {payingId === r.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Wallet size={12} />
                          )}
                          Bayar Sekarang
                        </button>
                      )}

                      {r.status === "verified" && (
                        <button
                          onClick={() => {
                            const paymentsArr = Array.isArray(r.payments)
                              ? r.payments
                              : r.payments
                                ? [r.payments]
                                : [];
                            const payment = paymentsArr[0] || { amount_idr: 0, status: "pending" };
                            downloadTicket({
                              ...r,
                              payments: payment,
                            });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
                        >
                          <Download size={12} /> Tiket PDF
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Alasan Penolakan */}
                  {r.status === "rejected" && r.rejection_reason && (
                    <div className="mt-4 rounded-2xl bg-destructive/10 border border-destructive/40 p-5">
                      <h4 className="text-sm font-semibold text-destructive">
                        Alasan Penolakan
                      </h4>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {r.rejection_reason}
                      </p>
                    </div>
                  )}

                  {/* Metode Pembayaran Manual */}
                  {r.status === "pending_payment" && metodePay === "manual" && (
                    <div className="mt-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 p-5">
                      <div className="space-y-4">
                        {qrisBankUrl && (
                          <>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <QrCode size={12} /> QRIS Pembayaran
                            </p>
                            <div className="w-fit rounded-2xl border border-white/10 bg-white p-3 shadow-lg">
                              <Image
                                src={qrisBankUrl}
                                alt="QRIS Bank"
                                width={220}
                                height={220}
                                className="rounded-xl object-contain"
                              />
                            </div>
                          </>
                        )}
                        {rekeningBank && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-amber-500 font-display">BANK SEABANK INDONESIA</h4>
                            <div className="inline-flex flex-col gap-2 items-start px-3 py-2 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-sm rounded-lg">
                              <div>
                                <h4 className="uppercase text-[10px] font-semibold tracking-wider">No. Rekening</h4>
                                <p className="font-display text-white text-sm mt-0.5">{rekeningBank.split("-")[0]}</p>
                              </div>
                              <div>
                                <h4 className="uppercase text-[10px] font-semibold tracking-wider">Atas Nama</h4>
                                <p className="font-display text-white text-sm mt-0.5">{rekeningBank.split("-")[1]}</p>
                              </div>
                              <div>
                                <h4 className="uppercase text-[10px] font-semibold tracking-wider">Harga</h4>
                                <p className="font-display text-white text-sm mt-0.5">Rp. {amount.toLocaleString("id-ID")}</p>
                              </div>
                              {r.slot > 1 &&
                                <div>
                                  <h4 className="uppercase text-[10px] font-semibold tracking-wider">Slot</h4>
                                  <p className="font-display text-white text-sm mt-0.5">{r.slot} slot</p>
                                </div>
                              }
                            </div>
                          </div>
                        )}
                        {(!qrisBankUrl && !rekeningBank) ? (
                          <p className="inline-block px-3 py-2 bg-destructive/10 text-destructive border border-destructive/30 text-sm rounded-lg">Metode pembayaran belum ditentukan. Harap hubungi panitia CSS untuk informasi lebih lanjut</p>
                        ) : (
                          <>
                            <p className="text-xs text-muted-foreground">
                              Upload foto bukti pembayaran, pastikan bukti pembayaran valid dan sesuai dengan nominal yang tertera.
                            </p>

                            <div>
                              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-white/10 transition">
                                <Upload size={13} />
                                {proofFile ? proofFile.name : "Upload Bukti Bayar"}
                                <input
                                  type="file"
                                  accept=".png, .jpg, .jpeg"
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


                            <button
                              disabled={payManual.isPending || uploadingProof || !proofFile}
                              onClick={() => payManual.mutate({ registrationId: r.id, paymentId: payment.id })}
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/25 px-4 py-2.5 text-sm font-bold text-emerald-300 hover:bg-emerald-500/35 disabled:opacity-60 transition cursor-pointer border border-emerald-500/20"
                            >
                              {payManual.isPending || uploadingProof ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              Upload
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Grup Lomba */}
                  {r.status === "verified" && r.competition && (
                    <GroupLinkPanel competitionId={r.competition.id} />
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {modalData && (
        <div
          className="confirm-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalData(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="confirm-modal-box max-w-md">
            <div className="confirm-modal-icon bg-blue-500">
              <Wallet size={22} />
            </div>

            <button
              onClick={() => setModalData(null)}
              className="confirm-modal-close"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>

            <div className="confirm-modal-content">
              <h2 className="confirm-modal-title">Lanjutkan Pembayaran</h2>
              <p className="confirm-modal-message">
                Anda memiliki transaksi pembayaran yang sedang aktif untuk pendaftaran ini.
                Apakah Anda ingin melanjutkan pembayaran sebelumnya, atau membuat metode pembayaran baru (untuk mengganti metode pembayaran)?
              </p>
            </div>

            <div className="confirm-modal-actions">
              <button
                onClick={() => {
                  const regId = modalData.registrationId;
                  setModalData(null);
                  pay.mutate({ registrationId: regId, forceNew: false });
                }}
                className="confirm-btn-cancel"
              >
                Lanjutkan
              </button>
              <button
                onClick={() => {
                  const regId = modalData.registrationId;
                  setModalData(null);
                  pay.mutate({ registrationId: regId, forceNew: true });
                }}
                className="confirm-btn-confirm btn-hero"
              >
                Metode Baru
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default HistoryPage;