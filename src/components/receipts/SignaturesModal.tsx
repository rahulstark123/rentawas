"use client";

import { useEffect, useState } from "react";
import { X, Upload, Trash2, PenLine, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { RentReceiptSignatureData } from "@/lib/rentReceipts";

interface SignaturesModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string | null;
  onSignaturesChange?: (signatures: RentReceiptSignatureData[]) => void;
}

function compressSignatureFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 480;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png", 0.92));
      };
      img.onerror = () => reject(new Error("Invalid image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function SignaturesModal({
  open,
  onClose,
  workspaceId,
  onSignaturesChange,
}: SignaturesModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signatures, setSignatures] = useState<RentReceiptSignatureData[]>([]);
  const [label, setLabel] = useState("");
  const [signerName, setSignerName] = useState("");
  const [previewData, setPreviewData] = useState("");

  const loadSignatures = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/receipt-signatures?workspaceId=${workspaceId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load signatures");
      const list = json.data || [];
      setSignatures(list);
      onSignaturesChange?.(list);
    } catch (err: any) {
      toast(err.message || "Could not load signatures.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && workspaceId) {
      void loadSignatures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, workspaceId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please upload a PNG or JPG signature image.", "info");
      return;
    }
    try {
      const dataUrl = await compressSignatureFile(file);
      setPreviewData(dataUrl);
    } catch {
      toast("Could not process signature image.", "error");
    }
    e.target.value = "";
  };

  const handleSaveSignature = async () => {
    if (!workspaceId) return;
    if (!label.trim()) {
      toast("Enter a label for this signature.", "info");
      return;
    }
    if (!previewData) {
      toast("Upload a signature image first.", "info");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/receipt-signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: Number(workspaceId),
          label: label.trim(),
          signerName: signerName.trim() || null,
          imageData: previewData,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save signature");
      toast("Signature uploaded successfully.", "success");
      setLabel("");
      setSignerName("");
      setPreviewData("");
      await loadSignatures();
    } catch (err: any) {
      toast(err.message || "Could not save signature.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this signature? Templates using it will be cleared.")) return;
    try {
      const res = await fetch(`/api/receipt-signatures/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      toast("Signature deleted.", "success");
      await loadSignatures();
    } catch (err: any) {
      toast(err.message || "Could not delete signature.", "error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
              <PenLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">My Signatures</h3>
              <p className="text-xs text-slate-500">Upload signatures to print on rent receipts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/80 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Upload New Signature</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label e.g. Landlord Signature"
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
              />
              <input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Signer name (optional)"
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-300 rounded-xl bg-white cursor-pointer hover:border-[#FF6B00]/50 transition-colors">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Click to upload PNG / JPG signature</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />
            </label>

            {previewData ? (
              <div className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <img src={previewData} alt="New signature preview" className="h-12 object-contain" />
                <button
                  type="button"
                  onClick={handleSaveSignature}
                  disabled={saving}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-50 text-white text-xs font-extrabold rounded-xl uppercase cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Signature"}
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Saved Signatures ({signatures.length})
            </h4>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : signatures.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm border border-slate-200 rounded-xl bg-slate-50">
                No signatures yet. Upload your first signature above.
              </div>
            ) : (
              signatures.map((sig) => (
                <div
                  key={sig.id}
                  className="flex items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl bg-white"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-28 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <img src={sig.imageData} alt={sig.label} className="max-h-10 max-w-24 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-slate-900 truncate">{sig.label}</div>
                      {sig.signerName ? (
                        <div className="text-xs text-slate-500 truncate">{sig.signerName}</div>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(sig.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer shrink-0"
                    title="Delete signature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
