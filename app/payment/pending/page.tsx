"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import Link from "next/link";
import { Clock, ArrowRight, Loader2, ShieldAlert, Bell } from "lucide-react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

type VerifyResult =
  | { state: "loading" }
  | { state: "invalid" }
  | {
      state: "pending";
      teamName: string;
      competitionName: string;
      orderId: string;
      amount: number;
    };

function PaymentPendingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<VerifyResult>({ state: "loading" });

  useEffect(() => {
    const orderId = params.get("order_id");
    const transactionStatus = params.get("transaction_status");
    const statusCode = params.get("status_code");

    if (!orderId || !transactionStatus || !statusCode) {
      router.replace("/");
      return;
    }

    if (transactionStatus !== "pending") {
      if (["settlement", "capture"].includes(transactionStatus)) {
        router.replace("/payment/success?" + params.toString());
      } else {
        router.replace("/payment/error?" + params.toString());
      }
      return;
    }

    const supabase = createClient();
    supabase
      .from("payments")
      .select(
        "id, amount_idr, midtrans_order_id, status, registration:registrations(team_name, competition:competitions(name))"
      )
      .eq("midtrans_order_id", orderId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setResult({ state: "invalid" });
          return;
        }
        const reg = Array.isArray(data.registration)
          ? data.registration[0]
          : (data.registration as { team_name: string; competition: { name: string } | { name: string }[] | null } | null);
        const comp = Array.isArray(reg?.competition)
          ? reg?.competition[0]
          : reg?.competition;

        setResult({
          state: "pending",
          teamName: reg?.team_name ?? "—",
          competitionName: (comp as { name: string } | null)?.name ?? "—",
          orderId: data.midtrans_order_id ?? orderId,
          amount: data.amount_idr ?? 0,
        });
      });
  }, [params, router]);

  return (
    <section className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-lg">
        {result.state === "loading" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 size={40} className="animate-spin text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Memuat status pembayaran…</p>
          </div>
        )}

        {result.state === "invalid" && (
          <div className="glass rounded-3xl border border-white/10 p-10 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-amber-500/15">
              <ShieldAlert size={36} className="text-amber-400" />
            </div>
            <h1 className="font-display text-2xl font-bold">Sesi Tidak Valid</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Halaman ini hanya dapat diakses setelah proses pembayaran dengan status tertunda dari Midtrans.
              Data pembayaran tidak ditemukan atau sesi telah berakhir.
            </p>
            <Link
              href="/history"
              className="btn-hero mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              Cek Riwayat Pendaftaran <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {result.state === "pending" && (
          <div className="glass rounded-3xl border border-amber-500/20 p-10 text-center shadow-2xl">
            {/* Icon dengan animasi pulse */}
            <div className="mx-auto mb-6 relative flex size-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping opacity-40" />
              <div className="relative flex size-24 items-center justify-center rounded-full bg-amber-500/15 shadow-2xl shadow-amber-500/20">
                <Clock size={48} className="text-amber-400" />
              </div>
            </div>

            <h1 className="font-display text-3xl font-bold">Menunggu Pembayaran</h1>

            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Pembayaranmu sedang diproses oleh bank atau penyedia layanan pembayaran.
              Transaksi ini akan dikonfirmasi otomatis dalam beberapa saat.
            </p>

            {/* Detail */}
            <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-5 text-left space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tim</span>
                <span className="font-semibold">{result.teamName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cabang Lomba</span>
                <span className="font-semibold">{result.competitionName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs text-muted-foreground">{result.orderId}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Total Bayar</span>
                <span className="font-display text-xl font-bold">
                  Rp {result.amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-amber-500/15 text-amber-300">
              <Clock size={12} className="animate-spin" style={{ animationDuration: "3s" }} />
              Menunggu Konfirmasi Pembayaran
            </div>

            {/* Info box */}
            <div className="mt-6 rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4 text-left">
              <div className="flex items-start gap-3">
                <Bell size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-300 mb-1">Yang perlu kamu lakukan:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Selesaikan pembayaran di aplikasi bank atau e-wallet kamu</li>
                    <li>Jangan tutup aplikasi pembayaran sebelum transaksi selesai</li>
                    <li>Status pendaftaran akan otomatis berubah setelah dikonfirmasi</li>
                    <li>Proses konfirmasi biasanya membutuhkan waktu beberapa menit</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/history"
                className="btn-hero inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                Pantau Status Pendaftaran <ArrowRight size={14} />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-white/30 transition"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function PaymentPendingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-[600px] rounded-full bg-amber-500/8 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 size-[500px] rounded-full bg-yellow-500/6 blur-[100px]" />
      </div>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 size={40} className="animate-spin text-muted-foreground" />
          </div>
        }
      >
        <PaymentPendingContent />
      </Suspense>
      <Footer />
    </div>
  );
}
