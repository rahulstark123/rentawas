"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  HelpCircle, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  Search, 
  Upload, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck, 
  Zap, 
  Send,
  X,
  FileText,
  UserCheck,
  Trash2,
  RefreshCw,
  Check,
  Paperclip,
  Image as ImageIcon,
  Eye
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";
import { ensureActiveWorkspaceId, getActiveWorkspaceId } from "@/lib/workspace";
import { invalidateSupportTickets } from "@/lib/queryInvalidation";

export interface SupportTicketRecord {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  message: string;
  contactEmail?: string;
  contactPhone?: string;
  adminReply?: string;
  adminRepliedAt?: string;
  attachments?: string[];
  workspaceId?: number;
  createdAt: string;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  url: string;
  type: string;
}

export default function LandlordSupportPage() {
  const { toast } = useToast();

  const [selectedTicketForView, setSelectedTicketForView] = useState<SupportTicketRecord | null>(null);

  // ─── Workspace ID ──────────────────────────────────────────────────────────
  const [supportWorkspaceId, setSupportWorkspaceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (wid) setSupportWorkspaceId(wid);
    })();
  }, []);

  // ─── TanStack Query ────────────────────────────────────────────────────────
  const { data: tickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ["tickets", supportWorkspaceId],
    enabled: !!supportWorkspaceId,
    queryFn: async () => {
      const res = await fetch(`/api/support/tickets?wid=${supportWorkspaceId}&isTenant=false`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data && Array.isArray(json.data)) ? json.data as SupportTicketRecord[] : [];
    },
  });

  const fetchTickets = () => invalidateSupportTickets(queryClient);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Rent Payments & Collection");
  const [priority, setPriority] = useState("Medium");
  const [desc, setDesc] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [contactPhone, setContactPhone] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userName, setUserName] = useState("Landlord");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Pagination State (Max 5 tickets per page)
  const [currentPage, setCurrentPage] = useState(1);
  const TICKETS_PER_PAGE = 5;

  const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE) || 1;
  const paginatedTickets = tickets.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("rentawas_user") || localStorage.getItem("supabase_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.fullName || parsed?.name) {
          setUserName(parsed.fullName || parsed.name);
        }
      }
    } catch (e) {}
  }, []);


  // Attachment File Upload & WebP Image Compression
  const compressImageFile = (file: File, maxWidth = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/webp", quality);
            resolve(compressedDataUrl);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
    });
  };

  const uploadAttachmentToStorage = async (file: File): Promise<string> => {
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId() || "support";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", String(activeWid));
      formData.append("context", "misc");

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        return json.url;
      }
      if (file.type.startsWith("image/")) {
        return await compressImageFile(file, 1200, 0.8);
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } catch (err) {
      if (file.type.startsWith("image/")) {
        return await compressImageFile(file, 1200, 0.8);
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_FILES = 3;
    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

    if (attachments.length >= MAX_FILES) {
      toast(`Maximum ${MAX_FILES} attachments allowed per ticket!`, "error");
      return;
    }

    const fileList = Array.from(files);
    const remainingSlots = MAX_FILES - attachments.length;
    const selectedFiles = fileList.slice(0, remainingSlots);

    if (fileList.length > remainingSlots) {
      toast(`Only ${remainingSlots} more attachment(s) could be added (max ${MAX_FILES} total).`, "info");
    }

    setIsUploadingAttachment(true);
    const newAttachments: AttachmentItem[] = [];

    for (const file of selectedFiles) {
      // 2MB Validation Check
      if (file.size > MAX_SIZE_BYTES) {
        toast(`File "${file.name}" exceeds maximum 2MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)!`, "error");
        continue;
      }

      toast(`Compressing & uploading "${file.name}"...`, "info");
      const uploadedUrl = await uploadAttachmentToStorage(file);
      
      newAttachments.push({
        id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: uploadedUrl,
        type: file.type,
      });
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
      toast(`Successfully attached ${newAttachments.length} file(s)!`, "success");
    }
    setIsUploadingAttachment(false);
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
    toast("Attachment removed", "info");
  };

  // 2. Create Ticket (POST)
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !desc.trim()) return;

    setIsSubmitting(true);
    const fullPhone = contactPhone.trim() ? `${selectedCountry.dialCode} ${contactPhone.trim()}` : null;

    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!activeWid) {
        toast("Workspace not found. Please sign in again.", "error");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          priority,
          message: desc.trim(),
          contactEmail: contactEmail.trim() || null,
          contactPhone: fullPhone,
          attachments: attachments.map((a) => a.url),
          wid: Number(activeWid),
          isTenant: false,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast(`Support Ticket #${json.data.ticketNumber} created successfully!`, "success");
        setSubject("");
        setDesc("");
        setContactEmail("");
        setContactPhone("");
        setAttachments([]);
        setShowModal(false);
        fetchTickets();
      } else {
        toast(json.error || "Failed to create support ticket", "error");
      }
    } catch (err) {
      toast("Error submitting support ticket", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Update Ticket Status (PATCH)
  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Resolved" ? "Open" : "Resolved";
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const res = await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, wid: activeWid ? Number(activeWid) : undefined, isTenant: false }),
      });
      if (res.ok) {
        toast(`Ticket status updated to "${newStatus}"!`, "success");
        fetchTickets();
      }
    } catch (err) {
      toast("Could not update ticket status", "error");
    }
  };

  const [ticketToDelete, setTicketToDelete] = useState<{ id: string; ticketNumber: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 4. Delete Ticket (DELETE)
  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      const widQuery = activeWid ? `&wid=${activeWid}&isTenant=false` : "&isTenant=false";
      const res = await fetch(`/api/support/tickets?id=${ticketToDelete.id}${widQuery}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast(`Ticket #${ticketToDelete.ticketNumber} deleted successfully!`, "success");
        setTicketToDelete(null);
        fetchTickets();
      } else {
        toast("Could not delete ticket", "error");
      }
    } catch (err) {
      toast("Could not delete ticket", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const faqs = [
    {
      q: "How are rent payments processed and tracked in RentAwas?",
      a: "Landlords can record tenant rent payments directly or issue Razorpay payment links for instant online collections and automated receipts.",
    },
    {
      q: "Are AI Legal Agreements generated on RentAwas legally binding in India and US?",
      a: "Yes. All legal templates comply with local housing acts and include ISO 27001 cryptographic hashes for legal verification.",
    },
    {
      q: "What happens if a tenant misses their rent due date?",
      a: "RentAwas automatically sends scheduled WhatsApp & SMS reminders 5 days before, on the due date, and 3 days after. On the 6th day past due, an automated late fee can be applied to the tenant invoice.",
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Landlord Help & Support Hub
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Support Desk Active</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create support tickets, report issues, and get help from the RentAwas team.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Support Ticket</span>
        </button>
      </div>

      {/* Support Channels Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Support Desk</span>
              <span className="font-extrabold text-slate-900 text-sm block">+91 96257 27372</span>
              <span className="text-[11px] text-emerald-600 font-bold">Instant Agent Chat</span>
            </div>
          </div>

          <a
            href={`https://wa.me/919625727372?text=${encodeURIComponent(`Hi, I am ${userName}. I need support regarding RentAwas.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer shrink-0"
          >
            <MessageSquare className="w-4 h-4 fill-white text-white" />
            <span>Chat</span>
          </a>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dedicated Email Desk</span>
            <span className="font-extrabold text-slate-900 text-sm block">support.rentawas@anshapps.com</span>
            <span className="text-[11px] text-blue-600 font-bold">Email Support Active</span>
          </div>
        </div>
      </div>

      {/* Active Support Tickets List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FF6B00]" />
            <span>Workspace Support Tickets & Resolution Tracker</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">{tickets.length} Tickets</span>
        </div>

        {loadingTickets ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 min-h-[120px] flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-24 bg-slate-200 rounded-md" />
                    <div className="h-4 w-32 bg-slate-200/70 rounded-md" />
                  </div>
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-slate-200 rounded-md" />
                  <div className="h-3.5 w-full bg-slate-200/60 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No support tickets created yet.</p>
            <p className="text-xs text-slate-400">Click "Create Support Ticket" above to submit a new inquiry.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedTickets.map((t) => (
              <div
                key={t.id}
                className="p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-slate-900">{t.ticketNumber}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                      {t.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      t.priority === "High" || t.priority === "Urgent" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {t.priority} Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicketForView(t)}
                      className="p-1.5 text-xs text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer border border-slate-200 flex items-center gap-1 font-bold shadow-2xs"
                      title="View Ticket Details & Replies"
                    >
                      <Eye className="w-4 h-4 text-slate-600 group-hover:text-[#FF6B00]" />
                      <span className="hidden sm:inline text-[11px]">View Details</span>
                    </button>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      t.status === "Resolved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-purple-50 text-purple-800 border border-purple-200"
                    }`}>
                      {t.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => setTicketToDelete({ id: t.id, ticketNumber: t.ticketNumber })}
                      className="p-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                      title="Delete Support Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.subject}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.message}</p>

                  {Array.isArray(t.attachments) && t.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {t.attachments.map((attUrl, idx) => (
                        <a
                          key={idx}
                          href={attUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:text-[#FF6B00] hover:border-[#FF6B00] transition-colors"
                        >
                          <Paperclip className="w-3 h-3 text-[#FF6B00]" />
                          <span>Attachment #{idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                  <span>Created: {new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <div className="flex items-center gap-3">
                    {t.contactPhone && <span>Phone: <strong className="text-slate-800">{t.contactPhone}</strong></span>}
                    {t.contactEmail && <span>Email: <strong className="text-slate-800">{t.contactEmail}</strong></span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  Showing <strong className="text-slate-900">{(currentPage - 1) * TICKETS_PER_PAGE + 1}</strong> to{" "}
                  <strong className="text-slate-900">{Math.min(currentPage * TICKETS_PER_PAGE, tickets.length)}</strong> of{" "}
                  <strong className="text-slate-900">{tickets.length}</strong> tickets
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? "bg-[#FF6B00] text-white shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAQ Knowledge Base Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180" : ""}`} />
              </button>
              {activeFaq === idx && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleTicketSubmit} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">Create Support Ticket</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">Describe your issue and our support team will respond shortly.</p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Issue Subject / Title</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about payment auto-debit"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Rent Payments & Collection">Rent Payments & Collection</option>
                      <option value="Property & Unit Management">Property & Unit Management</option>
                      <option value="Tenant Management & Onboarding">Tenant Management & Onboarding</option>
                      <option value="AI Document Generation">AI Document Generation</option>
                      <option value="Maintenance Requests">Maintenance Requests</option>
                      <option value="Property Expenses">Property Expenses</option>
                      <option value="Account & Subscription Billing">Account & Subscription Billing</option>
                      <option value="Technical & UI Issues">Technical & UI Issues</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Priority SLA</label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Low">Low (General Query)</option>
                      <option value="Medium">Medium (Account/Feature)</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent Issue</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Contact Email Row */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="support.rentawas@anshapps.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Contact Phone Row (Separate New Row) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                <CountryPhoneInput
                  value={contactPhone}
                  onChange={setContactPhone}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                />
              </div>

              {/* Detailed Message Row */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Explain what happened or what assistance you need..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Attachment Upload Section (Max 3 files, Max 2MB each, WebP compression) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase">
                    Attachments <span className="text-slate-400 font-normal text-[10px] lowercase">(max 3 files, max 2MB each)</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    {attachments.length} / 3 Attached
                  </span>
                </div>

                {/* Upload Button */}
                {attachments.length < 3 && (
                  <label className={`w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-[#FF6B00] bg-slate-50 hover:bg-orange-50/50 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:text-[#FF6B00] transition-all cursor-pointer ${
                    isUploadingAttachment ? "opacity-50 pointer-events-none" : ""
                  }`}>
                    <Paperclip className="w-4 h-4" />
                    <span>{isUploadingAttachment ? "Compressing & Uploading..." : "+ Attach Document or Image"}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleAttachmentUpload}
                      disabled={isUploadingAttachment || attachments.length >= 3}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Attached File List Pills */}
                {attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {att.type.startsWith("image/") ? (
                            <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">({att.size})</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Remove attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF6B00] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Support Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Dialogue Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-center">
            
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200 shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">Delete Support Ticket?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete <strong>Ticket #{ticketToDelete.ticketNumber}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteTicket}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Deleting..." : "Yes, Delete"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SLIDE-OVER SIDEBAR / DRAWER FOR TICKET DETAILS & REPLIES */}
      {selectedTicketForView && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSelectedTicketForView(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col divide-y divide-slate-200 animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-6 bg-[#0B132B] text-white flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#FF6B00]">
                      #{selectedTicketForView.ticketNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 uppercase">
                      {selectedTicketForView.category}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white leading-tight">
                    {selectedTicketForView.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTicketForView(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Query Status Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Ticket Status</span>
                    <span className="text-sm font-extrabold text-slate-900">{selectedTicketForView.status}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                      selectedTicketForView.status === "Resolved"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : selectedTicketForView.status === "In Progress"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {selectedTicketForView.status}
                  </span>
                </div>

                {/* User Original Message Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#FF6B00]" />
                      <span>Submitted Request (You)</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(selectedTicketForView.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/80 space-y-3">
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {selectedTicketForView.message}
                    </p>

                    {Array.isArray(selectedTicketForView.attachments) &&
                      selectedTicketForView.attachments.length > 0 && (
                        <div className="pt-2 border-t border-orange-200/60">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Attachments ({selectedTicketForView.attachments.length})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {selectedTicketForView.attachments.map((attUrl, idx) => (
                              <a
                                key={idx}
                                href={attUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-slate-700 text-[11px] font-bold hover:text-[#FF6B00] transition-colors inline-flex items-center gap-1.5"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>Attachment #{idx + 1}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Support Team Reply Section */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Support Team Response</span>
                    </span>
                    {selectedTicketForView.adminRepliedAt && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(selectedTicketForView.adminRepliedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {selectedTicketForView.adminReply ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[10px]">
                          ANSH Support Desk
                        </span>
                      </div>
                      <p className="text-xs text-slate-900 leading-relaxed font-medium">
                        {selectedTicketForView.adminReply}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                      <Clock className="w-6 h-6 text-amber-500 mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-slate-700">Under Review by Support Team</p>
                      <p className="text-[11px] text-slate-500">
                        Our team is actively processing your ticket. You will see official responses here as soon as an agent replies.
                      </p>
                    </div>
                  )}
                </div>

                {/* Registered Contact Information */}
                <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 space-y-2 text-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Associated Contact Info</span>
                  <div className="flex flex-col gap-1 font-mono text-[11px]">
                    {selectedTicketForView.contactEmail && (
                      <span className="text-slate-700">Email: {selectedTicketForView.contactEmail}</span>
                    )}
                    {selectedTicketForView.contactPhone && (
                      <span className="text-slate-700">Phone: {selectedTicketForView.contactPhone}</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedTicketForView(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
