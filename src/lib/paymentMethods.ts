/** Payment channels that appear on Settings → Integrations (connected = active). */

export type WorkspacePaymentFlags = {
  stripeConnected?: boolean | null;
  razorpayConnected?: boolean | null;
  paypalConnected?: boolean | null;
  gpayConnected?: boolean | null;
  phonepeConnected?: boolean | null;
  paytmConnected?: boolean | null;
  upiConnected?: boolean | null;
};

export type ActivePaymentMethod = {
  id: string;
  name: string;
  connectedKey: keyof WorkspacePaymentFlags;
};

/** Same catalog as landlord Integrations page — order matches settings. */
export const INTEGRATION_PAYMENT_METHODS: ActivePaymentMethod[] = [
  { id: "stripe", name: "Stripe Connect & ACH Direct", connectedKey: "stripeConnected" },
  { id: "razorpay", name: "Razorpay & Merchant Gateway", connectedKey: "razorpayConnected" },
  { id: "paypal", name: "PayPal & Venmo Commerce", connectedKey: "paypalConnected" },
  { id: "gpay", name: "Google Pay (GPay) Direct UPI", connectedKey: "gpayConnected" },
  { id: "phonepe", name: "PhonePe Business & UPI", connectedKey: "phonepeConnected" },
  { id: "paytm", name: "Paytm Wallet & UPI QR", connectedKey: "paytmConnected" },
];

export function getActivePaymentMethods(
  workspace: WorkspacePaymentFlags | null | undefined
): ActivePaymentMethod[] {
  if (!workspace) return [];
  return INTEGRATION_PAYMENT_METHODS.filter((m) => Boolean(workspace[m.connectedKey]));
}
