import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createUserProfileAndWorkspace } from "@/app/actions/authActions";

// GET /auth/callback - OAuth Callback Handler for Supabase Google Sign-In
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const roleHint = searchParams.get("role");
  const nextParam = searchParams.get("next");

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        const userId = data.user.id;
        const email = data.user.email || "";
        const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split("@")[0];
        const role = data.user.user_metadata?.role || roleHint || "owner";

        await createUserProfileAndWorkspace({
          userId,
          email,
          fullName,
          role,
        });

        const defaultNext =
          role === "tenant" ? "/tenant/dashboard" : "/dashboard";
        const next = nextParam || defaultNext;

        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("OAuth Exchange Callback Error:", err);
    }
  }

  const fallbackNext =
    roleHint === "tenant" ? "/tenant/dashboard" : nextParam || "/dashboard";
  return NextResponse.redirect(`${origin}${fallbackNext}`);
}
