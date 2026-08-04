"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Listing",
  description = "Are you sure you want to delete this property listing? This action cannot be undone.",
  confirmLabel = "Delete Listing",
  isLoading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red accent top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

        <div className="p-6 sm:p-7">
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="w-13 h-13 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5 w-fit p-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>

          {/* Text */}
          <h3 className="text-lg font-extrabold text-[#0B132B] mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-red-500 hover:bg-red-600 active:scale-[0.98] rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{isLoading ? "Deleting…" : confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
