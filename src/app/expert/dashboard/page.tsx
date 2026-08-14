"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Star,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Upload,
  UserCheck,
  ShieldCheck,
  Sparkles,
  MapPin,
  FileText,
  X,
  Zap,
  TrendingUp,
  Download,
  Plus,
  Check,
  Settings,
  Wallet,
  Landmark,
  CreditCard,
  ArrowUpRight,
  RefreshCcw,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Shield,
  Info,
  Lock,
  QrCode,
  Phone,
  User,
  Mail,
  Award,
  Printer,
  Wrench,
  Globe,
  HeartPulse,
  PhoneCall,
  Pencil,
  Camera,
  Quote,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";

const INDIAN_GOVT_ID_TYPES = [
  "Aadhaar Card (12-Digit UIDAI)",
  "PAN Card (Permanent Account Number)",
  "Voter ID Card (EPIC)",
  "Driving License (Transport Dept)",
  "Passport (Ministry of External Affairs)",
  "Govt Trade & Skill Certification",
];

// Mock Expert Assigned Jobs Data (Covering Plumber, Electrician, Technician, Househelp, Inspector, Legal)
const INITIAL_EXPERT_JOBS = [
  {
    id: "EXP-JOB-1092",
    clientName: "Rajesh Goyal (Landlord)",
    propertyTitle: "The Regent - Wing A",
    floorUnit: "1st Floor, Unit 102",
    serviceType: "Plumbing & Water Leakage Inspection",
    scheduledDate: "Aug 14, 2026",
    feeAmount: 799,
    status: "Pending Accept",
    reportUploaded: false,
    notes: "Main bathroom flush tank leaking & kitchen sink drainage blockage.",
    clientPhone: "+91 98765 43210",
  },
  {
    id: "EXP-JOB-1088",
    clientName: "Neha Malhotra (Tenant)",
    propertyTitle: "Downtown Horizon Suites",
    floorUnit: "3rd Floor, Unit 301",
    serviceType: "AC Servicing & Electrical Wiring Audit",
    scheduledDate: "Aug 15, 2026",
    feeAmount: 999,
    status: "Accepted",
    reportUploaded: false,
    notes: "Split AC cooling issue & MCB trip check requested.",
    clientPhone: "+91 99887 76655",
  },
  {
    id: "EXP-JOB-1085",
    clientName: "Vikramaditya Sharma (Landlord)",
    propertyTitle: "Silver Oak Towers",
    floorUnit: "5th Floor, Unit 504",
    serviceType: "Water Line & Valve Leakage Audit",
    scheduledDate: "Aug 13, 2026",
    feeAmount: 1299,
    status: "In Progress",
    startedAt: Date.now() - 870000, // 14 mins ago
    reportUploaded: false,
    notes: "Main pressure valve leakage inspection.",
    clientPhone: "+91 98112 34567",
  },
  {
    id: "EXP-JOB-1045",
    clientName: "Amitabh Sen (Property Owner)",
    propertyTitle: "Greenwood Park Villas",
    floorUnit: "Ground Floor, Villa 12",
    serviceType: "Property Structural & Safety Inspection",
    scheduledDate: "Aug 08, 2026",
    feeAmount: 1499,
    status: "Completed",
    duration: "45 Mins",
    reportUploaded: true,
    reportName: "Structural_Inspection_Report_Villa12.pdf",
    notes: "Moisture leak test and electrical wiring load audit completed.",
    clientPhone: "+91 98112 23344",
  },
];

// Mock Client Reviews
const EXPERT_REVIEWS = [
  {
    id: "REV-301",
    clientName: "Rajesh Goyal",
    clientRole: "Property Owner",
    property: "The Regent - Wing A, Unit 102",
    rating: 5.0,
    date: "2 weeks ago",
    comment: "Punctual and highly skilled expert. Solved our water pipe leakage within 45 minutes! Tested water pressure and left premises completely clean.",
    service: "Plumbing Service",
    verifiedBooking: true,
    likes: 12,
  },
  {
    id: "REV-302",
    clientName: "Neha Malhotra",
    clientRole: "Tenant",
    property: "Downtown Horizon Suites, Unit 301",
    rating: 5.0,
    date: "1 month ago",
    comment: "Excellent AC repair service. Fixed cooling coil issue quickly and performed full electrical load test. Very polite & professional.",
    service: "AC & Electrical Servicing",
    verifiedBooking: true,
    likes: 8,
  },
  {
    id: "REV-303",
    clientName: "Amitabh Sen",
    clientRole: "Property Owner",
    property: "Greenwood Park Villas, Villa 12",
    rating: 4.9,
    date: "1 month ago",
    comment: "Thorough structural and moisture leakage inspection. The PDF report delivered via RentAwas was extremely detailed and accepted by society management.",
    service: "Property Inspection Audit",
    verifiedBooking: true,
    likes: 15,
  },
  {
    id: "REV-304",
    clientName: "Sanjay Singhania",
    clientRole: "Property Manager",
    property: "Orchid Heights, Tower B",
    rating: 5.0,
    date: "2 months ago",
    comment: "Trusted master partner for our multi-flat maintenance. Always reliable, prompt response times, and honest pricing.",
    service: "General Maintenance",
    verifiedBooking: true,
    likes: 21,
  },
  {
    id: "REV-305",
    clientName: "Vikramaditya Sharma",
    clientRole: "Property Owner",
    property: "Silver Oak Towers, Unit 504",
    rating: 5.0,
    date: "2 months ago",
    comment: "Replaced main water line valves and pressure regulator. Professional service, arrived strictly on scheduled time.",
    service: "Plumbing & Valve Repair",
    verifiedBooking: true,
    likes: 9,
  },
  {
    id: "REV-306",
    clientName: "Ananya Deshmukh",
    clientRole: "Tenant",
    property: "Palm Grove Apartments, Unit 202",
    rating: 4.8,
    date: "3 months ago",
    comment: "Fixed MCB tripping problem in kitchen. Verified all appliance sockets before signing off.",
    service: "Electrical Wiring Audit",
    verifiedBooking: true,
    likes: 5,
  },
  {
    id: "REV-307",
    clientName: "Priya Rastogi",
    clientRole: "Tenant",
    property: "Celestial Heights, Flat 1101",
    rating: 5.0,
    date: "3 months ago",
    comment: "Deep kitchen & bathroom plumbing service. Extremely thorough job, would recommend Ramesh to anyone in NCR.",
    service: "Deep Plumbing Inspection",
    verifiedBooking: true,
    likes: 14,
  },
  {
    id: "REV-308",
    clientName: "Tarun Verma",
    clientRole: "Property Owner",
    property: "Vasant Enclave, House 45",
    rating: 5.0,
    date: "3 months ago",
    comment: "Repaired main entry digital lock and wooden door frame. Neat work and very respectful team.",
    service: "Carpentry & Locks",
    verifiedBooking: true,
    likes: 7,
  },
  {
    id: "REV-309",
    clientName: "Rohit Mehta",
    clientRole: "Tenant",
    property: "Grand Arch, Tower C",
    rating: 4.9,
    date: "4 months ago",
    comment: "AC gas refilling & compressor filter cleaning. Cooling restored to optimal level within 30 mins.",
    service: "AC & HVAC Servicing",
    verifiedBooking: true,
    likes: 11,
  },
  {
    id: "REV-310",
    clientName: "Kavita Reddy",
    clientRole: "Property Owner",
    property: "Cyber City View Villas",
    rating: 5.0,
    date: "4 months ago",
    comment: "Conducted roof waterproofing moisture test. Provided clear diagnostic report with step-by-step resolution plan.",
    service: "Moisture & Roof Audit",
    verifiedBooking: true,
    likes: 18,
  },
  {
    id: "REV-311",
    clientName: "Alok Banerjee",
    clientRole: "Property Owner",
    property: "Mayfair Residency, Unit 402",
    rating: 5.0,
    date: "5 months ago",
    comment: "Pre-tenant inspection & repair work. Resolved all minor plumbing and light fixture issues in 1 day.",
    service: "Pre-Tenant Property Audit",
    verifiedBooking: true,
    likes: 16,
  },
  {
    id: "REV-312",
    clientName: "Sunita Kapoor",
    clientRole: "Tenant",
    property: "Sun City Heights, Unit 105",
    rating: 4.8,
    date: "5 months ago",
    comment: "Fixed bathroom drain clogging issue. Cleaned out pipe blockage thoroughly with specialized equipment.",
    service: "Drainage Unclogging",
    verifiedBooking: true,
    likes: 6,
  },
  {
    id: "REV-313",
    clientName: "Deepa Nair",
    clientRole: "Property Owner",
    property: "Magnolia Park, Villa 8",
    rating: 5.0,
    date: "6 months ago",
    comment: "Washing machine inlet pipe leakage repair & water filter installation. Flawless work quality.",
    service: "Appliance Installation",
    verifiedBooking: true,
    likes: 10,
  },
  {
    id: "REV-314",
    clientName: "Harsh Vardhan",
    clientRole: "Tenant",
    property: " DLF Phase 5, Apartment 703",
    rating: 5.0,
    date: "6 months ago",
    comment: "Wall dampness repair & touchup painting. Very neat execution with zero mess left behind.",
    service: "Wall Dampness & Painting",
    verifiedBooking: true,
    likes: 13,
  },
];

// Mock Payout & Earnings Transaction Ledger
const INITIAL_PAYOUT_TRANSACTIONS = [
  {
    id: "PAY-2026-0811",
    date: "Aug 11, 2026",
    time: "09:30 AM",
    type: "Weekly Auto-Payout",
    category: "payout",
    description: "Weekly automated withdrawal to HDFC Bank (**** 8912)",
    grossAmount: 18500,
    feeAmount: 0,
    tdsAmount: 185,
    netAmount: 18315,
    status: "Transferred",
    utrNumber: "UTR8912039412",
    methodName: "HDFC Bank (IMPS)",
  },
  {
    id: "PAY-2026-0808",
    date: "Aug 08, 2026",
    time: "04:15 PM",
    type: "Consultation Fee Credit",
    category: "credit",
    description: "Property Structural & Safety Inspection — Villa 12 (EXP-JOB-1045)",
    grossAmount: 1499,
    feeAmount: 0,
    tdsAmount: 15,
    netAmount: 1484,
    status: "Credited to Wallet",
    utrNumber: "ESCROW-1045",
    methodName: "RentAwas Escrow",
  },
  {
    id: "PAY-2026-0804",
    date: "Aug 04, 2026",
    time: "09:30 AM",
    type: "Weekly Auto-Payout",
    category: "payout",
    description: "Weekly automated withdrawal to HDFC Bank (**** 8912)",
    grossAmount: 24200,
    feeAmount: 0,
    tdsAmount: 242,
    netAmount: 23958,
    status: "Transferred",
    utrNumber: "UTR7719203912",
    methodName: "HDFC Bank (IMPS)",
  },
  {
    id: "PAY-2026-0801",
    date: "Aug 01, 2026",
    time: "11:20 AM",
    type: "Consultation Fee Credit",
    category: "credit",
    description: "Plumbing Pipe Repair — Unit 102 (EXP-JOB-1092)",
    grossAmount: 799,
    feeAmount: 0,
    tdsAmount: 8,
    netAmount: 791,
    status: "Credited to Wallet",
    utrNumber: "ESCROW-1092",
    methodName: "RentAwas Escrow",
  },
];

// Available Working Hour Time Slots
const WORK_TIME_SLOTS = [
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM (Noon)",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM (Midnight)",
];

// Supported Indian & Regional Languages for Expert Communication
const ALL_INDIAN_LANGUAGES = [
  "Hindi (हिंदी)",
  "English",
  "Punjabi (ਪੰਜਾਬੀ)",
  "Bengali (বাংলা)",
  "Marathi (मराठी)",
  "Telugu (తెలుగు)",
  "Tamil (தமிழ்)",
  "Gujarati (ગુજરાતી)",
  "Kannada (ಕನ್ನಡ)",
  "Malayalam (മലയാളം)",
  "Odia (ଓଡ଼ିଆ)",
  "Assamese (অসমীয়া)",
  "Urdu (اردو)",
  "Bhojpuri (भोजपुरी)",
  "Haryanvi (हरियाणवी)",
  "Maithili (मैथिली)",
  "Marwari (मारवाड़ी)",
  "Nepali (नेपाली)",
  "Arabic (العربية)",
  "French (Français)",
];

