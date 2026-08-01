"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export interface SignUpParams {
  userId: string;       // Supabase auth.users.id
  email: string;
  fullName: string;
  phone?: string;
  role: "owner" | "tenant";
  workspaceName?: string;
  currency?: string;
}

export async function createUserProfileAndWorkspace(params: SignUpParams) {
  try {
    const { userId, email, fullName, phone, role, workspaceName, currency } = params;

    // 1. Create or upsert Profile (Mapped 1:1 with Supabase Auth ID)
    const profile = await prisma.profile.upsert({
      where: { id: userId },
      update: {
        fullName,
        phone,
        role: role === "tenant" ? Role.TENANT : Role.OWNER,
      },
      create: {
        id: userId,
        email,
        fullName,
        phone: phone || null,
        role: role === "tenant" ? Role.TENANT : Role.OWNER,
      },
    });

    // 2. Create Workspace with auto-incrementing integer wid (1, 2, 3...) if Landlord Owner
    let workspace = null;
    if (role === "owner") {
      workspace = await prisma.workspace.create({
        data: {
          name: workspaceName || `${fullName}'s Workspace`,
          currency: currency || "USD ($)",
          plan: "trial",
          trialStartedAt: new Date(),
          ownerId: profile.id,
        },
      });
    }

    return {
      success: true,
      profile,
      workspace,
      wid: workspace ? workspace.wid : null,
    };
  } catch (error: any) {
    console.error("Error creating profile or workspace:", error);
    return {
      success: false,
      error: error?.message || "Failed to initialize user workspace.",
    };
  }
}
