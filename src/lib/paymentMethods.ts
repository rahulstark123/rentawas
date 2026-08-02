/** Payment channels that appear on Settings → Integrations (connected = active). */

export type WorkspacePaymentFlags = {
  stripeConnected?: boolean | null;
  razorpayConnected?: boolean | null;
  paypalConnected?: boolean | null;
  gpayConnected?: boolean | null;
  phonepeConnected?: boolean | null;
  paytmConnected?: boolean | null;
  upiConnected?: boolean | null;

  stripePublishableKey?: string | null;
  razorpayKeyId?: string | null;
  paypalClientId?: string | null;

  upiId?: string | null;
  upiPhoneNumber?: string | null;
  upiQrCodeUrl?: string | null;

  gpayUpiId?: string | null;
  gpayPhoneNumber?: string | null;
  gpayQrCodeUrl?: string | null;

  phonepeUpiId?: string | null;
  phonepePhoneNumber?: string | null;
  phonepeQrCodeUrl?: string | null;

  paytmUpiId?: string | null;
  paytmPhoneNumber?: string | null;
  paytmQrCodeUrl?: string | null;
};

export type ActivePaymentMethod = {
  id: string;
  name: string;
  connectedKey: keyof WorkspacePaymentFlags;
};

/** Catalog of payment methods */
export const INTEGRATION_PAYMENT_METHODS: ActivePaymentMethod[] = [
  { id: "stripe", name: "Stripe Connect & ACH Direct", connectedKey: "stripeConnected" },
  { id: "razorpay", name: "Razorpay & Merchant Gateway", connectedKey: "razorpayConnected" },
  { id: "paypal", name: "PayPal & Venmo Commerce", connectedKey: "paypalConnected" },
  { id: "gpay", name: "Google Pay (GPay) Direct UPI", connectedKey: "gpayConnected" },
  { id: "phonepe", name: "PhonePe Business & UPI", connectedKey: "phonepeConnected" },
  { id: "paytm", name: "Paytm Wallet & UPI QR", connectedKey: "paytmConnected" },
];

export function isMethodActive(
  methodId: string,
  w: Record<string, any> | null | undefined
): boolean {
  if (!w) return false;
  if (methodId === "stripe") {
    return Boolean(w.stripeConnected || w.stripePublishableKey || w.stripeSecretKey);
  }
  if (methodId === "razorpay") {
    return Boolean(w.razorpayConnected || w.razorpayKeyId || w.razorpayKeySecret);
  }
  if (methodId === "paypal") {
    return Boolean(w.paypalConnected || w.paypalClientId);
  }
  if (methodId === "gpay") {
    return Boolean(
      w.gpayConnected ||
      w.gpayUpiId ||
      w.gpayPhoneNumber ||
      w.gpayQrCodeUrl ||
      w.upiId ||
      w.upiPhoneNumber ||
      w.upiQrCodeUrl
    );
  }
  if (methodId === "phonepe") {
    return Boolean(
      w.phonepeConnected ||
      w.phonepeUpiId ||
      w.phonepePhoneNumber ||
      w.phonepeQrCodeUrl ||
      w.upiId ||
      w.upiPhoneNumber ||
      w.upiQrCodeUrl
    );
  }
  if (methodId === "paytm") {
    return Boolean(
      w.paytmConnected ||
      w.paytmUpiId ||
      w.paytmPhoneNumber ||
      w.paytmQrCodeUrl ||
      w.upiId ||
      w.upiPhoneNumber ||
      w.upiQrCodeUrl
    );
  }
  if (methodId === "upi") {
    return Boolean(
      w.upiConnected ||
      w.upiId ||
      w.upiPhoneNumber ||
      w.upiQrCodeUrl ||
      w.gpayUpiId ||
      w.phonepeUpiId ||
      w.paytmUpiId
    );
  }
  return false;
}

export function getActivePaymentMethods(
  workspace: Record<string, any> | null | undefined
): ActivePaymentMethod[] {
  if (!workspace) return [];
  return INTEGRATION_PAYMENT_METHODS.filter((m) => isMethodActive(m.id, workspace));
}

/** Same gate as tenant Pay Rent portal — checks keys, VPAs, QR codes & boolean flags. */
export function hasActiveRentPaymentChannels(
  workspace: Record<string, any> | null | undefined
): boolean {
  if (!workspace) return false;
  return (
    getActivePaymentMethods(workspace).length > 0 ||
    isMethodActive("upi", workspace) ||
    isMethodActive("razorpay", workspace) ||
    isMethodActive("stripe", workspace) ||
    isMethodActive("paypal", workspace) ||
    isMethodActive("gpay", workspace) ||
    isMethodActive("phonepe", workspace) ||
    isMethodActive("paytm", workspace)
  );
}
