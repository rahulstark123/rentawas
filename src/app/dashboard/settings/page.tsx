"use client";

import { useState } from "react";
import { 
  Building2, 
  CreditCard, 
  Bell, 
  Users, 
  ShieldCheck, 
  Save, 
  Plus, 
  CheckCircle2, 
  Globe, 
  DollarSign, 
  Zap, 
  Lock, 
  Check, 
  Trash2,
  ChevronDown
} from "lucide-react";
import { IconAutopilotRent } from "@/components/ui/CustomIcons";

import { useToast } from "@/components/ui/Toast";

export default function WorkspaceSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "payouts" | "automations" | "team" | "security">("general");

  // General Settings State
  const [orgName, setOrgName] = useState("Grand Regency Management LLC");
  const [currency, setCurrency] = useState("USD ($)");
  const [jurisdiction, setJurisdiction] = useState("Seattle, WA (USA)");
  const [companyEmail, setCompanyEmail] = useState("support@regencymanagement.com");
  const [companyPhone, setCompanyPhone] = useState("+1 (555) 019-2834");

  // Payout Settings State
  const [bankName, setBankName] = useState("JPMorgan Chase Bank");
  const [accountNumber, setAccountNumber] = useState("•••• •••• •••• 8942");
  const [payoutSchedule, setPayoutSchedule] = useState("instant");

  // Automations State
  const [remindWhatsApp, setRemindWhatsApp] = useState(true);
  const [remindSMS, setRemindSMS] = useState(true);
  const [remindEmail, setRemindEmail] = useState(true);
  const [lateFeePercent, setLateFeePercent] = useState("5");

  // Saved Feedback
  const [isSaved, setIsSaved] = useState(false);

  // Team Members
  const [team, setTeam] = useState([
    { id: 1, name: "Alexander Wright", email: "alexander@regencymanagement.com", role: "Workspace Owner", status: "Active" },
    { id: 2, name: "Sarah Jenkins", email: "sarah.j@regencymanagement.com", role: "Property Manager", status: "Active" },
    { id: 3, name: "David Ross", email: "david.r@accounting.com", role: "Finance & Tax View", status: "Active" },
    { id: 4, name: "QuickPlumb Co.", email: "dispatch@quickplumb.com", role: "Vendor Maintenance Only", status: "Active" },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Property Manager");

  const handleSave = () => {
    setIsSaved(true);
    toast("Workspace settings saved successfully!", "success");
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setTeam([
      ...team,
      {
        id: Date.now(),
        name: inviteEmail.split("@")[0].replace(".", " "),
        email: inviteEmail,
        role: inviteRole,
        status: "Pending Invite",
      },
    ]);
    toast(`Invitation sent to ${inviteEmail}`, "info");
    setInviteEmail("");
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Workspace & Landlord Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure organization profile, Autopilot disbursal accounts, automated reminder rules, and team access.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? "Saved Successfully!" : "Save Changes"}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar">
        {[
          { id: "general", label: "Organization & Profile", icon: Building2 },
          { id: "payouts", label: "Autopilot Payouts & Banking", icon: CreditCard, badge: "INSTANT" },
          { id: "automations", label: "Reminders & Late Fees", icon: Bell },
          { id: "team", label: "Team & Role Access", icon: Users, count: team.length },
          { id: "security", label: "Security & Audit Logs", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase">
                  {tab.badge}
                </span>
              )}
              {tab.count && (
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Organization & Profile */}
      {activeTab === "general" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#FF6B00]" />
            <span>Organization Profile & Global Preferences</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Organization / Company Legal Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Default Operating Currency
              </label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                >
                  <option value="USD ($)">USD ($) — United States Dollar</option>
                  <option value="INR (₹)">INR (₹) — Indian Rupee</option>
                  <option value="GBP (£)">GBP (£) — British Pound</option>
                  <option value="EUR (€)">EUR (€) — Eurozone Euro</option>
                  <option value="AED (AED)">AED (AED) — UAE Dirham</option>
                  <option value="AUD ($)">AUD ($) — Australian Dollar</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Primary Municipal Jurisdiction
              </label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Support Email Address
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Portfolio Contact Phone
              </label>
              <input
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Company Stamp / Logo Branding
              </label>
              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-500">
                <span>Upload official seal / header logo (PNG or SVG)</span>
                <button
                  type="button"
                  onClick={() => alert("Logo upload triggered!")}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  Upload File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Autopilot Payouts & Banking */}
      {activeTab === "payouts" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <IconAutopilotRent className="w-5 h-5 text-emerald-600" />
              <span>Autopilot Disbursal & Bank Routing Accounts</span>
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Bank Settlement Active</span>
            </span>
          </div>

          <div className="space-y-6 text-xs">
            {/* Primary Bank Card */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Primary Disbursal Account</div>
                  <div className="text-base font-extrabold text-white">{bankName}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{accountNumber} • Operating Checking</div>
                </div>
              </div>

              <button
                onClick={() => alert("Modifying payout bank account routing details...")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
              >
                Change Bank Account
              </button>
            </div>

            {/* Payout Trigger Frequency */}
            <div className="space-y-3">
              <label className="block font-bold text-slate-700 uppercase">
                Autopilot Disbursal Trigger Frequency
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "instant", title: "Instant Real-Time Routing", desc: "Collected rent is deposited to bank within 2 hours." },
                  { id: "daily", title: "Daily 09:00 AM Batch", desc: "Bundles all previous day rent payments into 1 transfer." },
                  { id: "weekly", title: "Weekly Settlement", desc: "Transfers accumulated balance every Monday morning." },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPayoutSchedule(item.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      payoutSchedule === item.id
                        ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-bold text-slate-900 flex items-center justify-between mb-1">
                      <span>{item.title}</span>
                      {payoutSchedule === item.id && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                    </div>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Connected Gateways */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block font-bold text-slate-700 uppercase">Connected Payment Gateways</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Stripe ACH / Card", status: "Connected", icon: "💳" },
                  { name: "Razorpay UPI", status: "Connected", icon: "🇮🇳" },
                  { name: "Bank Auto-Debit", status: "Active", icon: "🏦" },
                  { name: "Apple Pay / Google Pay", status: "Enabled", icon: "⚡" },
                ].map((g, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span>{g.icon}</span>
                      <span>{g.name}</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title={g.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Reminders & Late Fees */}
      {activeTab === "automations" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF6B00]" />
            <span>Automated Rent Reminders & Statutory Late Fee Rules</span>
          </h3>

          <div className="space-y-5 text-xs">
            {/* Reminder Channels */}
            <div className="space-y-3">
              <label className="block font-bold text-slate-700 uppercase">Active Reminder Channels</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer select-none">
                  <span className="font-bold text-slate-800">WhatsApp Notification</span>
                  <input
                    type="checkbox"
                    checked={remindWhatsApp}
                    onChange={(e) => setRemindWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00]"
                  />
                </label>

                <label className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer select-none">
                  <span className="font-bold text-slate-800">SMS Direct Dispatch</span>
                  <input
                    type="checkbox"
                    checked={remindSMS}
                    onChange={(e) => setRemindSMS(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00]"
                  />
                </label>

                <label className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer select-none">
                  <span className="font-bold text-slate-800">Email Digest & Invoice</span>
                  <input
                    type="checkbox"
                    checked={remindEmail}
                    onChange={(e) => setRemindEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00]"
                  />
                </label>
              </div>
            </div>

            {/* Late Fee Rule */}
            <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-900">Automated Late Fee Rule Configuration</div>
              <p className="text-slate-600 text-[11px]">
                Applies a percentage fee on tenant invoices if unpaid after the standard 5-day grace period.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span className="font-bold text-slate-700">Grace Period: 5 Days</span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-700">Late Fee Percentage:</span>
                  <input
                    type="number"
                    value={lateFeePercent}
                    onChange={(e) => setLateFeePercent(e.target.value)}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                  <span className="font-bold text-slate-700">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team & Role Access */}
      {activeTab === "team" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF6B00]" />
              <span>Team Members & Property Manager Permissions</span>
            </h3>

            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Team Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 px-2">Member</th>
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Access Role</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {team.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-bold text-slate-900">{m.name}</td>
                    <td className="py-3 px-2 text-slate-600">{m.email}</td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-800 uppercase">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {m.role !== "Workspace Owner" && (
                        <button
                          onClick={() => setTeam(team.filter(t => t.id !== m.id))}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Revoke Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Security & Audit Logs */}
      {activeTab === "security" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Security & Cryptographic Audit Logs</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-emerald-900">Two-Factor Authentication (2FA) Enforced</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">All landlord login sessions require authenticator app or SMS code.</div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-[10px] rounded-lg uppercase">
                Active
              </span>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700 uppercase">Recent Session Logins</label>
              <div className="space-y-2">
                {[
                  { device: "Chrome on macOS (Seattle, WA)", time: "Current Session", status: "Active Now" },
                  { device: "RentAwas iOS App (iPhone 15 Pro)", time: "Today at 08:14 AM", status: "Verified" },
                  { device: "Firefox on Windows (Mumbai, IN)", time: "Yesterday at 11:42 PM", status: "Verified" },
                ].map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{s.device}</div>
                      <div className="text-[10px] text-slate-500">{s.time}</div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleInvite} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Invite Team Member</h3>
            <p className="text-xs text-slate-500">Send an invitation to grant access to your workspace.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@domain.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Access Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                >
                  <option value="Property Manager">Property Manager (Full Ops)</option>
                  <option value="Finance & Tax View">Finance & Tax View (Read Only)</option>
                  <option value="Vendor Maintenance Only">Vendor Maintenance Only (Tickets)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B00] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer"
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
