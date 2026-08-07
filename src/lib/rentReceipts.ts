export function isManualVerificationPayment(method?: string | null) {
  return /manual verification/i.test(method || "");
}

export function isGatewayPayment(method?: string | null) {
  return /razorpay|stripe|paypal/i.test(method || "");
}

export function billNotesInclude(notes: string | null | undefined, token: string) {
  return (notes || "").toLowerCase().includes(token.toLowerCase());
}

export type RentBillReceiptState =
  | "pending_verification"
  | "verified_awaiting_receipt"
  | "receipt_ready";

export function getRentBillReceiptState(bill: {
  status?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  receiptUrl?: string | null;
  property?: { autoReceiptEnabled?: boolean | null } | null;
  autoReceiptEnabled?: boolean | null;
}): RentBillReceiptState {
  const status = (bill.status || "").trim().toLowerCase();
  const method = bill.paymentMethod || "";
  const notes = bill.notes || "";
  const autoReceipt =
    bill.property?.autoReceiptEnabled ?? bill.autoReceiptEnabled ?? true;

  if (bill.receiptUrl) {
    return "receipt_ready";
  }

  if (billNotesInclude(notes, "receipt_issued")) {
    return "receipt_ready";
  }

  if (isGatewayPayment(method) && (status === "paid" || status === "success")) {
    return autoReceipt ? "receipt_ready" : "verified_awaiting_receipt";
  }

  if (isManualVerificationPayment(method)) {
    if (status === "pending" || billNotesInclude(notes, "awaiting_landlord_verification")) {
      return "pending_verification";
    }
    if (status === "paid" && billNotesInclude(notes, "landlord_verified")) {
      return autoReceipt ? "receipt_ready" : "verified_awaiting_receipt";
    }
    return "pending_verification";
  }

  if (status === "paid" || status === "success") {
    return autoReceipt ? "receipt_ready" : "verified_awaiting_receipt";
  }

  return "pending_verification";
}

/** Tenant can download a receipt only when one has been issued or uploaded. */
export function isTenantRentReceiptDownloadable(bill: {
  status?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  receiptUrl?: string | null;
  property?: { autoReceiptEnabled?: boolean | null } | null;
  autoReceiptEnabled?: boolean | null;
}) {
  return getRentBillReceiptState(bill) === "receipt_ready";
}

export function appendBillNote(existing: string | null | undefined, token: string) {
  const current = (existing || "").trim();
  if (!current) return token;
  if (billNotesInclude(current, token)) return current;
  return `${current};${token}`;
}

export type TenantMonthRentStatus = "due" | "pending_verification" | "paid";

export function getBillRentMonthLabel(bill: {
  title?: string | null;
  paidDate?: Date | string | null;
  createdAt?: Date | string | null;
}): string | null {
  const title = bill.title || "";
  const titleMatch = title.match(/—\s*([A-Za-z]+\s+\d{4})\s*—/);
  if (titleMatch?.[1]) return titleMatch[1];

  const dateSource = bill.paidDate || bill.createdAt;
  if (!dateSource) return null;
  const d = new Date(dateSource);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function isRentBill(bill: { category?: string | null; title?: string | null }) {
  const category = (bill.category || "").toLowerCase();
  if (category === "rent") return true;
  return /rent/i.test(bill.title || "");
}

/** Whether the tenant already paid (or submitted) rent for a given calendar month. */
export function getTenantMonthRentStatus(
  bills:
    | Array<{
        title?: string | null;
        status?: string | null;
        category?: string | null;
        paidDate?: Date | string | null;
        createdAt?: Date | string | null;
        notes?: string | null;
      }>
    | null
    | undefined,
  monthLabel: string
): TenantMonthRentStatus {
  if (!Array.isArray(bills) || bills.length === 0) return "due";

  let hasPending = false;

  for (const bill of bills) {
    if (!isRentBill(bill)) continue;
    const billMonth = getBillRentMonthLabel(bill);
    if (billMonth !== monthLabel) continue;

    const status = (bill.status || "").trim().toLowerCase();
    if (status === "cancelled" || status === "canceled") continue;

    if (status === "paid" || status === "success") {
      return "paid";
    }

    if (
      status === "pending" ||
      billNotesInclude(bill.notes, "awaiting_landlord_verification")
    ) {
      hasPending = true;
    }
  }

  return hasPending ? "pending_verification" : "due";
}

export interface RentReceiptTemplateData {
  brandName: string;
  tagline?: string | null;
  address?: string | null;
  taxId?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  footerNote?: string | null;
  accentColor?: string | null;
  signatureId?: string | null;
}

export interface RentReceiptSignatureData {
  id: string;
  label: string;
  signerName?: string | null;
  imageData: string;
}

export const DEFAULT_RENT_RECEIPT_TEMPLATE: RentReceiptTemplateData = {
  brandName: "Property Management",
  tagline: "House Rent Receipt",
  address: "",
  taxId: "",
  contactEmail: "",
  contactPhone: "",
  footerNote: "This receipt acknowledges rent received for the stated billing period.",
  accentColor: "#1e3a5f",
  signatureId: null,
};

export function resolveSignatureForReceipt(
  signatures: RentReceiptSignatureData[],
  signatureId?: string | null
) {
  if (!signatureId) return undefined;
  const sig = signatures.find((s) => s.id === signatureId);
  if (!sig) return undefined;
  return {
    imageData: sig.imageData,
    label: sig.label,
    signerName: sig.signerName,
  };
}
