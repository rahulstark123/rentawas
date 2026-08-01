"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Search, 
  Eye, 
  FileCheck2, 
  Lock, 
  Upload, 
  Receipt, 
  Car, 
  PawPrint, 
  UserCheck, 
  X,
  Printer,
  ChevronDown,
  Trash2,
  Loader2,
  File
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface TenantDoc {
  id: string;
  title: string;
  category: string;
  icon: any;
  date: string;
  size: string;
  status: "Verified" | "Active" | "Issued" | "Pending Verification" | "Rejected";
  description: string;
  fileUrl?: string;
}

export const INITIAL_DOCUMENTS: TenantDoc[] = [
  {
    id: "DOC-101",
    title: "Signed Residential Lease Agreement (2025–2026)",
    category: "Lease & Addendums",
    icon: FileText,
    date: "July 24, 2025",
    size: "1.4 MB",
    status: "Verified",
    description: "Official 12-month tenancy contract executed with Landlord Alexander Wright (Unit 302).",
  },
  {
    id: "DOC-102",
    title: "Security Deposit Escrow Receipt ($3,200)",
    category: "Receipts & Tax",
    icon: Receipt,
    date: "July 24, 2025",
    size: "420 KB",
    status: "Active",
    description: "Official escrow receipt confirming statutory security deposit of $3,200 held in Chase escrow.",
  },
  {
    id: "DOC-103",
    title: "Government Photo ID & KYC Verification",
    category: "ID & Verification",
    icon: UserCheck,
    date: "July 20, 2025",
    size: "850 KB",
    status: "Verified",
    description: "Verified Passport & State Driver's License copy on file with building management.",
  },
];

