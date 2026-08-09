import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createUserProfileAndWorkspace } from "@/app/actions/authActions";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

function redirectWithCookies(origin: string, path: string, sessionCookies: CookieToSet[]) {
  const response = NextResponse.redirect(`${origin}${path}`);
  sessionCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

// GET /auth/callback — OAuth + PKCE recovery (code exchange)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const roleHint = searchParams.get("role");
  const nextParam = searchParams.get("next");
  const isRecovery = nextParam === "/reset-password";

  if (!code) {
    const fallbackNext =
      roleHint === "tenant" ? "/tenant/dashboard" : nextParam || "/login";
    return NextResponse.redirect(`${origin}${fallbackNext}`);
  }

  const cookieStore = await cookies();
  const sessionCookies: CookieToSet[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            sessionCookies.push({ name, value, options });
          });
        },
      },
    }
  );

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.user) {
      console.error("Auth callback exchange failed:", error?.message);
      return redirectWithCookies(
        origin,
        isRecovery ? "/reset-password?error=invalid_link" : "/login?error=auth_callback_failed",
        sessionCookies
      );
    }

    if (isRecovery) {
      return redirectWithCookies(origin, "/reset-password", sessionCookies);
    }

    const userId = data.user.id;
    const email = data.user.email || "";
    const fullName =
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.fullName ||
      data.user.user_metadata?.name ||
      email.split("@")[0];
    const role = data.user.user_metadata?.role || roleHint || "owner";

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

    const response = NextResponse.redirect(redirectUrl.toString());
    sessionCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  } catch (err) {
    console.error("Auth callback error:", err);
    return redirectWithCookies(
      origin,
      isRecovery ? "/reset-password?error=invalid_link" : "/login?error=auth_callback_failed",
      sessionCookies
    );
  }
}
