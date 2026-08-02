"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FileText,
  ShieldCheck,
  Scale,
  Building2,
  CreditCard,
  UserCheck,
  FileCheck2,
  Wrench,
  AlertTriangle,
  Lock,
  Mail,
  Search,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Clock,
  HelpCircle,
  Briefcase,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";

export default function TermsOfServicePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const lastUpdated = "August 2, 2026";

  const handleCopyLink = (sectionId: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/terms#${sectionId}`;
      navigator.clipboard.writeText(url);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const sections = [
    {
      id: "acceptance-terms",
      title: "1. Acceptance of Terms",
      icon: Scale,
      badge: "Core Agreement",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            Welcome to <strong>RentAwas</strong> (&quot;Platform&quot;), a property management and rent collection software-as-a-service (SaaS) solution engineered and operated by <strong>ANSH Apps</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
          </p>
          <p>
            By registering an account, creating a workspace, listing a property, paying rent, or accessing any service provided via <strong>rentawas.com</strong> or associated applications, you (&quot;User,&quot; &quot;Landlord,&quot; &quot;Tenant,&quot; or &quot;Subscriber&quot;) agree to be bound by these Terms of Service (&quot;Terms&quot;), as well as our <Link href="/privacy" className="text-[#FF6B00] underline font-medium">Privacy Policy</Link>.
          </p>
          <p className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            If you are entering into these Terms on behalf of a company, partnership, or legal entity, you represent that you have full legal authority to bind such entity to these provisions. If you do not agree to these Terms, you must not access or use the Platform.
          </p>
        </div>
      ),
    },
    {
      id: "platform-services-description",
      title: "2. Description of Platform Services",
      icon: Building2,
      badge: "Services Scope",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            RentAwas provides cloud-based digital infrastructure for real estate property operations, including:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#FF6B00]" />
                Landlord &amp; Owner Management Suite
              </strong>
              <p className="text-slate-600 text-xs">
                Multi-unit portfolio management, unit tracking, occupancy analytics, automated rent invoicing, expense tracking, and digital notices.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF6B00]" />
                Integrated Rent Collections
              </strong>
              <p className="text-slate-600 text-xs">
                Automated monthly rent billing, payment link generation, receipt delivery, and gateway integrations (Razorpay, Stripe, PayPal, UPI).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#FF6B00]" />
                Tenant Self-Service Portal
              </strong>
              <p className="text-slate-600 text-xs">
                Digital rent payments via credit card/UPI, access to online lease agreements, payment history downloads, and maintenance ticket logging.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 font-bold flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#FF6B00]" />
                Doorstep Expert Maintenance
              </strong>
              <p className="text-slate-600 text-xs">
                On-demand dispatch coordination for background-checked local technicians handling plumbing, electrical, AC servicing, and carpentry.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "user-accounts-roles",
      title: "3. Account Registration & User Responsibilities",
      icon: UserCheck,
      badge: "Account Terms",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            Users are categorized based on platform roles. Each role entails specific obligations:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 text-xs sm:text-sm space-y-1.5">
              <h4 className="font-extrabold text-[#FF6B00]">A. Property Owners &amp; Landlords</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
                <li>Must provide accurate property details, rental pricing, security deposit terms, and valid bank account payout credentials.</li>
                <li>Responsible for obtaining all statutory permits, building approvals, and local tenancy permissions required for letting properties.</li>
                <li>Solely responsible for local tax compliance (e.g. GST, rental income reporting, municipal property tax filings).</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 text-xs sm:text-sm space-y-1.5">
              <h4 className="font-extrabold text-[#FF6B00]">B. Tenants &amp; Residents</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
                <li>Obligated to pay rent and utility bills on or before agreed due dates specified in their tenancy terms.</li>
                <li>Must provide accurate identity documentation (e.g. Aadhaar, PAN, Passport) when requested for verification.</li>
                <li>Must use maintenance ticketing responsibly and avoid logging fraudulent or malicious service dispatches.</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            <strong>Account Security:</strong> You are responsible for safeguarding your login credentials. RentAwas is not liable for losses resulting from unauthorized account access caused by weak passwords or credential sharing.
          </p>
        </div>
      ),
    },
    {
      id: "rent-billing-subscriptions",
      title: "4. Rent Collections, Subscriptions & Gateway Terms",
      icon: CreditCard,
      badge: "Billing Terms",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            RentAwas facilitates rent billing and workspace subscriptions through integrated payment gateways:
          </p>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 font-bold block mb-1">A. Landlord Fee Policy &amp; Subscriptions:</strong>
              <p className="text-slate-600">
                Landlords enjoy <strong>0% platform commission fees</strong> on direct UPI rent collections. Workspace plans (Free Trial, Starter, Pro, Pro Plus) are billed on a recurring monthly or annual basis as specified in subscription settings.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 font-bold block mb-1">B. Payment Gateway Facilitation:</strong>
              <p className="text-slate-600">
                RentAwas operates as a SaaS platform provider, not a bank, escrow agent, or financial institution. Payments processed via Razorpay, Stripe, or PayPal are subject to respective payment gateway terms and payout schedules (e.g. T+1 or T+2 settlement cycles).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 font-bold block mb-1">C. Rent Refunds &amp; Payment Disputes:</strong>
              <p className="text-slate-600">
                Rent payment refunds or security deposit disputes must be resolved directly between the Landlord and Tenant. RentAwas does not hold custody of rent funds and cannot unilaterally reverse completed bank transfers unless required by payment gateway fraud protocols.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "digital-lease-disclaimer",
      title: "5. Digital Lease Agreements & Legal Notice Tools",
      icon: FileCheck2,
      badge: "Legal Disclaimer",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            RentAwas offers automated document generators for rental agreements, tenancy notices, and digital signatures.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Legal Disclaimer &amp; Verification Notice</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Lease templates and notice builders provided on RentAwas are for general administrative convenience only and do not constitute formal legal advice. Landlords and Tenants are strongly advised to consult qualified legal counsel and register rental agreements under applicable state laws (such as local Rent Control Acts or Stamp Duty regulations).
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "maintenance-doorstep-services",
      title: "6. Doorstep Maintenance & Service Dispatches",
      icon: Wrench,
      badge: "Maintenance Services",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            RentAwas connects users with certified local maintenance experts for plumbing, electrical, AC servicing, and repair work:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 font-medium text-xs sm:text-sm">
            <li><strong>Technician Verification:</strong> Independent technicians dispatched via RentAwas undergo identity verification and background checks.</li>
            <li><strong>Property Access &amp; Safety:</strong> Tenants or landlords must provide reasonable property access at scheduled appointment times.</li>
            <li><strong>Warranty &amp; Service Limits:</strong> Doorstep repairs carry specific service guarantees detailed at dispatch. RentAwas is not liable for pre-existing structural flaws or unapproved alterations made to properties.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "prohibited-conduct",
      title: "7. Prohibited Conduct & Account Termination",
      icon: AlertCircle,
      badge: "Conduct Rules",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            Users must refrain from misuse of the Platform. Prohibited activities include:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 text-slate-800 space-y-1">
              <strong className="text-red-700 font-bold block">Fake Listings or Rent Scamming</strong>
              <span>Listing properties without ownership rights or creating fraudulent rent invoices.</span>
            </div>

            <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 text-slate-800 space-y-1">
              <strong className="text-red-700 font-bold block">Unauthorized Data Scraping</strong>
              <span>Using automated bots, scrapers, or scripts to harvest property listings or user data.</span>
            </div>

            <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 text-slate-800 space-y-1">
              <strong className="text-red-700 font-bold block">Harassment &amp; Illegal Notices</strong>
              <span>Issuing unlawful eviction notices or using communication tools for harassment.</span>
            </div>

            <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 text-slate-800 space-y-1">
              <strong className="text-red-700 font-bold block">Malware &amp; Reverse Engineering</strong>
              <span>Decompiling platform code or uploading virus-laden file attachments.</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            RentAwas reserves the right to immediately suspend or terminate accounts violating these guidelines without prior notice or refund.
          </p>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      title: "8. Intellectual Property Rights",
      icon: Sparkles,
      badge: "IP & Branding",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            All intellectual property rights in the RentAwas Platform — including logos, trade names, UI designs, software code, branding assets, and database schemas — are owned exclusively by <strong>ANSH Apps</strong>.
          </p>
          <p className="text-xs text-slate-500">
            Users retain ownership of their uploaded property photos, lease documents, and workspace content, granting RentAwas a non-exclusive license to host and process such data solely for operational delivery.
          </p>
        </div>
      ),
    },
    {
      id: "limitation-liability",
      title: "9. Limitation of Liability & Disclaimers",
      icon: ShieldCheck,
      badge: "Liability Terms",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            To the maximum extent permitted by applicable law:
          </p>

          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
            <h4 className="font-bold text-[#FF6B00] text-sm">&quot;AS IS&quot; &amp; &quot;AS AVAILABLE&quot; Disclaimer</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              RentAwas is provided without warranties of any kind, whether express or implied. We do not warrant that platform operations will be uninterrupted, error-free, or immune to third-party payment gateway downtime.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
              In no event shall ANSH Apps or its officers be liable for indirect, incidental, punitive, or consequential damages arising from tenancy disputes, rent payment delays, or property maintenance issues.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "governing-law-jurisdiction",
      title: "10. Governing Law & Dispute Resolution",
      icon: Briefcase,
      badge: "Jurisdiction",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>.
          </p>
          <p className="text-xs text-slate-600">
            Any legal suit, action, or proceeding arising out of or related to these Terms or the RentAwas Platform shall be subject to the exclusive jurisdiction of the competent courts located in <strong>New Delhi, India</strong>, or the primary operating city specified in the user&apos;s workspace settings.
          </p>
        </div>
      ),
    },
    {
      id: "contact-legal-information",
      title: "11. Contact & Legal Support",
      icon: Mail,
      badge: "Legal Support",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            If you have any questions, legal notices, or feedback regarding these Terms of Service, please contact our legal team:
          </p>
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <h4 className="font-bold text-base text-[#FF6B00]">RentAwas Legal Department</h4>
            <div className="space-y-1 text-xs font-mono text-slate-200">
              <p>Email: <a href="mailto:legal@rentawas.com" className="text-[#FF6B00] underline">legal@rentawas.com</a> / <a href="mailto:support.rentawas@anshapps.com" className="text-[#FF6B00] underline">support.rentawas@anshapps.com</a></p>
              <p>Parent Entity: ANSH Apps</p>
              <p>Website: <a href="https://anshapps.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] underline">anshapps.com</a></p>
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
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest">
            <Scale className="w-4 h-4" />
            <span>RentAwas Legal Framework</span>
          </div>

          <div className="space-y-3 max-w-4xl">
            <h1
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Terms of <span className="text-[#FF6B00]">Service</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-medium leading-relaxed">
              Please review the terms and conditions governing the use of RentAwas property management software, rent collections, lease tools, and maintenance dispatches.
            </p>
          </div>

          {/* Metadata bar */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6B00]" />
              <span>Effective Date: <strong>{lastUpdated}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#FF6B00]" />
              <span>Operator: <strong>ANSH Apps</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Governance: <strong>Indian Jurisdictional Compliance</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Guarantees / Highlights Bar */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">0% Landlord UPI Fees</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">No commission on direct landlord UPI collections.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Digital Leases</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Automated agreement builders &amp; sign logs.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verified Experts</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Background-checked doorstep repair dispatches.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Isolated Workspaces</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Role-based security &amp; private lease vaults.</p>
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
                  <span>Terms Index</span>
                </h3>

                {/* Quick Filter Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search terms sections..."
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
                    href="/privacy"
                    className="flex items-center justify-between text-xs font-bold text-slate-600 hover:text-[#FF6B00] transition-colors"
                  >
                    <span>Read Privacy Policy</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="mailto:legal@rentawas.com"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Contact Legal Desk</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Terms Content Sections */}
          <div className="lg:col-span-8 space-y-10">
            {filteredSections.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800">No matching sections found</h3>
                <p className="text-xs text-slate-500">Try searching for terms like &quot;rent&quot;, &quot;lease&quot;, or &quot;liability&quot;.</p>
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
                  Legal Inquiry &amp; Support
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  Have Questions Regarding Platform Terms?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                  Our legal desk is ready to clarify terms regarding payment settlements, digital lease generator disclaimers, or commercial workspace subscriptions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10 pt-2">
                <a
                  href="mailto:legal@rentawas.com"
                  className="px-6 py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Legal Desk</span>
                </a>
                <Link
                  href="/privacy"
                  className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-700"
                >
                  <span>View Privacy Policy</span>
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
