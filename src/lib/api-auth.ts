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

  return profile;
}
