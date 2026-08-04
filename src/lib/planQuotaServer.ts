import { prisma } from "@/lib/prisma";
import {
  checkPlanQuota,
  canAccessMessages,
  MESSAGES_UPGRADE_MESSAGE,
  type QuotaCheckResult,
} from "@/lib/planLimits";

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

async function resolveWorkspacePlan(workspaceId: number): Promise<{
  plan: string;
  isTrialActive: boolean;
} | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { wid: workspaceId },
    select: {
      plan: true,
      trialStartedAt: true,
      createdAt: true,
    },
  });
  if (!workspace) return null;

  let plan = workspace.plan || "trial";
  const trialDaysLeft = computeTrialDaysLeft(workspace.trialStartedAt, workspace.createdAt);
  const isTrialActive = plan === "trial" && trialDaysLeft > 0;
  if (plan === "trial" && !isTrialActive) {
    plan = "free";
  }
  return { plan, isTrialActive };
}

/** Gate chat APIs — Pro / Pro Plus (or active trial) only. */
export async function assertWorkspaceMessagesAccess(
  workspaceId: number
): Promise<QuotaCheckResult> {
  const resolved = await resolveWorkspacePlan(workspaceId);
  if (!resolved) {
    return { ok: false, code: "PLAN_LOCKED", message: "Workspace not found." };
  }
  if (!canAccessMessages(resolved)) {
    return {
      ok: false,
      code: "MESSAGES_LOCKED",
      message: MESSAGES_UPGRADE_MESSAGE,
    };
  }
  return { ok: true };
}

export async function assertWorkspaceQuota(opts: {
  workspaceId: number;
  action: "property" | "unit" | "mutate";
  unitsToAdd?: number;
}): Promise<QuotaCheckResult> {
  const resolved = await resolveWorkspacePlan(opts.workspaceId);
  if (!resolved) {
    return { ok: false, code: "PLAN_LOCKED", message: "Workspace not found." };
  }
  const { plan, isTrialActive } = resolved;

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
