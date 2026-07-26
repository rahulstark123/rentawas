"use client";

import { useState, useEffect } from "react";
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
  ShieldCheck, 
  Zap, 
  Send,
  X,
  FileText,
  UserCheck,
  Trash2,
  RefreshCw,
  Check
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";

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
  workspaceId?: number;
  createdAt: string;
}

export default function LandlordSupportPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // 1. Fetch tickets from PostgreSQL API wid-wise
  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await fetch("/api/support/tickets?wid=1");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setTickets(json.data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch support tickets from DB:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // 2. Create Ticket (POST)
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !desc.trim()) return;

    setIsSubmitting(true);
    const fullPhone = contactPhone.trim() ? `${selectedCountry.dialCode} ${contactPhone.trim()}` : null;

    try {
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
          wid: 1,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast(`Support Ticket #${json.data.ticketNumber} created successfully!`, "success");
        setSubject("");
        setDesc("");
        setContactEmail("");
        setContactPhone("");
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
      const res = await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast(`Ticket status updated to "${newStatus}"!`, "success");
        fetchTickets();
      }
    } catch (err) {
      toast("Could not update ticket status", "error");
    }
  };

  // 4. Delete Ticket (DELETE)
  const handleDeleteTicket = async (id: string, tktNum: string) => {
    if (!confirm(`Are you sure you want to delete ticket #${tktNum}?`)) return;
    try {
      const res = await fetch(`/api/support/tickets?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast(`Ticket #${tktNum} deleted from database`, "success");
        fetchTickets();
      }
    } catch (err) {
      toast("Could not delete ticket", "error");
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
            Generate support tickets, report application issues, and get technical assistance live from PostgreSQL.
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
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Support Desk</span>
            <span className="font-extrabold text-slate-900 text-sm block">+91 96257 27372</span>
            <span className="text-[11px] text-purple-600 font-bold">Instant Agent Chat</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dedicated Email Desk</span>
            <span className="font-extrabold text-slate-900 text-sm block">support@anshapps.com</span>
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
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            Loading tickets from PostgreSQL database...
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No support tickets created yet.</p>
            <p className="text-xs text-slate-400">Click "Create Support Ticket" above to submit a new inquiry.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      t.status === "Resolved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-purple-50 text-purple-800 border border-purple-200"
                    }`}>
                      {t.status}
                    </span>

                    <button
                      onClick={() => handleStatusUpdate(t.id, t.status)}
                      className="p-1.5 text-xs text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                      title={t.status === "Resolved" ? "Re-open ticket" : "Mark as Resolved"}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTicket(t.id, t.ticketNumber)}
                      className="p-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.subject}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.message}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                  <span>Created: {new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  {t.contactEmail && <span>Contact: <strong className="text-slate-800">{t.contactEmail}</strong></span>}
                </div>
              </div>
            ))}
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

            <p className="text-xs text-slate-500">Submit a support request directly to your workspace log in PostgreSQL.</p>

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
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
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Priority SLA</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="Low">Low (General Query)</option>
                    <option value="Medium">Medium (Account/Feature)</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Issue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="support@anshapps.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                  <CountryPhoneInput
                    value={contactPhone}
                    onChange={setContactPhone}
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Explain what happened or what assistance you need..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
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
    </div>
  );
}
