"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Mail,
  Trash2,
  Zap,
  X,
  Loader2,
  ChevronDown,
  Eye,
  UserCheck,
  ShieldCheck,
  Clock,
  Paperclip,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";
import { useTenantMe } from "@/hooks/useTenantMe";

interface SupportTicketRecord {
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
  isTenant?: boolean;
  workspaceId?: number;
  createdAt: string;
}

export default function TenantSupportPage() {
  const { toast } = useToast();
  const [selectedTicketForView, setSelectedTicketForView] = useState<SupportTicketRecord | null>(null);
  const { data: tenantMe, isLoading: meLoading } = useTenantMe();
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [tenantName, setTenantName] = useState("Resident");
  const [tenantEmail, setTenantEmail] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Tenant Portal");
  const [priority, setPriority] = useState("Medium");
  const [desc, setDesc] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<{ id: string; ticketNumber: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTickets = async (wid: number) => {
    try {
      setLoadingTickets(true);
      const res = await fetch(
        `/api/support/tickets?wid=${encodeURIComponent(String(wid))}&isTenant=true`
      );
      if (res.ok) {
        const json = await res.json();
        setTickets(Array.isArray(json.data) ? json.data : []);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.warn("Could not fetch tenant support tickets:", err);
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (meLoading) return;

    if (!tenantMe) {
      setLoadingTickets(false);
      return;
    }

    const d = tenantMe;
    setTenantName(d.name || "Resident");
    setTenantEmail(d.email || "");
    setContactEmail(d.email || "");
    if (d.phone) {
      const matched = ALL_COUNTRIES.find((c) => String(d.phone).startsWith(c.dialCode));
      if (matched) {
        setSelectedCountry(matched);
        setContactPhone(String(d.phone).replace(matched.dialCode, "").trim());
      } else {
        setContactPhone(String(d.phone));
      }
    }

    const wid = d.workspaceId != null ? Number(d.workspaceId) : NaN;
    if (!isNaN(wid) && wid > 0) {
      setWorkspaceId(wid);
      fetchTickets(wid);
    } else {
      setTickets([]);
      setLoadingTickets(false);
    }
  }, [tenantMe, meLoading]);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !desc.trim()) return;
    if (!workspaceId) {
      toast("Workspace not found for your lease. Please contact your landlord.", "error");
      return;
    }

    setIsSubmitting(true);
    const fullPhone = contactPhone.trim()
      ? `${selectedCountry.dialCode} ${contactPhone.trim()}`
      : null;

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          priority,
          message: desc.trim(),
          contactEmail: contactEmail.trim() || tenantEmail || null,
          contactPhone: fullPhone,
          attachments: [],
          wid: workspaceId,
          isTenant: true,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast(`Support Ticket #${json.data.ticketNumber} created successfully!`, "success");
        setSubject("");
        setDesc("");
        setShowModal(false);
        fetchTickets(workspaceId);
      } else {
        toast(json.error || "Failed to create support ticket", "error");
      }
    } catch {
      toast("Error submitting support ticket", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete || !workspaceId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/support/tickets?id=${ticketToDelete.id}&wid=${workspaceId}&isTenant=true`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast(`Ticket #${ticketToDelete.ticketNumber} deleted successfully!`, "success");
        setTicketToDelete(null);
        fetchTickets(workspaceId);
      } else {
        toast("Could not delete ticket", "error");
      }
    } catch {
      toast("Could not delete ticket", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              RentAwas Help & Support
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
              <span>Resident Desk</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Raise support tickets for the RentAwas resident portal. These stay separate from landlord tickets.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all uppercase tracking-wider cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Support Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                WhatsApp Support
              </span>
              <span className="font-extrabold text-slate-900 text-sm block">+91 96257 27372</span>
            </div>
          </div>
          <a
            href={`https://wa.me/919625727372?text=${encodeURIComponent(`Hi, I am ${tenantName} (tenant). I need support regarding RentAwas.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer shrink-0"
          >
            Chat
          </a>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Email Support
            </span>
            <span className="font-extrabold text-slate-900 text-sm block">support.rentawas@anshapps.com</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-600" />
            <span>My Resident Support Tickets</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">{tickets.length} Tickets</span>
        </div>

        {loadingTickets ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3.5 w-20 bg-slate-200 rounded" />
                    <div className="h-5 w-24 bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="h-4 w-48 bg-slate-200 rounded-md" />
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No support tickets yet.</p>
            <p className="text-xs text-slate-400">Create a ticket if you need help with the resident portal.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-slate-900">{t.ticketNumber}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                      {t.category}
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

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        t.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-purple-50 text-purple-800 border border-purple-200"
                      }`}
                    >
                      {t.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTicketToDelete({ id: t.id, ticketNumber: t.ticketNumber })}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.subject}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.message}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                  Created:{" "}
                  {new Date(t.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleTicketSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Create Resident Support Ticket</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your ticket goes to the RentAwas resident support desk and stays separate from landlord tickets.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">Subject</label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Unable to view rent receipt"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="Tenant Portal">Tenant Portal</option>
                      <option value="Rent Payments">Rent Payments</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Documents">Documents</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1.5">Priority</label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Describe your issue..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">Contact Phone</label>
                <CountryPhoneInput
                  value={contactPhone}
                  onChange={setContactPhone}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {ticketToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="text-base font-extrabold text-slate-900">Delete ticket?</h4>
            <p className="text-xs text-slate-500">
              This will permanently remove ticket #{ticketToDelete.ticketNumber}.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteTicket}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
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
