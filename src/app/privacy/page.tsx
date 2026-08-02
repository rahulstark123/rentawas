"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ShieldCheck,
  Lock,
  FileText,
  Eye,
  CreditCard,
  UserCheck,
  Building2,
  Server,
  RefreshCw,
  Mail,
  Search,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Clock,
  Database,
  KeyRound,
  Users,
  AlertCircle,
  HardDrive,
  FileSpreadsheet
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const lastUpdated = "August 2, 2026";

  const handleCopyLink = (sectionId: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/privacy#${sectionId}`;
      navigator.clipboard.writeText(url);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const sections = [
    {
      id: "scope-overview",
      title: "1. Scope & Overview",
      icon: ShieldCheck,
      badge: "Core Policy",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            Welcome to <strong>RentAwas</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), a property management and rent collection SaaS platform operated by <strong>ANSH Apps</strong>. This Privacy Policy governs your access to and use of the RentAwas website, web applications, landlord management dashboards, tenant portals, and associated mobile or API services (collectively, the &quot;Platform&quot;).
          </p>
          <p>
            We are committed to safeguarding the privacy and security of all individuals who interact with our Platform, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 font-medium">
            <li><strong>Property Owners &amp; Landlords:</strong> Individuals, property managers, or real estate organizations managing rental units, billing, and tenant relationships.</li>
            <li><strong>Tenants &amp; Occupants:</strong> Individuals residing in properties managed via RentAwas who pay rent, submit maintenance tickets, or view lease agreements.</li>
            <li><strong>Prospective Tenants &amp; Visitors:</strong> Individuals browsing property listings, submitting inquiry forms, or interacting with public RentAwas pages.</li>
          </ul>
          <p>
            By creating an account, accessing the Platform, or utilizing any of our rent collection and property management services, you acknowledge that you have read, understood, and agreed to the data practices described in this Privacy Policy.
          </p>
        </div>
      ),
    },
    {
      id: "information-we-collect",
      title: "2. Information We Collect",
      icon: Database,
      badge: "Data Collection",
      content: (
        <div className="space-y-6 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            To provide efficient rental management, automated billing, digital lease generation, and maintenance dispatching, we collect specific categories of personal and technical data:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Users className="w-4 h-4 text-[#FF6B00]" />
                <span>A. Account &amp; Identity Information</span>
              </div>
              <p className="text-xs text-slate-600">
                Full name, primary email address, mobile phone number, password credentials, profile photo/avatar, user role (Landlord or Tenant), and authentication identifiers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-[#FF6B00]" />
                <span>B. Property &amp; Workspace Data</span>
              </div>
              <p className="text-xs text-slate-600">
                Property names, unit numbers, physical addresses, floor numbers, occupancy status, workspace settings, business entity name, tax IDs, and registered office details.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileText className="w-4 h-4 text-[#FF6B00]" />
                <span>C. Tenancy &amp; Lease Records</span>
              </div>
              <p className="text-xs text-slate-600">
                Lease start/end dates, monthly rent amount, security deposit amounts, due dates, emergency contact details, lease documents, digital signatures, and property notice logs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CreditCard className="w-4 h-4 text-[#FF6B00]" />
                <span>D. Payment &amp; Financial Metadata</span>
              </div>
              <p className="text-xs text-slate-600">
                Rent billing invoices, payment statuses, receipt records, bank payout account details (IFSC, Account Number/VPA for landlords), and payment gateway transaction references.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileSpreadsheet className="w-4 h-4 text-[#FF6B00]" />
                <span>E. Tenant Verification Documents</span>
              </div>
              <p className="text-xs text-slate-600">
                Government identity documents (e.g., Aadhaar card, PAN, Passport, or Voter ID uploads) submitted voluntarily by tenants for identity verification or lease generation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <HardDrive className="w-4 h-4 text-[#FF6B00]" />
                <span>F. Technical &amp; Device Metadata</span>
              </div>
              <p className="text-xs text-slate-600">
                IP addresses, browser type, operating system, session cookies, page response times, error logs, and AI invoice parsing usage logs.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "how-we-use-information",
      title: "3. How We Use Your Information",
      icon: Sparkles,
      badge: "Data Purpose",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            RentAwas processes collected data solely for legitimate business operations, platform performance, and statutory compliance. Key operational uses include:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-100">
              <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 text-sm">Rent Billing &amp; Automated Collections:</strong>
                <p className="text-xs text-slate-600 mt-0.5">Generating automated monthly rent invoices, sending due date notifications, recording payments, and dispatching digital rent receipts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-100">
              <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 text-sm">Lease &amp; Notice Administration:</strong>
                <p className="text-xs text-slate-600 mt-0.5">Enabling landlords and tenants to create, sign, store, and access digital rental agreements, eviction notices, or rent revision notices.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-100">
              <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 text-sm">Maintenance &amp; Service Dispatching:</strong>
                <p className="text-xs text-slate-600 mt-0.5">Routing maintenance requests (photos, descriptions, urgency levels) submitted by tenants to property managers or certified doorstep service experts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-100">
              <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 text-sm">Platform Security &amp; Fraud Prevention:</strong>
                <p className="text-xs text-slate-600 mt-0.5">Detecting unauthorized login attempts, preventing fraudulent payment activity, and ensuring multi-tenant data isolation.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "payment-security",
      title: "4. Payment Gateway & Financial Security",
      icon: CreditCard,
      badge: "PCI-DSS Security",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            RentAwas provides integrated online rent payment processing through trusted PCI-DSS Level 1 compliant payment gateways, including <strong>Razorpay</strong>, <strong>Stripe</strong>, and <strong>PayPal</strong>, alongside UPI apps (Google Pay, PhonePe, Paytm).
          </p>

          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-[#FF6B00]">
              <Lock className="w-5 h-5" />
              <span>We Never Store Raw Card or UPI PIN Credentials</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When tenants pay rent via Credit Card, Debit Card, NetBanking, or UPI, payment details are submitted directly to the PCI-compliant payment gateway via encrypted tokens. RentAwas servers only receive confirmation tokens, transaction IDs, payment methods used, and completion statuses.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Landlords configuring custom API integration keys (e.g. Razorpay Key ID / Secret or Stripe Connect details) have their API keys securely encrypted in database storage using AES-256 encryption.
          </p>
        </div>
      ),
    },
    {
      id: "tenant-verification-documents",
      title: "5. Tenant Verification & Document Handling",
      icon: UserCheck,
      badge: "Document Privacy",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            RentAwas allows landlords and property managers to upload or request tenant verification documents (such as Government ID proofs, employment letters, or police verification forms).
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 font-medium text-sm">
            <li><strong>Restricted Workspace Access:</strong> Uploaded identity documents are strictly accessible only by the authorized Landlord/Property Manager of that workspace and the respective tenant.</li>
            <li><strong>Private Cloud Storage:</strong> Documents are stored in encrypted private cloud storage buckets with short-lived signed URLs, preventing public indexing or unauthorized web access.</li>
            <li><strong>No Unrelated Data Monetization:</strong> Tenant documents are strictly used for lease administration and identity verification. They are never shared with third-party advertisers.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "third-party-services",
      title: "6. Third-Party Services & Integrations",
      icon: Server,
      badge: "Service Partners",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            To deliver real-time infrastructure, RentAwas integrates with carefully audited third-party service providers:
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-900">Database &amp; Authentication:</strong>
                <span className="text-slate-600 block">Supabase / PostgreSQL — Encrypted user authentication and session management.</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px]">SOC 2 Certified Infrastructure</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-900">Payment Infrastructure:</strong>
                <span className="text-slate-600 block">Razorpay, Stripe, PayPal — Payment tokenization &amp; automated rent payouts.</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px]">PCI-DSS Level 1</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-900">Transactional Messaging:</strong>
                <span className="text-slate-600 block">Resend, Twilio, WhatsApp Business API — Rent receipts, bill reminders, and OTP verification.</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px]">Encrypted Transit</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "data-security-encryption",
      title: "7. Data Security, Isolation & Encryption",
      icon: Lock,
      badge: "Data Isolation",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            RentAwas employs robust, multi-layered technical and organizational safeguards to ensure data confidentiality and integrity:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-1">
              <span className="text-xl font-extrabold text-[#FF6B00] block">TLS 1.3</span>
              <span className="text-xs font-semibold text-slate-700 block">In-Transit Encryption</span>
              <span className="text-[11px] text-slate-500 block">All network requests are encrypted using modern HTTPS protocols.</span>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-1">
              <span className="text-xl font-extrabold text-[#FF6B00] block">AES-256</span>
              <span className="text-xs font-semibold text-slate-700 block">At-Rest Storage Encryption</span>
              <span className="text-[11px] text-slate-500 block">Database volumes and sensitive credentials are encrypted at rest.</span>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-1">
              <span className="text-xl font-extrabold text-[#FF6B00] block">RBAC</span>
              <span className="text-xs font-semibold text-slate-700 block">Tenant Data Isolation</span>
              <span className="text-[11px] text-slate-500 block">Strict multi-tenant security barriers prevent cross-workspace data access.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "user-rights-deletion",
      title: "8. Data Retention & Your Privacy Rights",
      icon: KeyRound,
      badge: "User Control",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            You retain full control over your personal data. In compliance with applicable privacy regulations (including India&apos;s Digital Personal Data Protection Act and international frameworks), you have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 font-medium text-sm">
            <li><strong>Right to Access &amp; Export:</strong> Request a copy of your personal data, rental receipts, and workspace history in machine-readable format.</li>
            <li><strong>Right to Rectification:</strong> Update inaccurate profile information or workspace settings directly through your dashboard.</li>
            <li><strong>Right to Erasure / Account Deletion:</strong> Request full permanent deletion of your account and personal records by contacting support. Tax and transaction logs required by legal regulations will be retained securely for statutory retention periods.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "cookies-tracking",
      title: "9. Cookies & Local Storage",
      icon: Eye,
      badge: "Cookies Policy",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            RentAwas uses essential session cookies and browser local storage to maintain active authentication logins, remember active workspace selections, and store user interface preferences (such as dark/light theme or currency format).
          </p>
          <p className="text-xs text-slate-500">
            We do not use intrusive cross-site tracking cookies. You may disable cookies in your web browser settings, though doing so may limit essential dashboard authentication features.
          </p>
        </div>
      ),
    },
    {
      id: "updates-contact",
      title: "10. Updates & Contact Information",
      icon: Mail,
      badge: "Policy Contact",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            We may periodically update this Privacy Policy to reflect platform enhancements, legal requirements, or security upgrades. Material policy changes will be communicated via dashboard notification or email.
          </p>
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <h4 className="font-bold text-base text-[#FF6B00]">Have Questions or Privacy Requests?</h4>
            <p className="text-xs text-slate-300">
              For any questions, data access requests, or privacy concerns regarding RentAwas or ANSH Apps, please contact our Data Protection Officer:
            </p>
            <div className="space-y-1 text-xs font-mono text-slate-200">
              <p>Email: <a href="mailto:privacy@rentawas.com" className="text-[#FF6B00] underline">privacy@rentawas.com</a> / <a href="mailto:support.rentawas@anshapps.com" className="text-[#FF6B00] underline">support.rentawas@anshapps.com</a></p>
              <p>Parent Company: ANSH Apps</p>
              <p>Application: RentAwas SaaS Property Management</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-600">
      <Navbar variant="dark" />

      {/* Header Banner Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20 bg-[#0B132B] text-white border-b border-slate-800 overflow-hidden">
        {/* Glow backdrop accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] bg-[#FF6B00]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>RentAwas Legal &amp; Compliance</span>
          </div>

          <div className="space-y-3 max-w-4xl">
            <h1
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Privacy &amp; Data <span className="text-[#FF6B00]">Protection Policy</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-medium leading-relaxed">
              We respect your trust. Learn how RentAwas collects, processes, isolates, and protects property management data, tenant records, and rent transactions.
            </p>
          </div>

          {/* Metadata bar */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6B00]" />
              <span>Last Updated: <strong>{lastUpdated}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#FF6B00]" />
              <span>Entity: <strong>ANSH Apps</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Status: <strong className="text-emerald-400">256-Bit Encrypted &amp; PCI Compliant</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Zero Data Selling</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">We never sell personal or rental data to advertisers.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Bank-Grade Encryption</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">AES-256 data protection at rest &amp; TLS 1.3 in transit.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">PCI Payment Security</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Payments tokenized via Razorpay, Stripe &amp; PayPal.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Data Ownership</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Landlords &amp; Tenants retain 100% control of records.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs sticky top-24">
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF6B00]" />
                  <span>Table of Contents</span>
                </h3>

                {/* Quick Filter Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search policy sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#FF6B00] font-medium"
                  />
                </div>

                {/* Nav Links */}
                <nav className="space-y-1 max-h-[55vh] overflow-y-auto pr-1">
                  {filteredSections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-[#FF6B00] transition-colors group"
                    >
                      <span className="truncate">{sec.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#FF6B00] transition-opacity shrink-0" />
                    </a>
                  ))}
                </nav>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Link
                    href="/terms"
                    className="flex items-center justify-between text-xs font-bold text-slate-600 hover:text-[#FF6B00] transition-colors"
                  >
                    <span>Read Terms of Service</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="mailto:privacy@rentawas.com"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Contact Privacy Officer</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Privacy Text Sections */}
          <div className="lg:col-span-8 space-y-10">
            {filteredSections.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800">No matching sections found</h3>
                <p className="text-xs text-slate-500">Try searching for terms like &quot;payment&quot;, &quot;cookies&quot;, or &quot;deletion&quot;.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-xl bg-orange-100 text-[#FF6B00] font-bold text-xs"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => {
                const IconComponent = sec.icon;
                return (
                  <section
                    key={sec.id}
                    id={sec.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs scroll-mt-28 hover:border-orange-200 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-100/70 border border-orange-200 text-[#FF6B00] flex items-center justify-center font-bold shrink-0">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider block w-fit mb-0.5">
                            {sec.badge}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            {sec.title}
                          </h2>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyLink(sec.id)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#FF6B00] transition-colors font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:border-orange-200"
                        title="Copy link to this section"
                      >
                        {copiedSection === sec.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Share Section</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div>{sec.content}</div>
                  </section>
                );
              })
            )}

            {/* Bottom Support Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF6B00]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-2 relative z-10">
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-[#FF6B00] text-xs font-black uppercase tracking-wider">
                  Data Protection Governance
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  Need Clarification or Data Export Assistance?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                  Our dedicated privacy team is available to handle tenant verification inquiries, landlord data export requests, and compliance verification.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10 pt-2">
                <a
                  href="mailto:privacy@rentawas.com"
                  className="px-6 py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Privacy DPO</span>
                </a>
                <Link
                  href="/terms"
                  className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-700"
                >
                  <span>View Terms of Service</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
