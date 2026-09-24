import nodemailer from "nodemailer";
import {
  generateVerificationEmailHtml,
  generateRegistrationEmailHtml,
  type RegistrationEmailData,
} from "@/lib/email-template";
import { createAdmin } from "@/supabase/admin";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

export const sendVerificationEmail = async (
  to: string,
  code: string,
  fullName: string,
) => {
  const plainText = `Halo ${fullName || "Peserta"},\n\nKode verifikasi akun CSS 3.0 Anda adalah: ${code}\n\nKode ini berlaku selama 15 menit.\nJika Anda tidak mendaftar di CSS 3.0, abaikan email ini.`;
  const html = generateVerificationEmailHtml(to, code, fullName);

  await transporter.sendMail({
    from: `"CSS 3.0 — Computer Science Showdown" <${process.env.EMAIL_SMTP_USER}>`,
    to,
    subject: `[CSS 3.0] Kode Verifikasi Email`,
    text: plainText,
    html,
  });
};

export const sendRegistrationEmail = async (data: RegistrationEmailData) => {
  if (!data.leaderEmail) return;

  try {
    const html = generateRegistrationEmailHtml(data);
    const plainText = `Halo ${data.leaderName || "Peserta"},\n\nTerima kasih telah mendaftar di CSS 3.0.\n\nDetail Pendaftaran:\n-${data.kategoriPeserta === "tim" ? `Nama Tim: ${data.teamName}` : `Nama Peserta: ${data.leaderName}`}\n- Cabang Lomba: ${data.competitionName}\n- Jumlah Slot: ${data.slot || 1}\n- Total Pembayaran: Rp ${Number(data.amountIdr || 0).toLocaleString("id-ID")}\n- Status: Terbayar / Berhasil\n\nSilakan cek website CSS 3.0 untuk info selengkapnya.`;

    await transporter.sendMail({
      from: `"CSS 3.0 — Computer Science Showdown" <${process.env.EMAIL_SMTP_USER}>`,
      to: data.leaderEmail,
      subject: `[CSS 3.0] Bukti Pendaftaran - ${data.competitionName}`,
      text: plainText,
      html,
    });
  } catch (error) {
    console.error("[Email] Failed to send registration email:", error);
  }
};

export const sendRegistrationEmailById = async (registrationId: string) => {
  try {
    const supabaseAdmin = createAdmin();
    const { data: reg, error } = await supabaseAdmin
      .from("registrations")
      .select(
        "id, team_name, leader_name, leader_email, leader_whatsapp, slot, status, created_at, competition:competitions(name, kategori_peserta), payments(id, amount_idr, status, midtrans_order_id, paid_at)"
      )
      .eq("id", registrationId)
      .maybeSingle();

    if (error || !reg) {
      console.error("[sendRegistrationEmailById] Error fetching registration:", error);
      return;
    }

    const comp = Array.isArray(reg.competition) ? reg.competition[0] : reg.competition;
    const payments = Array.isArray(reg.payments)
      ? reg.payments
      : reg.payments
      ? [reg.payments]
      : [];
    const payment = payments[0];

    const emailData: RegistrationEmailData = {
      leaderName: reg.leader_name || "",
      leaderEmail: reg.leader_email || "",
      leaderWhatsapp: reg.leader_whatsapp || undefined,
      teamName: reg.team_name || "",
      kategoriPeserta: comp.kategori_peserta,
      competitionName: comp?.name || "Perlombaan CSS 3.0",
      amountIdr: payment?.amount_idr || 0,
      slot: reg.slot || 1,
      paymentStatus: payment?.status || reg.status || "success",
      orderId: payment?.midtrans_order_id || undefined,
      registrationId: reg.id,
      paidAt: payment?.paid_at || undefined,
    };

    await sendRegistrationEmail(emailData);
  } catch (err) {
    console.error("[sendRegistrationEmailById] Exception:", err);
  }
};

