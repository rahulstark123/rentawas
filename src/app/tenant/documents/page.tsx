"use client";

import { useState } from "react";
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
  Printer
} from "lucide-react";

export interface TenantDoc {
  id: string;
  title: string;
  category: "Lease & Addendums" | "Receipts & Tax" | "ID & Verification" | "Vehicle & Passes";
  icon: any;
  date: string;
  size: string;
  status: "Verified" | "Active" | "Issued";
  description: string;
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
  {
    id: "DOC-104",
    title: "Pet Liability Rider & Vaccine Certificate",
    category: "Lease & Addendums",
    icon: PawPrint,
    date: "July 22, 2025",
    size: "650 KB",
    status: "Verified",
    description: "Approved domestic pet addendum rider with current rabies vaccination records.",
  },
  {
    id: "DOC-105",
    title: "Resident Vehicle & Parking Pass Permit (#P-302)",
    category: "Vehicle & Passes",
    icon: Car,
    date: "August 01, 2025",
    size: "310 KB",
    status: "Active",
    description: "Covered basement garage parking stall #302 authorization permit.",
  },
  {
    id: "DOC-106",
    title: "Move-In Physical Condition Inspection Report",
    category: "Lease & Addendums",
    icon: FileCheck2,
    date: "August 01, 2025",
    size: "2.1 MB",
    status: "Verified",
    description: "Room-by-room inventory checklist signed during unit key handover.",
  },
  {
    id: "DOC-107",
    title: "Annual Rent Paid Tax Certificate (Form 1099/80GG)",
    category: "Receipts & Tax",
    icon: Receipt,
    date: "January 15, 2026",
    size: "510 KB",
    status: "Issued",
    description: "Official annual rent payment tax deduction statement for tax filing.",
  },
  {
    id: "DOC-108",
    title: "Housing Society / HOA Move-In Clearance NOC",
    category: "ID & Verification",
    icon: ShieldCheck,
    date: "July 28, 2025",
    size: "380 KB",
    status: "Verified",
    description: "No Objection Certificate issued by The Regent Housing Association.",
  },
];

export default function TenantDocumentsPage() {
  const [documents, setDocuments] = useState<TenantDoc[]>(INITIAL_DOCUMENTS);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<TenantDoc | null>(null);
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<TenantDoc["category"]>("ID & Verification");

  const categories = ["All", "Lease & Addendums", "Receipts & Tax", "ID & Verification", "Vehicle & Passes"];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = activeCategory === "All" || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;

    const newDoc: TenantDoc = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      title: uploadTitle,
      category: uploadCategory,
      icon: FileText,
      date: "Just now",
      size: "620 KB",
      status: "Verified",
      description: "Resident uploaded personal record file.",
    };

    setDocuments([newDoc, ...documents]);
    setUploadTitle("");
    setShowUploadModal(false);
  };

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
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identity & KYC Status</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
            <span>Verified</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Passports & Driver ID Verified</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Contract Term</span>
          <div className="text-2xl font-black text-slate-900 mt-1">2025 – 2026</div>
          <div className="text-xs text-purple-700 font-bold mt-0.5">The Regent — Unit 302</div>
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

      {/* Documents Grid */}
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

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 uppercase shrink-0">
                    {doc.status}
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
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => alert(`Downloading ${doc.title}...`)}
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

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUploadSubmit} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Upload New Resident Document</h3>
            <p className="text-xs text-slate-500">Upload personal records, vehicle registration, or identity documents.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Renter's Insurance Policy 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="ID & Verification">ID & Verification</option>
                  <option value="Lease & Addendums">Lease & Addendums</option>
                  <option value="Receipts & Tax">Receipts & Tax</option>
                  <option value="Vehicle & Passes">Vehicle & Passes</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Attach File (PDF, PNG, JPG)</label>
                <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-purple-600" />
                    <span>Choose document file...</span>
                  </span>
                  <span className="text-[10px] font-bold text-purple-700">Browse</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl shadow-xs uppercase tracking-wider cursor-pointer"
              >
                Upload File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
