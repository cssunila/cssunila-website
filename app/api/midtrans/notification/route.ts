import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdmin } from "@/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendRegistrationEmailById } from "@/lib/mailer";

type Notification = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
};

const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION;
const isProd = (isProduction ?? "false").toLowerCase() === "true";

const serverKey = isProd
  ? process.env.MIDTRANS_SERVER_KEY_PROD
  : process.env.MIDTRANS_SERVER_KEY_SAND;

export const POST = async (request: Request) => {
  if (!serverKey) return new Response("Tidak ada Server Key", { status: 500 });

  const ip = getClientIp(request);
  const { allowed, resetAt } = rateLimit(`midtrans-notif:${ip}`, 30, 60_000);
  if (!allowed) {
    return new Response("Telah mencapai limit, tunggu beberapa saat...", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
    });
  }

  const supabaseAdmin = createAdmin();

  const raw = await request.text();

  let body: Notification;

  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    payment_type,
  } = body;

  if (!order_id || !status_code || !gross_amount || !signature_key) {
    return new Response("missing fields", { status: 400 });
  }

  const expected = createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  if (expected !== signature_key) {
    return new Response("invalid signature", { status: 401 });
  }


  const { data: payment, error: pErr } = await supabaseAdmin
    .from("payments")
    .select("id, registration_id, amount_idr, status")
    .eq("midtrans_order_id", order_id)
    .maybeSingle();

  if (pErr || !payment) {
    return new Response("payment not found", { status: 404 });
  }

  if (Number(gross_amount) !== payment.amount_idr) {
    return new Response("amount mismatch", { status: 400 });
  }

  const wasAlreadySuccess = payment.status === "success";

  let payStatus:
    | "pending"
    | "success"
    | "failed"
    | "expired"
    | "refunded" = "pending";

  let regStatus:
    | "draft"
    | "pending_payment"
    | "pending_verification"
    | "rejected"
    | "verified"
    | null = null;

  if (
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept")
  ) {
    payStatus = "success";
    regStatus = "pending_verification";
  } else if (transaction_status === "pending") {
    payStatus = "pending";
  } else if (transaction_status === "expire") {
    payStatus = "expired";
  } else if (
    transaction_status === "cancel" ||
    transaction_status === "deny" ||
    transaction_status === "failure"
  ) {
    payStatus = "failed";
  }

  await supabaseAdmin
    .from("payments")
    .update({
      status: payStatus,
      midtrans_payment_type: payment_type ?? null,
      midtrans_transaction_status: transaction_status ?? null,
      paid_at: payStatus === "success" ? new Date().toISOString() : null,
    })
    .eq("id", payment.id);

  if (regStatus) {
    await supabaseAdmin
      .from("registrations")
      .update({ status: regStatus })
      .eq("id", payment.registration_id);
  }

  if (payStatus === "success" && !wasAlreadySuccess && payment.registration_id) {
    sendRegistrationEmailById(payment.registration_id).catch((err) => {
      console.error("[Midtrans Notification] Error sending registration email:", err);
    });
  }

  return NextResponse.json({ ok: true });
}