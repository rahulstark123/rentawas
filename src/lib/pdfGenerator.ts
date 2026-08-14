// Printable PDF Document Generator for Tax Invoices and Payment Receipts

export interface BillingDocRecord {
  invoiceNumber: string;
  receiptNumber?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  planName: string;
  amount: string;
  billingTerm?: string;
  paymentType?: string;
  paymentMethod?: string;
  paymentId?: string;
  status?: string;
}

// Generate Official Tax Invoice Document
export function generateTaxInvoiceHtml(record: BillingDocRecord): string {
  const invNum = record.invoiceNumber || "INV-2026-001";
  const rawDate = record.date ? new Date(record.date) : new Date();
  const dateStr = record.date
    ? new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const isAiRecharge = record.planName?.toLowerCase().includes("ai") || record.billingTerm?.toLowerCase().includes("ai");
  const isYearly = record.billingTerm?.toLowerCase().includes("year") || record.planName?.toLowerCase().includes("year") || record.billingTerm?.toLowerCase().includes("annual");

  // Determine Billing Cycle column text
  const billingCycleColumnText = isAiRecharge
    ? "AI Credit Recharge"
    : isYearly
    ? "Yearly Subscription (Auto-Pay)"
    : "Monthly Subscription (Auto-Pay)";

  // Calculate billing cycle start and end date (Monthly = 30 Days, Yearly = 1 Year)
  const cycleStart = record.startDate || dateStr;
  const cycleEnd = record.endDate || (() => {
    const end = new Date(rawDate.getTime());
    if (isYearly) {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setDate(end.getDate() + 30);
    }
    return end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  })();

  // Clean plan name string (avoid duplicate "Subscription" word)
  let cleanPlan = (record.planName || "Pro Plan").trim();
  cleanPlan = cleanPlan.replace(/\bSubscription\b/gi, "").trim();
  const displayTitle = isAiRecharge
    ? cleanPlan
    : cleanPlan.toLowerCase().includes("plan")
    ? `${cleanPlan} Subscription`
    : `${cleanPlan} Plan Subscription`;

  const amt = record.amount || "₹1,299.00";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tax Invoice - ${invNum}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 40px; background: #fff; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px; }
    
    .company-header { text-align: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 20px; margin-bottom: 24px; }
    .company-name { font-size: 26px; font-weight: 900; color: #0B132B; margin: 0; letter-spacing: -0.5px; }
    .product-name { font-size: 16px; font-weight: 800; color: #FF6B00; margin: 2px 0 6px 0; }
    .tag-line { font-size: 12px; color: #475569; font-weight: 600; margin: 2px 0; }
    .udyam-no { font-size: 12px; color: #334155; font-weight: 700; margin: 2px 0; }
    .support-info { font-size: 11px; color: #64748B; font-weight: 500; margin: 4px 0 0 0; }

    .doc-meta-row { display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .doc-title { font-size: 18px; font-weight: 800; color: #1E293B; }
    .doc-num { font-size: 13px; color: #FF6B00; font-weight: 800; margin-top: 2px; }

    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; font-size: 13px; }
    .meta-box h4 { font-size: 11px; text-transform: uppercase; color: #64748B; margin: 0 0 6px 0; letter-spacing: 0.5px; }
    .meta-box p { margin: 2px 0; font-weight: 600; color: #1E293B; }

    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
    th { background: #F8FAFC; text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; color: #64748B; border-bottom: 1px solid #E2E8F0; }
    td { padding: 16px; border-bottom: 1px solid #F1F5F9; font-weight: 500; }

    .totals { width: 300px; margin-left: auto; font-size: 13px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; color: #475569; }
    .totals-row.grand { border-top: 2px solid #0F172A; font-weight: 800; font-size: 16px; color: #0F172A; padding-top: 10px; margin-top: 6px; }

    .company-footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; }
    .footer-tagline { font-size: 12px; font-weight: 800; color: #0B132B; margin-bottom: 4px; }
    .footer-tagline span { color: #64748B; font-weight: 600; font-style: italic; }
    .footer-text { font-size: 11px; color: #64748B; margin: 0; }
    .badge { display: inline-block; background: #ECFDF5; color: #047857; font-weight: 800; font-size: 10px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="invoice-card">
    
    <!-- ANSH Apps Header -->
    <div class="company-header">
      <h1 class="company-name">ANSH Apps</h1>
      <div class="product-name">Rent Awas</div>
      <div style="font-size: 13px; font-weight: 700; color: #64748B; margin-top: 1px; margin-bottom: 4px;">rentawas.com</div>
      <div class="udyam-no">Udyam Registration Number: UDYAM-BR-23-0127857 | GSTIN: 10DIUPR1358M1ZP</div>
      <div class="support-info">Support: support.rentawas@anshapps.com | Website: rentawas.com</div>
      <div class="support-info" style="margin-top: 2px;">For billing support contact support.rentawas@anshapps.com</div>
    </div>

    <div class="doc-meta-row">
      <div>
        <div class="doc-title">OFFICIAL TAX INVOICE</div>
        <div class="doc-num">Invoice #${invNum}</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">${record.status || "PAID"}</span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h4>Billed To</h4>
        <p><strong>Alexander Wright</strong></p>
        <p>Regency Property Management LLC</p>
        <p>alexander@regencymanagement.com</p>
      </div>
      <div class="meta-box" style="text-align: right;">
        <h4>Invoice Details</h4>
        <p>Invoice Date: <strong>${dateStr}</strong></p>
        <p>Payment Method: <strong>${record.paymentMethod || "Razorpay Auto-Debit"}</strong></p>
        <p>Transaction ID: <strong>${record.paymentId || "pay_P9283401"}</strong></p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th>Billing Cycle</th>
          <th>Qty</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Rent Awas ${displayTitle}</strong>
            <br/>
            <span style="font-size:11px; color:#64748B;">
              ${isAiRecharge ? "Instant AI credit top-up for RentAwas Buddy assistant" : "Full property portfolio management, rent disbursals & tenant health analytics"}
            </span>
            ${!isAiRecharge ? `
            <br/>
            <div style="margin-top: 5px; font-size: 11px; color: #334155; font-weight: 700; background: #F1F5F9; display: inline-block; padding: 3px 8px; border-radius: 6px;">
              Billing Period: <span style="color: #FF6B00;">${cycleStart} – ${cycleEnd}</span>
            </div>
            ` : ""}
          </td>
          <td>${billingCycleColumnText}</td>
          <td>1</td>
          <td style="text-align: right;"><strong>${amt}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>${amt}</span>
      </div>
      <div class="totals-row">
        <span>GST / Tax (18% Included):</span>
        <span>Included</span>
      </div>
      <div class="totals-row grand">
        <span>Total Paid:</span>
        <span style="color: #FF6B00;">${amt}</span>
      </div>
    </div>

    <!-- ANSH Apps Footer -->
    <div class="company-footer">
      <div class="footer-tagline">A product of ANSH Apps</div>
      <div style="font-size: 11px; color: #475569; margin: 4px 0 6px 0; font-weight: 600;">
        Udyam Registration Number: UDYAM-BR-23-0127857 &nbsp;|&nbsp; GSTIN: 10DIUPR1358M1ZP
      </div>
      <p class="footer-text">This is a computer-generated tax invoice for your subscription payment. Thank you for choosing ANSH Apps.</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
}

// Generate Official Payment Receipt Document
export function generatePaymentReceiptHtml(record: BillingDocRecord): string {
  const rcptNum = record.receiptNumber || `RCPT-2026-${Math.floor(100 + Math.random() * 900)}`;
  const invNum = record.invoiceNumber || "INV-2026-001";
  const dateStr = record.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const plan = record.planName || "Pro Plan";
  const amt = record.amount || "$15.00 USD";
  const payId = record.paymentId || "pay_P9283401";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payment Receipt - ${rcptNum}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 40px; background: #fff; }
    .receipt-card { max-width: 680px; margin: 0 auto; border: 2px solid #E2E8F0; border-radius: 20px; padding: 36px; background: #FAFAFA; }
    
    .company-header { text-align: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 18px; margin-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: 900; color: #0B132B; margin: 0; letter-spacing: -0.5px; }
    .product-name { font-size: 15px; font-weight: 800; color: #FF6B00; margin: 2px 0 4px 0; }
    .tag-line { font-size: 11px; color: #475569; font-weight: 600; margin: 2px 0; }
    .udyam-no { font-size: 11px; color: #334155; font-weight: 700; margin: 2px 0; }
    .support-info { font-size: 11px; color: #64748B; font-weight: 500; margin: 3px 0 0 0; }

    .stamp { display: inline-block; background: #10B981; color: white; font-weight: 900; font-size: 10px; padding: 5px 14px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; }
    
    .doc-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .title { font-size: 18px; font-weight: 800; color: #1E293B; }

    .amount-banner { background: #0F172A; color: white; border-radius: 14px; padding: 18px; text-align: center; margin: 20px 0; }
    .amount-banner h2 { font-size: 30px; font-weight: 900; margin: 0; color: #38BDF8; }
    .amount-banner p { font-size: 11px; color: #94A3B8; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px; }

    .detail-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #E2E8F0; font-size: 13px; }
    .detail-row span:first-child { color: #64748B; font-weight: 600; }
    .detail-row span:last-child { font-weight: 700; color: #0F172A; }

    .company-footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid #E2E8F0; text-align: center; }
    .footer-tagline { font-size: 12px; font-weight: 800; color: #0B132B; margin-bottom: 4px; }
    .footer-tagline span { color: #64748B; font-weight: 600; font-style: italic; }
    .footer-text { font-size: 11px; color: #64748B; margin: 0; }
  </style>
</head>
<body>
  <div class="receipt-card">
    
    <!-- ANSH Apps Header -->
    <div class="company-header">
      <h1 class="company-name">ANSH Apps</h1>
      <div class="product-name">Rent Awas</div>
      <div style="font-size: 13px; font-weight: 700; color: #64748B; margin-top: 1px; margin-bottom: 4px;">rentawas.com</div>
      <div class="udyam-no">Udyam Registration Number: UDYAM-BR-23-0127857 | GSTIN: 10DIUPR1358M1ZP</div>
      <div class="support-info">Support: support.rentawas@anshapps.com | Website: rentawas.com</div>
      <div class="support-info" style="margin-top: 2px;">For billing support contact support.rentawas@anshapps.com</div>
    </div>

    <div class="doc-row">
      <div>
        <div class="title">PAYMENT RECEIPT</div>
        <div style="font-size: 11px; color: #64748B; font-weight: 600; margin-top: 2px;">Receipt #: ${rcptNum}</div>
      </div>
      <div>
        <span class="stamp">PAYMENT SUCCESSFUL</span>
      </div>
    </div>

    <div class="amount-banner">
      <p>Amount Received</p>
      <h2>${amt}</h2>
    </div>

    <div style="margin: 16px 0;">
      <div class="detail-row">
        <span>Invoice Number:</span>
        <span>${invNum}</span>
      </div>
      <div class="detail-row">
        <span>Payment Transaction ID:</span>
        <span style="font-family: monospace;">${payId}</span>
      </div>
      <div class="detail-row">
        <span>Payment Date & Time:</span>
        <span>${dateStr}</span>
      </div>
      <div class="detail-row">
        <span>Subscription Plan:</span>
        <span>${plan}</span>
      </div>
      <div class="detail-row">
        <span>Payment Gateway Method:</span>
        <span>${record.paymentMethod || "Razorpay Secured Checkout"}</span>
      </div>
      <div class="detail-row">
        <span>Payer Email:</span>
        <span>alexander@regencymanagement.com</span>
      </div>
    </div>

    <!-- ANSH Apps Footer -->
    <div class="company-footer">
      <div class="footer-tagline">A product of ANSH Apps</div>
      <div style="font-size: 11px; color: #475569; margin: 4px 0 6px 0; font-weight: 600;">
        Udyam Registration Number: UDYAM-BR-23-0127857 &nbsp;|&nbsp; GSTIN: 10DIUPR1358M1ZP
      </div>
      <p class="footer-text">This is a computer-generated receipt for your subscription payment. Thank you for choosing ANSH Apps.</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
}

export function triggerPrintOrDownload(htmlContent: string, title: string) {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

export interface RentReceiptBranding {
  brandName: string;
  tagline?: string | null;
  address?: string | null;
  taxId?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  footerNote?: string | null;
  accentColor?: string | null;
}

export interface RentPaymentReceiptRecord {
  receiptNumber?: string;
  date?: string;
  tenantName: string;
  tenantEmail?: string;
  propertyName: string;
  unitNumber?: string;
  title: string;
  amount: string;
  rawAmount?: number;
  paymentMethod?: string;
  paymentId?: string;
  status?: string;
  branding?: RentReceiptBranding;
  signature?: {
    imageData: string;
    label?: string | null;
    signerName?: string | null;
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getBillingPeriod(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return { start: "—", end: "—" };
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const fmt = (dt: Date) =>
    dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return { start: fmt(start), end: fmt(end) };
}

function getPaymentModeFlags(method?: string) {
  const m = (method || "").toLowerCase();
  return {
    cash: /\bcash\b/i.test(m),
    cheque: /cheque|check/i.test(m),
    moneyOrder: /money order/i.test(m),
    online:
      /razorpay|stripe|paypal|upi|gpay|phonepe|paytm|transfer|neft|imps|bank|card|manual verification/i.test(m) ||
      (!/\bcash\b|cheque|check|money order/i.test(m) && m.length > 0),
  };
}

export function generateRentPaymentReceiptHtml(record: RentPaymentReceiptRecord): string {
  const branding = record.branding;
  const brandName = escapeHtml(branding?.brandName || record.propertyName || "Property Management");
  const tagline = escapeHtml(branding?.tagline || "House Rent Receipt");
  const accent = branding?.accentColor || "#1e3a5f";
  const rcptNum = escapeHtml(
    record.receiptNumber ||
      `RCPT-${(record.date || new Date().toISOString().slice(0, 10)).replace(/-/g, "")}`
  );
  const dateStr = escapeHtml(
    record.date
      ? new Date(record.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  );
  const tenantName = escapeHtml(record.tenantName);
  const amount = escapeHtml(record.amount);
  const paymentFor = escapeHtml(
    record.title || `Monthly rent — ${record.propertyName}${record.unitNumber ? ` (${record.unitNumber})` : ""}`
  );
  const period = getBillingPeriod(record.date);
  const modes = getPaymentModeFlags(record.paymentMethod);
  const receivedByName = escapeHtml(
    record.signature?.signerName || branding?.brandName || "Authorized Signatory"
  );
  const receivedByAddress = escapeHtml(branding?.address || "");
  const receivedByPhone = escapeHtml(branding?.contactPhone || "");
  const footerNote = escapeHtml(
    branding?.footerNote || "This receipt acknowledges rent received for the stated period."
  );
  const signatureBlock = record.signature?.imageData
    ? `<img src="${record.signature.imageData}" alt="Signature" style="max-height:56px; max-width:180px; object-fit:contain;" />`
    : `<div style="height:48px; border-bottom:1px solid #334155; width:180px;"></div>`;

  const check = (on: boolean) => (on ? "☑" : "☐");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>House Rent Receipt - ${rcptNum}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      color: #1a1a1a;
      margin: 0;
      padding: 32px;
      background: linear-gradient(180deg, #f8f4ec 0%, #efe8da 100%);
    }
    .sheet {
      max-width: 760px;
      margin: 0 auto;
      background: #fffef9;
      border: 2px dotted #222;
      padding: 28px 32px 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    }
    .title {
      text-align: center;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0 0 18px;
      color: ${accent};
      text-transform: uppercase;
    }
    .meta {
      display: flex;
      justify-content: flex-end;
      gap: 28px;
      font-size: 13px;
      margin-bottom: 22px;
      font-weight: 600;
    }
    .line {
      font-size: 14px;
      line-height: 2.1;
      margin-bottom: 6px;
    }
    .fill {
      display: inline-block;
      min-width: 120px;
      border-bottom: 1px solid #334155;
      padding: 0 6px 2px;
      font-weight: 700;
    }
    .fill-wide {
      min-width: 280px;
    }
    .fill-amount {
      min-width: 100px;
      font-size: 16px;
      color: ${accent};
    }
    .period {
      text-align: center;
      margin: 18px 0 24px;
      font-size: 14px;
      font-weight: 600;
    }
    .bottom {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 24px;
      margin-top: 28px;
      align-items: start;
    }
    .modes {
      font-size: 13px;
      line-height: 1.9;
      font-weight: 600;
    }
    .summary {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .summary td {
      border: 1px solid #334155;
      padding: 8px 10px;
    }
    .summary td:first-child {
      font-weight: 600;
      background: #f8fafc;
      width: 58%;
    }
    .summary td:last-child {
      text-align: right;
      font-weight: 700;
    }
    .received {
      margin-top: 28px;
      font-size: 13px;
      line-height: 1.8;
    }
    .signature-wrap {
      margin-top: 8px;
      min-height: 60px;
    }
    .footer-row {
      margin-top: 22px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }
    .rentawas-credit {
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
      font-style: normal;
      white-space: nowrap;
    }
    .footer {
      text-align: right;
      font-size: 11px;
      color: #64748b;
      font-style: italic;
    }
    .sub-brand {
      text-align: center;
      font-size: 12px;
      color: #475569;
      margin-top: -8px;
      margin-bottom: 14px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { box-shadow: none; border: 2px dotted #222; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <h1 class="title">${tagline || "House Rent Receipt"}</h1>
    <div class="sub-brand">${brandName}${branding?.taxId ? ` · Tax ID: ${escapeHtml(branding.taxId)}` : ""}</div>

    <div class="meta">
      <div>Date: <span class="fill">${dateStr}</span></div>
      <div>Receipt No: <span class="fill">${rcptNum}</span></div>
    </div>

    <div class="line">
      Received From: <span class="fill fill-wide">${tenantName}</span>
      the amount of <span class="fill fill-amount">${amount}</span>
    </div>

    <div class="line">
      For Payment of <span class="fill" style="min-width:420px;">${paymentFor}</span>
    </div>

    <div class="period">
      From <span class="fill">${escapeHtml(period.start)}</span>
      &nbsp;to&nbsp;
      <span class="fill">${escapeHtml(period.end)}</span>
    </div>

    <div class="bottom">
      <div class="modes">
        <div>${check(modes.cash)} Cash</div>
        <div>${check(modes.cheque)} Cheque No: <span class="fill" style="min-width:140px;">${modes.cheque ? escapeHtml(record.paymentId || "") : ""}</span></div>
        <div>${check(modes.moneyOrder)} Money Order</div>
        <div>${check(modes.online)} Online / UPI / Bank Transfer</div>
        ${record.paymentMethod ? `<div style="margin-top:8px; font-size:12px; color:#475569;">Mode: ${escapeHtml(record.paymentMethod)}</div>` : ""}
      </div>

      <table class="summary">
        <tr><td>Total Amount to be Received</td><td>${amount}</td></tr>
        <tr><td>Amount Received</td><td>${amount}</td></tr>
        <tr><td>Balance Due</td><td>0.00</td></tr>
      </table>
    </div>

    <div class="received">
      <div><strong>Received By:</strong> <span class="fill fill-wide">${receivedByName}</span></div>
      ${receivedByAddress ? `<div><strong>Address:</strong> <span class="fill fill-wide">${receivedByAddress}</span></div>` : ""}
      ${receivedByPhone ? `<div><strong>Phone:</strong> <span class="fill">${receivedByPhone}</span></div>` : ""}
      <div class="signature-wrap">${signatureBlock}</div>
      <div style="font-size:11px; color:#64748b; margin-top:4px;">Authorized Signature</div>
    </div>

    <div class="footer-row">
      <div class="rentawas-credit">
        <div style="font-weight:700;">A product of ANSH Apps</div>
        <div style="font-size:9px; color:#64748b; margin-top:2px;">Udyam Registration Number: UDYAM-BR-23-0127857 | GSTIN: 10DIUPR1358M1ZP</div>
      </div>
      <div>
        <div class="footer">${footerNote}</div>
      </div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>
  `;
}
