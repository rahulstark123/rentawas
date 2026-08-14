"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type RecoveryState = "checking" | "ready" | "invalid";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordsMatch = useMemo(
    () => password.length > 0 && password === confirmPassword,
    [confirmPassword, password]
  );

  useEffect(() => {
    let isMounted = true;

    const errorParam = searchParams.get("error");
    if (errorParam === "invalid_link") {
      setRecoveryState("invalid");
      setErrorMessage(
        "This reset link is invalid or has expired. Request a new link from the login page."
      );
      return;
    }

    const resolveSession = async () => {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!isMounted) return false;
        if (error) {
          setRecoveryState("invalid");
          setErrorMessage(error.message);
          return false;
        }
        router.replace("/reset-password");
      }

      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        if (!isMounted) return false;
        if (error) {
          setRecoveryState("invalid");
          setErrorMessage(error.message);
          return false;
        }
        router.replace("/reset-password");
      }

      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return false;

      if (error) {
        setRecoveryState("invalid");
        setErrorMessage(error.message || "This reset link is invalid or has expired.");
        return false;
      }

      if (data.session) {
        setRecoveryState("ready");
        setErrorMessage(null);
        return true;
      }

      return false;
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setRecoveryState("ready");
        setErrorMessage(null);
      }
    });

    void resolveSession();

    const fallbackTimer = window.setTimeout(async () => {
      const hasSession = await resolveSession();
      if (!hasSession && isMounted) {
        setRecoveryState("invalid");
        setErrorMessage(
          "This reset link is invalid or has expired. Request a new link from the login page."
        );
      }
    }, 5000);

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimer);
      authListener.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Your password has been updated. Redirecting to login...");
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1500);
    } catch {
      setErrorMessage("Could not update password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between font-sans relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
          <Image src="/logo.png" alt="RentAwas Logo" width={54} height={54} priority className="h-10 sm:h-11 w-auto object-contain" />
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-cormorant">
            <span className="text-[#0B132B]">Rent</span>
            <span className="text-[#FF6B00]">Awas</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200 px-3.5 py-2 rounded-lg uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Set a new password</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Choose a strong password for your RentAwas account.
          </p>

          {recoveryState === "checking" && (
            <div className="flex justify-center py-10">
              <span className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#FF6B00] rounded-full animate-spin" />
            </div>
          )}

          {recoveryState === "invalid" && (
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <Link
                href="/login"
                className="block w-full text-center py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-sm rounded-xl uppercase tracking-wider"
              >
                Go to Login
              </Link>
            </div>
          )}

          {recoveryState === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`mt-2 text-xs font-medium ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}>
                    {passwordsMatch ? "Passwords match." : "Passwords do not match."}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || Boolean(successMessage)}
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Update Password</span>
                    <Sparkles className="w-4 h-4 text-orange-200" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 z-10 space-y-1">
        <p>&copy; {new Date().getFullYear()} RentAwas. A product of ANSH Apps. All rights reserved.</p>
        <p className="text-[11px] text-slate-500 font-medium">
          Udyam Registration Number: <span className="font-mono text-slate-400">UDYAM-BR-23-0127857</span> &nbsp;|&nbsp; GSTIN: <span className="font-mono text-slate-400">10DIUPR1358M1ZP</span>
        </p>
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <span className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#FF6B00] rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
