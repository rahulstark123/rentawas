"use client";

import { useState } from "react";
import { 
  Building2, 
  Wrench, 
  DollarSign, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Send 
} from "lucide-react";
import ComingSoonModal from "@/components/ui/ComingSoonModal";

export default function OperationsAndAICommand() {
  const [promptInput, setPromptInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("AI Command Center Executing...");

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setModalTitle(`AI Command Executed: "${promptInput}"`);
    setIsModalOpen(true);
    setPromptInput("");
  };

  const presetPrompts = [
    "Audit overdue lease agreements in Wing B",
    "Send automated WhatsApp payment reminders to all pending tenants",
    "Generate monthly income statement export for Q3",
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-20">
        
        {/* Section 1: Operations Hub Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Card A: Maintenance Hub Stack (6 cols) */}
          <div className="lg:col-span-6 bg-[#F8FAFC] rounded-xl md:rounded-2xl p-7 sm:p-9 border border-slate-200/80 card-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 text-[#FF6B00] flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider font-sans">
                  Operational Control
                </span>
              </div>

              {/* Cormorant Garamond Heading */}
              <h3 
                className="text-2xl sm:text-3xl font-bold text-[#0B132B] mb-3"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Automated Maintenance Hub
              </h3>
              {/* Inter Body Description */}
              <p className="text-slate-600 font-normal text-sm sm:text-base leading-relaxed mb-8 font-sans">
                Triage tenant repair tickets instantly. AI categorizes urgency and dispatches local vendors based on contract SLA.
              </p>
            </div>

            {/* Ticket Stack Visual */}
            <div className="space-y-3 font-sans">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Water Line Pipe Leak</p>
                    <p className="text-xs text-slate-500 font-normal">Apt 4B • Reported 12m ago</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wider">
                  Urgent
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between opacity-95">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">HVAC Filter Replacement</p>
                    <p className="text-xs text-slate-500 font-normal">Unit 12 • Vendor Dispatched</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                  Assigned
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Capital Flow Ledger (6 cols) */}
          <div className="lg:col-span-6 bg-[#F8FAFC] rounded-xl md:rounded-2xl p-7 sm:p-9 border border-slate-200/80 card-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider font-sans">
                  Financial Ledger
                </span>
              </div>

              {/* Cormorant Garamond Heading */}
              <h3 
                className="text-2xl sm:text-3xl font-bold text-[#0B132B] mb-3"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Capital Flow Engine
              </h3>
              {/* Inter Body Description */}
              <p className="text-slate-600 font-normal text-sm sm:text-base leading-relaxed mb-8 font-sans">
                Reconcile monthly rent deposits automatically against bank feeds with zero manual spreadsheet bookkeeping.
              </p>
            </div>

            {/* Transaction Ledger Table Snippet */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 shadow-2xs font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Tenant & Unit</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              <div className="flex items-center justify-between text-sm py-1.5 font-medium text-slate-800">
                <span className="font-bold text-slate-900">Marcus Vance (Apt 201)</span>
                <span className="font-bold text-slate-900">₹24,500</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Paid</span>
              </div>

              <div className="flex items-center justify-between text-sm py-1.5 font-medium text-slate-800 border-t border-slate-100">
                <span className="font-bold text-slate-900">Elena Rostova (Suite 14)</span>
                <span className="font-bold text-slate-900">₹32,000</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Paid</span>
              </div>
            </div>
          </div>

        </div>

        {/* Section 2: AI Command Center Bar */}
        <div className="bg-[#0B132B] text-white rounded-xl md:rounded-2xl p-8 sm:p-12 relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            {/* Cormorant Garamond Heading */}
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Control your portfolio in plain natural language.
            </h2>
            {/* Inter Description */}
            <p className="text-slate-300 font-normal text-base sm:text-lg leading-relaxed mb-8 font-sans">
              Ask questions, trigger bulk actions, and draft legal notices using our intelligent AI agent bar.
            </p>

            {/* Prompt Bar Input Form */}
            <form onSubmit={handlePromptSubmit} className="relative mb-6 font-sans">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask AI: e.g. 'Show all unpaid rent for Wing B'..."
                className="w-full bg-[#18223C] text-white placeholder-slate-400 font-medium text-sm sm:text-base px-5 py-4 pr-14 rounded-xl border border-slate-700 focus:outline-hidden focus:border-[#FF6B00] shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#FF6B00] hover:bg-[#E56000] text-white p-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Preset Prompt Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 font-sans">
              <span className="text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider">Try prompts:</span>
              {presetPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptInput(prompt)}
                  className="text-xs font-medium text-slate-300 bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Trigger Component */}
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      />
    </section>
  );
}
