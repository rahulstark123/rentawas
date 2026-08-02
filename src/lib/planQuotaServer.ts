import { prisma } from "@/lib/prisma";
import { checkPlanQuota, type QuotaCheckResult } from "@/lib/planLimits";

const TRIAL_DURATION_DAYS = 14;

function computeTrialDaysLeft(
  trialStartedAt: Date | null | undefined,
  createdAt?: Date | null
): number {
  const start = trialStartedAt || createdAt;
  if (!start) return TRIAL_DURATION_DAYS;
  const elapsedMs = Date.now() - new Date(start).getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return Math.max(0, TRIAL_DURATION_DAYS - elapsedDays);
}

export async function assertWorkspaceQuota(opts: {
  workspaceId: number;
  action: "property" | "unit" | "mutate";
  unitsToAdd?: number;
}): Promise<QuotaCheckResult> {
  const workspace = await prisma.workspace.findUnique({
    where: { wid: opts.workspaceId },
    select: {
      plan: true,
      trialStartedAt: true,
      createdAt: true,
    },
  });

  if (!workspace) {
    return { ok: false, code: "PLAN_LOCKED", message: "Workspace not found." };
  }

  let plan = workspace.plan || "trial";
  const trialDaysLeft = computeTrialDaysLeft(workspace.trialStartedAt, workspace.createdAt);
  const isTrialActive = plan === "trial" && trialDaysLeft > 0;

  if (plan === "trial" && !isTrialActive) {
    plan = "free";
  }

  const [unitsCount, propertiesCount] = await Promise.all([
    prisma.unit.count({
      where: {
        OR: [
          { workspaceId: opts.workspaceId },
          { property: { workspaceId: opts.workspaceId } },
        ],
      },
    }),
    prisma.property.count({
      where: { workspaceId: opts.workspaceId },
    }),
  ]);

  return checkPlanQuota({
    plan,
    isTrialActive,
    unitsCount,
    propertiesCount,
    action: opts.action,
    unitsToAdd: opts.unitsToAdd,
  });
}
