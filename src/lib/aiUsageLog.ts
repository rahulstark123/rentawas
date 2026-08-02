import { prisma } from "@/lib/prisma";

export type AiUsageFeature =
  | "Property Operational Intelligence"
  | "Unit Telemetry Analysis"
  | "Marketplace Listing Advice"
  | "Resident Behavioral Health Check";

/** Persist a real RentAwas Buddy query for the AI Control Center history table. */
export async function recordAiUsageLog(opts: {
  workspaceId: number;
  feature: AiUsageFeature | string;
  targetItem: string;
  question?: string | null;
  creditsCost?: number;
}) {
  const question = (opts.question?.trim() || "Summarise").slice(0, 500);
  try {
    await prisma.aiUsageLog.create({
      data: {
        workspaceId: opts.workspaceId,
        feature: opts.feature,
        targetItem: opts.targetItem.slice(0, 200),
        question,
        creditsCost: opts.creditsCost ?? 2,
        status: "Completed",
      },
    });
  } catch (err) {
    console.warn("Failed to record AI usage log:", err);
  }
}
