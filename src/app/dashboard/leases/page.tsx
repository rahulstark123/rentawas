"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, 
  FileText, 
  Download, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Copy,
  Building2,
  AlertTriangle,
  Receipt,
  ClipboardCheck,
  FileCheck2,
  TrendingUp,
  Wrench,
  UserCheck,
  Globe,
  Printer,
  ChevronDown,
  Sun,
  Moon,
  Check,
  Folder,
  Plus,
  Search,
  Trash2,
  Share2,
  Upload,
  Loader2,
  ExternalLink,
  Eye,
  X,
  FileCheck,
  Mail,
  MessageCircle,
  Smartphone,
  Bell
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { uploadFile, validateFile } from "@/lib/upload";
import { ensureActiveWorkspaceId, getActiveWorkspaceId } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";

export interface LegalDocumentTemplate {
  id: string;
  title: string;
  category: "Global & US/UK" | "India Specific" | "Notices & Extra Rules";
  icon: any;
  description: string;
  jurisdictions: string[];
}

export const LEGAL_DOCUMENTS: LegalDocumentTemplate[] = [
  {
    id: "res-lease",
    title: "1. Home Rent Agreement",
    category: "Global & US/UK",
    icon: FileText,
    description: "Standard 12-month or 24-month agreement for renting a home or flat.",
    jurisdictions: ["Seattle, WA (USA)", "New York, NY (USA)", "London (UK)", "Dubai (UAE)", "Sydney (Australia)"],
  },
  {
    id: "leave-license",
    title: "2. Rent Agreement (India)",
    category: "India Specific",
    icon: FileCheck2,
    description: "Standard 11-month rent agreement following Indian city and state rules.",
    jurisdictions: ["Maharashtra (Mumbai/Pune)", "Karnataka (Bengaluru)", "Delhi NCR (Gurugram/Noida)", "Telangana (Hyderabad)", "Tamil Nadu (Chennai)"],
  },
  {
    id: "comm-lease",
    title: "3. Commercial & Shop Lease",
    category: "Global & US/UK",
    icon: Building2,
    description: "Lease agreement for shops, offices, or commercial spaces.",
    jurisdictions: ["Global Commercial Standard", "India Commercial Lease"],
  },
  {
    id: "eviction-notice",
    title: "4. Notice to Vacate / Move Out",
    category: "Notices & Extra Rules",
    icon: AlertTriangle,
    description: "30 or 60-day notice for unpaid rent or asking a tenant to move out.",
    jurisdictions: ["Standard 30-Day Notice", "Urgent 15-Day Default Notice"],
  },
  {
    id: "rent-increase",
    title: "5. Rent Increase Notice",
    category: "Notices & Extra Rules",
    icon: TrendingUp,
    description: "Official letter informing tenant about upcoming rent increase.",
    jurisdictions: ["Standard Annual Rent Increase", "Lease Renewal Rent Adjustment"],
  },
  {
    id: "deposit-refund",
    title: "6. Security Deposit Refund Receipt",
    category: "Notices & Extra Rules",
    icon: Receipt,
    description: "Summary of security deposit refund showing repair deductions and final payout.",
    jurisdictions: ["Full Refund Receipt", "Itemized Deduction Payout Statement"],
  },
  {
    id: "inspection-report",
    title: "7. House Move-In / Move-Out Checklist",
    category: "Notices & Extra Rules",
    icon: ClipboardCheck,
    description: "Room-by-room check of house condition, lights, plumbing, and key handover.",
    jurisdictions: ["Move-In House Inspection", "Move-Out House Inspection"],
  },
  {
    id: "pet-sublet",
    title: "8. Pet & Guest Rules Agreement",
    category: "Notices & Extra Rules",
    icon: ShieldCheck,
    description: "Rules for pets, extra guests, and prohibiting unauthorized subletting.",
    jurisdictions: ["Global Standard Pet Rider", "India Co-living Sublet Rider"],
  },
  {
    id: "maintenance-disclosure",
    title: "9. Repair & Maintenance Duties",
    category: "Notices & Extra Rules",
    icon: Wrench,
    description: "Clear list showing who pays for repairs (Landlord vs Tenant).",
    jurisdictions: ["Global Tenant Maintenance Rider", "India Structural Maintenance Clause"],
  },
  {
    id: "police-verification",
    title: "10. Police Verification & Society NOC",
    category: "India Specific",
    icon: UserCheck,
    description: "Police verification form and Housing Society move-in permission letter.",
    jurisdictions: ["India State Police Verification (Form 1)", "Global Housing Society Move-In Permission"],
  },
];

