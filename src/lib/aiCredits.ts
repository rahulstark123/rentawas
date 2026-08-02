/** AI credit allotment by workspace subscription plan. */

export const AI_CREDIT_LIMITS: Record<string, number> = {
  trial: 20,
  free: 20,
  starter: 50,
  pro: 200,
  pro_plus: 500,
};

export function getPlanCreditLimit(plan: string | null | undefined): number {
  if (!plan) return AI_CREDIT_LIMITS.free;
  return AI_CREDIT_LIMITS[plan] ?? AI_CREDIT_LIMITS.free;
}
