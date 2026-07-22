/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createAdmin } from "@/supabase/admin";
import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:cssunila25@gmail.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export const POST = async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
      return NextResponse.json({ message: "Unauthorized webhook access" }, { status: 401 });
    }

    const payload = await req.json();
    if (payload.type !== "INSERT" || payload.table !== "notifications" || !payload.record) {
      return NextResponse.json({ message: "Ignore non-insert notification event" });
    }

    const record = payload.record;
    const title = record.title || "Notifikasi Baru";
    const body = record.message || "";
    const competitionId = record.competition_id;
    const isForAdmin = record.is_for_admin;
    const userId = record.user_id;

    const supabase = createAdmin();
    let targetUserIds: string[] = [];

    if (userId) {
      targetUserIds.push(userId);
    } else if (isForAdmin) {
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminIds = (admins ?? []).map((a) => a.user_id);
      targetUserIds.push(...adminIds);

      if (competitionId) {
        const { data: lombaUsers } = await supabase
          .from("user_competitions")
          .select("user_id")
          .eq("competition_id", competitionId);

        const lombaIds = (lombaUsers ?? []).map((l) => l.user_id);
        targetUserIds.push(...lombaIds);
      }
    }

    targetUserIds = Array.from(new Set(targetUserIds));

    if (targetUserIds.length === 0) {
      return NextResponse.json({ message: "No target users found for this notification" });
    }

    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, subscription")
      .in("user_id", targetUserIds);

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No active push subscriptions found" });
    }

    const pushPayload = JSON.stringify({
      title,
      body,
      icon: "/css-logo.png",
      url: isForAdmin ? "/admin" : "/history",
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (subRecord: any) => {
        try {
          await webpush.sendNotification(subRecord.subscription, pushPayload);
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", subRecord.id);
          }
          throw err;
        }
      })
    );

    const sentCount = results.filter((r) => r.status === "fulfilled").length;
    const failedCount = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      message: "Push notifications dispatch finished",
      sent: sentCount,
      failed: failedCount,
    });
  } catch (error: any) {
    console.error("Webhook push send error:", error);
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 });
  }
}
 
