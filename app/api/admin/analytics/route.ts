/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createSign } from "crypto";

function base64urlUrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken(
  clientEmail: string,
  privateKey: string
): Promise<string | null> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = base64urlUrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = base64urlUrlEncode(
      JSON.stringify({
        iss: clientEmail,
        scope: "https://www.googleapis.com/auth/analytics.readonly",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
      })
    );

    const formattedKey = privateKey.replace(/\\n/g, "\n");
    const signer = createSign("RSA-SHA256");
    signer.update(`${header}.${payload}`);
    const signature = signer.sign(formattedKey, "base64url");

    const jwt = `${header}.${payload}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      console.error("[GA API Token Error]", await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token ?? null;
  } catch (err) {
    console.error("[GA JWT Sign Error]", err);
    return null;
  }
}

export const GET = async (req: Request) => {
  const ip = getClientIp(req);
  const { allowed, resetAt } = rateLimit(`admin-analytics:${ip}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { message: "Terlalu banyak permintaan. Silakan tunggu sebentar." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 401 });
    }

    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKey = process.env.GA_PRIVATE_KEY;

    let gaStats: {
      activeUsers30d: number;
      activeUsers7d: number;
      pageViews30d: number;
      sessions30d: number;
    } | null = null;

    let gaConfigured = false;

    if (propertyId && clientEmail && privateKey) {
      const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
      if (accessToken) {
        try {
          const gaRes = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                metrics: [
                  { name: "activeUsers" },
                  { name: "screenPageViews" },
                  { name: "sessions" },
                ],
              }),
            }
          );

          if (gaRes.ok) {
            const json = await gaRes.json();
            const rows = json.rows?.[0]?.metricValues ?? [];
            const activeUsers = parseInt(rows[0]?.value ?? "0", 10);
            const pageViews = parseInt(rows[1]?.value ?? "0", 10);
            const sessions = parseInt(rows[2]?.value ?? "0", 10);

            const gaRes7d = await fetch(
              `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
                  metrics: [{ name: "activeUsers" }],
                }),
              }
            );

            let activeUsers7d = activeUsers;
            if (gaRes7d.ok) {
              const json7d = await gaRes7d.json();
              activeUsers7d = parseInt(
                json7d.rows?.[0]?.metricValues?.[0]?.value ?? "0",
                10
              );
            }

            gaStats = {
              activeUsers30d: activeUsers,
              activeUsers7d: activeUsers7d,
              pageViews30d: pageViews,
              sessions30d: sessions,
            };
            gaConfigured = true;
          } else {
            console.error("[GA Data API Error]", await gaRes.text());
          }
        } catch (err) {
          console.error("[GA Data Fetch Error]", err);
        }
      }
    }

    const { count: profilesCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: registrationsCount } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      configured: gaConfigured,
      gaStats,
      systemStats: {
        totalUsers: profilesCount ?? 0,
        totalRegistrations: registrationsCount ?? 0,
      },
    });
  } catch (error: any) {
    console.error("[Analytics API Error]", error);
    return NextResponse.json(
      { message: error.message || "Gagal mengambil data analytics" },
      { status: 500 }
    );
  }
}
