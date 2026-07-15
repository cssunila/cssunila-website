/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ message: "Invalid subscription" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("subscription->>endpoint", subscription.endpoint)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("push_subscriptions")
        .update({ subscription, created_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      const { error: insertError } = await supabase
        .from("push_subscriptions")
        .insert({
          user_id: user.id,
          subscription,
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ message: "Subscription saved successfully" });
  } catch (error: any) {
    console.error("Push subscription save error:", error);
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}
  
