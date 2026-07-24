"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  Plus,
  X,
  Building2,
  Calendar,
  DollarSign,
  ChevronDown,
  UserPlus
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface TenantItem {
  id: string;
  name: string;
  unit: string;
  phone: string;
  email: string;
  leaseEnd: string;
  healthScore: number;
  status: "Excellent" | "Good" | "Fair" | "Attention";
  onTimeRate: string;
}

export default function TenantsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Tenant Form State
  const [name, setName] = useState("");
  const [propertyUnit, setPropertyUnit] = useState("The Regent - Unit 401");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("2027-07-31");
  const [monthlyRent, setMonthlyRent] = useState("2850");
  const [paymentChannel, setPaymentChannel] = useState("Autopilot ACH Direct");

  const [tenants, setTenants] = useState<TenantItem[]>([
    {
      id: "TEN-101",
      name: "Eleanor Vance",
      unit: "The Regent - Unit 302",
      phone: "+1 (555) 234-5678",
      email: "eleanor.vance@example.com",
      leaseEnd: "2027-06-30",
      healthScore: 98,
      status: "Excellent",
      onTimeRate: "100%",
    },
    {
      id: "TEN-102",
      name: "Marcus Sterling",
      unit: "The Regent - Unit 104",
      phone: "+1 (555) 876-5432",
      email: "marcus.s@example.com",
      leaseEnd: "2026-11-15",
      healthScore: 94,
      status: "Good",
      onTimeRate: "98%",
    },
    {
      id: "TEN-103",
      name: "Sophia Martinez",
      unit: "Horizon Suites - Unit 408",
      phone: "+1 (555) 345-6789",
      email: "sophia.m@example.com",
      leaseEnd: "2027-01-31",
      healthScore: 96,
      status: "Excellent",
      onTimeRate: "100%",
    },
    {
      id: "TEN-104",
      name: "David Chen",
      unit: "Oakwood - Unit 201",
      phone: "+1 (555) 901-2345",
      email: "david.c@example.com",
      leaseEnd: "2026-08-15",
      healthScore: 82,
      status: "Fair",
      onTimeRate: "85%",
    },
  ]);

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newTenant: TenantItem = {
      id: `TEN-${Math.floor(100 + Math.random() * 900)}`,
      name,
      unit: propertyUnit,
      phone: phone || "+1 (555) 000-0000",
      email,
      leaseEnd,
      healthScore: 95,
      status: "Excellent",
      onTimeRate: "100%",
    };

    setTenants([newTenant, ...tenants]);
    toast(`Tenant ${name} successfully assigned to ${propertyUnit}!`, "success");
    setName("");
    setEmail("");
    setPhone("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tenants & Behavioral Health Scores</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {tenants.length} Active Residents
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Credit scoring, payment behavioral history, and lease contract tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tenant name or unit..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Tenant</span>
          </button>
        </div>
      </div>

      {/* Tenant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTenants.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0B132B] text-white font-bold text-sm flex items-center justify-center">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                  <p className="text-xs font-semibold text-slate-500">{t.unit}</p>
                </div>
              </div>

              {/* Health Score Badge */}
              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.healthScore} / 100</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{t.status} Rating</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">On-Time Payment Rate</span>
                <span className="font-extrabold text-slate-900">{t.onTimeRate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lease Expiry</span>
                <span className="font-extrabold text-slate-900">{t.leaseEnd}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast(`Opening communication channel for ${t.name}...`, "info")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ------------------- MODAL: ADD NEW TENANT ------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleAddTenant}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">Add New Tenant Resident</h3>
                  <p className="text-xs text-slate-500 mt-1">Assign resident to unit & configure lease telemetry.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Resident Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Property & Unit</label>
                  <div className="relative">
                    <select
                      value={propertyUnit}
                      onChange={(e) => setPropertyUnit(e.target.value)}
                      className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="The Regent - Unit 401">The Regent — Unit 401</option>
                      <option value="The Regent - Unit 302">The Regent — Unit 302</option>
                      <option value="Downtown Horizon - Suite 202">Downtown Horizon — Suite 202</option>
                      <option value="Oakwood Residency - Unit 105">Oakwood Residency — Unit 105</option>
                      <option value="Skyline Manor - Unit 101">Skyline Manor — Unit 101</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Rent ($ / ₹)</label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    placeholder="2850"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenant@domain.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 912-3840"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Lease Expiry Date</label>
                  <input
                    type="date"
                    value={leaseEnd}
                    onChange={(e) => setLeaseEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Autopilot Payment Channel</label>
                  <div className="relative">
                    <select
                      value={paymentChannel}
                      onChange={(e) => setPaymentChannel(e.target.value)}
                      className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Autopilot ACH Direct">Autopilot ACH Direct (Auto-Debit)</option>
                      <option value="Razorpay UPI Gateway">Razorpay UPI Gateway</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="Manual Bank Wire Transfer">Manual Bank Wire Transfer</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save & Assign Tenant</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
