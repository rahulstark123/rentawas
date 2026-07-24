"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ToastMessage {
  id: number;
  message: string;
  type?: "success" | "info" | "warning" | "error";
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "info" | "warning" | "error") => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = (message: string, type: "success" | "info" | "warning" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Notification Floating Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 pointer-events-auto text-xs font-bold ${
                t.type === "success"
                  ? "bg-[#0F172A] text-white border-emerald-500/40"
                  : t.type === "error"
                  ? "bg-[#0F172A] text-white border-red-500/40"
                  : "bg-[#0F172A] text-white border-purple-500/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {t.type === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                {t.type === "info" && <Info className="w-4 h-4 text-purple-400 shrink-0" />}
                <span className="leading-snug">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
