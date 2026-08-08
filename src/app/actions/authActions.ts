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
  portfolioScale?: string;
}

export async function createUserProfileAndWorkspace(params: SignUpParams) {
  try {
    const { userId, email, fullName, phone, role, workspaceName, currency, portfolioScale } = params;
    const prismaRole = role === "tenant" ? Role.TENANT : Role.OWNER;

    // 1. Create or upsert Profile (Mapped 1:1 with Supabase Auth ID)
    const profile = await prisma.profile.upsert({
      where: { id: userId },
      update: {
        fullName,
        phone,
        role: prismaRole,
      },
      create: {
        id: userId,
        email,
        fullName,
        phone: phone || null,
        role: prismaRole,
      },
    });

    // 2. Create workspace only for new owner accounts (avoid duplicates on Google re-login)
    let workspace = null;
    if (role === "owner") {
      workspace = await prisma.workspace.findFirst({
        where: { ownerId: profile.id },
        orderBy: { wid: "asc" },
      });

      if (!workspace) {
        workspace = await prisma.workspace.create({
          data: {
            name: workspaceName || `${fullName}'s Workspace`,
            currency: currency || "USD ($)",
            plan: "trial",
            trialStartedAt: new Date(),
            portfolioScale: portfolioScale || null,
            ownerId: profile.id,
            isOnboarded: false,
          },
        });
      } else if (workspace.plan === "free" && !workspace.trialStartedAt) {
        // Recover workspaces that were created without a trial window
        workspace = await prisma.workspace.update({
          where: { wid: workspace.wid },
          data: {
            plan: "trial",
            trialStartedAt: new Date(),
          },
        });
      }
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
