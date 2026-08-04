import { getPlanCreditLimit } from "@/lib/aiCredits";

export type PlanKey = "trial" | "free" | "starter" | "pro" | "pro_plus";

export type PlanLimits = {
  unitsCap: number; // Infinity = unlimited
  propertiesCap: number; // Infinity = unlimited
  aiCredits: number;
  canMutate: boolean; // false = free view-only
  /** In-app Messages (DMs + groups) — Pro / Pro Plus only (trial unlocked). */
  canUseMessages: boolean;
};

const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  trial: {
    unitsCap: Number.POSITIVE_INFINITY,
    propertiesCap: Number.POSITIVE_INFINITY,
    aiCredits: getPlanCreditLimit("trial"),
    canMutate: true,
    canUseMessages: true,
  },
  free: {
    unitsCap: 0,
    propertiesCap: 0,
    aiCredits: getPlanCreditLimit("free"),
    canMutate: false,
    canUseMessages: false,
  },
  starter: {
    unitsCap: 15,
    propertiesCap: 3,
    aiCredits: getPlanCreditLimit("starter"),
    canMutate: true,
    canUseMessages: false,
  },
  pro: {
    unitsCap: 75,
    propertiesCap: Number.POSITIVE_INFINITY,
    aiCredits: getPlanCreditLimit("pro"),
    canMutate: true,
    canUseMessages: true,
  },
  pro_plus: {
    unitsCap: Number.POSITIVE_INFINITY,
    propertiesCap: Number.POSITIVE_INFINITY,
    aiCredits: getPlanCreditLimit("pro_plus"),
    canMutate: true,
    canUseMessages: true,
  },
};

export function normalizePlanKey(plan: string | null | undefined): PlanKey {
  const key = String(plan || "free").toLowerCase();
  if (key === "enterprise") return "pro_plus";
  if (key === "trial" || key === "free" || key === "starter" || key === "pro" || key === "pro_plus") {
    return key;
  }
  return "free";
}

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[normalizePlanKey(plan)];
}

export function resolveEffectivePlan(opts: {
  plan: string | null | undefined;
  isTrialActive?: boolean;
}): PlanKey {
  if (opts.isTrialActive) return "trial";
  return normalizePlanKey(opts.plan);
}

/** Messages is Pro / Pro Plus only; active trial still has full access. */
export function canAccessMessages(opts: {
  plan: string | null | undefined;
  isTrialActive?: boolean;
}): boolean {
  const effective = resolveEffectivePlan(opts);
  return getPlanLimits(effective).canUseMessages;
}

export const MESSAGES_UPGRADE_MESSAGE =
  "In-app Messages (tenant DMs & group channels) is available on Pro and Pro Plus. Upgrade to unlock messaging.";

export type QuotaCheckResult =
  | { ok: true }
  | { ok: false; code: "PLAN_LOCKED" | "UNITS_CAP" | "PROPERTIES_CAP" | "MESSAGES_LOCKED"; message: string };

/** Server/client shared gate for creating properties or units. */
export function checkPlanQuota(opts: {
  plan: string | null | undefined;
  isTrialActive?: boolean;
  unitsCount: number;
  propertiesCount: number;
  action: "property" | "unit" | "mutate";
  /** Extra units being added in one request (bulk create on property). */
  unitsToAdd?: number;
}): QuotaCheckResult {
  const effectivePlan = resolveEffectivePlan({
    plan: opts.plan,
    isTrialActive: opts.isTrialActive,
  });
  const limits = getPlanLimits(effectivePlan);

  if (!limits.canMutate) {
    return {
      ok: false,
      code: "PLAN_LOCKED",
      message:
        "Your Free plan is view-only. Upgrade to Starter, Pro, or Pro Plus to add properties, units, and tenants.",
    };
  }

  if (opts.action === "property") {
    if (Number.isFinite(limits.propertiesCap) && opts.propertiesCount >= limits.propertiesCap) {
      return {
        ok: false,
        code: "PROPERTIES_CAP",
        message: `Your plan allows up to ${limits.propertiesCap} properties. Upgrade to add more.`,
      };
    }
  }

  const unitsToAdd =
    opts.unitsToAdd ?? (opts.action === "unit" ? 1 : 0);

  if (unitsToAdd > 0 && Number.isFinite(limits.unitsCap)) {
    if (opts.unitsCount + unitsToAdd > limits.unitsCap) {
      return {
        ok: false,
        code: "UNITS_CAP",
        message: `Your plan allows up to ${limits.unitsCap} units. You have ${opts.unitsCount} now${
          unitsToAdd > 1 ? ` and this action would add ${unitsToAdd}` : ""
        }. Upgrade to add more.`,
      };
    }
  }

  return { ok: true };
}
