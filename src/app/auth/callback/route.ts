import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createUserProfileAndWorkspace } from "@/app/actions/authActions";

// GET /auth/callback - OAuth Callback Handler for Supabase Google Sign-In
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const roleHint = searchParams.get("role");
  const nextParam = searchParams.get("next");

  if (!code) {
    const fallbackNext =
      roleHint === "tenant" ? "/tenant/dashboard" : nextParam || "/login";
    return NextResponse.redirect(`${origin}${fallbackNext}`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.user) {
      console.error("OAuth exchange failed:", error?.message);
      return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
    }

    // Password recovery — session only; do not run signup/workspace provisioning
    if (nextParam === "/reset-password") {
      return NextResponse.redirect(`${origin}/reset-password`);
    }

    const userId = data.user.id;
    const email = data.user.email || "";
    const fullName =
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.fullName ||
      data.user.user_metadata?.name ||
      email.split("@")[0];
    const role =
      data.user.user_metadata?.role || roleHint || "owner";

    const result = await createUserProfileAndWorkspace({
      userId,
      email,
      fullName,
      role: role === "tenant" ? "tenant" : "owner",
    });

    const workspace = result.workspace;
    const isOwner = role !== "tenant";
    const needsOnboarding = isOwner && workspace && !workspace.isOnboarded;

    let next: string;
    if (role === "tenant") {
      next = nextParam || "/tenant/dashboard";
    } else if (needsOnboarding) {
      next = "/onboarding";
    } else {
      next = nextParam || "/dashboard";
    }

    const redirectUrl = new URL(next, origin);
    if (result.wid) {
      redirectUrl.searchParams.set("wid", String(result.wid));
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("OAuth Exchange Callback Error:", err);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }
}
