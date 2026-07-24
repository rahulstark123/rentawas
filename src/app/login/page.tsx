"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Building2, 
  User, 
  CheckCircle2, 
  KeyRound,
  Zap,
  FileCheck
} from "lucide-react";
import { IconAutopilotRent } from "@/components/ui/CustomIcons";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "tenant">("owner");
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(ALL_COUNTRIES[0]);
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmittedMessage(null);

    if (authMethod === "otp" && !otpSent) {
      setTimeout(() => {
        setIsLoading(false);
        setOtpSent(true);
      }, 600);
      return;
    }

    // Direct navigation to Dashboard
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-orange-100 selection:text-orange-600 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
          <Image
            src="/logo.png"
            alt="RentAwas Logo"
            width={54}
            height={54}
            priority
            className="h-10 sm:h-11 w-auto object-contain group-hover:opacity-90 transition-opacity"
          />
          <span 
            className="text-2xl sm:text-3xl font-extrabold tracking-tight font-cormorant"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            <span className="text-[#0B132B]">Rent</span>
            <span className="text-[#FF6B00]">Awas</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/90 hover:border-slate-300 px-3.5 py-2 rounded-lg transition-all shadow-2xs backdrop-blur-xs group uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-500" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 z-10">
        <div className="w-full max-w-5xl bg-white border border-slate-200/90 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Decorative/Info Section */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0B132B] via-[#141A26] to-[#1E293B] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-medium text-orange-300 mb-6">
                <IconAutopilotRent className="w-4 h-4 text-emerald-400" />
                <span>Autopilot Rent Enabled</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-3">
                Mission Control for Rental Ecosystems
              </h2>
              <p className="text-slate-300 text-sm font-normal leading-relaxed">
                Automated collections, real-time analytics, and instant maintenance dispatch—all in one place.
              </p>
            </div>

            {/* Middle Feature Highlights */}
            <div className="relative z-10 my-8 space-y-4">
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
                <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instant Rent Disbursal</h4>
                  <p className="text-xs text-slate-300">Automated payout routing directly into property accounts.</p>
                </div>
              </div>

              {/* Updated Highlight replacing Bank-Grade Encryption */}
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Legal Lease Architect</h4>
                  <p className="text-xs text-slate-300">Generate fully compliant localized lease agreements instantly.</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer Quote */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Systems Operational
              </span>
              <span>v2.4.0</span>
            </div>
          </div>

          {/* Right Login Form Section */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Log In to RentAwas
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select your account type to access your portal.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === "owner"
                    ? "bg-white text-[#0B132B] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Building2 className={`w-4 h-4 ${role === "owner" ? "text-[#FF6B00]" : ""}`} />
                <span>Landlord / Owner</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === "tenant"
                    ? "bg-white text-[#0B132B] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className={`w-4 h-4 ${role === "tenant" ? "text-purple-600" : ""}`} />
                <span>Tenant / Resident</span>
              </button>
            </div>

            {/* Authentication Method Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-100 pb-3 mb-6 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => { setAuthMethod("password"); setOtpSent(false); }}
                className={`pb-1 transition-colors cursor-pointer relative ${
                  authMethod === "password" ? "text-[#FF6B00]" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Password Login
                {authMethod === "password" && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#FF6B00]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("otp")}
                className={`pb-1 transition-colors cursor-pointer relative ${
                  authMethod === "otp" ? "text-[#FF6B00]" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Mobile OTP Login
                {authMethod === "otp" && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#FF6B00]" />
                )}
              </button>
            </div>

            {/* Feedback Banner */}
            <AnimatePresence>
              {submittedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{submittedMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMethod === "password" ? (
                <>
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={role === "owner" ? "owner@property.com" : "tenant@rentawas.com"}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input with Forgot Password BELOW the input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Forgot Password BELOW the password input field */}
                    <div className="flex justify-end mt-1.5">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Password reset instructions have been dispatched to your email address!");
                        }}
                        className="text-xs font-semibold text-[#FF6B00] hover:underline"
                      >
                        Forgot Password?
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Phone Input with Country Code Selector & Real-Time Validation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mobile Phone Number
                    </label>
                    <CountryPhoneInput
                      value={phoneInput}
                      onChange={setPhoneInput}
                      selectedCountry={selectedCountry}
                      onCountryChange={setSelectedCountry}
                    />
                  </div>

                  {otpSent && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Enter 6-Digit OTP Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="1 2 3 4 5 6"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] border-slate-300 accent-[#FF6B00]"
                  />
                  <span className="text-xs font-medium text-slate-600">Keep me logged in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{authMethod === "otp" ? (otpSent ? "Verify & Sign In" : "Send One-Time OTP") : "Sign In to Mission Control"}</span>
                    <Sparkles className="w-4 h-4 text-orange-200" />
                  </>
                )}
              </button>
            </form>

            {/* Social Logins Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Or Continue With
              </span>
            </div>

            {/* Single SSO Google Button */}
            <div>
              <button
                type="button"
                onClick={() => alert("Google SSO Integration triggered!")}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Footer Sign Up Link */}
            <p className="text-center text-xs text-slate-500 mt-6 font-normal">
              Don&apos;t have an account yet?{" "}
              <Link href="/signup" className="font-bold text-[#FF6B00] hover:underline">
                Create an Account
              </Link>
            </p>

          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 z-10">
        &copy; {new Date().getFullYear()} RentAwas Ecosystem Inc. All rights reserved. • Protected by reCAPTCHA Enterprise.
      </footer>
    </div>
  );
}
