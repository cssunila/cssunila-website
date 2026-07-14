import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

type SnapResult = {
  token: string;
  redirect_url: string;
  client_key: string;
  is_production: boolean;
};

const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION;
const isProd = (isProduction ?? "false").toLowerCase() === "true";

const serverKey = isProd
  ? process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY_PROD
  : process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY_SAND;

const clientKey = isProd
  ? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PROD
  : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SAND;

export const POST = async (req: Request) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: "Akses ditolak" },
        { status: 401 }
      );
    }

    const data = (await req.json()) as { registrationId: string; forceNew?: boolean };

    if (!serverKey || !clientKey) {
      return NextResponse.json(
        { message: "Midtrans belum dikonfigurasi" },
        { status: 500 }
      );
    }

    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .select(
        "id, user_id, team_name, leader_name, leader_email, leader_whatsapp, status, slot, competition:competitions(name, fee_idr), payments(id, amount_idr, status, midtrans_token, midtrans_order_id)"
      )
      .eq("id", data.registrationId)
      .maybeSingle();

    if (regErr) throw regErr;

    if (!reg) {
      return NextResponse.json(
        { message: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (reg.user_id !== user.id) {
      return NextResponse.json(
        { message: "Akses ditolak" },
        { status: 403 }
      );
    }

    if (reg.status !== "pending_payment") {
      return NextResponse.json(
        { message: "Pendaftaran sudah diproses" },
        { status: 400 }
      );
    }

    const payments = Array.isArray(reg.payments)
      ? reg.payments
      : reg.payments
        ? [reg.payments]
        : [];

    const payment = payments[0] as
      | {
          id: string;
          amount_idr: number;
          status: string;
          midtrans_token: string | null;
          midtrans_order_id: string | null;
        }
      | undefined;

    if (!payment) {
      return NextResponse.json(
        { message: "Data pembayaran belum dibuat" },
        { status: 400 }
      );
    }

    if (!data.forceNew && payment.midtrans_token && payment.status === "pending") {
      const result: SnapResult = {
        token: payment.midtrans_token,
        redirect_url: "",
        client_key: clientKey,
        is_production: isProd,
      };

      return NextResponse.json(result);
    }

    const orderId = `CSS3-${reg.id.slice(0, 8)}-${Date.now()}`;

    const baseUrl = isProd
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";

    const competitionName = Array.isArray(reg.competition)
      ? reg.competition[0]?.name
      : (reg.competition as { name: string } | null)?.name;

    const competitionPrice = Array.isArray(reg.competition)
      ? reg.competition[0]?.fee_idr
      : (reg.competition as { fee_idr: number } | null)?.fee_idr;

    const appUrl = process.env.NEXT_PUBLIC_DOMAIN_URL ?? "http://localhost:3000";

    const body = {
      transaction_details: {
        order_id: orderId,
        gross_amount: payment.amount_idr,
      },
      customer_details: {
        first_name: reg.leader_name,
        email: reg.leader_email ?? undefined,
        phone: reg.leader_whatsapp,
      },
      item_details: [
        {
          id: reg.id,
          name: `${competitionName ?? "Lomba"} - ${reg.team_name}`.slice(
            0,
            50
          ),
          price: competitionPrice ?? 0,
          quantity: reg.slot,
        },
      ],
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${appUrl}/payment/success`,
        error: `${appUrl}/payment/error`,
        pending: `${appUrl}/payment/pending`,
      },
    };

    const auth = Buffer.from(`${serverKey}:`).toString("base64");

    const res = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok || !json.token) {
      console.error("Midtrans Snap error", json);

      return NextResponse.json(
        {
          message:
            json?.error_messages?.[0] ??
            "Gagal membuat transaksi Midtrans",
        },
        { status: 500 }
      );
    }
 
    const { error: updateErr } = await supabase
      .from("payments")
      .update({
        midtrans_order_id: orderId,
        midtrans_token: json.token,
        status: "pending",
      })
      .eq("id", payment.id);
    
    if (updateErr) throw updateErr;

    const result: SnapResult = {
      token: json.token,
      redirect_url: json.redirect_url ?? "",
      client_key: clientKey,
      is_production: isProd,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}