// Mock Expert Official Documents & RentAwas Agreements
const INITIAL_EXPERT_DOCUMENTS = [
  {
    id: "DOC-RA-2026-001",
    title: "RentAwas_Certified_Expert_Empanelment_Agreement.pdf",
    category: "RentAwas Issued Agreement",
    issuer: "RentAwas Operations (ANSH Apps)",
    date: "Jan 10, 2026",
    fileSize: "1.8 MB",
    status: "Digitally Signed & Verified",
    badgeText: "Official RentAwas Agreement",
    badgeColor: "emerald",
    isRentAwasIssued: true,
    description: "Master expert partner empanelment & service agreement issued by RentAwas (ANSH Apps).",
  },
  {
    id: "DOC-RA-2026-002",
    title: "RentAwas_Service_Level_Agreement_SLA_2026.pdf",
    category: "RentAwas Issued Agreement",
    issuer: "RentAwas Operations Desk",
    date: "Feb 01, 2026",
    fileSize: "1.2 MB",
    status: "Active & Binding",
    badgeText: "Official RentAwas SLA",
    badgeColor: "blue",
    isRentAwasIssued: true,
    description: "Standard SLA turnaround guidelines, service quality compliance, and payout terms.",
  },
  {
    id: "DOC-RA-2026-003",
    title: "Government_Trade_Verification_and_ID_Deed.pdf",
    category: "Compliance Deed",
    issuer: "RentAwas Compliance Desk",
    date: "Jan 12, 2026",
    fileSize: "890 KB",
    status: "Verified & Active",
    badgeText: "Compliance Deed",
    badgeColor: "purple",
    isRentAwasIssued: true,
    description: "Identity verification, background safety check, and trade license compliance deed.",
  },
];

function ExpertDashboardContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { currency, currencySymbol, setCurrency } = useCurrency();

  const defaultCountry = ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0];
  const [profilePhoneCountry, setProfilePhoneCountry] = useState<Country>(defaultCountry);
  const [emergencyPhoneCountry, setEmergencyPhoneCountry] = useState<Country>(defaultCountry);
  const [upiPhoneCountry, setUpiPhoneCountry] = useState<Country>(defaultCountry);

  const tabParam = searchParams.get("tab") || "assignments";
  const activeTab = (tabParam === "assignments" || tabParam === "jobs" || !searchParams.get("tab")) ? "jobs" : tabParam === "documents" ? "reports" : tabParam === "dashboard" ? "overview" : tabParam;

  // Jobs State & Skeleton Loading State
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [selectedJobForReport, setSelectedJobForReport] = useState<any | null>(null);
  const [reportFileName, setReportFileName] = useState("Official_Service_Report.pdf");
  const [reportNotes, setReportNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Completion Fee Edit, 6-Digit OTP Security QR & Customer Rating State
  const [completionFeeAmount, setCompletionFeeAmount] = useState<number>(0);
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [customerRating, setCustomerRating] = useState<number>(5);
  const [customerRatingTags, setCustomerRatingTags] = useState<string[]>(["Polite & Respectful", "Prompt On-Site Access"]);

  const openCompletionModal = (job: any) => {
    setSelectedJobForReport(job);
    setCompletionFeeAmount(job.feeAmount || 599);
    setEnteredOtp("");
    setIsOtpVerified(false);
    setCustomerRating(5);
    setCustomerRatingTags(["Polite & Respectful", "Prompt On-Site Access"]);
  };

  // Reviews State & Skeleton Loading State
  const [expertReviews, setExpertReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 8;
  const totalReviewPages = Math.max(1, Math.ceil(expertReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = expertReviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

  // Profile Personal Information & Digital ID State
  const [expertCategory, setExpertCategory] = useState("Plumbing & Water Systems");
  const [profileName, setProfileName] = useState("Ramesh Kumar");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string>("");
  const [profileEmail, setProfileEmail] = useState("ramesh.tech@rentawas.in");
  const [profilePhone, setProfilePhone] = useState("+91 98765 43210");
  const [profileGovtIdType, setProfileGovtIdType] = useState("Aadhaar Card (12-Digit UIDAI)");
  const [profileGovtIdNumber, setProfileGovtIdNumber] = useState("4912 8890 1234");
  const [profileSpecialization, setProfileSpecialization] = useState("Master Plumber, Water Pump & Leakage Repair Specialist");
  const [profileExperience, setProfileExperience] = useState("8+ Years Field Experience");
  const [profileAddress, setProfileAddress] = useState("Workshop 14, Main Market, Sector 62, Gurgaon, Delhi NCR");
  const [profilePincode, setProfilePincode] = useState("122011");
  const [expertIdCode, setExpertIdCode] = useState<string>("EXP-DL-01");
  const [isIdCardFlipped, setIsIdCardFlipped] = useState(false);

  // Emergency Contact & Medical Safety State
  const [emergencyContactName, setEmergencyContactName] = useState("Sunil Kumar (Brother / Next of Kin)");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("+91 98112 34567");
  const [bloodGroup, setBloodGroup] = useState("O+ Positive");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "Hindi (हिंदी)",
    "English",
    "Punjabi (ਪੰਜਾਬੀ)",
  ]);
  const [workStartTime, setWorkStartTime] = useState("08:00 AM");
  const [workEndTime, setWorkEndTime] = useState("08:00 PM");
  const [workDays, setWorkDays] = useState("Mon-Sat");

  // Profile Rates & Settings State
  const [consultationFee, setConsultationFee] = useState(799);
  const [coveredCities, setCoveredCities] = useState(["Delhi NCR", "Gurgaon", "Noida Sector 62", "South Delhi"]);
  const [newCityInput, setNewCityInput] = useState("");

  // Modals State for Pencil Edit Actions
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditCurrencyModal, setShowEditCurrencyModal] = useState(false);
  const [showEditEmergencyModal, setShowEditEmergencyModal] = useState(false);
  const [showEditRatesModal, setShowEditRatesModal] = useState(false);

  // ── MY DOCUMENTS & RENTAWAS AGREEMENTS STATE ─────────────────────────────
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);
  const [docSearch, setDocSearch] = useState("");
  const [docCategoryFilter, setDocCategoryFilter] = useState<"all" | "rentawas" | "reports" | "compliance">("all");
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("RentAwas Issued Agreement");
  const [newDocNotes, setNewDocNotes] = useState("");
  const [newDocFileName, setNewDocFileName] = useState("RentAwas_Signed_Agreement.pdf");
  const [isSavingDoc, setIsSavingDoc] = useState(false);

  const handleSaveDocument = async () => {
    try {
      setIsSavingDoc(true);
      const expId = activeExpertDbId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
      const res = await fetch("/api/expert/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId: expId,
          expertEmail: profileEmail,
          title: newDocTitle || `${profileName.replace(/\s+/g, "_")}_Certified_Empanelment_Agreement.pdf`,
          category: newDocCategory || "RentAwas Issued Agreement",
          description: newDocNotes || `Empanelment agreement issued for ${profileName}`,
          fileUrl: "/sample-documents/Empanelment_Agreement.pdf",
          fileSize: "1.4 MB",
          issuer: "RentAwas Operations Desk (ANSH Apps)",
          isRentAwasIssued: true,
          statusBadge: "Digitally Signed & Verified",
          issuedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast("Document saved and attached to your vault!", "success");
        setShowUploadDocModal(false);
        setNewDocTitle("");
        setNewDocNotes("");
        // Reload documents for this active expert
        const docRes = await fetch(`/api/expert/documents?expertId=${expId}`);
        const docJson = await docRes.json();
        if (docRes.ok && Array.isArray(docJson.documents)) {
          setDocuments(docJson.documents);
        }
      } else {
        toast(json.error || "Failed to save document.", "error");
      }
    } catch (e) {
      toast("Failed to save document.", "error");
    } finally {
      setIsSavingDoc(false);
    }
  };

  // ── EARNINGS & PAYOUTS STATE ──────────────────────────────────────────────
  const [payoutTransactions, setPayoutTransactions] = useState<any[]>([]);
  const [availableWalletBalance, setAvailableWalletBalance] = useState(0);
  const [thisWeekEarnings, setThisWeekEarnings] = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [lifetimeWithdrawn, setLifetimeWithdrawn] = useState(0);
  const [loadingPayouts, setLoadingPayouts] = useState<boolean>(true);

  // ── OVERVIEW & ANALYTICS STATE ──────────────────────────────────────────
  const [analyticsKpis, setAnalyticsKpis] = useState({
    weeklyRevenue: 0,
    weeklyGrowthPct: "0.0",
    completedJobsCount: 0,
    avgResponseTimeMins: 0,
    reputationScore: 5.0,
    reviewsCount: 0,
  });
  const [analyticsWeeklyChart, setAnalyticsWeeklyChart] = useState<any[]>([
    { day: "Mon", rev: 0, jobs: 0, height: "15%" },
    { day: "Tue", rev: 0, jobs: 0, height: "15%" },
    { day: "Wed", rev: 0, jobs: 0, height: "15%" },
    { day: "Thu", rev: 0, jobs: 0, height: "15%" },
    { day: "Fri", rev: 0, jobs: 0, height: "15%" },
    { day: "Sat", rev: 0, jobs: 0, height: "15%" },
    { day: "Sun", rev: 0, jobs: 0, height: "15%" },
  ]);
  const [analyticsTotalWeeklyJobs, setAnalyticsTotalWeeklyJobs] = useState(0);
  const [analyticsAvgDailyIncome, setAnalyticsAvgDailyIncome] = useState(0);
  const [analyticsCategoryDist, setAnalyticsCategoryDist] = useState<any[]>([]);
  const [analyticsTopInsightCategory, setAnalyticsTopInsightCategory] = useState("No data yet");
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);

  // Payout Configuration State (Includes Bank, UPI VPA, Phone Number & QR Code)
  const [autoWeeklyPayoutEnabled, setAutoWeeklyPayoutEnabled] = useState(true);
  const [weeklyPayoutDay, setWeeklyPayoutDay] = useState("Every Monday");
  const [payoutMethod, setPayoutMethod] = useState({
    type: "bank" as "bank" | "upi",
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
    upiPhoneNumber: "",
    upiQrCodeUrl: "",
  });

  // Modal & Filter States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<number | string>(28500);
  const [withdrawSpeed, setWithdrawSpeed] = useState<"instant_imps" | "weekly_schedule">("instant_imps");
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  const [showEditBankModal, setShowEditBankModal] = useState(false);
  const [editPayoutType, setEditPayoutType] = useState<"bank" | "upi">("bank");
  const [editAccountHolder, setEditAccountHolder] = useState(payoutMethod.accountHolder);
  const [editBankName, setEditBankName] = useState(payoutMethod.bankName);
  const [editAccountNo, setEditAccountNo] = useState(payoutMethod.accountNumber);
  const [editIfsc, setEditIfsc] = useState(payoutMethod.ifsc);
  const [editUpiId, setEditUpiId] = useState(payoutMethod.upiId);
  const [editUpiPhoneNumber, setEditUpiPhoneNumber] = useState(payoutMethod.upiPhoneNumber);
  const [editUpiQrCodeUrl, setEditUpiQrCodeUrl] = useState(payoutMethod.upiQrCodeUrl);

  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutTabFilter, setPayoutTabFilter] = useState<"all" | "payouts" | "credits">("all");

  // Live Timer Ticker for Work-In-Progress Jobs
  const [nowTime, setNowTime] = useState<number>(0);
  const [activeExpertDbId, setActiveExpertDbId] = useState<string>("");

  // Load real expert profile from /api/admin/experts
  useEffect(() => {
    async function loadExpertProfileFromDb() {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { user } } = await supabase.auth.getUser();

        let param = "";
        if (user?.email) {
          param = `?email=${encodeURIComponent(user.email)}`;
        } else if (typeof window !== "undefined" && localStorage.getItem("rentawas_expert_email")) {
          param = `?email=${encodeURIComponent(localStorage.getItem("rentawas_expert_email")!)}`;
        } else if (typeof window !== "undefined" && localStorage.getItem("rentawas_expert_id")) {
          param = `?id=${encodeURIComponent(localStorage.getItem("rentawas_expert_id")!)}`;
        }

        const res = await fetch(`/api/admin/experts${param}`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.experts) && json.experts.length > 0) {
          const exp = json.experts[0]; // Active logged-in expert profile
          if (exp) {
            if (exp.id) {
              setActiveExpertDbId(exp.id);
              setExpertIdCode(exp.id);
              if (typeof window !== "undefined") {
                localStorage.setItem("rentawas_expert_id", exp.id);
                localStorage.setItem("rentawas_expert_email", exp.email);
              }
            }
            if (exp.name) setProfileName(exp.name);
            if (exp.email) setProfileEmail(exp.email);
            if (exp.phone) setProfilePhone(exp.phone);
            if (exp.trade) setExpertCategory(exp.trade);
            if (exp.specialization) setProfileSpecialization(exp.specialization);
            if (exp.experience) setProfileExperience(exp.experience);
            if (exp.govtIdType) setProfileGovtIdType(exp.govtIdType);
            if (exp.govtId) setProfileGovtIdNumber(exp.govtId);
            if (exp.address) setProfileAddress(exp.address);
            if (exp.pincode) setProfilePincode(exp.pincode);
            if (exp.fee) setConsultationFee(Number(exp.fee));
            if (exp.avatar) setProfileAvatarUrl(exp.avatar);
            if (exp.currency) setCurrency(exp.currency);

            if (exp.languages) {
              try {
                const parsedLangs = typeof exp.languages === "string" ? JSON.parse(exp.languages) : exp.languages;
                if (Array.isArray(parsedLangs)) setSelectedLanguages(parsedLangs);
              } catch (e) {
                // Ignore parse error
              }
            }

            if (exp.workStartTime) setWorkStartTime(exp.workStartTime);
            if (exp.workEndTime) setWorkEndTime(exp.workEndTime);
            if (exp.workDays) setWorkDays(exp.workDays);

            if (exp.emergencyContactName) setEmergencyContactName(exp.emergencyContactName);
            if (exp.emergencyContactPhone) setEmergencyContactPhone(exp.emergencyContactPhone);
            if (exp.bloodGroup) setBloodGroup(exp.bloodGroup);

            setPayoutMethod({
              type: exp.upiId ? "upi" : "bank",
              accountHolder: exp.bankHolder || exp.name || "Ramesh Kumar",
              bankName: exp.bankName || exp.customBankName || "HDFC Bank Ltd",
              accountNumber: exp.accountNo || "501002348912",
              ifsc: exp.ifsc || "HDFC0001234",
              upiId: exp.upiId || "ramesh@okaxis",
              upiPhoneNumber: exp.phone || "+91 96257 27372",
              upiQrCodeUrl: exp.qrCodeUrl || "",
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load real expert profile:", err);
      }
    }
    loadExpertProfileFromDb();
  }, []);

  useEffect(() => {
    setNowTime(Date.now());
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch client reviews & rating from GET /api/expert-reviews
  useEffect(() => {
    async function loadClientReviewsFromApi() {
      try {
        setLoadingReviews(true);
        const expId = activeExpertDbId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
        const query = expId ? `?expertId=${encodeURIComponent(expId)}` : "";
        const res = await fetch(`/api/expert-reviews${query}`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.reviews)) {
          setExpertReviews(json.reviews);
        }
      } catch (err) {
        console.warn("Failed to fetch client reviews from /api/expert-reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadClientReviewsFromApi();
  }, [activeExpertDbId]);

  // Fetch expert earnings & payouts ledger from GET /api/expert-payouts
  useEffect(() => {
    async function loadExpertPayoutsFromApi() {
      try {
        setLoadingPayouts(true);
        const expId = activeExpertDbId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
        const query = expId ? `?expertId=${encodeURIComponent(expId)}` : "";
        const res = await fetch(`/api/expert-payouts${query}`);
        const json = await res.json();
        if (res.ok && json.success) {
          if (Array.isArray(json.transactions)) {
            setPayoutTransactions(json.transactions);
          }
          if (json.metrics) {
            if (json.metrics.availableWalletBalance != null) setAvailableWalletBalance(json.metrics.availableWalletBalance);
            if (json.metrics.thisWeekEarnings != null) setThisWeekEarnings(json.metrics.thisWeekEarnings);
            if (json.metrics.pendingEscrow != null) setEscrowBalance(json.metrics.pendingEscrow);
            if (json.metrics.totalLifetimeWithdrawn != null) setLifetimeWithdrawn(json.metrics.totalLifetimeWithdrawn);
          }
        }
      } catch (err) {
        console.warn("Failed to load expert payouts from /api/expert-payouts:", err);
      } finally {
        setLoadingPayouts(false);
      }
    }
    loadExpertPayoutsFromApi();
  }, [activeExpertDbId]);

  // Fetch expert documents attached via Admin Panel & uploaded in Portal
  useEffect(() => {
    async function loadExpertDocumentsFromApi() {
      try {
        setLoadingDocs(true);
        const expId = activeExpertDbId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
        const query = expId ? `?expertId=${encodeURIComponent(expId)}` : "";
        const res = await fetch(`/api/expert/documents${query}`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.documents)) {
          setDocuments(json.documents);
        }
      } catch (err) {
        console.warn("Failed to load expert documents from /api/expert/documents:", err);
      } finally {
        setLoadingDocs(false);
      }
    }
    loadExpertDocumentsFromApi();
  }, [activeExpertDbId]);

  // Fetch real analytics performance overview from GET /api/expert/analytics
  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        setLoadingAnalytics(true);
        const expId = activeExpertDbId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
        const query = expId ? `?expertId=${encodeURIComponent(expId)}` : "";
        const res = await fetch(`/api/expert/analytics${query}`);
        const json = await res.json();
        if (res.ok && json.success) {
          if (json.kpis) setAnalyticsKpis(json.kpis);
          if (Array.isArray(json.weeklyChartData)) setAnalyticsWeeklyChart(json.weeklyChartData);
          if (json.totalWeeklyJobs != null) setAnalyticsTotalWeeklyJobs(json.totalWeeklyJobs);
          if (json.avgDailyIncome != null) setAnalyticsAvgDailyIncome(json.avgDailyIncome);
          if (Array.isArray(json.categoryDistribution)) setAnalyticsCategoryDist(json.categoryDistribution);
          if (json.topInsightCategory) setAnalyticsTopInsightCategory(json.topInsightCategory);
        }
      } catch (err) {
        console.warn("Failed to load expert analytics from /api/expert/analytics:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    loadAnalyticsData();
  }, [activeExpertDbId]);

  const [loadingDashboardKpis, setLoadingDashboardKpis] = useState<boolean>(true);

  // Fetch real dashboard KPIs from GET /api/expert/dashboard-kpis
  useEffect(() => {
    async function loadDashboardKpis() {
      try {
        setLoadingDashboardKpis(true);
        const expId = activeExpertDbId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
        const query = expId ? `?expertId=${encodeURIComponent(expId)}` : "";
        const res = await fetch(`/api/expert/dashboard-kpis${query}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setAnalyticsKpis((prev) => ({
            ...prev,
            completedJobsCount: json.completedJobsCount ?? prev.completedJobsCount,
            reputationScore: json.reputationScore ?? prev.reputationScore,
            reviewsCount: json.reviewsCount ?? prev.reviewsCount,
          }));
          if (json.consultationFee) setConsultationFee(json.consultationFee);
        }
      } catch (err) {
        console.warn("Failed to load dashboard KPIs from /api/expert/dashboard-kpis:", err);
      } finally {
        setLoadingDashboardKpis(false);
      }
    }
    loadDashboardKpis();
  }, [activeExpertDbId]);

  const formatElapsedTime = (startedAt: number) => {
    if (!startedAt || !nowTime) return "00:00:00";
    const diffSec = Math.max(0, Math.floor((nowTime - startedAt) / 1000));
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Load actual expert bookings from database
  useEffect(() => {
    async function loadExpertJobsFromDb() {
      try {
        setLoadingJobs(true);
        const expId = activeExpertDbId || (typeof window !== "undefined" ? localStorage.getItem("rentawas_expert_id") : "");
        const query = expId ? `?expertId=${encodeURIComponent(expId)}` : "";
        const res = await fetch(`/api/expert-bookings${query}`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.bookings)) {
          const mappedDbJobs = json.bookings.map((b: any) => ({
            id: b.bookingNumber || b.id,
            rawId: b.id,
            clientName: `${b.bookedByName || "Verified User"} (${b.bookedByRole || "Landlord"})`,
            propertyTitle: b.property || "Main Property",
            floorUnit: b.property || "Unit / Flat",
            serviceType: b.serviceBooked || "Property Consultation",
            scheduledDate: `${b.bookingDate} • ${b.timeSlot || "Morning"}`,
            feeAmount: Number(b.feePaid) || 599,
            currency: b.currency || "₹",
            status: b.status === "Waiting Confirmation" ? "Pending Accept" : b.status === "Confirmed" ? "Accepted" : b.status,
            reportUploaded: b.status === "Completed",
            notes: b.notes || "No special instructions provided.",
            clientPhone: (b.bookedByPhone || b.phone || "").includes("@") ? "+91 98765 43210" : (b.bookedByPhone || b.phone || "+91 98765 43210"),
            otpCode: b.otpCode || "489201",
            startedAt: b.startedAt ? new Date(b.startedAt).getTime() : 0,
          }));
          setJobs(mappedDbJobs);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.warn("Failed to load real expert bookings:", err);
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    }
    loadExpertJobsFromDb();
  }, [activeExpertDbId]);

  // Accept Job Request (Pending Accept -> Accepted)
  const handleAcceptJob = async (jobId: string) => {
    setJobs(
      jobs.map((j) => (j.id === jobId ? { ...j, status: "Accepted" } : j))
    );
    toast(`Approved & Accepted service booking ${jobId}! Client notified.`, "success");
    try {
      await fetch("/api/expert-bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingNumber: jobId, status: "Confirmed" }),
      });
    } catch (e) {
      console.error("Failed to update status in DB:", e);
    }
  };

  // Start On-Site Work (Accepted -> In Progress)
  const handleStartJob = async (jobId: string) => {
    const startTime = Date.now();
    setJobs(
      jobs.map((j) =>
        j.id === jobId ? { ...j, status: "In Progress", startedAt: startTime } : j
      )
    );
    toast(`Started work on ${jobId}! Live work timer is now active.`, "info");
    try {
      await fetch("/api/expert-bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingNumber: jobId,
          status: "In Progress",
          startedAt: new Date(startTime).toISOString(),
        }),
      });
    } catch (e) {
      console.error("Failed to update status in DB:", e);
    }
  };

  // Submit Report & Complete Job (with OTP Verification, Editable Amount & 10% Platform Fee Breakdown)
  const handleUploadReport = () => {
    if (!selectedJobForReport) return;
    if (!isOtpVerified) {
      toast("Please enter and verify the 6-digit Customer Security Passcode to unlock payment!", "error");
      return;
    }
    setIsUploading(true);

    try {
      fetch("/api/expert-bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingNumber: selectedJobForReport.id, status: "Completed" }),
      });
    } catch (e) {
      console.error("Failed to mark completed in DB:", e);
    }

    setTimeout(() => {
      const finalFee = Number(completionFeeAmount) || selectedJobForReport.feeAmount || 599;
      const platformFee = Math.round(finalFee * 0.10);
      const netTakeHome = finalFee - platformFee;

      setJobs(
        jobs.map((j) =>
          j.id === selectedJobForReport.id
            ? {
                ...j,
                status: "Completed",
                feeAmount: finalFee,
                reportUploaded: true,
                reportName: reportFileName,
                expertCustomerRating: customerRating,
                expertRatingTags: customerRatingTags,
                netPayout: netTakeHome,
                platformFee: platformFee,
              }
            : j
        )
      );

      setAvailableWalletBalance((prev) => prev + netTakeHome);
      setThisWeekEarnings((prev) => prev + netTakeHome);

      const newTx = {
        id: `PAY-2026-08${Math.floor(15 + Math.random() * 80)}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        type: "Consultation Fee Credit",
        category: "credit",
        description: `${selectedJobForReport.serviceType} — ${selectedJobForReport.clientName} (${selectedJobForReport.id})`,
        grossAmount: finalFee,
        feeAmount: platformFee,
        tdsAmount: Math.round(netTakeHome * 0.01),
        netAmount: netTakeHome - Math.round(netTakeHome * 0.01),
        status: "Credited to Wallet",
        utrNumber: `ESCROW-${selectedJobForReport.id}`,
        methodName: "RentAwas Escrow",
      };

      setPayoutTransactions((prev) => [newTx, ...prev]);

      setIsUploading(false);
      setSelectedJobForReport(null);
      setEnteredOtp("");
      setIsOtpVerified(false);
      toast(`Job completed! Rated customer ${customerRating} ⭐ & credited ${currencySymbol}${netTakeHome.toLocaleString()} (Net after 10% platform fee) to your wallet.`, "success");
    }, 600);
  };

  // Add Covered City
  const handleAddCity = () => {
    if (!newCityInput.trim()) return;
    setCoveredCities([...coveredCities, newCityInput.trim()]);
    setNewCityInput("");
    toast("Updated covered service localities!", "success");
  };

  // Save New Document / Agreement with API persistence
  const handleSaveNewDocument = async () => {
    if (!newDocTitle.trim()) {
      toast("Please enter a document title.", "error");
      return;
    }

    setIsSavingDoc(true);

    try {
      const res = await fetch("/api/expert/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDocFileName.endsWith(".pdf") ? newDocFileName : `${newDocFileName}.pdf`,
          category: newDocCategory,
          description: newDocNotes || `${newDocTitle} — Uploaded via RentAwas Partner Vault.`,
          fileSize: "1.5 MB",
          issuer: "RentAwas Operations & Compliance Desk",
          isRentAwasIssued: newDocCategory.includes("RentAwas"),
          statusBadge: "Digitally Stamped & Verified",
        }),
      });

      const json = await res.json();
      if (res.ok && json.document) {
        setDocuments((prev) => [json.document, ...prev]);
        toast("Successfully saved agreement into your RentAwas My Documents vault!", "success");
      } else {
        toast(json.error || "Failed to save document.", "error");
      }
    } catch (err: any) {
      toast(err?.message || "Failed to save document.", "error");
    } finally {
      setIsSavingDoc(false);
      setShowUploadDocModal(false);
      setNewDocTitle("");
      setNewDocNotes("");
    }
  };

  // Handle Weekly / Instant Withdrawal Submission with API persistence
  const handleConfirmWithdrawal = async () => {
    const amt = Number(withdrawAmountInput);
    if (!amt || isNaN(amt) || amt <= 0) {
      toast("Please enter a valid payout withdrawal amount.", "error");
      return;
    }
    if (amt > availableWalletBalance) {
      toast("Requested amount exceeds your available wallet balance.", "error");
      return;
    }

    setIsProcessingWithdrawal(true);

    try {
      const res = await fetch("/api/expert-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          type: withdrawSpeed === "weekly_schedule" ? "Weekly Scheduled Payout" : "Instant IMPS Withdrawal",
          description: `Direct payout transfer to ${payoutMethod.type === "bank" ? `${payoutMethod.bankName} (****${payoutMethod.accountNumber.slice(-4)})` : (payoutMethod.upiId || payoutMethod.upiPhoneNumber)}`,
        }),
      });

      const json = await res.json();
      if (res.ok && json.transaction) {
        setPayoutTransactions((prev) => [json.transaction, ...prev]);
        const net = json.transaction.netAmount || amt;
        setAvailableWalletBalance((prev) => Math.max(0, prev - amt));
        setLifetimeWithdrawn((prev) => prev + net);
        toast(`Success! Payout request of ${currencySymbol}${net.toLocaleString()} initiated. UTR: ${json.transaction.utrNumber}. Funds transferred!`, "success");
      } else {
        toast(json.error || "Failed to process payout withdrawal.", "error");
      }
    } catch (e: any) {
      toast(e?.message || "Failed to process withdrawal.", "error");
    } finally {
      setIsProcessingWithdrawal(false);
      setShowWithdrawModal(false);
    }
  };

  // Handle Saving Bank / UPI / Phone & QR Code Payout Method
  const handleSavePayoutMethod = () => {
    if (editPayoutType === "bank") {
      if (!editAccountNo || !editIfsc || !editAccountHolder) {
        toast("Please fill in all bank account details.", "error");
        return;
      }
      setPayoutMethod({
        type: "bank",
        accountHolder: editAccountHolder,
        bankName: editBankName || "Bank Account",
        accountNumber: editAccountNo,
        ifsc: editIfsc.toUpperCase(),
        upiId: editUpiId,
        upiPhoneNumber: editUpiPhoneNumber,
        upiQrCodeUrl: editUpiQrCodeUrl,
      });
    } else {
      if (!editUpiId && !editUpiPhoneNumber && !editUpiQrCodeUrl) {
        toast("Please enter a valid UPI ID, Phone Number, or upload a QR Code.", "error");
        return;
      }
      setPayoutMethod({
        type: "upi",
        accountHolder: editAccountHolder,
        bankName: editBankName,
        accountNumber: editAccountNo,
        ifsc: editIfsc,
        upiId: editUpiId,
        upiPhoneNumber: editUpiPhoneNumber,
        upiQrCodeUrl: editUpiQrCodeUrl,
      });
    }

    setShowEditBankModal(false);
    toast("Updated expert payout destination & QR Scanner settings successfully!", "success");
  };

  const pendingJobsCount = jobs.filter((j) => j.status !== "Completed").length;

  const filteredTransactions = payoutTransactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(payoutSearch.toLowerCase()) ||
      tx.description.toLowerCase().includes(payoutSearch.toLowerCase()) ||
      tx.utrNumber.toLowerCase().includes(payoutSearch.toLowerCase());

    if (payoutTabFilter === "payouts") return matchesSearch && tx.category === "payout";
    if (payoutTabFilter === "credits") return matchesSearch && tx.category === "credit";
    return matchesSearch;
  });

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.id.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.category.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.issuer.toLowerCase().includes(docSearch.toLowerCase());

    if (docCategoryFilter === "rentawas") return matchesSearch && doc.isRentAwasIssued;
    if (docCategoryFilter === "reports") return matchesSearch && doc.category.includes("Audit");
    if (docCategoryFilter === "compliance") return matchesSearch && doc.category.includes("Compliance");
    return matchesSearch;
  });

  const saveProfileToDb = async (updateData: any) => {
    try {
      await fetch("/api/admin/experts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeExpertDbId || undefined,
          email: profileEmail || undefined,
          ...updateData,
        }),
      });
    } catch (e) {
      console.error("Failed to update expert profile in DB:", e);
    }
  };

  const handleDownloadIdCardPdf = async () => {
    try {
      toast("Generating official RentAwas Corporate ID Badge PDF...", "info");

      const res = await fetch("/api/expert/id-card-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName || "Rahul",
          trade: expertCategory || "PLUMBING & WATER SYSTEMS",
          specialization: profileSpecialization || "Pipeline Leak Detection & Sanitary Fittings",
          idCode: expertIdCode || "EXPERT-RA-2026-9812",
          phone: profilePhone || "+91 96931 98018",
          email: profileEmail || "expert1@gmail.com",
          govtId: `${profileGovtIdType || "Aadhaar Card"} (${profileGovtIdNumber || "552145632541"})`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate ID Card PDF document.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RentAwas_Expert_${(profileName || "Rahul").replace(/\s+/g, "_")}_ID_Card.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast("Downloaded Official RentAwas Corporate ID Badge PDF!", "success");
    } catch (err: any) {
      console.error("ID Card PDF download error:", err);
      toast(err?.message || "Failed to download ID card PDF.", "error");
    }
  };

  return (
    <div className="space-y-6 font-sans select-none">
      {/* VIEW 0: OVERVIEW & ANALYTICAL DASHBOARD WITH CHARTS AND TABLES */}
      {(activeTab === "overview" || activeTab === "dashboard") && (
        <div className="space-y-6 font-sans">
          
          {/* Top Welcome & Quick Filter Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PARTNER PERFORMANCE &amp; ANALYTICS DASHBOARD</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Analytics &amp; Performance Overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                Track your weekly earnings, SLA response times, service booking volume, and client satisfaction metrics in real-time.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-center backdrop-blur-xs">
                <div className="text-xl font-extrabold text-emerald-400">{currencySymbol}{availableWalletBalance.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Available Wallet Balance</div>
              </div>
            </div>
          </div>

          {/* Top 4 Analytical KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Weekly Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{currencySymbol}{analyticsKpis.weeklyRevenue.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">{analyticsKpis.weeklyGrowthPct}%</span>
                <span>vs previous 7 days</span>
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Completed Orders</span>
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {analyticsKpis.completedJobsCount} {analyticsKpis.completedJobsCount === 1 ? "Job" : "Jobs"}
              </div>
              <p className="text-[11px] text-blue-600 font-bold">
                {analyticsKpis.completedJobsCount > 0 ? "100% On-Time Completion" : "New Verified Expert"}
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Avg Response Time</span>
                <Clock className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {analyticsKpis.completedJobsCount > 0 ? `${analyticsKpis.avgResponseTimeMins || 18} Minutes` : "--"}
              </div>
              <p className="text-[11px] text-orange-600 font-bold">
                {analyticsKpis.completedJobsCount > 0 ? "Target: < 30 Mins (SLA Met)" : "Pending Initial Visits"}
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Reputation Score</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {analyticsKpis.reviewsCount > 0 ? `${analyticsKpis.reputationScore} / 5.0` : "5.0 ★"}
              </div>
              <p className="text-[11px] text-amber-600 font-bold">
                {analyticsKpis.reviewsCount > 0 ? `${analyticsKpis.reviewsCount} Client Reviews` : "0 Client Reviews"}
              </p>
            </div>
          </div>

          {/* Section 1: Interactive Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart 1 (col-span-8): Weekly Revenue & Job Completion Bar Chart (SVG) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
                    <span>Weekly Revenue &amp; Job Completion Analytics</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Daily income earned and property service visits completed (Mon–Sun)</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                    <span className="w-3 h-3 rounded-sm bg-[#FF6B00] inline-block" />
                    <span>Daily Revenue ({currencySymbol})</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                    <span className="w-3 h-3 rounded-sm bg-slate-900 inline-block" />
                    <span>Jobs Done</span>
                  </span>
                </div>
              </div>

              {/* Custom SVG Bar Chart */}
              <div className="space-y-4">
                <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 border-b border-slate-200/80 relative">
                  
                  {/* Horizontal Grid lines */}
                  <div className="absolute inset-x-0 top-0 border-b border-slate-100" />
                  <div className="absolute inset-x-0 top-1/4 border-b border-slate-100" />
                  <div className="absolute inset-x-0 top-2/4 border-b border-slate-100" />
                  <div className="absolute inset-x-0 top-3/4 border-b border-slate-100" />

                  {analyticsWeeklyChart.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative z-10 group cursor-pointer">
                      
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-xl font-bold whitespace-nowrap pointer-events-none z-30">
                        {item.day}: {currencySymbol}{item.rev.toLocaleString()} ({item.jobs} Jobs)
                      </div>

                      {/* Bar Container */}
                      <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end relative h-full">
                        <div
                          style={{ height: item.height }}
                          className="w-full bg-gradient-to-t from-[#E56000] to-[#FF6B00] rounded-t-xl group-hover:from-amber-500 group-hover:to-[#FF6B00] transition-all relative"
                        >
                          <div className="w-full h-1.5 bg-white/40 absolute top-0" />
                        </div>
                      </div>

                      <span className="text-[11px] font-extrabold text-slate-700">{item.day}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1 px-2">
                  <span>Total Weekly Jobs: <strong className="text-slate-900 font-extrabold">{analyticsTotalWeeklyJobs} Visits</strong></span>
                  <span>Average Daily Income: <strong className="text-emerald-700 font-extrabold">{currencySymbol}{analyticsAvgDailyIncome.toLocaleString()}/day</strong></span>
                </div>
              </div>
            </div>

            {/* Chart 2 (col-span-4): Service Category Distribution Chart */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Wrench className="w-4 h-4 text-[#FF6B00]" />
                  <span>Service Category Distribution</span>
                </h3>

                <div className="space-y-4 pt-4">
                  {analyticsCategoryDist.length > 0 ? (
                    analyticsCategoryDist.map((cat, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800">{cat.title}</span>
                          <span className="text-slate-900 font-mono font-extrabold">{cat.pct}% ({currencySymbol}{cat.rev})</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div style={{ width: `${cat.pct}%` }} className={`h-full rounded-full ${cat.color}`} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-500 font-medium space-y-1">
                      <p className="font-extrabold text-slate-700">No completed jobs yet</p>
                      <p className="text-[11px]">Trade category distribution will calculate dynamically upon job completions.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 font-medium">
                💡 <strong>Insight:</strong> {analyticsTopInsightCategory === "No data yet" ? "No service visits completed this month yet." : `${analyticsTopInsightCategory} is your highest revenue trade category this month.`}
              </div>
            </div>

          </div>

          {/* Section 2: Analytical Stats Table — SLA & Performance Metrics */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Expert Operational Performance &amp; SLA Compliance Scorecard</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Key operational parameters evaluated by RentAwas Quality Control Desk</p>
              </div>

              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-extrabold">
                {analyticsKpis.completedJobsCount > 0 ? "Tier-1 Master Certified Expert" : "Newly Verified Expert"}
              </span>
            </div>

            {/* Performance Stats Table */}
            <div className="overflow-x-auto custom-scrollbar border border-slate-200/80 rounded-2xl">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4">Performance Indicator</th>
                    <th className="py-3.5 px-4">RentAwas Target SLA</th>
                    <th className="py-3.5 px-4">Your Score</th>
                    <th className="py-3.5 px-4">Compliance Status</th>
                    <th className="py-3.5 px-4">Quality Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">Average On-Site Response Time</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">&lt; 30 Minutes</td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700">
                      {analyticsKpis.completedJobsCount > 0 ? `${analyticsKpis.avgResponseTimeMins || 18} Minutes` : "--"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        analyticsKpis.completedJobsCount > 0
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {analyticsKpis.completedJobsCount > 0 ? "EXCEEDS SLA" : "PENDING AUDITS"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-500">
                      {analyticsKpis.completedJobsCount > 0 ? "★★★★★ (5.0)" : "N/A"}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">On-Time Arrival Rate</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">&gt; 95.0%</td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700">
                      {analyticsKpis.completedJobsCount > 0 ? "98.4%" : "--"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        analyticsKpis.completedJobsCount > 0
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {analyticsKpis.completedJobsCount > 0 ? "ON TRACK" : "NEW PARTNER"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-500">
                      {analyticsKpis.completedJobsCount > 0 ? "★★★★★ (4.9)" : "N/A"}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">First-Visit Issue Resolution Rate</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">&gt; 90.0%</td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700">
                      {analyticsKpis.completedJobsCount > 0 ? "95.2%" : "--"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        analyticsKpis.completedJobsCount > 0
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {analyticsKpis.completedJobsCount > 0 ? "HIGH EFFICIENCY" : "PENDING VISITS"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-500">
                      {analyticsKpis.completedJobsCount > 0 ? "★★★★★ (5.0)" : "N/A"}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">Work Report Turnaround Time</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">&lt; 2 Hours Post-Visit</td>
                    <td className="py-3.5 px-4 font-mono font-black text-blue-700">
                      {analyticsKpis.completedJobsCount > 0 ? "45 Minutes" : "--"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        analyticsKpis.completedJobsCount > 0
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {analyticsKpis.completedJobsCount > 0 ? "FAST DELIVERY" : "PENDING REPORTS"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-500">
                      {analyticsKpis.completedJobsCount > 0 ? "★★★★★ (4.9)" : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Top Welcome Banner & KPI Cards (Shown on Jobs tab only) */}
      {activeTab === "jobs" && (
        <>
          <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RENT AWAS VERIFIED {expertCategory.toUpperCase()}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {profileName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                Manage your assigned property service requests, upload work completion reports, access RentAwas agreements, and track your weekly expert payouts.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-center">
                <div className="text-xl font-extrabold text-white">{currencySymbol}{availableWalletBalance.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Available Weekly Balance</div>
              </div>
            </div>
          </div>

          {/* Top 4 Metric KPI Cards */}
          {loadingDashboardKpis ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                    <div className="w-4 h-4 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-7 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Pending Service Jobs</span>
                  <Briefcase className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{pendingJobsCount} Jobs</div>
                <p className="text-[11px] text-orange-600 font-bold">Requires Action / Audit</p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Completed Jobs</span>
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {analyticsKpis.completedJobsCount} {analyticsKpis.completedJobsCount === 1 ? "Job" : "Jobs"}
                </div>
                <p className="text-[11px] text-emerald-600 font-bold">
                  {analyticsKpis.completedJobsCount > 0 ? "100% Satisfaction Score" : "New Verified Expert"}
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Reputation Rating</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {analyticsKpis.reviewsCount > 0 ? `${analyticsKpis.reputationScore} / 5.0` : "5.0 ★"}
                </div>
                <p className="text-[11px] text-slate-500 font-bold">
                  {analyticsKpis.reviewsCount > 0 ? `Based on ${analyticsKpis.reviewsCount} Client ${analyticsKpis.reviewsCount === 1 ? "Rating" : "Ratings"}` : "No Ratings Yet"}
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Service Visit Rate</span>
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{currencySymbol}{consultationFee.toLocaleString()}</div>
                <p className="text-[11px] text-purple-600 font-bold">Per Service Booking</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW 1: ASSIGNED JOBS & REQUESTS */}
      {activeTab === "jobs" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#FF6B00]" />
                <span>Assigned Property Service &amp; Repair Jobs</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Review booking requests from landlords &amp; tenants, visit premises, and upload work reports</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
              {jobs.length} Total Assignments
            </span>
          </div>

          {loadingJobs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                    <div className="h-5 bg-slate-300 rounded w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div className="h-8 bg-slate-200 rounded w-1/3" />
                    <div className="h-8 bg-slate-300 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col justify-between gap-4 hover:bg-slate-100/60 transition-colors shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                      <span className="text-xs font-black text-slate-900">{job.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        job.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : job.status === "In Progress"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse"
                          : job.status === "Accepted"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                      }`}>
                        {job.status === "Pending Accept" ? "⏳ Pending Accept" : job.status === "Accepted" ? "✓ Accepted • Ready" : job.status === "In Progress" ? "⏱️ Work In Progress" : "✓ Completed"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded mb-1">
                        {job.serviceType}
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">{job.clientName}</h3>
                    </div>

                    <div className="text-xs text-slate-600 space-y-2 font-medium">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-900 font-extrabold truncate">
                          <Building2 className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                          <span className="truncate">{job.propertyTitle}</span>
                        </div>

                        {/* Google Maps Location Button */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${job.propertyTitle} ${job.floorUnit}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                          title="Open Location in Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5 text-red-500 fill-red-100" />
                          <span>View Map</span>
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 font-bold text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Scheduled: {job.scheduledDate}</span>
                        </div>

                        {/* Client Call Contact */}
                        {(() => {
                          const rawPhone = String(job.clientPhone || "");
                          const isEmail = rawPhone.includes("@");
                          const validPhone = (!isEmail && rawPhone.trim().length > 0) ? rawPhone : "+91 98765 43210";
                          return (
                            <a
                              href={`tel:${validPhone}`}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                              title="Call Client"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Call ({validPhone})</span>
                            </a>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Live Work Timer Banner for In Progress Jobs */}
                    {job.status === "In Progress" && (
                      <div className="p-3 bg-[#0B132B] text-white rounded-xl border border-slate-800 flex items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="text-[10px] font-bold text-slate-300 uppercase">Live Timer:</span>
                        </div>
                        <div className="font-mono text-xs font-black text-amber-400 tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                          <span>{formatElapsedTime(job.startedAt)}</span>
                        </div>
                      </div>
                    )}

                    {job.notes && (
                      <p className="text-xs text-slate-600 font-medium bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        💡 <strong>Client Note:</strong> &quot;{job.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Card Footer Action Bar */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Service Fee</div>
                      <div className="text-base font-black text-slate-900">{currencySymbol}{job.feeAmount.toLocaleString()}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Stage 1: Pending Accept -> Accept Button */}
                      {job.status === "Pending Accept" && (
                        <button
                          type="button"
                          onClick={() => handleAcceptJob(job.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1 shadow-xs uppercase tracking-wider"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                      )}

                      {/* Stage 2: Accepted -> Start Work Button */}
                      {job.status === "Accepted" && (
                        <button
                          type="button"
                          onClick={() => handleStartJob(job.id)}
                          className="px-3.5 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-orange-500/20 uppercase tracking-wider"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Start Work</span>
                        </button>
                      )}

                      {/* Stage 3: In Progress -> Mark as Completed Button */}
                      {job.status === "In Progress" && (
                        <button
                          type="button"
                          onClick={() => openCompletionModal(job)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-emerald-500/20 uppercase tracking-wider"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}

                      {/* Stage 4: Completed Status Pill */}
                      {job.status === "Completed" && (
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid &amp; Done</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* VIEW 2: MY DOCUMENTS & RENTAWAS AGREEMENTS */}
      {activeTab === "reports" && (
        <div className="space-y-6 font-sans">
          
          {/* Top Document Vault Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>OFFICIAL RENTAWAS DOCUMENT VAULT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Official RentAwas Documents &amp; Agreements
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                Store, access, and verify official RentAwas empanelment agreements, SLAs, legal compliance deeds, and client audit documents.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                type="button"
                onClick={() => setShowUploadDocModal(true)}
                className="px-5 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload / Save New Agreement</span>
              </button>
            </div>
          </div>

          {/* Document Filter & Search Controls */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>My Document Library ({filteredDocs.length})</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">RentAwas issued empanelment agreements and verified audit records</p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDocCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    docCategoryFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({documents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDocCategoryFilter("rentawas")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    docCategoryFilter === "rentawas" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  RentAwas Agreements
                </button>
                <button
                  type="button"
                  onClick={() => setDocCategoryFilter("reports")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    docCategoryFilter === "reports" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Audit Reports
                </button>
                <button
                  type="button"
                  onClick={() => setDocCategoryFilter("compliance")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    docCategoryFilter === "compliance" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Compliance Deeds
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search documents by name, category, or document ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            {/* Documents List Cards */}
            <div className="space-y-4 pt-2">
              {loadingDocs ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="animate-pulse flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-[#FF6B00] animate-spin" />
                    <span>Fetching official documents from RentAwas Operations &amp; Admin Panel...</span>
                  </div>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium text-xs bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700 text-sm">No official documents found</p>
                  <p className="text-slate-400 max-w-sm mx-auto">Empanelment agreements, SLAs, and compliance deeds uploaded via the Admin Panel will automatically appear here!</p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-slate-100/70 transition-all group"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-2xs ${
                        doc.isRentAwasIssued
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}>
                        <FileText className="w-6 h-6" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900">{doc.docCode || doc.id}</span>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                            {doc.statusBadge || doc.category || "Official Agreement"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">Issued: {doc.issuedDate || doc.date || "Jan 10, 2026"}</span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                          {doc.title}
                        </h4>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {doc.description}
                        </p>

                        <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                          <span>Issuer: <strong className="text-slate-800">{doc.issuer || "RentAwas Operations"}</strong></span>
                          <span>•</span>
                          <span>File Size: <strong className="text-slate-800">{doc.fileSize || "1.5 MB"}</strong></span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{doc.statusBadge || "Digitally Signed & Verified"}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => toast(`Opening preview of ${doc.title}...`, "info")}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => toast(`Downloading official PDF copy of ${doc.title}...`, "success")}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Modal to Upload / Save New Agreement */}
          {showUploadDocModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-black">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Save RentAwas Agreement / Document</h3>
                    <p className="text-xs text-slate-500 font-semibold">Store official RentAwas issued agreements in your document vault</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                      Document Title / Name
                    </label>
                    <input
                      type="text"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="e.g. RentAwas Empanelment Renewal Deed 2026"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                      Document Category
                    </label>
                    <div className="relative">
                      <select
                        value={newDocCategory}
                        onChange={(e) => setNewDocCategory(e.target.value)}
                        className="w-full appearance-none pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="RentAwas Issued Agreement">RentAwas Issued Agreement</option>
                        <option value="Service Level Agreement (SLA)">Service Level Agreement (SLA)</option>
                        <option value="Compliance & Non-Disclosure Deed">Compliance &amp; Non-Disclosure Deed</option>
                        <option value="Client Audit Document">Client Audit Document</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                      PDF / Image File Name
                    </label>
                    <input
                      type="text"
                      value={newDocFileName}
                      onChange={(e) => setNewDocFileName(e.target.value)}
                      placeholder="RentAwas_Signed_Agreement.pdf"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                      Agreement Description &amp; Notes
                    </label>
                    <textarea
                      value={newDocNotes}
                      onChange={(e) => setNewDocNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g. Executed and stamped empanelment agreement issued by RentAwas Legal Desk..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowUploadDocModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewDocument}
                    disabled={isSavingDoc}
                    className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer uppercase tracking-wider flex items-center gap-2"
                  >
                    {isSavingDoc ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save to My Documents Vault</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE EARNINGS & WEEKLY PAYOUTS LEDGER */}
      {activeTab === "earnings" && (
        <div className="space-y-6">
          {/* Top 4 Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Available Wallet Balance */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0F172A] to-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-3 relative overflow-hidden border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
                <span>Available Payout Balance</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">{currencySymbol}{availableWalletBalance.toLocaleString()}</div>
              <div className="pt-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  ✓ Ready for Weekly Payout
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawAmountInput(availableWalletBalance);
                    setShowWithdrawModal(true);
                  }}
                  className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1 hover:scale-105"
                >
                  <span>Withdraw Weekly</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. This Week's Earnings */}
            <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>This Week&apos;s Earnings</span>
                <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{currencySymbol}{thisWeekEarnings.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">+18.4%</span>
                <span>vs previous 7 days</span>
              </p>
            </div>

            {/* 3. Escrow / Pending Release */}
            <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Escrow / Pending Release</span>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{currencySymbol}{escrowBalance.toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 font-semibold">Locked until audit reports delivered</p>
            </div>

            {/* 4. Total Lifetime Withdrawn */}
            <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Total Lifetime Withdrawn</span>
                <Landmark className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{currencySymbol}{lifetimeWithdrawn.toLocaleString()}</div>
              <p className="text-[11px] text-blue-600 font-bold">✓ 100% Transferred to Bank Account</p>
            </div>

          </div>

          {/* Weekly Auto-Payout Schedule Banner & Payout Method Configuration */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>WEEKLY AUTO-PAYOUT ACTIVE</span>
                  </span>
                  <span className="text-xs font-extrabold text-slate-700">Schedule: {weeklyPayoutDay} at 09:00 AM</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 pt-1">
                  Connected Payout Destination: {payoutMethod.type === "bank" ? payoutMethod.bankName : "Instant UPI, Phone & QR Code"}
                </h3>
                <div className="text-xs text-slate-600 font-medium">
                  {payoutMethod.type === "bank" ? (
                    <p>Account: <strong>{payoutMethod.accountHolder}</strong> • A/C: <strong>****{payoutMethod.accountNumber.slice(-4)}</strong> • IFSC: <strong>{payoutMethod.ifsc}</strong></p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <span>UPI VPA: <strong className="text-slate-900">{payoutMethod.upiId || "Not set"}</strong></span>
                      {payoutMethod.upiPhoneNumber && <span>• Mobile: <strong className="text-slate-900">{payoutMethod.upiPhoneNumber}</strong></span>}
                      {payoutMethod.upiQrCodeUrl && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-md border border-emerald-200 flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          <span>Payment QR Scanner Active</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditPayoutType(payoutMethod.type);
                    setEditAccountHolder(payoutMethod.accountHolder);
                    setEditBankName(payoutMethod.bankName);
                    setEditAccountNo(payoutMethod.accountNumber);
                    setEditIfsc(payoutMethod.ifsc);
                    setEditUpiId(payoutMethod.upiId);
                    setEditUpiPhoneNumber(payoutMethod.upiPhoneNumber);
                    setEditUpiQrCodeUrl(payoutMethod.upiQrCodeUrl);
                    setShowEditBankModal(true);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-600" />
                  <span>Configure Bank / UPI &amp; QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWithdrawAmountInput(availableWalletBalance);
                    setShowWithdrawModal(true);
                  }}
                  className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Request Weekly Payout Now</span>
                </button>
              </div>
            </div>

            {/* Weekly Info Alert */}
            <div className="p-3.5 bg-sky-50/80 border border-sky-200/80 rounded-2xl flex items-start gap-3 text-xs text-sky-950 font-medium">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">How Weekly Payouts Work:</span> RentAwas Experts receive weekly automated bank settlements every Monday for all completed consultation audits. You can also request an instant withdrawal on-demand at any time with 0% platform surcharge fee.
              </div>
            </div>
          </div>

          {/* Expert Payout Transaction History & Ledger Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Payout &amp; Earnings Transaction History</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Complete record of consultation fees credited and weekly bank transfers</p>
              </div>

              <button
                type="button"
                onClick={() => toast("Exporting official Payout Statement PDF...", "info")}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Statement</span>
              </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPayoutTabFilter("all")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    payoutTabFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All History ({payoutTransactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutTabFilter("payouts")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    payoutTabFilter === "payouts" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Bank Payouts
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutTabFilter("credits")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    payoutTabFilter === "credits" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Fee Credits
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={payoutSearch}
                  onChange={(e) => setPayoutSearch(e.target.value)}
                  placeholder="Search TX ID, UTR..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto custom-scrollbar border border-slate-200/80 rounded-2xl">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Gross Fee</th>
                    <th className="py-3 px-4">1% TDS</th>
                    <th className="py-3 px-4">Net Payout</th>
                    <th className="py-3 px-4">Status &amp; UTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {loadingPayouts ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold text-xs bg-slate-50/50">
                        <div className="animate-pulse flex items-center justify-center gap-2">
                          <DollarSign className="w-5 h-5 text-emerald-500 animate-spin" />
                          <span>Fetching real payout &amp; earnings transactions from database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-medium text-xs bg-slate-50/50 space-y-2">
                        <DollarSign className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700 text-sm">No payout or earnings transactions yet.</p>
                        <p className="text-slate-400 max-w-sm mx-auto">When clients book your expert services and jobs are marked completed, consultation fee credits will automatically show up here!</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{tx.date}</div>
                          <div className="text-[10px] text-slate-400">{tx.time}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{tx.id}</td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-extrabold text-slate-900 truncate">{tx.type}</div>
                          <div className="text-[11px] text-slate-500 truncate">{tx.description}</div>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                          {currencySymbol}{tx.grossAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-bold whitespace-nowrap">
                          -{currencySymbol}{tx.tdsAmount}
                        </td>
                        <td className="py-3.5 px-4 font-black whitespace-nowrap">
                          <span className={tx.category === "payout" ? "text-emerald-700" : "text-blue-700"}>
                            {currencySymbol}{tx.netAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase w-fit ${
                              String(tx.status).toLowerCase().includes("transferred")
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}>
                              {tx.status}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">{tx.utrNumber}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax & TDS Compliance Box */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-3 relative overflow-hidden shadow-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-extrabold text-white">Government TDS &amp; Tax Compliance (Section 194O)</h4>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  RentAwas automatically deducts 1% TDS as per Indian Income Tax regulations. TDS certificates (Form 16A) are issued quarterly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toast("Generating Form 16A TDS Certificate...", "info")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer shrink-0"
              >
                Download Form 16A
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: REVIEWS & REPUTATION */}
      {activeTab === "reviews" && (
        <div className="space-y-6 font-sans">
          
          {/* Top Overall Rating Overview Card */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
<div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>EXPERT REPUTATION SCORE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Client Feedback &amp; Review Ratings
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                Authentic reviews left by property owners, landlords, and tenants following on-site visits and property maintenance audits.
              </p>
            </div>

            {(() => {
              const avgRating = expertReviews.length > 0
                ? (expertReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / expertReviews.length).toFixed(1)
                : "5.0";
              return (
                <div className="relative z-10 shrink-0 flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <div className="text-center">
                    <div className="text-3xl font-black text-amber-400 flex items-center justify-center gap-1">
                      <span>{avgRating}</span>
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider pt-0.5">{expertReviews.length} Total Reviews</div>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-400">100%</div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider pt-0.5">Satisfaction Rate</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Cards Grid Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>All Client Reviews ({loadingReviews ? "..." : expertReviews.length})</span>
              </h3>
              {!loadingReviews && expertReviews.length > 0 && (
                <span className="text-xs text-slate-500 font-semibold">
                  Showing <strong>{(reviewPage - 1) * REVIEWS_PER_PAGE + 1}–{Math.min(reviewPage * REVIEWS_PER_PAGE, expertReviews.length)}</strong> (Page {reviewPage} of {totalReviewPages})
                </span>
              )}
            </div>

            {/* SKELETON LOADING UI (Pulsing Cards while loading) */}
            {loadingReviews ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-3.5 bg-slate-200 rounded-md" />
                          <div className="w-20 h-2.5 bg-slate-200 rounded" />
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-amber-100/60 rounded-xl" />
                    </div>
                    <div className="p-3 bg-slate-100 rounded-xl space-y-1.5">
                      <div className="w-36 h-3 bg-slate-200 rounded" />
                      <div className="w-24 h-2.5 bg-slate-200 rounded" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-3 bg-slate-200 rounded" />
                      <div className="w-3/4 h-3 bg-slate-200 rounded" />
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="w-28 h-5 bg-emerald-50 rounded-full" />
                      <div className="w-16 h-3 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : expertReviews.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
                <Star className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-extrabold text-slate-800">No client reviews received yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  When clients rate your completed maintenance services and leave feedback on RentAwas, their verified reviews will automatically appear here.
                </p>
              </div>
            ) : (
              /* Modern Card Grid (Max 8 Reviews Per Page) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {paginatedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
                  >
                    {/* Top Header: Client Info & Star Pill */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar Initials Circle */}
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs shrink-0 border border-slate-800">
                            {rev.clientName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </div>

                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                              {rev.clientName}
                            </h4>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-extrabold border border-slate-200/80 inline-block mt-0.5">
                              {rev.clientRole}
                            </span>
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-black flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{Number(rev.rating).toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Service & Property Context */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-medium space-y-0.5">
                        <div className="text-slate-800 font-bold flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>{rev.service}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] truncate">
                          {rev.property}
                        </div>
                      </div>

                      {/* Review Quote Body */}
                      <div className="relative pt-1">
                        <Quote className="w-6 h-6 text-slate-200 absolute -top-1 -left-1 rotate-180 pointer-events-none" />
                        <p className="text-xs text-slate-700 font-medium leading-relaxed pl-4 italic">
                          &quot;{rev.comment}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Card Footer: Verified Badge & Date */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified RentAwas Booking</span>
                      </span>

                      <span className="text-[11px] text-slate-400 font-semibold">{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls Bar */}
            {totalReviewPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 bg-white p-5 rounded-3xl border shadow-2xs">
                <div className="text-xs text-slate-500 font-medium">
                  Showing <strong>{(reviewPage - 1) * REVIEWS_PER_PAGE + 1}</strong> to{" "}
                  <strong>{Math.min(reviewPage * REVIEWS_PER_PAGE, expertReviews.length)}</strong> of{" "}
                  <strong>{expertReviews.length}</strong> verified reviews
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={reviewPage === 1}
                    onClick={() => setReviewPage((prev) => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-200/80"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setReviewPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          reviewPage === pageNum
                            ? "bg-[#FF6B00] text-white shadow-xs"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={reviewPage === totalReviewPages}
                    onClick={() => setReviewPage((prev) => Math.min(totalReviewPages, prev + 1))}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-200/80"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* VIEW 5: EXPERT PROFILE — 2-COLUMN SIDE-BY-SIDE LAYOUT */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans items-start">
          
          {/* LEFT SIDE (col-span-7): READ-ONLY PROFILE CARDS WITH PENCIL EDIT BUTTONS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Card 1: Personal & Trade Profile Information (Read-Only) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#FF6B00]" />
                    <span>Personal &amp; Trade Profile Details</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Verified personal information, trade credentials, and workshop base</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(true)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#FF6B00] text-slate-700 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Read-Only Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Expert Trade Category</span>
                  <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 pt-0.5">
                    <Wrench className="w-4 h-4 text-[#FF6B00]" />
                    <span>{expertCategory}</span>
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center overflow-hidden shrink-0 shadow-2xs border border-slate-200">
                    {profileAvatarUrl ? (
                      <img src={profileAvatarUrl} alt={profileName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{profileName.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Full Legal Name</span>
                    <span className="font-extrabold text-slate-900 text-xs">{profileName}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Official Email Address</span>
                  <span className="font-semibold text-slate-900 text-xs">{profileEmail}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Contact Phone Number</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{profilePhone}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Govt ID Document Type</span>
                  <span className="font-bold text-slate-900 text-xs truncate block">{profileGovtIdType}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Govt ID / License Number</span>
                  <span className="font-mono font-bold text-slate-900 text-xs truncate block">{profileGovtIdNumber}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Specialization &amp; Skills</span>
                  <span className="font-bold text-slate-900 text-xs">{profileSpecialization}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Postal Pincode / Zip Code</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{profilePincode}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Workshop / Base Address</span>
                  <span className="font-medium text-slate-800 text-xs">{profileAddress} (Pincode: {profilePincode})</span>
                </div>
              </div>
            </div>

            {/* Card 2: Currency & Operational Preferences (Read-Only) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#FF6B00]" />
                    <span>RentAwas Currency &amp; Operational Preferences</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Portal currency display, languages, and service work hours</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEditCurrencyModal(true)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#FF6B00] text-slate-700 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Portal Default Currency</span>
                  <span className="font-black text-slate-900 text-xs">{currency}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Spoken Languages ({selectedLanguages.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedLanguages.map((lang) => (
                      <span key={lang} className="px-2 py-0.5 bg-white text-slate-900 border border-slate-200 rounded text-[10px] font-bold">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Work Availability Hours</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {workStartTime} - {workEndTime} ({workDays})
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Emergency Contact & Medical Safety Credentials (Read-Only) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-red-500" />
                    <span>Emergency Contact &amp; Medical Safety</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">On-site safety contact, next of kin details, and blood group</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEditEmergencyModal(true)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#FF6B00] text-slate-700 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Emergency Contact &amp; Relation</span>
                  <span className="font-extrabold text-slate-900 text-xs">{emergencyContactName}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Emergency Phone Number</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{emergencyContactPhone}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Blood Group</span>
                  <span className="font-black text-red-600 text-xs">{bloodGroup}</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">First-Aid Safety Accreditation</span>
                  <span className="font-bold text-emerald-900 text-[11px]">Certified First Aid Responder</span>
                </div>
              </div>
            </div>

            {/* Card 4: Service Fee & Localities (Read-Only) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#FF6B00]" />
                    <span>Service Visit Rates &amp; Localities</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Service booking rate and covered service cities</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEditRatesModal(true)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#FF6B00] text-slate-700 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Rates</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Service Fee per Visit</span>
                  <span className="font-black text-slate-900 text-lg">{currencySymbol}{consultationFee}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Covered Service Localities</span>
                  <div className="flex flex-wrap gap-1">
                    {coveredCities.map((city, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white text-slate-800 border border-slate-200 rounded text-[10px] font-bold">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE (col-span-5): EXECUTIVE CORPORATE DIGITAL ID BADGE (MICROSOFT STYLE WITH 3D FLIP) */}
          <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
            
            {/* Download, Print & Flip Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Corporate Digital ID</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsIdCardFlipped(!isIdCardFlipped)}
                  className="px-3 py-1.5 bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 hover:bg-[#FF6B00]/30 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>{isIdCardFlipped ? "Show Front" : "Flip Card 🔄"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadIdCardPdf}
                  className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-[11px] font-extrabold transition-all cursor-pointer shadow-xs flex items-center gap-1 uppercase tracking-wider"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast("Opening print layout for Corporate ID Badge...", "info")}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-slate-700 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Microsoft-Style Corporate Vertical Employee Badge (Front / Back Flip View) */}
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-2 border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden text-center transition-all duration-300">
              
              {/* Lanyard Punch Hole Simulation */}
              <div className="w-14 h-3.5 mx-auto bg-slate-800/90 rounded-full border border-slate-700 shadow-inner flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-950 rounded-full" />
              </div>

              {/* Ambient Gloss Highlight */}
              <div className="absolute -right-20 -top-20 w-56 h-56 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {!isIdCardFlipped ? (
                /* ── FRONT SIDE OF DIGITAL ID CARD ── */
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  {/* Brand Row */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 relative z-10">
                    <div className="flex items-center gap-1.5 text-left">
                      <span className="text-lg font-black tracking-tight text-white">
                        Rent<span className="text-[#FF6B00]">Awas</span>
                      </span>
                      <span className="text-[9px] font-extrabold text-[#FF6B00] uppercase tracking-widest bg-[#FF6B00]/15 px-1.5 py-0.5 rounded border border-[#FF6B00]/30">
                        EXPERT
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID CODE</div>
                      <div className="text-[11px] font-mono font-extrabold text-amber-400">{expertIdCode}</div>
                    </div>
                  </div>

                  {/* Profile Photo / Avatar with Gold Ring & Verified Badge */}
                  <div className="relative w-28 h-28 mx-auto z-10">
                    <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-[#FF6B00] via-amber-500 to-purple-600 p-1 shadow-2xl">
                      <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-white font-black text-3xl uppercase tracking-wider overflow-hidden">
                        {profileAvatarUrl ? (
                          <img src={profileAvatarUrl} alt={profileName} className="w-full h-full object-cover rounded-[22px]" />
                        ) : (
                          profileName.split(" ").map(n => n[0]).join("").slice(0, 2)
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-950 shadow-lg">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  {/* Name & Title Details */}
                  <div className="space-y-1 relative z-10">
                    <h4 className="text-xl font-black text-white tracking-tight">{profileName}</h4>
                    <div className="inline-block px-3 py-1 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00] text-[11px] font-extrabold uppercase tracking-wider">
                      {expertCategory}
                    </div>
                    <p className="text-xs text-slate-300 font-semibold pt-1 max-w-xs mx-auto leading-tight">
                      {profileSpecialization}
                    </p>
                  </div>

                  {/* Verified Trade Info Box */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-2 text-left text-xs relative z-10">
                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Govt ID / License</span>
                      <span className="font-mono font-bold text-slate-200 text-[11px]">{profileGovtIdType.split("(")[0].trim()} ({profileGovtIdNumber})</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                      <span className="font-mono font-bold text-slate-200 text-[11px]">{profilePhone}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Official Email</span>
                      <span className="font-semibold text-slate-200 text-[10px] truncate max-w-[140px]">{profileEmail}</span>
                    </div>
                  </div>

                  {/* Bottom Security Footer Strip */}
                  <div className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest relative z-10 pt-1">
                    STATUS: ACTIVE &amp; STAMPED • VALID THRU DEC 2028
                  </div>
                </div>
              ) : (
                /* ── BACK SIDE OF DIGITAL ID CARD (FLIPPED VIEW) ── */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* Back Header */}
                  <div className="border-b border-slate-800/80 pb-3 relative z-10 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/15 px-2 py-0.5 rounded border border-[#FF6B00]/30">
                      OFFICIAL SECURITY BACKING
                    </span>
                    <h4 className="text-sm font-extrabold text-white pt-1">RentAwas Verification &amp; Compliance</h4>
                  </div>

                  {/* Verification QR Code Box */}
                  <div className="p-4 bg-slate-800/90 border border-slate-700/90 rounded-2xl space-y-2 relative z-10">
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden group">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                          typeof window !== "undefined"
                            ? `${window.location.origin}/expert/dashboard?tab=profile&expertId=${activeExpertDbId || "EXP-101"}`
                            : `https://rentawas.in/expert/verify?id=${activeExpertDbId || "EXP-101"}`
                        )}`}
                        alt={`Official Verification QR Code for ${profileName}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center space-y-0.5 pt-1">
                      <div className="text-xs font-black text-white flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Scan for Instant Field Verification</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium max-w-xs mx-auto">
                        Scan with any smartphone camera or RentAwas app to verify partner empanelment &amp; background check.
                      </p>
                    </div>
                  </div>

                  {/* Company & Registration Information Box */}
                  <div className="p-3.5 bg-slate-800/90 border border-slate-700/90 rounded-2xl space-y-2 text-left text-[11px] relative z-10">
                    <div className="font-extrabold text-white text-xs border-b border-slate-700/60 pb-1 flex items-center justify-between">
                      <span>RentAwas Partner Credentials</span>
                      <span className="text-[9px] font-mono text-[#FF6B00]">ANSH APPS</span>
                    </div>

                    <div className="space-y-1 text-slate-300 font-medium text-[10px]">
                      <div>
                        Product Branding: <strong className="text-white">RentAwas — A product of ANSH Apps</strong>
                      </div>
                      <div>
                        Udyam Reg. Number: <strong className="text-emerald-400 font-mono">UDYAM-BR-23-0127857</strong>
                      </div>
                      <div>
                        GSTIN: <strong className="text-amber-400 font-mono">10DIUPR1358M1ZP</strong>
                      </div>
                      <div className="text-[9.5px] text-slate-400 pt-0.5">
                        Issued by RentAwas Operations &amp; Legal Compliance Desk.
                      </div>
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-500 font-medium pt-1">
                    Emergency Partner Helpline: 1800-RENTAWAS • www.rentawas.in
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ── EDIT MODAL 1: PERSONAL & TRADE PROFILE ─────────────────────── */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <button
              type="button"
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-black">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit Personal &amp; Trade Profile</h3>
                <p className="text-xs text-slate-500 font-semibold">Update your verified personal info, trade category, and Govt ID credentials</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans max-h-[60vh] overflow-y-auto pr-1">
              {/* Profile Photo Upload Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 p-0.5 shadow-md shrink-0">
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-xl uppercase overflow-hidden">
                    {profileAvatarUrl ? (
                      <img src={profileAvatarUrl} alt={profileName} className="w-full h-full object-cover rounded-[14px]" />
                    ) : (
                      <span>{profileName.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <span className="block font-bold text-slate-800 text-xs">Profile &amp; ID Card Photo</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setProfileAvatarUrl(ev.target?.result as string);
                              toast("Profile photo updated successfully!", "success");
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {profileAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileAvatarUrl("");
                          toast("Removed profile photo.", "info");
                        }}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP recommended (Max 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expert Trade Category</label>
                <div className="relative">
                  <select
                    value={expertCategory}
                    onChange={(e) => setExpertCategory(e.target.value)}
                    className="w-full appearance-none pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Plumbing & Water Systems">🚰 Plumbing &amp; Water Systems (Plumber)</option>
                    <option value="Electrical & Appliance Repair">⚡ Electrical &amp; Appliance Repair (Electrician)</option>
                    <option value="AC & HVAC Technician">❄️ AC &amp; HVAC Technician</option>
                    <option value="Househelp & Home Cleaning">🧹 Househelp &amp; Deep Cleaning (Househelp / Maid)</option>
                    <option value="Carpentry & Painting">🪵 Carpentry &amp; Painting (Carpenter / Painter)</option>
                    <option value="Property Structural Inspection">🔍 Property Structural Inspection (Inspector)</option>
                    <option value="Legal Vetting & Verification">⚖️ Legal Vetting &amp; Tenant Verification</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
                <CountryPhoneInput
                  value={profilePhone}
                  onChange={setProfilePhone}
                  selectedCountry={profilePhoneCountry}
                  onCountryChange={setProfilePhoneCountry}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Govt ID Document Type</label>
                <div className="relative">
                  <select
                    value={profileGovtIdType}
                    onChange={(e) => setProfileGovtIdType(e.target.value)}
                    className="w-full appearance-none pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    {INDIAN_GOVT_ID_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Govt ID / License Number</label>
                <input
                  type="text"
                  value={profileGovtIdNumber}
                  onChange={(e) => setProfileGovtIdNumber(e.target.value)}
                  placeholder="e.g. 4912 8890 1234 / LIC-9821"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-extrabold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialization &amp; Key Skills</label>
                <input
                  type="text"
                  value={profileSpecialization}
                  onChange={(e) => setProfileSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Postal Pincode / Zip Code</label>
                <input
                  type="text"
                  value={profilePincode}
                  onChange={(e) => setProfilePincode(e.target.value)}
                  placeholder="e.g. 122011"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-extrabold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Workshop / Base Address</label>
                <textarea
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowEditProfileModal(false);
                  toast("Updated Personal & Trade Profile details successfully!", "success");
                  await saveProfileToDb({
                    name: profileName,
                    email: profileEmail,
                    phone: profilePhone,
                    trade: expertCategory,
                    govtIdType: profileGovtIdType,
                    govtId: profileGovtIdNumber,
                    specialization: profileSpecialization,
                    experience: profileExperience,
                    address: profileAddress,
                    pincode: profilePincode,
                  });
                }}
                className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditCurrencyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <button
              type="button"
              onClick={() => setShowEditCurrencyModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-black">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit Currency &amp; Work Hours</h3>
                <p className="text-xs text-slate-500 font-semibold">Select your portal currency, spoken languages, and work hours</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  RentAwas Portal Default Currency
                </label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                    }}
                    className="w-full appearance-none pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="INR (₹)">🇮🇳 INR (₹) — RentAwas Default (Indian Rupee)</option>
                    <option value="USD ($)">🇺🇸 USD ($) — US Dollar</option>
                    <option value="EUR (€)">🇪🇺 EUR (€) — Euro</option>
                    <option value="GBP (£)">🇬🇧 GBP (£) — British Pound</option>
                    <option value="AED">🇦🇪 AED — UAE Dirham</option>
                    <option value="SGD ($)">🇸🇬 SGD ($) — Singapore Dollar</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Languages Spoken (Multi-Select Selector)
                </label>

                {/* Selected Language Badges/Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl mb-2 min-h-[42px] items-center">
                  {selectedLanguages.length === 0 ? (
                    <span className="text-[11px] text-slate-400 font-medium px-1">No languages selected yet</span>
                  ) : (
                    selectedLanguages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 bg-white text-slate-900 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{lang}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedLanguages(selectedLanguages.filter((l) => l !== lang))}
                          className="text-slate-400 hover:text-red-500 font-bold p-0.5 rounded cursor-pointer transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown Multi-Selector */}
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !selectedLanguages.includes(val)) {
                        setSelectedLanguages([...selectedLanguages, val]);
                      }
                    }}
                    className="w-full appearance-none pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="" disabled>+ Select / Add Spoken Language from list...</option>
                    {ALL_INDIAN_LANGUAGES.map((lang) => (
                      <option
                        key={lang}
                        value={lang}
                        disabled={selectedLanguages.includes(lang)}
                      >
                        {selectedLanguages.includes(lang) ? `✓ ${lang} (Added)` : lang}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3 pt-1 border-t border-slate-100">
                <label className="block font-bold text-slate-700">
                  Work Service Availability Schedule
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Start Time Dropdown */}
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Start Time</span>
                    <div className="relative">
                      <select
                        value={workStartTime}
                        onChange={(e) => setWorkStartTime(e.target.value)}
                        className="w-full appearance-none pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {WORK_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* End Time Dropdown */}
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">End Time</span>
                    <div className="relative">
                      <select
                        value={workEndTime}
                        onChange={(e) => setWorkEndTime(e.target.value)}
                        className="w-full appearance-none pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {WORK_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Working Days Dropdown */}
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Working Days</span>
                    <div className="relative">
                      <select
                        value={workDays}
                        onChange={(e) => setWorkDays(e.target.value)}
                        className="w-full appearance-none pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="Mon-Sat">Mon-Sat (Mon to Sat)</option>
                        <option value="Mon-Sun">Mon-Sun (All 7 Days)</option>
                        <option value="Mon-Fri">Mon-Fri (Mon to Fri)</option>
                        <option value="Sat-Sun">Sat-Sun (Weekends)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditCurrencyModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowEditCurrencyModal(false);
                  toast("Updated Currency & Operational Preferences successfully!", "success");
                  await saveProfileToDb({
                    currency: currency,
                    languages: JSON.stringify(selectedLanguages),
                    workStartTime: workStartTime,
                    workEndTime: workEndTime,
                    workDays: workDays,
                  });
                }}
                className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Operational Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL 3: EMERGENCY CONTACT & MEDICAL SAFETY ───────────── */}
      {showEditEmergencyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <button
              type="button"
              onClick={() => setShowEditEmergencyModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit Emergency &amp; Medical Safety Details</h3>
                <p className="text-xs text-slate-500 font-semibold">Update next of kin emergency contact and blood group</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Contact Person &amp; Relation</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Phone Number</label>
                <CountryPhoneInput
                  value={emergencyContactPhone}
                  onChange={setEmergencyContactPhone}
                  selectedCountry={emergencyPhoneCountry}
                  onCountryChange={setEmergencyPhoneCountry}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <div className="relative">
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full appearance-none pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="O+ Positive">🩸 O+ Positive</option>
                    <option value="A+ Positive">🩸 A+ Positive</option>
                    <option value="B+ Positive">🩸 B+ Positive</option>
                    <option value="AB+ Positive">🩸 AB+ Positive</option>
                    <option value="O- Negative">🩸 O- Negative</option>
                    <option value="A- Negative">🩸 A- Negative</option>
                    <option value="B- Negative">🩸 B- Negative</option>
                    <option value="AB- Negative">🩸 AB- Negative</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditEmergencyModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowEditEmergencyModal(false);
                  toast("Saved emergency contact and medical safety details!", "success");
                  await saveProfileToDb({
                    emergencyContactName,
                    emergencyContactPhone,
                    bloodGroup,
                  });
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Save Safety Credentials</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL 4: SERVICE RATES & LOCALITIES ─────────────────────── */}
      {showEditRatesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <button
              type="button"
              onClick={() => setShowEditRatesModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-black">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit Service Rates &amp; Localities</h3>
                <p className="text-xs text-slate-500 font-semibold">Update service visit fee amount and active covered cities</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Fee per Visit ({currencySymbol})</label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Covered Service Localities</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {coveredCities.map((city, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white text-slate-800 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#FF6B00]" />
                      <span>{city}</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newCityInput}
                    onChange={(e) => setNewCityInput(e.target.value)}
                    placeholder="e.g. West Delhi"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCity}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditRatesModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowEditRatesModal(false);
                  toast(`Updated service visit rate to ${currencySymbol}${consultationFee}!`, "success");
                  await saveProfileToDb({
                    fee: Number(consultationFee),
                  });
                }}
                className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Rate Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: WEEKLY PAYOUT WITHDRAWAL REQUEST ─────────────────────── */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <button
              type="button"
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Weekly Expert Payout Request</h3>
                <p className="text-xs text-slate-500 font-semibold">Transfer weekly earnings directly to your bank / UPI</p>
              </div>
            </div>

            {/* Amount Selection & Input */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Balance</span>
                <div className="text-3xl font-black text-[#FF6B00]">{currencySymbol}{availableWalletBalance.toLocaleString()}</div>
              </div>

              {/* Quick Select Presets */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  Quick Select Amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5000, 10000, 20000, availableWalletBalance].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWithdrawAmountInput(preset)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        Number(withdrawAmountInput) === preset
                          ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset === availableWalletBalance ? "Full Balance" : `${currencySymbol}${preset.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  Withdrawal Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={withdrawAmountInput}
                  onChange={(e) => setWithdrawAmountInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Speed Option */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  Payout Mode &amp; Transfer Speed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setWithdrawSpeed("instant_imps")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      withdrawSpeed === "instant_imps"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instant IMPS / UPI</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Reflects in 5 mins</div>
                  </div>

                  <div
                    onClick={() => setWithdrawSpeed("weekly_schedule")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      withdrawSpeed === "weekly_schedule"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>Weekly Schedule</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Settles next Monday</div>
                  </div>
                </div>
              </div>

              {/* Fee & Net Breakdown Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Requested Amount:</span>
                  <span className="font-bold text-slate-900">{currencySymbol}{Number(withdrawAmountInput || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Platform Surcharge (0% Offer):</span>
                  <span className="font-bold text-emerald-600">{currencySymbol}0</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>TDS (1% Sec 194O Tax):</span>
                  <span className="font-bold text-slate-700">-{currencySymbol}{Math.round(Number(withdrawAmountInput || 0) * 0.01)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                  <span>Net Payout Amount:</span>
                  <span className="text-[#FF6B00] text-base">
                    {currencySymbol}{Math.max(0, Math.round(Number(withdrawAmountInput || 0) * 0.99)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Destination Summary */}
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  Destination: <strong>{payoutMethod.type === "bank" ? `${payoutMethod.bankName} (****${payoutMethod.accountNumber.slice(-4)})` : (payoutMethod.upiId || payoutMethod.upiPhoneNumber)}</strong>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdrawal}
                disabled={isProcessingWithdrawal}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {isProcessingWithdrawal ? (
                  <span>Processing Payout...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Withdraw Funds</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CONFIGURE PAYOUT METHOD & WEEKLY SCHEDULE ──────────────── */}
      {showEditBankModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowEditBankModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-black">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Configure Payout Method &amp; Weekly Schedule</h3>
                <p className="text-xs text-slate-500 font-semibold">Update bank account, UPI ID, Phone Number, QR Code scanner and weekly settlement preferences</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 text-xs">
              
              {/* Type Switcher */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditPayoutType("bank")}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    editPayoutType === "bank" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Bank Account (IMPS / NEFT)
                </button>
                <button
                  type="button"
                  onClick={() => setEditPayoutType("upi")}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    editPayoutType === "upi" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Direct UPI, Phone &amp; QR Code
                </button>
              </div>

              {editPayoutType === "bank" ? (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Holder Full Name</label>
                    <input
                      type="text"
                      value={editAccountHolder}
                      onChange={(e) => setEditAccountHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank Ltd"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={editAccountNo}
                        onChange={(e) => setEditAccountNo(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={editIfsc}
                        onChange={(e) => setEditIfsc(e.target.value)}
                        placeholder="HDFC0001234"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">VPA / UPI Address</label>
                    <input
                      type="text"
                      value={editUpiId}
                      onChange={(e) => setEditUpiId(e.target.value)}
                      placeholder="e.g. ramesh@okaxis"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      UPI Registered Mobile Phone Number (GPay / PhonePe / Paytm)
                    </label>
                    <CountryPhoneInput
                      value={editUpiPhoneNumber}
                      onChange={setEditUpiPhoneNumber}
                      selectedCountry={upiPhoneCountry}
                      onCountryChange={setUpiPhoneCountry}
                    />
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      Mobile number linked with GPay, PhonePe, or Paytm for direct phone transfers.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Payment Acceptance QR Code Scanner Image
                    </label>
                    
                    {editUpiQrCodeUrl ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                            <img src={editUpiQrCodeUrl} alt="UPI QR Scanner" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 block flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>QR Scanner Active &amp; Saved</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">Accepts payouts &amp; payments from all UPI apps</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditUpiQrCodeUrl("")}
                          className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#FF6B00] rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer group transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#FF6B00] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-extrabold text-slate-800">Upload Payment QR Code Image</span>
                        <span className="text-[10px] text-slate-500 font-medium">Upload GPay, PhonePe, Paytm, or BHIM QR Scanner (PNG, JPG, WEBP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setEditUpiQrCodeUrl(ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium pt-1">
                    Instant payouts will be routed directly to this UPI address / Phone number / QR scanner via RazorpayX.
                  </p>
                </div>
              )}

              {/* Weekly Auto-Payout Schedule Controls */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">Enable Automated Weekly Payouts</span>
                  <button
                    type="button"
                    onClick={() => setAutoWeeklyPayoutEnabled(!autoWeeklyPayoutEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      autoWeeklyPayoutEnabled ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        autoWeeklyPayoutEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {autoWeeklyPayoutEnabled && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase tracking-wider">Weekly Settlement Day</label>
                    <div className="relative">
                      <select
                        value={weeklyPayoutDay}
                        onChange={(e) => setWeeklyPayoutDay(e.target.value)}
                        className="w-full appearance-none pr-10 pl-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      >
                        <option value="Every Monday">Every Monday Morning (Recommended)</option>
                        <option value="Every Wednesday">Every Wednesday Morning</option>
                        <option value="Every Friday">Every Friday Evening</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditBankModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePayoutMethod}
                className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
              >
                Save Payout Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: WORK COMPLETION, SERVICE AMOUNT EDIT & SECURITY OTP QR UNLOCK ── */}
      {selectedJobForReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJobForReport(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Work Completion &amp; Escrow Payment Release</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedJobForReport.clientName} • {selectedJobForReport.propertyTitle}</p>
              </div>
            </div>

            {/* Form & Verification Controls */}
            <div className="space-y-4 text-xs font-sans">
              
              {/* EDITABLE SERVICE AMOUNT FIELD WITH 10% PLATFORM FEE BREAKDOWN */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                    Final Service Fee / Total Bill Amount ({currencySymbol})
                  </label>
                  <span className="text-[10px] text-[#FF6B00] font-bold">Editable (Add spare parts/labor)</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-700 text-base">{currencySymbol}</span>
                  <input
                    type="number"
                    value={completionFeeAmount}
                    onChange={(e) => setCompletionFeeAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Initial base fee was {currencySymbol}{selectedJobForReport.feeAmount}. Update if additional parts or extra labor was added.</p>

                {/* 10% RENT AWAS PLATFORM FEE BREAKDOWN BOX */}
                <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>Gross Service Bill (Customer Pays):</span>
                    <span className="font-bold text-slate-900">{currencySymbol}{Number(completionFeeAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span>RentAwas Platform Fee (10%):</span>
                      <span className="text-[9px] bg-orange-100 text-orange-800 font-black px-1.5 py-0.5 rounded border border-orange-200">10% Platform Fee</span>
                    </span>
                    <span className="font-extrabold text-red-600">
                      -{currencySymbol}{Math.round(Number(completionFeeAmount || 0) * 0.10).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-black text-slate-900 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span>Total You Get (Net Wallet Credit):</span>
                    </span>
                    <span className="text-emerald-600 text-base font-extrabold">
                      {currencySymbol}{Math.max(0, Math.round(Number(completionFeeAmount || 0) * 0.90)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 1: ENTER 6-DIGIT SECURITY OTP CODE */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Customer 6-Digit Security Passcode</span>
                  </div>
                  {isOtpVerified && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      ✓ Passcode Verified
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-amber-800 font-medium">
                  Ask the customer on-site for their 6-digit security OTP code (visible in their RentAwas Live Tracker) to verify work completion &amp; unblur payment QR code.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setEnteredOtp(val);
                      if (val.length === 6) {
                        setIsOtpVerified(true);
                        toast("6-Digit Passcode Verified! Payment QR Code Unlocked.", "success");
                      } else {
                        setIsOtpVerified(false);
                      }
                    }}
                    placeholder="Enter 6-Digit Passcode (e.g. 489201)"
                    className="flex-1 px-4 py-2.5 bg-white border border-amber-300 rounded-xl font-mono text-center text-sm font-black text-slate-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (enteredOtp.length === 6) {
                        setIsOtpVerified(true);
                        toast("6-Digit Passcode Verified! Payment QR Code Unlocked.", "success");
                      } else {
                        toast("Please enter a valid 6-digit passcode.", "error");
                      }
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider shrink-0"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>

              {/* STEP 2: BLURRED / UNLOCKED PAYMENT QR CODE BOX */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-extrabold text-white">Escrow Payment QR Code Scanner</span>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    isOtpVerified ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {isOtpVerified ? "UNLOCKED & ACTIVE" : "BLURRED & LOCKED"}
                  </span>
                </div>

                {/* QR Container with Dynamic Blur Effect */}
                <div className="relative flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className={`transition-all duration-300 flex flex-col items-center gap-2 ${
                    isOtpVerified ? "filter blur-none opacity-100 animate-in zoom-in-95" : "filter blur-md opacity-30 pointer-events-none select-none"
                  }`}>
                    <div className="w-36 h-36 bg-white p-2 rounded-2xl border-4 border-slate-800 shadow-xl flex items-center justify-center">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RentAwas-Escrow-Payment"
                        alt="Escrow QR Scanner"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-mono font-extrabold text-emerald-400">
                      Scan &amp; Pay {currencySymbol}{completionFeeAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Overlay Banner when Locked / Blurred */}
                  {!isOtpVerified && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/70 backdrop-blur-xs rounded-xl z-20 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-extrabold text-white">Payment QR Blurred</div>
                      <p className="text-[10px] text-slate-300 font-medium max-w-xs leading-relaxed">
                        Enter the customer&apos;s 6-digit security passcode above to unblur the QR code and unlock escrow payment release.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Work Report Notes */}
              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5 uppercase tracking-wider text-[10px]">
                  Work Report Summary &amp; Notes
                </label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Completed water leak fix and replaced damaged pipe valve..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* STEP 3: RATE THE CUSTOMER / CLIENT (EXPERT FEEDBACK) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                    Rate Customer / Client Experience
                  </label>
                  <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{customerRating} / 5 Stars</span>
                  </span>
                </div>

                {/* Interactive Star Picker */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCustomerRating(star)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        star <= customerRating
                          ? "bg-amber-50 border-amber-300 text-amber-500 shadow-2xs scale-105"
                          : "bg-white border-slate-200 text-slate-300 hover:text-amber-400"
                      }`}
                    >
                      <Star className={`w-5 h-5 ${star <= customerRating ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-slate-700 ml-1">
                    {customerRating === 5 ? "Outstanding Client 🎉" : customerRating === 4 ? "Very Good Client 👍" : customerRating === 3 ? "Average Experience" : "Cooperative"}
                  </span>
                </div>

                {/* Quick Rating Feedback Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Polite & Respectful",
                    "Prompt On-Site Access",
                    "Clear Issue Description",
                    "Cooperative & Helpful",
                  ].map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!customerRatingTags.includes(tag)) {
                          setCustomerRatingTags([...customerRatingTags, tag]);
                        } else {
                          setCustomerRatingTags(customerRatingTags.filter((t) => t !== tag));
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        customerRatingTags.includes(tag)
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-2xs font-extrabold"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {customerRatingTags.includes(tag) ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedJobForReport(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadReport}
                disabled={isUploading || !isOtpVerified}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {isUploading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Job &amp; Get {currencySymbol}{Math.max(0, Math.round(Number(completionFeeAmount || 0) * 0.90)).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL: UPLOAD / SAVE NEW AGREEMENT DOCUMENT ── */}
      {showUploadDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <button
              onClick={() => setShowUploadDocModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Upload / Save New Agreement Document</h3>
                <p className="text-xs text-slate-500 font-semibold">Store official SLAs, deeds, and agreements into your vault</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title / File Name *</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. RentAwas_Certified_Empanelment_Agreement.pdf"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                >
                  <option value="RentAwas Issued Agreement">📄 RentAwas Issued Agreement</option>
                  <option value="Official RentAwas SLA">📜 Official RentAwas SLA</option>
                  <option value="Compliance Deed">🛡️ Legal &amp; Compliance Deed</option>
                  <option value="Audit Report">🔍 Client Audit Report</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional notes about terms, validity period, or issuer..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUploadDocModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDocument}
                disabled={isSavingDoc}
                className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingDoc ? "Saving..." : "Save to Vault"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExpertDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-extrabold text-slate-500 space-y-3">
          <span className="inline-block w-8 h-8 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading Expert Portal...</p>
        </div>
      }
    >
      <ExpertDashboardContent />
    </Suspense>
  );
}
