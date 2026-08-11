// TEMPLATE EMAIL VERIFIKASI
export const generateVerificationEmailHtml = (
  email: string,
  code: string,
  fullName: string,
) => {
  const displayName = fullName?.trim() || "Peserta";
  const digits = code.split("");

  const digitCell = (d: string) => `
    <td style="padding:0 4px;">
      <div style="
        width:44px;
        height:56px;
        background:#161d31;
        border:2px solid #38bdf8;
        border-radius:12px;
        text-align:center;
        line-height:56px;
        font-size:28px;
        font-weight:800;
        color:#38bdf8;
        font-family:'Courier New',Courier,monospace;
      ">${d}</div>
    </td>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Kode Verifikasi Email — CSS 3.0</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0b0f19;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card wrapper -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;margin:0 auto;">

          <!-- ===== HEADER ===== -->
          <tr>
            <td align="center" style="
              background:linear-gradient(135deg,#4338ca 0%,#0284c7 60%,#059669 100%);
              border-radius:20px 20px 0 0;
              padding:36px 32px;
              text-align:center;
            ">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center">
                    <img
                      src="https://www.cssunila.com/css-logo.png"
                      alt="CSS 3.0 Logo"
                      width="72"
                      height="72"
                      style="display:block;width:72px;height:72px;max-width:72px;max-height:72px;border:0;outline:none;text-decoration:none;margin:0 auto 16px auto;"
                    />
                  </td>
                </tr>
              </table>

              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;">
                Computer Science Showdown
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;">
                CSS 3.0 &mdash; HIMAKOM FMIPA Universitas Lampung
              </p>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="
              background:#111827;
              border-left:1px solid rgba(255,255,255,0.08);
              border-right:1px solid rgba(255,255,255,0.08);
              padding:36px 32px;
            ">
              <!-- Greeting -->
              <h2 style="margin:0 0 12px;color:#f3f4f6;font-size:19px;font-weight:600;">
                Halo, ${displayName}! &#x1F44B;
              </h2>
              <p style="margin:0 0 28px;color:#9ca3af;font-size:14px;line-height:1.7;">
                Terima kasih telah mendaftar di CSS 3.0 dengan email
                <strong style="color:#38bdf8;">${email}</strong>.
                Gunakan kode verifikasi di bawah ini untuk menyelesaikan pendaftaran Anda:
              </p>

              <!-- OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center" style="
                    background:rgba(56,189,248,0.06);
                    border:1px solid rgba(56,189,248,0.25);
                    border-radius:16px;
                    padding:28px 16px;
                    text-align:center;
                  ">
                    <p style="margin:0 0 16px;color:#64748b;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">
                      KODE VERIFIKASI OTP
                    </p>

                    <!-- Digit boxes -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                      <tr>
                        ${digits.map(digitCell).join("")}
                      </tr>
                    </table>

                    <p style="margin:18px 0 0;color:#94a3b8;font-size:12px;">
                      &#x23F0; Kode ini berlaku selama <strong style="color:#e2e8f0;">15 menit</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="
                    background:rgba(245,158,11,0.08);
                    border:1px solid rgba(245,158,11,0.2);
                    border-radius:10px;
                    padding:12px 16px;
                  ">
                    <p style="margin:0;color:#cbd5e1;font-size:12px;line-height:1.6;">
                      &#x26A0;&#xFE0F; Jika Anda tidak merasa melakukan pendaftaran ini, silakan abaikan email ini.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td align="center" style="
              background:#090d16;
              border:1px solid rgba(255,255,255,0.08);
              border-top:none;
              border-radius:0 0 20px 20px;
              padding:20px 32px;
              text-align:center;
            ">
              <p style="margin:0 0 4px;color:#64748b;font-size:12px;">
                &copy; 2026 Computer Science Showdown &mdash; Universitas Lampung
              </p>
              <p style="margin:0;color:#475569;font-size:11px;">
                Email ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

// TEMPLATE EMAIL PENDAFTARAN & PEMBAYARAN
export type RegistrationEmailData = {
  leaderName: string;
  leaderEmail: string;
  leaderWhatsapp?: string;
  teamName: string;
  competitionName: string;
  amountIdr: number;
  slot?: number;
  paymentStatus?: string;
  paymentType?: string;
  orderId?: string;
  registrationId?: string;
  paidAt?: string;
};

export const generateRegistrationEmailHtml = (data: RegistrationEmailData) => {
  const displayName = data.leaderName?.trim() || "Peserta";
  const formattedAmount = `Rp ${Number(data.amountIdr || 0).toLocaleString("id-ID")}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Konfirmasi Pendaftaran Lomba — CSS 3.0</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0b0f19;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card wrapper -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto;">

          <!-- ===== HEADER ===== -->
          <tr>
            <td align="center" style="
              background:linear-gradient(135deg,#4338ca 0%,#0284c7 60%,#059669 100%);
              border-radius:20px 20px 0 0;
              padding:36px 32px;
              text-align:center;
            ">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center">
                    <img
                      src="https://www.cssunila.com/css-logo.png"
                      alt="CSS 3.0 Logo"
                      width="72"
                      height="72"
                      style="display:block;width:72px;height:72px;max-width:72px;max-height:72px;border:0;outline:none;text-decoration:none;margin:0 auto 16px auto;"
                    />
                  </td>
                </tr>
              </table>

              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;">
                Bukti Pendaftaran Lomba
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;">
                CSS 3.0 &mdash; HIMAKOM FMIPA Universitas Lampung
              </p>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="
              background:#111827;
              border-left:1px solid rgba(255,255,255,0.08);
              border-right:1px solid rgba(255,255,255,0.08);
              padding:36px 32px;
            ">
              <!-- Greeting -->
              <h2 style="margin:0 0 12px;color:#f3f4f6;font-size:19px;font-weight:600;">
                Halo, ${displayName}! &#x1F389;
              </h2>
              <p style="margin:0 0 24px;color:#9ca3af;font-size:14px;line-height:1.7;">
                Pendaftaran dan pembayaran Anda untuk cabang perlombaan <strong style="color:#38bdf8;">${data.competitionName}</strong> telah berhasil dicatat oleh sistem kami. Berikut adalah rincian informasi pendaftaran Anda:
              </p>

              <!-- Status Badge Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center" style="
                    background:rgba(16,185,129,0.08);
                    border:1px solid rgba(16,185,129,0.3);
                    border-radius:12px;
                    padding:14px 20px;
                    text-align:center;
                  ">
                    <span style="color:#10b981;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">
                      &#x2705; Pendaftaran Berhasil
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Registration Details Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                background:#161d31;
                border:1px solid rgba(255,255,255,0.08);
                border-radius:14px;
                margin:0 0 28px;
                border-collapse:separate;
                border-spacing:0;
              ">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#9ca3af;font-size:13px;width:35%;">Nama Tim</td>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#f3f4f6;font-size:13px;font-weight:600;">${data.teamName || "-"}</td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#9ca3af;font-size:13px;">Nama Pendaftar</td>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#f3f4f6;font-size:13px;font-weight:600;">${displayName}</td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#9ca3af;font-size:13px;">Email Pendaftar</td>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#38bdf8;font-size:13px;font-weight:600;">${data.leaderEmail}</td>
                </tr>
                ${data.leaderWhatsapp ? `
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#9ca3af;font-size:13px;">WhatsApp</td>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#f3f4f6;font-size:13px;font-weight:600;">${data.leaderWhatsapp}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#9ca3af;font-size:13px;">Cabang Lomba</td>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#38bdf8;font-size:13px;font-weight:700;">${data.competitionName}</td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#9ca3af;font-size:13px;">Jumlah Slot</td>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#f3f4f6;font-size:13px;font-weight:600;">${data.slot || 1} Slot</td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#9ca3af;font-size:13px;">Total Biaya</td>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#34d399;font-size:14px;font-weight:700;">${formattedAmount}</td>
                </tr>
                ${data.orderId ? `
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#9ca3af;font-size:13px;">No. Transaksi</td>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);color:#cbd5e1;font-size:12px;font-family:monospace;">${data.orderId}</td>
                </tr>
                ` : ""}
              </table>

              <!-- Information Note -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="
                    background:rgba(56,189,248,0.06);
                    border:1px solid rgba(56,189,248,0.2);
                    border-radius:12px;
                    padding:16px 20px;
                  ">
                    <p style="margin:0 0 8px;color:#38bdf8;font-size:13px;font-weight:700;">
                      &#x2139;&#xFE0F; Langkah Selanjutnya:
                    </p>
                    <p style="margin:0 0 6px;color:#cbd5e1;font-size:12px;line-height:1.6;">
                      1. Kunjungi menu <strong>Riwayat Pendaftaran</strong> pada website CSS 3.0 untuk memantau status pendaftaran anda.
                    </p>
                    <p style="margin:0;color:#cbd5e1;font-size:12px;line-height:1.6;">
                      2. Bergabunglah ke grup WhatsApp peserta perlombaan melalui tautan yang tersedia di halaman riwayat. Tautan akan tersedia ketika status pendaftaran terverifikasi.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td align="center" style="
              background:#090d16;
              border:1px solid rgba(255,255,255,0.08);
              border-top:none;
              border-radius:0 0 20px 20px;
              padding:20px 32px;
              text-align:center;
            ">
              <p style="margin:0 0 4px;color:#64748b;font-size:12px;">
                &copy; 2026 Computer Science Showdown &mdash; Universitas Lampung
              </p>
              <p style="margin:0;color:#475569;font-size:11px;">
                Email ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

export const generateEmailTemplate = generateRegistrationEmailHtml;

