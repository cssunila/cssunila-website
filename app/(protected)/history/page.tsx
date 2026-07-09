"use client";

import { useMutation } from "@tanstack/react-query";
import {
  Inbox,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  Download,
  Loader2,
  ShieldCheck,
  X,
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

type Row = {
  id: string;
  team_name: string;
  leader_name: string;
  leader_whatsapp: string;
  status: string;
  created_at: string;
  competition: { id: string; slug: string; name: string } | null;
  payments:
    | {
        amount_idr: number;
        status: string;
        midtrans_token: string | null;
        midtrans_order_id: string | null;
      }
    | {
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
  const [payingId, setPayingId] = useState<string | null>(null);
  const suparef = useRef(createClient());
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalData, setModalData] = useState<{ registrationId: string; midtransToken: string } | null>(null);
  const { role, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role === "admin") {
      router.replace("/admin");
    }
  }, [role, loading, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("midtrans-snap")) return;

    const s = document.createElement("script");
    s.id = "midtrans-snap";
    s.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    document.head.appendChild(s);
  }, []);

  const fetchRows = async () => {
    if (!user) return;

    const supabase = suparef.current;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("registrations")
      .select(
        "id, team_name, leader_name, leader_whatsapp, status, created_at, competition:competitions(id, slug, name), payments(amount_idr, status, midtrans_token, midtrans_order_id)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setIsLoading(false);
      setRows([]);
      return;
    }

    setRows((data ?? []) as unknown as Row[]);
    setIsLoading(false);
  };

  useEffect(() => {
    (async()=>{
      await fetchRows();
    })()
  }, [user]);

  const pay = useMutation({
    mutationFn: async ({
      registrationId,
      forceNew,
    }: {
      registrationId: string;
      forceNew?: boolean;
    }) => {
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

      if (!response.ok) {
        throw new Error(res.message ?? "Gagal membuat transaksi Midtrans");
      }

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
      setPayingId(null);
      fetchRows();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <section className="pt-32 pb-12 md:pt-40">
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
                        {r.team_name}
                      </h3>

                      <p className="text-sm text-cyan-strong">
                        {r.competition?.name ?? "—"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Rp. {amount.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}
                      >
                        <Icon size={12} /> {meta.label}
                      </span>

                      {r.status === "pending_payment" && (
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

                      {r.status === "verified" ? (
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
                      ) : (
                        <span
                          title="Tiket aktif setelah pembayaran diverifikasi panitia"
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground/60"
                        >
                          <ShieldCheck size={12} /> Tiket tersedia setelah
                          verifikasi
                        </span>
                      )}
                    </div>
                  </div>

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