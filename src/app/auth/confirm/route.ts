import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /auth/confirm?token_hash=...&type=recovery
// Handles Supabase email links (password recovery, email confirm) with token_hash
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error) {
      console.error("Auth confirm verifyOtp error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`);
    }

    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/reset-password`);
    }

    const destination = next && next.startsWith("/") ? next : "/dashboard";
    return NextResponse.redirect(`${origin}${destination}`);
  } catch (err) {
    console.error("Auth confirm error:", err);
    return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`);
  }
}
