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
  UserPlus,
  Rocket,
  Star,
  Check,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";
import { supabase } from "@/lib/supabase";
import { createUserProfileAndWorkspace } from "@/app/actions/authActions";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "tenant">("owner");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(ALL_COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [portfolioSize, setPortfolioSize] = useState("1-5");
  const [accessRole, setAccessRole] = useState("Owner"); // "Owner", "Admin", "Manager", "Employee"
  const [isLoading, setIsLoading] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isPasswordMatched = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match. Please ensure both passwords are identical.");
      return;
    }
    if (!agreedTerms) {
      alert("Please agree to the Terms of Service & Privacy Policy to proceed.");
      return;
    }
    setIsLoading(true);
    setSubmittedMessage(null);

    try {
      const formattedPhone = `${selectedCountry.dialCode} ${phone.trim()}`;

      // 1. Supabase Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
            role,
            accessRole,
            phone: formattedPhone,
            trialStartedAt: new Date().toISOString(),
            trialDays: 14,
          },
        },
      });

      if (authError) {
        alert(`Sign up failed: ${authError.message}`);
        setIsLoading(false);
        return;
      }

      // 2. Generate Prisma Profile & Workspace with auto-incrementing integer wid (1, 2, 3...)
      const userId = authData?.user?.id || `user_${Date.now()}`;
      const workspaceResult = await createUserProfileAndWorkspace({
        userId,
        email,
        fullName,
        phone: formattedPhone,
        role,
      });

      setIsLoading(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("signup_portfolio_scale", portfolioSize);
        if (workspaceResult?.wid) {
          const { setActiveWorkspaceId } = await import("@/lib/workspace");
          setActiveWorkspaceId(workspaceResult.wid);
        }
      }
      if (role === "tenant") {
        router.push("/tenant/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      alert(err?.message || "An error occurred during account creation. Please try again.");
      setIsLoading(false);
    }
  };

  // Compute password strength score (0 to 4)
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  const strengthColors = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-600"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-orange-100 selection:text-orange-600 relative overflow-hidden font-sans">
      {/* Dynamic Background Accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

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

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-slate-500 font-medium">Already registered?</span>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-black bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-2 rounded-lg transition-all shadow-2xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 z-10">
        <div className="w-full max-w-5xl bg-white border border-slate-200/90 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Decorative/Feature Banner — desktop/tablet only */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0B132B] via-[#141A26] to-[#1E293B] text-white p-8 sm:p-10 flex-col justify-between relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 backdrop-blur-md text-xs font-extrabold text-orange-300 mb-6">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>14-Day Free Trial Included</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-3">
                Elevate Your Rental Ecosystem
              </h2>
              <p className="text-slate-300 text-sm font-normal leading-relaxed mb-6">
                Join property owners and residents managing portfolios, messaging, maintenance, and RentAwas Buddy AI in one place.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                {[
                  "Property & Unit Portfolio Dashboard",
                  "In-App Landlord–Tenant Messaging",
                  "RentAwas Buddy AI Insights",
                  "Maintenance Request Tracking",
                  "Tenant Health Scores & Documents",
                  "No Hidden Setup Fees or Long Contracts",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Badge */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic mb-2">
                &ldquo;RentAwas keeps our properties, tenants, and maintenance in one dashboard. Messaging and Buddy AI save us hours every week.&rdquo;
              </p>
              <div className="text-[11px] font-bold text-slate-400">
                — Marcus Vance, Portfolio Director (85+ Units)
              </div>
            </div>
          </div>

          {/* Right Signup Form Section */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Create Your Account
                </h1>
                <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF6B00] text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>14 Days Free Trial</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Get 14 days of full access to properties, messaging, maintenance &amp; Buddy AI — no credit card required.
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
                <span>Tenant / Normal User</span>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alexander Wright"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                  />
                </div>
              </div>

              {/* Access Role (Landlord / Team only) */}
              {role === "owner" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Access Role *
                  </label>
                  <div className="relative">
                    <select
                      value={accessRole}
                      onChange={(e) => setAccessRole(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all cursor-pointer"
                    >
                      <option value="Owner">Owner (Portfolio & Financial Control)</option>
                      <option value="Admin">Admin (Workspace Administrator)</option>
                      <option value="Manager">Manager (Property & Tenant Operations)</option>
                      <option value="Employee">Employee (Staff & Operations)</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                  />
                </div>
              </div>

              {/* Mobile Phone with Country Code Picker & Validation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number
                </label>
                <CountryPhoneInput
                  value={phone}
                  onChange={setPhone}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                />
              </div>

              {/* Role specific extra field (Owner portfolio size only) */}
              {role === "owner" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Estimated Property Portfolio Size
                  </label>
                  <div className="relative">
                    <select
                      value={portfolioSize}
                      onChange={(e) => setPortfolioSize(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all cursor-pointer"
                    >
                      <option value="1-5">1 - 5 Properties / Units</option>
                      <option value="6-20">6 - 20 Properties / Units</option>
                      <option value="21-50">21 - 50 Properties / Units</option>
                      <option value="50+">50+ Large Portfolio</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Create Password
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
                      placeholder="8+ characters"
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full pl-10 pr-9 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        isPasswordMismatch 
                          ? "border-red-400 focus:ring-red-400/20 focus:border-red-500" 
                          : isPasswordMatched 
                          ? "border-emerald-400 focus:ring-emerald-400/20 focus:border-emerald-500"
                          : "border-slate-200 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator & Mismatch Indicator */}
              <div className="space-y-1.5">
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Password Strength:</span>
                      <span className={strength >= 3 ? "text-emerald-600" : "text-amber-600"}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 transition-all ${
                            step < strength ? strengthColors[strength] : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Password Match Alert */}
                {isPasswordMismatch && (
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Passwords do not match</span>
                  </p>
                )}
                {isPasswordMatched && (
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Passwords match perfectly</span>
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] border-slate-300 accent-[#FF6B00] shrink-0"
                  />
                  <span className="text-xs font-normal text-slate-600 leading-tight">
                    I agree to the RentAwas{" "}
                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Terms of Service"); }} className="font-semibold text-slate-900 underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Privacy Policy"); }} className="font-semibold text-slate-900 underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isPasswordMismatch}
                className="w-full py-3 px-4 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Free RentAwas Account</span>
                    <Sparkles className="w-4 h-4 text-orange-200" />
                  </>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Or Sign Up With
              </span>
            </div>

            {/* Single SSO Google Button */}
            <div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const callbackUrl = new URL("/auth/callback", window.location.origin);
                    callbackUrl.searchParams.set("role", role);
                    callbackUrl.searchParams.set(
                      "next",
                      role === "tenant" ? "/tenant/dashboard" : "/onboarding"
                    );

                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: callbackUrl.toString(),
                        queryParams: {
                          access_type: "offline",
                          prompt: "consent",
                        },
                      },
                    });
                    if (error) alert(error.message);
                  } catch {
                    alert("Google sign-up failed. Please try again.");
                  }
                }}
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

            {/* Footer Log In Link */}
            <p className="text-center text-xs text-slate-500 mt-5 font-normal">
              Already have a RentAwas account?{" "}
              <Link href="/login" className="font-bold text-[#FF6B00] hover:underline">
                Sign In
              </Link>
            </p>

          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 z-10">
        &copy; {new Date().getFullYear()} RentAwas. A product of ANSH Apps. All rights reserved.
      </footer>
    </div>
  );
}
