"use client";

import { useEffect, useState } from "react";
import { X, Building2, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface PropertyAutoReceipt {
  id: string;
  name: string;
  address?: string | null;
  autoReceiptEnabled: boolean;
}

interface AutoReceiptSettingsModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string | null;
}

export default function AutoReceiptSettingsModal({
  open,
  onClose,
  workspaceId,
}: AutoReceiptSettingsModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyAutoReceipt[]>([]);

  const loadSettings = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/auto-receipt?workspaceId=${workspaceId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load settings");
      setProperties(json.data || []);
    } catch (err: any) {
      toast(err.message || "Could not load auto-receipt settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && workspaceId) {
      void loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, workspaceId]);

  const handleToggle = async (property: PropertyAutoReceipt) => {
    if (!workspaceId) return;
    setSavingId(property.id);
    try {
      const res = await fetch("/api/properties/auto-receipt", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: Number(workspaceId),
          propertyId: property.id,
          autoReceiptEnabled: !property.autoReceiptEnabled,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setProperties((prev) =>
        prev.map((p) =>
          p.id === property.id ? { ...p, autoReceiptEnabled: !p.autoReceiptEnabled } : p
        )
      );
      toast(json.message || "Setting updated.", "success");
    } catch (err: any) {
      toast(err.message || "Could not update setting.", "error");
    } finally {
      setSavingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Auto Receipt Settings</h3>
              <p className="text-xs text-slate-500">Per-property RentAwas PDF vs manual upload</p>
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

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-3">
            <strong>Auto Receipt ON:</strong> After you verify a payment, the RentAwas PDF receipt is issued automatically.
            <br />
            <strong>Auto Receipt OFF:</strong> After verify, you upload your own receipt file (PDF/image).
          </p>

          {loading ? (
            <div className="py-10 text-center text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading properties...
            </div>
          ) : properties.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm border border-dashed border-slate-200 rounded-xl">
              No properties found in this workspace.
            </div>
          ) : (
            <div className="space-y-2">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-slate-900 truncate">{property.name}</div>
                      {property.address ? (
                        <div className="text-[11px] text-slate-500 truncate">{property.address}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase hidden sm:inline">
                      Auto Receipt
                    </span>
                    <button
                      type="button"
                      disabled={savingId === property.id}
                      onClick={() => handleToggle(property)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                        property.autoReceiptEnabled ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      aria-pressed={property.autoReceiptEnabled}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          property.autoReceiptEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
