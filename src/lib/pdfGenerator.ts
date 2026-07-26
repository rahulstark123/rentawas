// Printable PDF Document Generator for Tax Invoices and Payment Receipts

export interface BillingDocRecord {
  invoiceNumber: string;
  receiptNumber?: string;
  date?: string;
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
  const dateStr = record.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const plan = record.planName || "Pro Portfolio Plan";
  const amt = record.amount || "$15.00 USD";
  const term = record.billingTerm || "Monthly";

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
      <div class="udyam-no">Udyam Registration No: UDYAM-BR-23-0127857</div>
      <div class="support-info">Support: support@anshapps.com | Website: anshapps.com</div>
      <div class="support-info" style="margin-top: 2px;">For billing support contact support@anshapps.com</div>
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
        <p>Workspace ID: #1</p>
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
          <td><strong>Rent Awas ${plan} Subscription</strong><br/><span style="font-size:11px; color:#64748B;">Full property portfolio management, rent disbursals & tenant health analytics</span></td>
          <td>${term}</td>
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
      <div class="footer-tagline">ANSH Apps — <span>software that solves everyday problems</span></div>
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
  const plan = record.planName || "Pro Portfolio Plan";
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
      <div class="udyam-no">Udyam Registration No: UDYAM-BR-23-0127857</div>
      <div class="support-info">Support: support@anshapps.com | Website: anshapps.com</div>
      <div class="support-info" style="margin-top: 2px;">For billing support contact support@anshapps.com</div>
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
      <div class="footer-tagline">ANSH Apps — <span>software that solves everyday problems</span></div>
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

// Download HTML file helper function
export function triggerPrintOrDownload(htmlContent: string, title: string) {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
