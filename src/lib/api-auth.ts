import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/generated/prisma/client";

export async function getAuthenticatedProfile(
  request: Request
): Promise<Profile | null> {
  const authHeader = request.headers.get("authorization");
  let userId: string | null = null;
  let userEmail: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data } = await supabase.auth.getUser(token);
    if (data.user) {
      userId = data.user.id;
      userEmail = data.user.email ?? null;
    }
  }

  if (!userId) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      userId = data.user.id;
      userEmail = data.user.email ?? null;
    }
  }

  const emailParam = new URL(request.url).searchParams.get("email");
  if (!userEmail && emailParam) {
    userEmail = emailParam;
  }

  if (!userId && !userEmail) {
    return null;
  }

  const profile = await prisma.profile.findFirst({
    where: userId
      ? { id: userId }
      : { email: { equals: userEmail!, mode: "insensitive" } },
  });

  if (!profile && userEmail) {
    return prisma.profile.findFirst({
      where: { email: { equals: userEmail, mode: "insensitive" } },
    });
  }

  return profile;
}

/** Resolves profile from Bearer token, then userId/email query/body (mobile client fallback). */
export async function resolveRequestProfile(
  request: Request,
  body?: Record<string, unknown> | null
): Promise<Profile | null> {
  const fromAuth = await getAuthenticatedProfile(request);
  if (fromAuth) return fromAuth;

  const { searchParams } = new URL(request.url);
  const userId =
    searchParams.get("userId") ||
    (body?.userId ? String(body.userId).trim() : null);
  const email =
    searchParams.get("email") ||
    (body?.email ? String(body.email).trim() : null);

  if (userId) {
    const byId = await prisma.profile.findUnique({ where: { id: userId } });
    if (byId) return byId;
  }

  if (email) {
    return prisma.profile.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
  }

  return null;
}
