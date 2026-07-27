"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ShieldCheck } from "lucide-react";

interface LogoutAnimationProps {
  isLoggingOut: boolean;
  userRole?: string; // "landlord" | "resident" | "user"
}

export default function LogoutAnimation({ isLoggingOut, userRole = "user" }: LogoutAnimationProps) {
  return (
    <AnimatePresence>
      {isLoggingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-[#0A0F1D]/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden select-none"
        >
          {/* Ambient Glow Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-slate-900/90 border border-slate-800 p-8 sm:p-10 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-6 flex flex-col items-center"
          >
            {/* Animated Logo Ring */}
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                className="w-24 h-24 rounded-full border-2 border-dashed border-[#FF6B00] border-t-purple-500 border-r-transparent"
              />

              {/* Inner Circle Icon */}
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
              >
                <LogOut className="w-8 h-8 text-white animate-pulse" />
              </motion.div>
            </div>

            {/* Brand Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1 text-xl font-extrabold tracking-tight">
                <span className="text-white">Rent</span>
                <span className="text-[#FF6B00]">Awas</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Logging Out...
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
                Securing your session data and safely disconnecting your {userRole === "landlord" ? "Landlord Workspace" : "Resident Portal"}.
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-[#FF6B00] via-purple-500 to-emerald-400 rounded-full"
              />
            </div>

            {/* Status Footer Badge */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Session Safely Encrypted</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
