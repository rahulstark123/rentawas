"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Save,
  Building2,
  Eye,
  Palette,
  PenLine,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ensureActiveWorkspaceId, getActiveWorkspaceId } from "@/lib/workspace";
import {
  DEFAULT_RENT_RECEIPT_TEMPLATE,
  resolveSignatureForReceipt,
  type RentReceiptTemplateData,
  type RentReceiptSignatureData,
} from "@/lib/rentReceipts";
import {
  generateRentPaymentReceiptHtml,
  triggerPrintOrDownload,
} from "@/lib/pdfGenerator";
import { useCurrency } from "@/context/CurrencyContext";
import SignaturesModal from "@/components/receipts/SignaturesModal";

export default function MyReceiptsPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Array<{ id: string; name: string; address?: string }>>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [template, setTemplate] = useState<RentReceiptTemplateData>(DEFAULT_RENT_RECEIPT_TEMPLATE);
  const [signatures, setSignatures] = useState<RentReceiptSignatureData[]>([]);
  const [showSignaturesModal, setShowSignaturesModal] = useState(false);

  const loadSignatures = async (wid: string) => {
    const res = await fetch(`/api/receipt-signatures?workspaceId=${wid}`);
    const json = await res.json();
    if (res.ok && Array.isArray(json.data)) {
      setSignatures(json.data);
    }
  };

  const loadTemplate = async (wid: string, propertyId?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ workspaceId: wid });
      if (propertyId) params.set("propertyId", propertyId);
      const res = await fetch(`/api/receipt-templates?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load template");

      setProperties(json.properties || []);
      const selectedProperty = (json.properties || []).find((p: any) => p.id === propertyId);
      const data = json.data;

      setTemplate({
        brandName: data?.brandName || selectedProperty?.name || DEFAULT_RENT_RECEIPT_TEMPLATE.brandName,
        tagline: data?.tagline || DEFAULT_RENT_RECEIPT_TEMPLATE.tagline,
        address: data?.address || selectedProperty?.address || "",
        taxId: data?.taxId || "",
        contactEmail: data?.contactEmail || "",
        contactPhone: data?.contactPhone || "",
        footerNote: data?.footerNote || DEFAULT_RENT_RECEIPT_TEMPLATE.footerNote,
        accentColor: data?.accentColor || DEFAULT_RENT_RECEIPT_TEMPLATE.accentColor,
        signatureId: data?.signatureId || null,
      });
      await loadSignatures(wid);
    } catch (err: any) {
      toast(err.message || "Could not load receipt template.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!wid) {
        setLoading(false);
        return;
      }
      setWorkspaceId(String(wid));
      await loadTemplate(String(wid));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePropertyChange = async (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    if (!workspaceId) return;
    await loadTemplate(workspaceId, propertyId || undefined);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/receipt-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: Number(workspaceId),
          propertyId: selectedPropertyId || null,
          ...template,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save template");
      toast("Receipt template saved for this property.", "success");
    } catch (err: any) {
      toast(err.message || "Failed to save template.", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedSignature = resolveSignatureForReceipt(signatures, template.signatureId);

  const handlePreview = () => {
    const propertyName =
      properties.find((p) => p.id === selectedPropertyId)?.name || template.brandName;
    const html = generateRentPaymentReceiptHtml({
      receiptNumber: "RCPT-PREVIEW-001",
      date: new Date().toISOString().split("T")[0],
      tenantName: "Sample Resident",
      tenantEmail: "resident@example.com",
      propertyName,
      unitNumber: "Unit 102",
      title: `Rent Payment — ${new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}`,
      amount: formatCurrency(2000),
      rawAmount: 2000,
      paymentMethod: "Online / UPI Transfer",
      paymentId: "pay_preview_001",
      status: "PAID",
      branding: template,
      signature: selectedSignature,
    });
    triggerPrintOrDownload(html, "Rent_Receipt_Preview");
  };

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-start gap-3">
          <Link
            href="/dashboard/payments"
            className="mt-1 p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-orange-50 text-[#FF6B00]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  My Receipts
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Design formal rent receipts (Indian &amp; global standard) with optional digital signatures.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSignaturesModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all uppercase tracking-wider cursor-pointer"
          >
            <PenLine className="w-4 h-4 text-[#FF6B00]" />
            <span>My Signatures</span>
          </button>
          <button
            type="button"
            onClick={handlePreview}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-xs font-bold shadow-md transition-all uppercase tracking-wider cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Receipt</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Property (Receipt Branding Scope)
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedPropertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
              >
                <option value="">Workspace Default Template</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm font-bold text-slate-400 animate-pulse">
              Loading receipt template...
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Landlord / Property Name *</label>
                <input
                  required
                  value={template.brandName}
                  onChange={(e) => setTemplate((t) => ({ ...t, brandName: e.target.value }))}
                  placeholder="e.g. Housing Zone Residency"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receipt Title</label>
                <input
                  value={template.tagline || ""}
                  onChange={(e) => setTemplate((t) => ({ ...t, tagline: e.target.value }))}
                  placeholder="House Rent Receipt"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Received By Address</label>
                <textarea
                  rows={3}
                  value={template.address || ""}
                  onChange={(e) => setTemplate((t) => ({ ...t, address: e.target.value }))}
                  placeholder="Landlord address printed on receipt"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tax / PAN / GST ID</label>
                  <input
                    value={template.taxId || ""}
                    onChange={(e) => setTemplate((t) => ({ ...t, taxId: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
                    Title Color
                  </label>
                  <input
                    type="color"
                    value={template.accentColor || "#1e3a5f"}
                    onChange={(e) => setTemplate((t) => ({ ...t, accentColor: e.target.value }))}
                    className="w-full h-11 px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={template.contactEmail || ""}
                    onChange={(e) => setTemplate((t) => ({ ...t, contactEmail: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                  <input
                    value={template.contactPhone || ""}
                    onChange={(e) => setTemplate((t) => ({ ...t, contactPhone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Default Signature on Receipt</label>
                <select
                  value={template.signatureId || ""}
                  onChange={(e) => setTemplate((t) => ({ ...t, signatureId: e.target.value || null }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                >
                  <option value="">No signature (blank line)</option>
                  {signatures.map((sig) => (
                    <option key={sig.id} value={sig.id}>
                      {sig.label}{sig.signerName ? ` — ${sig.signerName}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Manage uploads via <button type="button" onClick={() => setShowSignaturesModal(true)} className="text-[#FF6B00] font-bold underline cursor-pointer">My Signatures</button>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Footer Note</label>
                <textarea
                  rows={2}
                  value={template.footerNote || ""}
                  onChange={(e) => setTemplate((t) => ({ ...t, footerNote: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Receipt Template"}</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#f8f4ec] border-2 border-dotted border-slate-400 rounded-2xl p-5 shadow-inner text-slate-900">
            <div className="text-center mb-3">
              <div className="text-xl font-bold uppercase" style={{ color: template.accentColor || "#1e3a5f" }}>
                {template.tagline || "House Rent Receipt"}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{template.brandName}</div>
            </div>
            <div className="text-[10px] text-right font-semibold mb-3 space-y-0.5">
              <div>Date: __________</div>
              <div>Receipt No: __________</div>
            </div>
            <div className="text-[11px] leading-relaxed space-y-1">
              <div>Received From: <strong>Sample Resident</strong> the amount of <strong>{formatCurrency(2000)}</strong></div>
              <div>For Payment of <strong>Monthly Rent — Unit 102</strong></div>
              <div className="text-center py-2">From ________ to ________</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 text-[10px]">
              <div className="space-y-1">
                <div>☐ Cash</div>
                <div>☐ Cheque</div>
                <div>☑ Online / UPI</div>
              </div>
              <div className="border border-slate-400 text-[9px]">
                <div className="flex justify-between border-b border-slate-400 px-1 py-0.5"><span>Total</span><span>{formatCurrency(2000)}</span></div>
                <div className="flex justify-between border-b border-slate-400 px-1 py-0.5"><span>Received</span><span>{formatCurrency(2000)}</span></div>
                <div className="flex justify-between px-1 py-0.5"><span>Balance</span><span>0</span></div>
              </div>
            </div>
            <div className="mt-4 text-[10px]">
              <div>Received By: <strong>{selectedSignature?.signerName || template.brandName}</strong></div>
              {selectedSignature?.imageData ? (
                <img src={selectedSignature.imageData} alt="Signature" className="h-8 mt-2 object-contain" />
              ) : (
                <div className="h-6 border-b border-slate-500 w-28 mt-2" />
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed px-1">
            Formal layout inspired by standard house rent receipts used in India and internationally — with received-from, billing period, payment mode, summary table, and authorized signature.
          </p>
        </div>
      </form>

      <SignaturesModal
        open={showSignaturesModal}
        onClose={() => setShowSignaturesModal(false)}
        workspaceId={workspaceId}
        onSignaturesChange={setSignatures}
      />
    </div>
  );
}
