import { NextResponse } from "next/server";
import { isSmtpConfigured, sendPasswordResetEmail } from "@/lib/email/smtp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const GENERIC_SUCCESS =
  "If an account exists for this email, we sent a password reset link. Please check your inbox.";

function resolveOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

// POST /api/auth/forgot-password — { email }
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!isSmtpConfigured()) {
      console.error(
        "[forgot-password] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)."
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Email service is not configured. Please contact support@anshapps.com.",
        },
        { status: 503 }
      );
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      console.error(
        "[forgot-password] SUPABASE_SERVICE_ROLE_KEY is missing on the server."
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Password reset is temporarily unavailable. Please contact support@anshapps.com.",
        },
        { status: 503 }
      );
    }

    const origin = resolveOrigin(request);
    const redirectTo = `${origin}/auth/callback?next=/reset-password`;

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error) {
      // Avoid account enumeration — still return success for unknown users
      const message = error.message?.toLowerCase() || "";
      if (
        message.includes("user not found") ||
        message.includes("not found") ||
        message.includes("no user")
      ) {
        return NextResponse.json({ success: true, message: GENERIC_SUCCESS });
      }

      console.error("[forgot-password] generateLink error:", error.message);
      return NextResponse.json(
        { success: false, error: "Could not create reset link. Please try again." },
        { status: 500 }
      );
    }

    const hashedToken = data.properties?.hashed_token;
    const resetLink = hashedToken
      ? `${origin}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`
      : data.properties?.action_link;

    if (!resetLink || typeof resetLink !== "string") {
      console.error("[forgot-password] generateLink returned no action_link");
      return NextResponse.json(
        { success: false, error: "Could not create reset link. Please try again." },
        { status: 500 }
      );
    }

    const mailResult = await sendPasswordResetEmail(email, resetLink);
    if (!mailResult.ok) {
      console.error("[forgot-password] SMTP failed:", mailResult.error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not send reset email right now. Please try again in a few minutes.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: GENERIC_SUCCESS });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[forgot-password] unexpected error:", message);
    return NextResponse.json(
      { success: false, error: "Could not send reset email. Please try again." },
      { status: 500 }
    );
  }
}