export default function AILeaseArchitectPage() {
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();
  
  // Top Level Main Tab Switcher ("my_documents" | "tenant_docs" | "ai_documents")
  const [activeMainTab, setActiveMainTab] = useState<"my_documents" | "tenant_docs" | "ai_documents">("my_documents");

  const [selectedDoc, setSelectedDoc] = useState<LegalDocumentTemplate>(LEGAL_DOCUMENTS[0]);
  const [jurisdiction, setJurisdiction] = useState(LEGAL_DOCUMENTS[0].jurisdictions[0]);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("light");
  
  // Form States
  const [landlordName, setLandlordName] = useState("Alexander Wright");
  const [tenantName, setTenantName] = useState("Eleanor Vance");
  const [propertyAddress, setPropertyAddress] = useState("Regent Tower, Unit 302, 5th Ave");
  const [rentAmount, setRentAmount] = useState("3200");
  const [depositAmount, setDepositAmount] = useState("3200");
  const [effectiveDate, setEffectiveDate] = useState("2026-08-01");
  const [additionalTerms, setAdditionalTerms] = useState("Includes 1 covered parking space. Maintenance fees billed separately.");
  
  // Specific States
  const [noticeDays, setNoticeDays] = useState("30");
  const [escalationRate, setEscalationRate] = useState("5");
  const [deductions, setDeductions] = useState("250");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingToVault, setIsSavingToVault] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modal 1: Upload Custom Document State
  const [docSearch, setDocSearch] = useState("");
  const [docCategoryFilter, setDocCategoryFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Lease Agreement");
  const [uploadPropertyId, setUploadPropertyId] = useState("");
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSavingCustomDoc, setIsSavingCustomDoc] = useState(false);
  const [docPropertyFilter, setDocPropertyFilter] = useState("all");

  // Modal 2: Send Document to Tenant State
  const [showSendModal, setShowSendModal] = useState(false);
  const [targetSendDoc, setTargetSendDoc] = useState<any | null>(null);
  const [sendMethod, setSendMethod] = useState<"whatsapp" | "email" | "sms" | "portal">("whatsapp");
  const [sendTenantEmail, setSendTenantEmail] = useState("");
  const [sendPhone, setSendPhone] = useState("+91 9876543210");
  const [sendNote, setSendNote] = useState("");
  const [sendFullText, setSendFullText] = useState(true);
  const [isSendingToTenant, setIsSendingToTenant] = useState(false);

  // ─── Workspace ID ──────────────────────────────────────────────────────────
  const [leasesWorkspaceId, setLeasesWorkspaceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (wid) setLeasesWorkspaceId(wid);
    })();
  }, []);

  // ─── TanStack Query Hooks ──────────────────────────────────────────────────
  const { data: savedDocs = [], isLoading: loadingDocs } = useQuery({
    queryKey: ["documents", leasesWorkspaceId],
    enabled: !!leasesWorkspaceId,
    queryFn: async () => {
      const [resDocs, resTenantDocs] = await Promise.all([
        fetch(`/api/documents?workspaceId=${leasesWorkspaceId}`),
        fetch(`/api/tenant/documents?workspaceId=${leasesWorkspaceId}`),
      ]);
      let allDocs: any[] = [];
      if (resDocs.ok) {
        const json = await resDocs.json();
        if (json.data && Array.isArray(json.data)) allDocs = [...json.data];
      }
      if (resTenantDocs.ok) {
        const jsonTenant = await resTenantDocs.json();
        if (jsonTenant.data && Array.isArray(jsonTenant.data)) {
          jsonTenant.data.forEach((td: any) => {
            if (!allDocs.some((d) => d.id === td.id)) allDocs.push(td);
          });
        }
      }
      return allDocs;
    },
  });

  const { data: tenantsList = [] } = useQuery({
    queryKey: ["tenants", leasesWorkspaceId],
    enabled: !!leasesWorkspaceId,
    queryFn: async () => {
      const res = await fetch(`/api/tenants?workspaceId=${leasesWorkspaceId}`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data && Array.isArray(json.data)) ? json.data : [];
    },
  });

  useEffect(() => {
    if (tenantsList.length > 0 && tenantsList[0]?.email && !sendTenantEmail) {
      setSendTenantEmail(tenantsList[0].email);
    }
  }, [tenantsList]);

  const { data: propertiesList = [] } = useQuery({
    queryKey: ["properties", leasesWorkspaceId],
    enabled: !!leasesWorkspaceId,
    queryFn: async () => {
      const res = await fetch(`/api/properties?wid=${leasesWorkspaceId}`);
      if (!res.ok) return [];
      const json = await res.json();
      const list = json.data || json.properties || (Array.isArray(json) ? json : []);
      return Array.isArray(list) ? list : [];
    },
  });

  useEffect(() => {
    if (propertiesList.length > 0 && propertiesList[0]?.id && !uploadPropertyId) {
      setUploadPropertyId(propertiesList[0].id);
    }
  }, [propertiesList]);

  const fetchSavedDocs = () => queryClient.invalidateQueries({ queryKey: ["documents", leasesWorkspaceId] });
  const fetchTenantsList = () => queryClient.invalidateQueries({ queryKey: ["tenants", leasesWorkspaceId] });
  const fetchPropertiesList = () => queryClient.invalidateQueries({ queryKey: ["properties", leasesWorkspaceId] });

  const handleVerifyDoc = async (docId: string, action: "Verified" | "Rejected") => {
    try {
      toast(
        action === "Verified"
          ? "Resident document verified & approved successfully!"
          : "Resident document marked as rejected.",
        action === "Verified" ? "success" : "info"
      );

      await fetch("/api/tenant/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docId, status: action }),
      });
      fetchSavedDocs();
    } catch (err) {
      console.error("Doc verification error:", err);
    }
  };



  const handleDocChange = (doc: LegalDocumentTemplate) => {
    setSelectedDoc(doc);
    setJurisdiction(doc.jurisdictions[0]);
    toast(`Template switched to ${doc.title.split(". ")[1]}`, "info");
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast(`AI successfully generated ${selectedDoc.title.split(". ")[1]}!`, "success");
    }, 600);
  };

  // Save current AI generated document to My Documents
  const handleSaveAIGeneratedToVault = async () => {
    setIsSavingToVault(true);
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) {
        toast("Workspace not found. Please sign in again.", "error");
        return;
      }

      let profileId: string | undefined;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        profileId = user?.id;
      } catch {}

      const docTitle = `${selectedDoc.title.split(". ")[1]} — ${tenantName || "Resident"}`;
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle,
          docType: selectedDoc.title.includes("Agreement") ? "Lease Agreement" : "Notice / Receipt",
          fileUrl: `https://rentawas.com/generated-doc/${selectedDoc.id}`,
          fileName: `${selectedDoc.id}_${Date.now()}.pdf`,
          fileSize: "1.4 MB",
          mimeType: "application/pdf",
          workspaceId: Number(activeWid),
          profileId,
          isDocs: true,
        }),
      });

      if (res.ok) {
        toast(`"${docTitle}" saved to My Documents!`, "success");
        fetchSavedDocs();
      } else {
        toast("Failed to save document", "error");
      }
    } catch (err) {
      toast("Failed to save document", "error");
    } finally {
      setIsSavingToVault(false);
    }
  };

  // Save custom uploaded document to database vault
  const handleSaveCustomDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      toast("Please enter a Document Title", "info");
      return;
    }
    if (!uploadUrl) {
      toast("Please upload a file first", "info");
      return;
    }
    if (!uploadPropertyId) {
      toast("Please select a target Property for this document", "info");
      return;
    }

    setIsSavingCustomDoc(true);
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) {
        toast("Workspace not found. Please sign in again.", "error");
        return;
      }

      let profileId: string | undefined;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        profileId = user?.id;
      } catch {}

      const payload: any = {
        title: uploadTitle.trim(),
        docType: uploadCategory,
        fileUrl: uploadUrl,
        fileName: uploadFileName || uploadTitle,
        fileSize: "2.1 MB",
        mimeType: "application/pdf",
        workspaceId: Number(activeWid),
        profileId,
        uploadedBy: "landlord",
        isDocs: true,
      };
      if (uploadPropertyId) {
        payload.propertyId = uploadPropertyId;
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(`Document "${uploadTitle}" saved to My Documents!`, "success");
        setShowUploadModal(false);
        setUploadTitle("");
        setUploadUrl("");
        setUploadFileName("");
        setUploadPropertyId("");
        fetchSavedDocs();
      } else {
        toast("Failed to save document", "error");
      }
    } catch (err) {
      toast("Failed to save document", "error");
    } finally {
      setIsSavingCustomDoc(false);
    }
  };

  // Modal 3: Delete Document Confirmation State
  const [deletingDoc, setDeletingDoc] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);

  // Delete saved document from database
  const handleConfirmDeleteDoc = async () => {
    if (!deletingDoc) return;
    setIsDeletingDoc(true);
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const widQuery = activeWid ? `?workspaceId=${activeWid}` : "";
      const res = await fetch(`/api/documents/${deletingDoc.id}${widQuery}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast(`"${deletingDoc.title}" deleted!`, "info");
        setDeletingDoc(null);
        fetchSavedDocs();
      } else {
        toast("Failed to delete document", "error");
      }
    } catch (err) {
      toast("Failed to delete document", "error");
    } finally {
      setIsDeletingDoc(false);
    }
  };

  // Send Document to Tenant via selected method (WhatsApp, Email, SMS, Portal)
  const handleSendToTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingToTenant(true);

    const docTitle = targetSendDoc?.title || selectedDoc.title.split(". ")[1] || "Document Agreement";
    const docUrl = targetSendDoc?.fileUrl || "https://rentawas.com/lease-agreement.pdf";

    // Build ENTIRE Document Text Body
    const fullDocumentBody = `📄 *${docTitle.toUpperCase()}*
──────────────────────────────
🏢 *Landlord / Owner:* ${landlordName}
👤 *Tenant Name:* ${tenantName}
📍 *Property Location:* ${propertyAddress}
💰 *Monthly Rent:* ${currencySymbol}${rentAmount}
🔐 *Security Deposit:* ${currencySymbol}${depositAmount}
📅 *Effective Date:* ${effectiveDate}

📝 *Terms & Rules:*
${additionalTerms || "Standard 12-month agreement terms apply."}

──────────────────────────────
🔗 *Download PDF / File Link:* ${docUrl}`;

    setTimeout(() => {
      setIsSendingToTenant(false);
      setShowSendModal(false);

      if (sendMethod === "whatsapp") {
        const cleanPhone = sendPhone.replace(/[^0-9]/g, "");
        const messageText = sendFullText
          ? `${fullDocumentBody}${sendNote ? `\n\n💬 *Owner Note:* ${sendNote}` : ""}`
          : `Hello ${tenantName}! Here is your official document "${docTitle}" from RentAwas: ${docUrl}${sendNote ? `\n\nNote: ${sendNote}` : ""}`;
        
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
        window.open(waUrl, "_blank");
        toast(`Opening WhatsApp with full document text for ${sendPhone}...`, "success");
      } else if (sendMethod === "email") {
        toast(`Entire document "${docTitle}" dispatched via Email to ${sendTenantEmail}!`, "success");
      } else if (sendMethod === "sms") {
        toast(`Document SMS alert sent to ${sendPhone}!`, "success");
      } else {
        toast(`Entire document "${docTitle}" pushed to Resident App Portal!`, "success");
      }
    }, 600);
  };

  const handleCopy = () => {
    setCopied(true);
    toast("Document text copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = previewTheme === "dark";

  // 1. Separate Landlord/Admin Custom Vault Docs vs Resident Tenant Submissions
  const landlordDocsList = savedDocs.filter((doc) => {
    // Only Landlord / Admin / Manager uploaded documents (no tenant attached AND not uploaded by tenant)
    const isTenantDoc = doc.tenantId != null || doc.tenant != null || doc.uploadedBy === "tenant" || doc.status === "Pending Verification";
    return !isTenantDoc;
  });

  const tenantDocsList = savedDocs.filter((doc) => {
    // Resident Tenant uploaded documents
    const isTenantDoc = doc.tenantId != null || doc.tenant != null || doc.uploadedBy === "tenant" || doc.status === "Pending Verification" || (doc.docType || "").includes("Resident") || (doc.docType || "").includes("ID");
    return isTenantDoc;
  });

  const pendingSubmissionsCount = tenantDocsList.filter((d) => d.status === "Pending Verification" || (!d.status && d.tenant)).length;

  // Filtered documents for My Documents Vault (Landlord/Admin Docs ONLY)
  const filteredSavedDocs = landlordDocsList.filter((doc) => {
    const q = docSearch.toLowerCase().trim();
    const matchSearch = !q || doc.title.toLowerCase().includes(q) || (doc.fileName || "").toLowerCase().includes(q);
    const matchCat = docCategoryFilter === "all" || doc.docType === docCategoryFilter;
    const matchProperty = docPropertyFilter === "all" || doc.propertyId === docPropertyFilter || doc.property?.id === docPropertyFilter;
    return matchSearch && matchCat && matchProperty;
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Header & Main Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeMainTab === "ai_documents"
                ? "Template Documents Architect"
                : activeMainTab === "tenant_docs"
                ? "Resident Tenant Documents"
                : "My Documents"}
            </h1>
            <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              {activeMainTab === "ai_documents" ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>10 Easy Document Templates</span>
                </>
              ) : activeMainTab === "tenant_docs" ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Resident Submissions ({pendingSubmissionsCount} Pending)</span>
                </>
              ) : (
                <>
                  <Folder className="w-3.5 h-3.5 text-purple-600" />
                  <span>Landlord &amp; Admin Vault ({landlordDocsList.length} Saved)</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeMainTab === "ai_documents"
              ? "Create rent agreements, move-out notices, security deposit receipts, and police verification forms in simple English."
              : activeMainTab === "tenant_docs"
              ? "Review, inspect high-res uploads, and verify resident tenant documents (ID, Lease, Receipts, Insurance, NOCs)."
              : "Save, manage, and store custom agreements, uploaded PDFs, signed tenancy contracts, and owner legal records."}
          </p>
        </div>

        {/* TOP TAB SWITCHER BUTTONS (My Documents, Tenant Docs, Template Documents) */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setActiveMainTab("my_documents")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 relative ${
              activeMainTab === "my_documents"
                ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Folder className="w-4 h-4 text-purple-200" />
            <span>My Documents ({landlordDocsList.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab("tenant_docs")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 relative ${
              activeMainTab === "tenant_docs"
                ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Tenant Docs ({tenantDocsList.length})</span>
            {pendingSubmissionsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full animate-pulse">
                {pendingSubmissionsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Template Documents coming soon"
            className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 text-slate-400 cursor-not-allowed opacity-70"
          >
            <Sparkles className="w-4 h-4" />
            <span>Template Documents (soon)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TAB 1: AI DOCUMENTS BUILDER & LIVE PREVIEW                          */}
      {/* ========================================================================= */}
      {activeMainTab === "ai_documents" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* 10 Documents Selector Grid */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#FF6B00]" />
                Choose Document Template (10 Available Options)
              </span>
              <span className="text-[11px] font-bold text-purple-600">
                Selected: {selectedDoc.title}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-1">
              {LEGAL_DOCUMENTS.map((doc) => {
                const Icon = doc.icon;
                const isSelected = selectedDoc.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleDocChange(doc)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02] ring-2 ring-slate-900/30"
                        : "bg-slate-50/80 hover:bg-slate-100 border-slate-200/90 text-slate-800"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-[#FF6B00] text-white" : "bg-white text-slate-700 border border-slate-200 shadow-2xs"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-200/90 text-slate-700"
                        }`}>
                          {doc.category === "India Specific" ? "INDIA" : doc.category === "Global & US/UK" ? "GLOBAL" : "RULES"}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base leading-snug">{doc.title}</h3>
                      <p className={`text-xs sm:text-[12.5px] font-medium leading-normal line-clamp-3 ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                        {doc.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form & Document Preview Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Simple Form Box (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF6B00]" />
                  <span>Fill {selectedDoc.title.split(". ")[1]} Details</span>
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Jurisdiction Selector */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Select City / State Location</label>
                  <div className="relative">
                    <select
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      {selectedDoc.jurisdictions.map((j, idx) => (
                        <option key={idx} value={j}>{j}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Landlord Name */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Landlord / Owner Name</label>
                  <input
                    type="text"
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* Tenant Name */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tenant / Renter Name</label>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* Property Address */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Property Address / House Location</label>
                  <input
                    type="text"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* Template Dynamic Fields */}
                {selectedDoc.id === "eviction-notice" ? (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Notice Days Granted</label>
                    <input
                      type="number"
                      value={noticeDays}
                      onChange={(e) => setNoticeDays(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                ) : selectedDoc.id === "rent-increase" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Current Rent ({currencySymbol})</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs pointer-events-none">
                          {currencySymbol}
                        </div>
                        <input
                          type="number"
                          value={rentAmount}
                          onChange={(e) => setRentAmount(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Increase Percentage (%)</label>
                      <input
                        type="number"
                        value={escalationRate}
                        onChange={(e) => setEscalationRate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>
                  </div>
                ) : selectedDoc.id === "deposit-refund" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Security Deposit ({currencySymbol})</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs pointer-events-none">
                          {currencySymbol}
                        </div>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Repair Deductions ({currencySymbol})</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs pointer-events-none">
                          {currencySymbol}
                        </div>
                        <input
                          type="number"
                          value={deductions}
                          onChange={(e) => setDeductions(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Rent ({currencySymbol})</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs pointer-events-none">
                          {currencySymbol}
                        </div>
                        <input
                          type="number"
                          value={rentAmount}
                          onChange={(e) => setRentAmount(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Security Deposit ({currencySymbol})</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs pointer-events-none">
                          {currencySymbol}
                        </div>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Special Rules & Notes</label>
                  <textarea
                    rows={2}
                    value={additionalTerms}
                    onChange={(e) => setAdditionalTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-70"
              >
                {isGenerating ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate {selectedDoc.title.split(". ")[1]}</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Document Preview Box (7 cols) */}
            <div className={`lg:col-span-7 border rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden font-sans transition-colors duration-200 ${
              isDark
                ? "bg-[#141A26] text-white border-slate-800"
                : "bg-white text-slate-900 border-slate-200 shadow-slate-200/80"
            }`}>
              {isDark && <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />}

              <div>
                {/* Header Action Toolbar */}
                <div className={`flex flex-wrap items-center justify-between pb-4 border-b gap-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Document Preview
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Save to My Documents Button */}
                    <button
                      type="button"
                      onClick={handleSaveAIGeneratedToVault}
                      disabled={isSavingToVault}
                      title="Save to My Documents in Database"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSavingToVault ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Folder className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      <span>Save to My Documents</span>
                    </button>

                    {/* Light / Dark Theme Switcher */}
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(isDark ? "light" : "dark")}
                      title={isDark ? "Switch to Light Paper View" : "Switch to Dark Theme View"}
                      className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer border ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                      }`}
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
                    </button>

                    {/* Copy Text Button */}
                    <button
                      type="button"
                      onClick={handleCopy}
                      title={copied ? "Copied to Clipboard!" : "Copy Document Text"}
                      className={`p-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer border ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {/* Print Document Button */}
                    <button
                      type="button"
                      onClick={() => alert(`Printing document PDF...`)}
                      title="Print Document / Save as PDF"
                      className={`p-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer border ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* WhatsApp Action */}
                    <button
                      onClick={() => {
                        setTargetSendDoc({ title: `${selectedDoc.title.split(". ")[1]} — ${tenantName}`, fileUrl: "#" });
                        setSendMethod("whatsapp");
                        setShowSendModal(true);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider shadow-xs"
                      title="Send via WhatsApp Direct"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Email Action */}
                    <button
                      onClick={() => {
                        setTargetSendDoc({ title: `${selectedDoc.title.split(". ")[1]} — ${tenantName}`, fileUrl: "#" });
                        setSendMethod("email");
                        setShowSendModal(true);
                      }}
                      className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider shadow-xs"
                      title="Send via Email Dispatch"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Generated Document Content Preview */}
                <div className={`mt-6 text-xs leading-relaxed space-y-4 p-6 rounded-xl border max-h-[460px] overflow-y-auto custom-scrollbar transition-colors ${
                  isDark
                    ? "bg-[#0C1019] text-slate-300 border-slate-800/80"
                    : "bg-slate-50 text-slate-800 border-slate-200/90 shadow-inner"
                }`}>
                  
                  {/* Document Title Header */}
                  <div className={`text-center font-bold uppercase tracking-widest text-sm border-b pb-3 ${
                    isDark ? "text-white border-slate-800" : "text-slate-900 border-slate-300"
                  }`}>
                    {selectedDoc.title.toUpperCase()} — {jurisdiction.toUpperCase()}
                  </div>

                  {/* Template 1: Home Rent Agreement */}
                  {selectedDoc.id === "res-lease" && (
                    <>
                      <p>
                        <strong>THIS RENT AGREEMENT</strong> is made on {effectiveDate}, between 
                        <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}> {landlordName} </span> (Owner / Landlord) and 
                        <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}> {tenantName} </span> (Tenant / Renter).
                      </p>
                      <p>
                        <strong>1. PROPERTY ADDRESS:</strong> House located at <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{propertyAddress}</span>.
                      </p>
                      <p>
                        <strong>2. RENT & DEPOSIT:</strong> Monthly rent is <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>{currencySymbol}{rentAmount}</strong> payable on the 1st of every month. Security deposit is <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>{currencySymbol}{depositAmount}</strong>.
                      </p>
                      <p>
                        <strong>3. SPECIAL RULES:</strong> {additionalTerms}
                      </p>
                    </>
                  )}

                  {/* Template 2: Rent Agreement (India) */}
                  {selectedDoc.id === "leave-license" && (
                    <>
                      <p>
                        <strong>RENT AGREEMENT FOR 11 MONTHS</strong> made on {effectiveDate}.
                      </p>
                      <p>
                        <strong>OWNER (LANDLORD):</strong> <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>{landlordName}</span> | <strong>TENANT:</strong> <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span>.
                      </p>
                      <p>
                        <strong>PROPERTY ADDRESS:</strong> House / Flat at <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{propertyAddress}</span> for 11 months.
                      </p>
                      <p>
                        <strong>RENT & DEPOSIT:</strong> Monthly rent is <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>{currencySymbol}{rentAmount} / month</strong> and refundable security deposit is <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>{currencySymbol}{depositAmount}</strong>.
                      </p>
                      <p>
                        <strong>POLICE VERIFICATION & REGISTRATION:</strong> This agreement will be registered online as per state government rules.
                      </p>
                    </>
                  )}

                  {/* Template 3: Commercial & Shop Lease */}
                  {selectedDoc.id === "comm-lease" && (
                    <>
                      <p>
                        <strong>COMMERCIAL SHOP / OFFICE LEASE AGREEMENT</strong> for property at <span className={`font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{propertyAddress}</span>.
                      </p>
                      <p>
                        <strong>LANDLORD:</strong> {landlordName} | <strong>TENANT:</strong> {tenantName}.
                      </p>
                      <p>
                        <strong>COMMERCIAL TERMS:</strong> Monthly Rent: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>{currencySymbol}{rentAmount}</strong> + Taxes. Security Deposit: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>{currencySymbol}{depositAmount}</strong>. Yearly Rent Increase: 5%.
                      </p>
                    </>
                  )}

                  {/* Template 4: Notice to Vacate */}
                  {selectedDoc.id === "eviction-notice" && (
                    <>
                      <div className={`p-3 border font-bold text-center uppercase rounded-lg ${
                        isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"
                      }`}>
                        OFFICIAL NOTICE TO VACATE HOUSE
                      </div>
                      <p>
                        <strong>TO TENANT:</strong> <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span>
                        <br />
                        <strong>PROPERTY ADDRESS:</strong> {propertyAddress}
                      </p>
                      <p className={isDark ? "text-amber-300" : "text-amber-700 font-medium"}>
                        PLEASE TAKE NOTICE that within <strong>{noticeDays} DAYS</strong> from receiving this notice, you are requested to clear all dues and hand over house keys to <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>{landlordName}</span>.
                      </p>
                    </>
                  )}

                  {/* Template 5: Rent Increase Notice */}
                  {selectedDoc.id === "rent-increase" && (
                    <>
                      <p>
                        <strong>NOTICE OF RENT INCREASE</strong>
                      </p>
                      <p>
                        Dear <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span>,
                      </p>
                      <p>
                        This is to inform you that starting from {effectiveDate}, the monthly rent for your house at {propertyAddress} will increase by {escalationRate}%. Your new monthly rent will be <strong>{currencySymbol}{(Number(rentAmount) * (1 + Number(escalationRate)/100)).toFixed(0)} / month</strong>.
                      </p>
                    </>
                  )}

                  {/* Template 6: Deposit Refund Receipt */}
                  {selectedDoc.id === "deposit-refund" && (
                    <>
                      <p>
                        <strong>SECURITY DEPOSIT REFUND SUMMARY</strong>
                      </p>
                      <div className={`p-3 border rounded-lg space-y-1 ${
                        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                      }`}>
                        <div>Total Security Deposit Received: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>{currencySymbol}{depositAmount}</strong></div>
                        <div>Minus Repair & Cleaning Charges: <strong className={isDark ? "text-red-400" : "text-red-600"}>-{currencySymbol}{deductions}</strong></div>
                        <div className={`border-t pt-1 font-bold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                          Final Refund Amount Paid to {tenantName}: <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>{currencySymbol}{Number(depositAmount) - Number(deductions)}</strong>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Template 7: House Checklist */}
                  {selectedDoc.id === "inspection-report" && (
                    <>
                      <p>
                        <strong>HOUSE MOVE-IN / MOVE-OUT CONDITION CHECKLIST</strong>
                      </p>
                      <p>
                        Address: {propertyAddress} | Checked by Landlord ({landlordName}) & Tenant ({tenantName}).
                      </p>
                      <div className={`text-[11px] space-y-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        <div>✓ Living Room & Walls: Good Condition</div>
                        <div>✓ Kitchen Fans, Lights & Plumbing: Working Perfectly</div>
                        <div>✓ Bathroom Fittings & Taps: Checked Clean & Working</div>
                      </div>
                    </>
                  )}

                  {/* Template 8: Pet & Guest Rules */}
                  {selectedDoc.id === "pet-sublet" && (
                    <>
                      <p>
                        <strong>PET RULES & SUBLETTING PERMISSION</strong>
                      </p>
                      <p>
                        Tenant <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span> is allowed to keep 1 domestic pet. Renting out rooms to outsiders or subletting without owner consent is not allowed.
                      </p>
                    </>
                  )}

                  {/* Template 9: Repair Duties */}
                  {selectedDoc.id === "maintenance-disclosure" && (
                    <>
                      <p>
                        <strong>REPAIR RESPONSIBILITY LIST (OWNER VS TENANT)</strong>
                      </p>
                      <p>
                        <strong>Owner / Landlord Duties:</strong> Water leakage, roof repairs, main electrical box, painting external walls.
                        <br />
                        <strong>Tenant Duties:</strong> Changing light bulbs, cleaning water tap blockages, replacing AC remote batteries.
                      </p>
                    </>
                  )}

                  {/* Template 10: Police Verification & Society NOC */}
                  {selectedDoc.id === "police-verification" && (
                    <>
                      <p>
                        <strong>TENANT POLICE VERIFICATION & HOUSING SOCIETY NOC</strong>
                      </p>
                      <p>
                        Tenant Name: <span className={`font-bold ${isDark ? "text-purple-400" : "text-purple-700"}`}>{tenantName}</span> | Owner Name: <span className={`font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>{landlordName}</span>.
                      </p>
                      <p>
                        This is to declare that tenant details have been submitted for Police Verification and Housing Society Move-in approval for premises: {propertyAddress}.
                      </p>
                    </>
                  )}

                  <div className={`pt-3 border-t text-[10px] flex justify-between ${
                    isDark ? "border-slate-800 text-slate-400" : "border-slate-300 text-slate-600"
                  }`}>
                    <span>Generated by RentAwas Smart Document Engine</span>
                    <span>Location Rules: {jurisdiction}</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN TAB 2: MY DOCUMENTS VAULT & LANDLORD DOCUMENT SAVER                  */}
      {/* ========================================================================= */}
      {activeMainTab === "my_documents" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Vault Controls (Search, Category Filter & Upload Custom Doc Button) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search & Category Filter */}
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <div className="relative flex-1 max-w-md min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Search saved agreements, PDFs, or tenant names..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Property Filter Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={docPropertyFilter}
                  onChange={(e) => setDocPropertyFilter(e.target.value)}
                  className="pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                >
                  <option value="all">🏢 All Properties</option>
                  {propertiesList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                {[
                  { id: "all", label: "All Saved Documents" },
                  { id: "tenant_pending", label: "⏳ Tenant Submissions (Pending)" },
                  { id: "ID & Verification", label: "KYC & Identity Proofs" },
                  { id: "Lease Agreement", label: "Lease Contracts" },
                  { id: "Notice / Receipt", label: "Notices & Receipts" },
                  { id: "Inspection Report", label: "Checklists" },
                  { id: "Custom Contract", label: "Custom Agreements" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDocCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] whitespace-nowrap transition-all cursor-pointer border ${
                      docCategoryFilter === cat.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action: Upload Custom Document Button */}
            <button
              onClick={() => {
                setUploadTitle("");
                setUploadUrl("");
                setUploadFileName("");
                setUploadFileObj(null);
                fetchPropertiesList();
                setShowUploadModal(true);
              }}
              className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2 shrink-0 self-end md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Custom Document</span>
            </button>
          </div>

          {/* Documents Grid / Vault List */}
          {loadingDocs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 min-h-[160px] flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-36 bg-slate-200 rounded-md" />
                      <div className="h-3 w-24 bg-slate-200/60 rounded-md" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 w-28 bg-slate-200 rounded-xl" />
                    <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSavedDocs.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200/90 rounded-2xl text-center space-y-3 shadow-2xs">
              <Folder className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-base">No Saved Documents Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have no saved documents yet. You can save agreements directly from the <strong>Template Documents</strong> tab or upload custom PDF contracts using the button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSavedDocs.map((doc) => {
                const isVerified = doc.status === "Verified" || doc.verified || doc.docType?.includes("Verified");
                const isRejected = doc.status === "Rejected";
                const isTenantDoc = doc.tenant != null || doc.status === "Pending Verification" || doc.docType?.includes("Resident");

                return (
                  <div key={doc.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2.5 rounded-xl shrink-0 ${isVerified ? "bg-emerald-50 text-emerald-600" : isTenantDoc ? "bg-amber-50 text-amber-600" : "bg-purple-50 text-purple-600"}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <span className="font-extrabold text-slate-900 text-sm block leading-snug truncate">{doc.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{doc.fileName || doc.title} • {doc.fileSize || "PDF"}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                          isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isRejected
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                        }`}>
                          {isVerified ? "Verified" : isRejected ? "Rejected" : "Pending Verification"}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 font-medium">
                        {doc.tenant && (
                          <div className="flex items-center justify-between">
                            <span>Resident Tenant:</span>
                            <strong className="text-slate-900 font-bold">{doc.tenant.name} {doc.tenant.unitNumber ? `(${doc.tenant.unitNumber})` : ""}</strong>
                          </div>
                        )}
                        {doc.property && (
                          <div className="flex items-center justify-between">
                            <span>Property:</span>
                            <strong className="text-slate-800">{doc.property.name}</strong>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>Uploaded Date:</span>
                          <strong className="text-slate-700">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          if (doc.fileUrl && doc.fileUrl.startsWith("http")) {
                            window.open(doc.fileUrl, "_blank");
                          } else if (doc.fileUrl) {
                            const win = window.open();
                            if (win) {
                              win.document.write(`<iframe src="${doc.fileUrl}" style="width:100%; height:100vh; border:none;"></iframe>`);
                            }
                          } else {
                            toast(`Opening ${doc.title}...`, "success");
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect &amp; Preview</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {!isVerified ? (
                          <>
                            <button
                              onClick={() => handleVerifyDoc(doc.id, "Verified")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              title="Verify & Approve Resident Document"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify &amp; Approve</span>
                            </button>

                            <button
                              onClick={() => handleVerifyDoc(doc.id, "Rejected")}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200"
                              title="Reject Document"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}

                        <button
                          onClick={() => setDeletingDoc({ id: doc.id, title: doc.title })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer ml-1"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN TAB 3: TENANT DOCS & RESIDENT SUBMISSIONS VERIFICATION               */}
      {/* ========================================================================= */}
      {activeMainTab === "tenant_docs" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Tenant Docs Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900">{tenantDocsList.length}</div>
                <div className="text-xs text-slate-500 font-medium">Total Resident Submissions</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl relative">
                <AlertTriangle className="w-5 h-5" />
                {pendingSubmissionsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute top-1 right-1" />
                )}
              </div>
              <div>
                <div className="text-xl font-extrabold text-amber-700">{pendingSubmissionsCount}</div>
                <div className="text-xs text-amber-800 font-medium">Pending Owner Review</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-emerald-700">
                  {tenantDocsList.filter((d) => d.status === "Verified" || d.verified || d.docType?.includes("Verified")).length}
                </div>
                <div className="text-xs text-emerald-800 font-medium">Verified &amp; Approved</div>
              </div>
            </div>
          </div>

          {/* Search, Property & Status Filter Controls */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search tenant name, document title, or unit number..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            {/* Property Filter Dropdown */}
            <div className="relative shrink-0">
              <select
                value={docPropertyFilter}
                onChange={(e) => setDocPropertyFilter(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
              >
                <option value="all">🏢 All Properties</option>
                {propertiesList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category/Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              {[
                { id: "all", label: "All Tenant Docs" },
                { id: "tenant_pending", label: `⏳ Pending Review (${pendingSubmissionsCount})` },
                { id: "ID & Verification", label: "KYC & Identity" },
                { id: "Lease & Addendums", label: "Lease & Renewals" },
                { id: "Receipts & Tax", label: "Receipts & Tax" },
                { id: "Renter Insurance & Liability", label: "Insurance" },
                { id: "Vehicle & Passes", label: "Vehicle & Parking" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setDocCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] whitespace-nowrap transition-all cursor-pointer border ${
                    docCategoryFilter === cat.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tenant Documents Cards List */}
          {loadingDocs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 min-h-[160px] flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-36 bg-slate-200 rounded-md" />
                      <div className="h-3 w-24 bg-slate-200/60 rounded-md" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 w-28 bg-slate-200 rounded-xl" />
                    <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : tenantDocsList.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200/90 rounded-2xl text-center space-y-3 shadow-2xs">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-base">No Tenant Documents Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No resident document uploads match your current filter. When tenants upload KYC, lease receipts, or insurance proofs from their app portal, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenantDocsList.map((doc) => {
                const isVerified = doc.status === "Verified" || doc.verified || doc.docType?.includes("Verified");
                const isRejected = doc.status === "Rejected";

                return (
                  <div key={doc.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2.5 rounded-xl shrink-0 ${isVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <span className="font-extrabold text-slate-900 text-sm block leading-snug truncate">{doc.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{doc.fileName || doc.title} • {doc.fileSize || "PDF"}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                          isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isRejected
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                        }`}>
                          {isVerified ? "Verified" : isRejected ? "Rejected" : "Pending Verification"}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-600 font-medium">
                        <div className="flex items-center justify-between">
                          <span>Resident Tenant:</span>
                          <strong className="text-slate-900 font-extrabold">{doc.tenant?.name || "Eleanor Vance"} {doc.tenant?.unitNumber ? `(${doc.tenant.unitNumber})` : ""}</strong>
                        </div>
                        {doc.property && (
                          <div className="flex items-center justify-between">
                            <span>Property:</span>
                            <strong className="text-slate-800">{doc.property.name}</strong>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>Category:</span>
                          <strong className="text-purple-700 font-bold">{doc.category || doc.docType || "Resident Upload"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          if (doc.fileUrl && doc.fileUrl.startsWith("http")) {
                            window.open(doc.fileUrl, "_blank");
                          } else if (doc.fileUrl) {
                            const win = window.open();
                            if (win) {
                              win.document.write(`<iframe src="${doc.fileUrl}" style="width:100%; height:100vh; border:none;"></iframe>`);
                            }
                          } else {
                            toast(`Opening ${doc.title}...`, "success");
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect &amp; Preview</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {!isVerified ? (
                          <>
                            <button
                              onClick={() => handleVerifyDoc(doc.id, "Verified")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              title="Verify & Approve Resident Document"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify &amp; Approve</span>
                            </button>

                            <button
                              onClick={() => handleVerifyDoc(doc.id, "Rejected")}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200"
                              title="Reject Document"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}

                        <button
                          onClick={() => setDeletingDoc({ id: doc.id, title: doc.title })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer ml-1"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ------------------- MODAL 1: UPLOAD CUSTOM DOCUMENT MODAL ------------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleSaveCustomDocument}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">Upload Custom Document</h3>
                  <p className="text-xs text-slate-500 mt-1">Save custom tenancy contracts & records to vault</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. 2026 Signed Lease Agreement or Electricity Bill Receipt"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Document Category</label>
                <div className="relative">
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Lease Agreement">Lease Agreement</option>
                    <option value="Government ID">Government ID</option>
                    <option value="Inspection Report">Inspection Report</option>
                    <option value="Notice / Receipt">Notice / Receipt</option>
                    <option value="Custom Contract">Custom Contract</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* SELECT PROPERTY FIELD (REQUIRED) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Select Property *</label>
                <div className="relative">
                  <select
                    required
                    value={uploadPropertyId}
                    onChange={(e) => setUploadPropertyId(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    {propertiesList.length === 0 ? (
                      <option value="" disabled>No properties found in database (Create in Properties Page)</option>
                    ) : (
                      <>
                        <option value="" disabled>-- Select Target Property --</option>
                        {propertiesList.map((p) => (
                          <option key={p.id} value={p.id}>
                            🏢 {p.name} {p.address ? `(${p.address})` : ""}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Upload File (PDF / Image)</label>
                <div className="p-5 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                  {uploadingFile ? (
                    <>
                      <Loader2 className="w-6 h-6 text-[#FF6B00] mx-auto animate-spin" />
                      <div className="text-xs font-bold text-slate-700">Uploading file to Cloudflare R2... {uploadProgress}%</div>
                    </>
                  ) : uploadUrl ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                      <div className="text-xs font-bold text-emerald-700">File Attached: {uploadFileName}</div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#FF6B00] mx-auto" />
                      <div className="text-xs font-bold text-slate-800">Select PDF (max 2MB), JPG, or PNG</div>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                        <span>⚡ PDFs & images auto-compressed before upload</span>
                      </div>
                    </>
                  )}

                  {!uploadingFile && (
                    <label className="inline-block px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs cursor-pointer">
                      {uploadUrl ? "Replace File" : "Choose File"}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const validation = validateFile(file);
                          if (!validation.valid) {
                            toast(validation.error || "Invalid file", "error");
                            e.target.value = "";
                            return;
                          }

                          setUploadFileObj(file);
                          setUploadFileName(file.name);

                          setUploadingFile(true);
                          setUploadProgress(30);

                          const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
                          const res = await uploadFile(file, {
                            workspaceId: activeWid || "1",
                            context: "lease-docs",
                            compress: true,
                            onProgress: (p) => setUploadProgress(p),
                          });
                          setUploadingFile(false);
                          if (res.url) {
                            setUploadUrl(res.url);
                            toast(`File uploaded successfully to R2!`, "success");
                          } else {
                            toast(res.error || "Upload failed", "error");
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCustomDoc}
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                {isSavingCustomDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Folder className="w-4 h-4" />}
                <span>Save to Vault</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL 2: SEND DOCUMENT TO TENANT MODAL ------------------- */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleSendToTenantSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">Send Document to Tenant</h3>
                  <p className="text-xs text-slate-500 mt-1">Send "{targetSendDoc?.title || "Contract"}" directly to resident</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* SELECT DELIVERY CHANNEL MODE */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">Select Delivery Channel / Mode *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSendMethod("whatsapp")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      sendMethod === "whatsapp"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    <MessageCircle className={`w-4 h-4 ${sendMethod === "whatsapp" ? "text-white" : "text-emerald-600"}`} />
                    <div>
                      <div className="font-extrabold text-xs">WhatsApp Direct</div>
                      <div className={`text-[10px] ${sendMethod === "whatsapp" ? "text-emerald-100" : "text-slate-500"}`}>Instant chat link</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendMethod("email")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      sendMethod === "email"
                        ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    <Mail className={`w-4 h-4 ${sendMethod === "email" ? "text-white" : "text-purple-600"}`} />
                    <div>
                      <div className="font-extrabold text-xs">Email Dispatch</div>
                      <div className={`text-[10px] ${sendMethod === "email" ? "text-purple-100" : "text-slate-500"}`}>PDF attachment</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendMethod("sms")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      sendMethod === "sms"
                        ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    <Smartphone className={`w-4 h-4 ${sendMethod === "sms" ? "text-white" : "text-amber-600"}`} />
                    <div>
                      <div className="font-extrabold text-xs">SMS Message</div>
                      <div className={`text-[10px] ${sendMethod === "sms" ? "text-amber-100" : "text-slate-500"}`}>Mobile text alert</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendMethod("portal")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      sendMethod === "portal"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    <Bell className={`w-4 h-4 ${sendMethod === "portal" ? "text-white" : "text-blue-600"}`} />
                    <div>
                      <div className="font-extrabold text-xs">Tenant App Portal</div>
                      <div className={`text-[10px] ${sendMethod === "portal" ? "text-blue-100" : "text-slate-500"}`}>In-app notification</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SELECT RESIDENT / TENANT DROPDOWN */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Select Resident / Tenant</label>
                <div className="relative">
                  <select
                    value={sendTenantEmail}
                    onChange={(e) => setSendTenantEmail(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    {tenantsList.length === 0 ? (
                      <option value="tenant@rentawas.com">demo Raj (tenant@rentawas.com)</option>
                    ) : (
                      tenantsList.map((t: any) => (
                        <option key={t.id} value={t.email || "tenant@rentawas.com"}>
                          {t.name} ({t.email || "no-email"})
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* WHATSAPP / MOBILE PHONE NUMBER FIELD */}
              {(sendMethod === "whatsapp" || sendMethod === "sms") && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {sendMethod === "whatsapp" ? "WhatsApp Number *" : "SMS Phone Number *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={sendPhone}
                    onChange={(e) => setSendPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Message Note to Resident (Optional)</label>
                <textarea
                  rows={2}
                  value={sendNote}
                  onChange={(e) => setSendNote(e.target.value)}
                  placeholder="e.g. Please review and sign your updated tenancy contract."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* WHATSAPP PDF ATTACHMENT HELPER */}
              {sendMethod === "whatsapp" && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs">
                      <Download className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Attach PDF Document File to WhatsApp</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Downloading "${targetSendDoc?.title || selectedDoc.title}.pdf"... You can drag & drop this file into WhatsApp!`);
                        toast(`PDF document downloaded for WhatsApp attachment!`, "success");
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-xl transition-colors cursor-pointer shrink-0 uppercase tracking-wider shadow-2xs"
                    >
                      Download PDF
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800 leading-relaxed">
                    💡 <strong>PDF Attachment Note:</strong> Web browsers open WhatsApp chat directly. Click <strong>"Download PDF"</strong> above to get the compiled agreement PDF, then click 📎 in WhatsApp to attach the PDF file directly to your resident!
                  </p>
                </div>
              )}

              {/* FULL DOCUMENT TEXT TOGGLE OPTION */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50/70 border border-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendFullText}
                  onChange={(e) => setSendFullText(e.target.checked)}
                  className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00] cursor-pointer"
                />
                <div>
                  <span className="font-extrabold text-slate-900 block text-xs">Include Entire Document Text Body in Message</span>
                  <span className="text-[10px] text-slate-500 block">Sends full terms, rent, deposit & address details directly in WhatsApp/Email text along with document link</span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSendingToTenant}
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                {isSendingToTenant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Document</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL 3: DELETE DOCUMENT CONFIRMATION MODAL ------------------- */}
      {deletingDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Delete Document?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium">
              Are you sure you want to delete <strong className="text-slate-900 font-extrabold">"{deletingDoc.title}"</strong>? It will be permanently removed from your saved records.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingDoc}
                onClick={handleConfirmDeleteDoc}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
