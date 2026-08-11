/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { sendRegistrationEmailById } from "@/lib/mailer";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { registrationId } = body as { registrationId?: string };

    if (!registrationId || typeof registrationId !== "string") {
      return NextResponse.json(
        { error: "registrationId is required" },
        { status: 400 }
      );
    }

    await sendRegistrationEmailById(registrationId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/email/send-registration] error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengirim email pendaftaran" },
      { status: 500 }
    );
  }
};