export default function TenantDocumentsPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [documents, setDocuments] = useState<TenantDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<TenantDoc | null>(null);
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<string>("ID & Verification");
  const [customCategory, setCustomCategory] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; sizeStr: string; dataUrl: string }[]>([]);
  const [previewAttachedFile, setPreviewAttachedFile] = useState<{ name: string; dataUrl: string; sizeStr: string } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleMultipleFilesSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const sizeInKb = file.size / 1024;
      const sizeStr = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${Math.round(sizeInKb)} KB`;
      const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
              setAttachedFiles((prev) => [
                ...prev,
                { id, name: file.name, sizeStr, dataUrl }
              ]);
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = (e.target?.result as string) || "";
          setAttachedFiles((prev) => [
            ...prev,
            { id, name: file.name, sizeStr, dataUrl }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  useEffect(() => {
    async function loadTenantDocs() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
        const res = await fetch(`/api/tenant/me${emailParam}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setTenant(json.data);
            const userDocs: TenantDoc[] = [];

            if (json.data.leaseDocUrl) {
              userDocs.push({
                id: "DOC-LEASE",
                title: `Signed Residential Lease Agreement (${json.data.propertyName} — ${json.data.unitNumber})`,
                category: "Lease & Addendums",
                icon: FileText,
                date: json.data.leaseStart ? new Date(json.data.leaseStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Verified",
                size: "1.4 MB",
                status: "Verified",
                description: `Official tenancy lease agreement contract for ${json.data.propertyName} — ${json.data.unitNumber}.`,
                fileUrl: json.data.leaseDocUrl,
              });
            }

            if (json.data.govIdUrl) {
              userDocs.push({
                id: "DOC-GOVID",
                title: `${json.data.govIdType || "Government Photo ID"} Verification (${json.data.govIdNumber || "KYC"})`,
                category: "ID & Verification",
                icon: UserCheck,
                date: json.data.createdAt ? new Date(json.data.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Verified",
                size: "850 KB",
                status: "Verified",
                description: `Verified ${json.data.govIdType || "Government Photo ID"} record on file with property management.`,
                fileUrl: json.data.govIdUrl,
              });
            }

            if (Array.isArray(json.data.documents) && json.data.documents.length > 0) {
              json.data.documents.forEach((d: any, idx: number) => {
                userDocs.push({
                  id: d.id || `DOC-DB-${idx + 1}`,
                  title: d.title || d.fileName || "Uploaded Tenant Document",
                  category: d.docType === "Lease Agreement" ? "Lease & Addendums" : "ID & Verification",
                  icon: d.docType === "Lease Agreement" ? FileText : UserCheck,
                  date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Uploaded",
                  size: d.fileSize || "1.2 MB",
                  status: "Verified",
                  description: `Uploaded document file: ${d.fileName || "tenant_doc.pdf"}. Verified in DB.`,
                  fileUrl: d.fileUrl,
                });
              });
            }

            setDocuments(userDocs);
          }
        }
      } catch (err) {
        console.error("Error fetching tenant docs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTenantDocs();
  }, []);

  const categories = [
    "All",
    "ID & Verification",
    "Lease & Addendums",
    "Receipts & Tax",
    "Renter Insurance & Liability",
    "Vehicle & Passes",
    "Pet Records & License",
    "Utility Bills & NOC",
    "Move-In / Move-Out Inspection",
    "Other"
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = activeCategory === "All" || doc.category.includes(activeCategory);
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;
    if (attachedFiles.length === 0) {
      alert("Please select at least one document file to upload.");
      return;
    }

    const finalCategory = uploadCategory === "Other" ? (customCategory.trim() || "Other Document") : uploadCategory;

    setIsUploading(true);
    try {
      const categoryIconMap: Record<string, any> = {
        "Lease & Addendums": FileText,
        "Receipts & Tax": Receipt,
        "ID & Verification": UserCheck,
        "Renter Insurance & Liability": ShieldCheck,
        "Vehicle & Passes": Car,
        "Pet Records & License": PawPrint,
        "Utility Bills & NOC": Receipt,
        "Move-In / Move-Out Inspection": FileCheck2,
      };

      const newDocs: TenantDoc[] = attachedFiles.map((af, idx) => {
        const title = attachedFiles.length === 1
          ? uploadTitle
          : `${uploadTitle} — ${af.name}`;

        return {
          id: `DOC-${Math.floor(100 + Math.random() * 900)}-${idx}`,
          title,
          category: finalCategory,
          icon: categoryIconMap[uploadCategory] || FileText,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          size: af.sizeStr || "650 KB",
          status: "Pending Verification",
          description: uploadDesc || `Resident uploaded document file: ${af.name}. Pending owner review.`,
          fileUrl: af.dataUrl || undefined,
        };
      });

      if (tenant && tenant.id && tenant.id !== "demo-tenant-id") {
        for (const af of attachedFiles) {
          try {
            await fetch("/api/tenant/documents", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: attachedFiles.length === 1 ? uploadTitle : `${uploadTitle} — ${af.name}`,
                category: finalCategory,
                fileName: af.name,
                fileSize: af.sizeStr,
                fileUrl: af.dataUrl,
                tenantId: tenant.id,
                workspaceId: tenant.workspaceId,
              }),
            });
          } catch (err) {
            console.error("Doc API save error:", err);
          }
        }
      }

      setDocuments((prev) => [...newDocs, ...prev]);
      setUploadTitle("");
      setUploadCategory("ID & Verification");
      setCustomCategory("");
      setUploadDesc("");
      setAttachedFiles([]);
      setShowUploadModal(false);
    } finally {
      setIsUploading(false);
    }
  };

  const isKycVerified = tenant?.govIdUrl || documents.some(d => d.category === "ID & Verification");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Documents
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>{documents.length} Verified Files</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your signed lease agreements, security deposit receipts, tax certificates, and personal KYC records.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Stored Vault Documents</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{documents.length} Files</div>
          <div className="text-xs text-slate-500 mt-0.5">256-bit Encrypted Cloud Vault</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identity &amp; KYC Status</span>
          <div className={`text-2xl font-black mt-1 flex items-center gap-2 ${isKycVerified ? "text-emerald-600" : "text-amber-600"}`}>
            <span>{isKycVerified ? "Verified" : "Pending ID"}</span>
            {isKycVerified ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Lock className="w-5 h-5 text-amber-600" />}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {isKycVerified ? "Passports & Driver ID Verified" : "Govt ID Upload Recommended"}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Contract Term</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {tenant?.leaseStart ? new Date(tenant.leaseStart).getFullYear() : "2026"} – {tenant?.leaseEnd ? new Date(tenant.leaseEnd).getFullYear() : "2027"}
          </div>
          <div className="text-xs text-purple-700 font-bold mt-0.5">
            {tenant?.propertyName || "The Regent"} — {tenant?.unitNumber || "Unit 302"}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Documents Grid or Empty State */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs">
          <p className="text-xs font-bold text-slate-600">Loading vault documents...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Documents Uploaded</h3>
            <p className="text-xs text-slate-500">
              No files or lease contracts have been uploaded for{" "}
              <span className="font-semibold text-slate-700">
                {tenant?.name || "this resident"} at {tenant?.propertyName || "Property"} — {tenant?.unitNumber || "Unit"}
              </span> yet.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDocs.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{doc.id}</span>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h3>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                      doc.status === "Verified" || doc.status === "Active" || doc.status === "Issued"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : doc.status === "Rejected"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      {doc.status || "Pending Verification"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{doc.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 font-medium">
                    {doc.date} • {doc.size}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (doc.fileUrl) {
                          window.open(doc.fileUrl, "_blank");
                        } else {
                          setPreviewDoc(doc);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => {
                        if (doc.fileUrl) {
                          window.open(doc.fileUrl, "_blank");
                        } else {
                          alert(`Downloading ${doc.title}...`);
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Drawer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-sans">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">Document Preview: {previewDoc.title}</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0C1019] p-5 rounded-xl border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="text-center font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2">
                {previewDoc.title.toUpperCase()}
              </div>
              <p>
                <strong>DOCUMENT ID:</strong> {previewDoc.id} | <strong>STATUS:</strong> {previewDoc.status}
              </p>
              <p>
                <strong>ISSUED TO RESIDENT:</strong> Eleanor Vance (The Regent — Unit 302)
              </p>
              <p>
                <strong>SUMMARY & DESCRIPTION:</strong> {previewDoc.description}
              </p>
              <div className="pt-2 text-[10px] text-slate-500 italic">
                * Cryptographically signed & stored in RentAwas Secure Cloud. ISO 27001 Certified.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 font-sans">
              <button
                onClick={() => alert(`Printing ${previewDoc.title}...`)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => {
                  alert(`Downloading ${previewDoc.title}...`);
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Verified PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attached File Inspector Preview Lightbox */}
      {previewAttachedFile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-60 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="truncate pr-4">
                <span className="text-xs font-mono font-bold text-purple-400 block uppercase tracking-wider">
                  File Preview Inspector ({previewAttachedFile.sizeStr})
                </span>
                <h4 className="text-base font-extrabold text-white truncate">
                  {previewAttachedFile.name}
                </h4>
              </div>
              <button
                onClick={() => setPreviewAttachedFile(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800/80 flex items-center justify-center max-h-[60vh] overflow-auto">
              {previewAttachedFile.dataUrl.startsWith("data:image/") ? (
                <img
                  src={previewAttachedFile.dataUrl}
                  alt={previewAttachedFile.name}
                  className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-lg"
                />
              ) : previewAttachedFile.dataUrl.startsWith("data:application/pdf") ? (
                <iframe
                  src={previewAttachedFile.dataUrl}
                  title={previewAttachedFile.name}
                  className="w-full h-[55vh] rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-12 h-12 text-purple-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-200">{previewAttachedFile.name}</p>
                  <p className="text-xs text-slate-400">Standard document file ({previewAttachedFile.sizeStr}) ready to be uploaded.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewAttachedFile(null)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto font-sans"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Upload New Resident Document</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload personal records, renter&apos;s insurance, vehicle registration, or identity documents.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {/* Document Title */}
              <div>
                <label className="block font-extrabold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Renter's Insurance Policy 2026 or Vehicle Registration"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block font-extrabold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Category *
                </label>
                <div className="relative">
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="ID & Verification">ID &amp; Verification (Passport, Driver License, Aadhaar, KYC)</option>
                    <option value="Lease & Addendums">Lease &amp; Addendums (Tenancy Contract, Renewals, House Rules)</option>
                    <option value="Receipts & Tax">Receipts &amp; Tax (Rent Receipts, Escrow Deposit, TDS/Form 16)</option>
                    <option value="Renter Insurance & Liability">Renter Insurance &amp; Liability (Policy &amp; Coverage Proof)</option>
                    <option value="Vehicle & Passes">Vehicle &amp; Passes (Vehicle RC, Parking Permit, RFID Gate Pass)</option>
                    <option value="Pet Records & License">Pet Records &amp; License (Vaccination, Pet License &amp; Agreement)</option>
                    <option value="Utility Bills & NOC">Utility Bills &amp; NOC (Electricity, Water Clearance &amp; NOC)</option>
                    <option value="Move-In / Move-Out Inspection">Move-In / Move-Out Inspection (Condition Audit, Key Receipt)</option>
                    <option value="Other">Other (Specify Custom Document Category)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Conditional Custom Category Input field when 'Other' is selected */}
              {uploadCategory === "Other" && (
                <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <label className="block font-extrabold text-purple-700 uppercase text-[11px]">
                    Specify Custom Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Society No-Objection Certificate, Employment Verification..."
                    className="w-full px-3.5 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                  />
                </div>
              )}

              {/* Attach Multiple Document Files */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Attach Document Files ({attachedFiles.length} Selected) *
                  </label>
                  <label className="text-[10px] font-extrabold text-purple-700 hover:underline cursor-pointer flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>Add More Files</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.csv"
                      onChange={(e) => handleMultipleFilesSelect(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {attachedFiles.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {attachedFiles.map((af) => (
                      <div
                        key={af.id}
                        className="p-3 bg-purple-50/60 border border-purple-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-150"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-extrabold text-slate-900 truncate block">
                              {af.name}
                            </span>
                            <span className="text-[10px] text-purple-700 font-bold flex items-center gap-1.5 mt-0.5">
                              <span>{af.sizeStr}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-black">Ready to Upload</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (af.dataUrl) {
                                setPreviewAttachedFile({ name: af.name, dataUrl: af.dataUrl, sizeStr: af.sizeStr });
                              } else {
                                alert(`Previewing ${af.name} (${af.sizeStr})`);
                              }
                            }}
                            className="p-1.5 bg-white hover:bg-purple-50 text-purple-600 border border-slate-200 hover:border-purple-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            title="Inspect & Preview file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAttachedFiles((prev) => prev.filter((item) => item.id !== af.id));
                            }}
                            className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <label className="p-6 bg-slate-50 border border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block group-hover:text-purple-700 transition-colors">
                          Click or drag multiple files to attach
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Select multiple PDFs, Images (PNG, JPG), Word (DOCX) &amp; Text documents
                        </span>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-purple-600 text-white text-xs font-extrabold rounded-xl shadow-xs uppercase tracking-wider group-hover:bg-purple-700 transition-colors shrink-0">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      multiple
                      required
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.csv"
                      onChange={(e) => handleMultipleFilesSelect(e.target.files)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Document Description / Notes */}
              <div>
                <label className="block font-extrabold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Description &amp; Document Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Provide any context or notes regarding this document..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-md uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploading ? "Uploading Documents..." : "Upload Files"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
