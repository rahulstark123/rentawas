"use client";

import { useState } from "react";
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
  UserCheck
} from "lucide-react";

export interface SupportTicket {
  id: string;
  subject: string;
  category: "Autopilot Rent & Disbursals" | "AI Lease & Legal Architect" | "Tenant Reminders" | "App Bug / UI Issue" | "Account & Billing";
  priority: "Low" | "Medium" | "High";
  status: "In Progress" | "Resolved" | "Waiting on Landlord";
  property: string;
  created: string;
  assignedTo: string;
  lastReply: string;
}

import { useToast } from "@/components/ui/Toast";

export default function LandlordSupportPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "SUP-801",
      subject: "Autopilot Disbursal batch routing query for Unit 304",
      category: "Autopilot Rent & Disbursals",
      priority: "High",
      status: "In Progress",
      property: "The Regent — Unit 304",
      created: "Today, 09:15 AM",
      assignedTo: "Devon Vance (Payments Lead)",
      lastReply: "Engineering investigating bank transfer clearing sequence.",
    },
    {
      id: "SUP-794",
      subject: "Custom E-Stamp logo alignment on Leave & License AI Contract",
      category: "AI Lease & Legal Architect",
      priority: "Low",
      status: "Resolved",
      property: "All Properties",
      created: "Yesterday, 02:40 PM",
      assignedTo: "Sarah Jenkins (Legal Tech)",
      lastReply: "Resolved. Updated PDF layout template uploaded.",
    },
    {
      id: "SUP-752",
      subject: "Adding 3rd Property Manager role permissions in Workspace Settings",
      category: "Account & Billing",
      priority: "Medium",
      status: "Resolved",
      property: "Downtown Horizon Suites",
      created: "July 18, 2026",
      assignedTo: "Support Desk",
      lastReply: "Role limits updated on Pro Plan quota.",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicket["category"]>("Autopilot Rent & Disbursals");
  const [priority, setPriority] = useState<SupportTicket["priority"]>("Medium");
  const [property, setProperty] = useState("The Regent - Wing A");
  const [desc, setDesc] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;

    const newId = `SUP-${Math.floor(800 + Math.random() * 100)}`;
    const newTicket: SupportTicket = {
      id: newId,
      subject,
      category,
      priority,
      status: "In Progress",
      property,
      created: "Just now",
      assignedTo: "Devon Vance (Support Engineer)",
      lastReply: "Ticket received. Priority SLA assigned (< 45 min).",
    };

    setTickets([newTicket, ...tickets]);
    toast(`Support ticket ${newId} submitted! Assigned to engineering team.`, "success");
    setSubject("");
    setDesc("");
    setShowModal(false);
  };

  const faqs = [
    {
      q: "How fast are Autopilot Rent funds disbursed into my bank account?",
      a: "For Pro Plan landlords, rent payments collected via ACH Auto-Debit or UPI are routed directly to your connected bank account within 2 to 4 hours.",
    },
    {
      q: "Are AI Legal Agreements generated on RentAwas legally binding in India and US?",
      a: "Yes. All 10 legal templates (including Leave & License Agreements under Maharashtra Rent Control Act and US Residential Leases) comply with state housing acts and include ISO 27001 cryptographic hashes for e-signatures.",
    },
    {
      q: "What happens if a tenant misses their rent due date?",
      a: "RentAwas automatically sends scheduled WhatsApp & SMS reminders 5 days before, on the due date, and 3 days after. On the 6th day past due, an automated 5% late fee is applied to the tenant invoice.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Landlord Help & Support Hub
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Priority Support Active (&lt; 45m SLA)</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate support tickets, report application issues, and get priority technical assistance 24/7.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Support Ticket</span>
        </button>
      </div>

      {/* Priority Support Channels Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-50 text-[#FF6B00] shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">24/7 Priority Toll-Free Line</span>
            <span className="font-extrabold text-slate-900 text-sm block">+1 (800) 555-AWAS</span>
            <span className="text-[11px] text-emerald-600 font-bold">Direct Landlord Line Active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Priority Desk</span>
            <span className="font-extrabold text-slate-900 text-sm block">+1 (555) 019-2834</span>
            <span className="text-[11px] text-purple-600 font-bold">Instant Agent Chat</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dedicated Email Desk</span>
            <span className="font-extrabold text-slate-900 text-sm block">landlord-support@rentawas.com</span>
            <span className="text-[11px] text-blue-600 font-bold">Response SLA &lt; 45 mins</span>
          </div>
        </div>
      </div>

      {/* Active Support Tickets List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FF6B00]" />
            <span>My Support Tickets & Resolution Tracker</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">{tickets.length} Active Tickets</span>
        </div>

        <div className="space-y-4">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3 hover:bg-slate-100/60 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                    {t.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    t.priority === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {t.priority} Priority
                  </span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  t.status === "Resolved"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-purple-50 text-purple-800 border border-purple-200"
                }`}>
                  {t.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{t.subject}</h4>
                <p className="text-xs text-slate-600 mt-1">{t.lastReply}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span>Created: {t.created} • Property: <strong className="text-slate-800">{t.property}</strong></span>
                <span>Assigned Agent: <strong className="text-purple-700">{t.assignedTo}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Knowledge Base Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Frequently Asked Landlord Questions</h3>

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
              <h3 className="text-xl font-bold text-slate-900">Generate Support Ticket</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">Describe the issue you are experiencing with the app.</p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Issue Subject / Title</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Bank disbursal delay on Unit 304"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="Autopilot Rent & Disbursals">Autopilot Rent & Disbursals</option>
                    <option value="AI Lease & Legal Architect">AI Lease & Legal Architect</option>
                    <option value="Tenant Reminders">Tenant WhatsApp Reminders</option>
                    <option value="App Bug / UI Issue">App Bug / UI Issue</option>
                    <option value="Account & Billing">Account & Billing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Priority SLA</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="Low">Low (General Query)</option>
                    <option value="Medium">Medium (Feature/Account)</option>
                    <option value="High">High (&lt; 45m Emergency SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Affected Property Portfolio</label>
                <select
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                >
                  <option value="The Regent - Wing A">The Regent - Wing A (24 Units)</option>
                  <option value="Downtown Horizon Suites">Downtown Horizon Suites (18 Units)</option>
                  <option value="Oakwood Executive Residency">Oakwood Executive Residency (12 Units)</option>
                  <option value="All Properties">All Properties</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Detailed Description & Reproduction Steps</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Explain what happened or error messages seen..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Screenshot / Log Attachment (Optional)</label>
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#FF6B00]" />
                    <span>Attach error screenshot or log file</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#FF6B00]">Upload</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF6B00] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer"
              >
                Submit Support Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
