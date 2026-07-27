"use client";

import { useState, useEffect } from "react";
import { Wrench, Plus, CheckCircle2, AlertCircle, Clock, Send, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TenantMaintenancePage() {
  const [tenant, setTenant] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [urgency, setUrgency] = useState("Medium");
  const [desc, setDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTenantProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
      const res = await fetch(`/api/tenant/me${emailParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTenant(json.data);
          if (Array.isArray(json.data.maintenances)) {
            setTickets(
              json.data.maintenances.map((m: any, idx: number) => ({
                id: m.ticketNumber || `TCK-${400 + idx}`,
                category: m.category || "General Maintenance",
                issue: m.issue || m.title || "Unit Maintenance",
                urgency: m.priority || "Medium",
                status: m.status || "Open",
                date: m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
                notes: m.notes || m.description || "Ticket logged with Property Manager.",
              }))
            );
          } else {
            setTickets([]);
          }
        }
      }
    } catch (err) {
      console.error("Error loading tenant maintenance tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle) return;

    setIsSubmitting(true);
    try {
      if (tenant && tenant.id !== "demo-tenant-id") {
        await fetch("/api/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issue: issueTitle,
            category,
            priority: urgency,
            notes: desc,
            tenantId: tenant.id,
            unitId: tenant.unitId || undefined,
            propertyId: tenant.propertyId || undefined,
            workspaceId: tenant.workspaceId || undefined,
          }),
        });
      } else {
        // Local state fallback for demo accounts
        setTickets((prev) => [
          {
            id: `TCK-${Math.floor(400 + Math.random() * 100)}`,
            category,
            issue: issueTitle,
            urgency,
            status: "Open",
            date: "Just now",
            notes: desc || "Ticket received. Property Manager review in progress.",
          },
          ...prev,
        ]);
      }

      setIssueTitle("");
      setDesc("");
      setShowModal(false);
      await fetchTenantProfile();
    } catch (err) {
      console.error("Submit ticket error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Maintenance &amp; Repair Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit repair tickets directly to building management and track vendor dispatch in real time.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Repair Request</span>
        </button>
      </div>

      {/* Active Tickets Stream */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
          <Loader2 className="w-7 h-7 text-[#FF6B00] animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading your maintenance tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Wrench className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Maintenance Requests Found</h3>
            <p className="text-xs text-slate-500">
              You currently have no active or historical repair tickets logged for{" "}
              <span className="font-semibold text-slate-700">
                {tenant?.propertyName || "your residence"} — {tenant?.unitNumber || "Unit"}
              </span>.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Repair Request</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-400">{t.id}</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 uppercase">
                    {t.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    t.urgency === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {t.urgency} Priority
                  </span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  t.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-purple-50 text-purple-800 border border-purple-200"
                }`}>
                  {t.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{t.issue}</h3>
                <p className="text-xs text-slate-600 mt-1">{t.notes}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Submitted: {t.date}</span>
                <span>Building Maintenance SLA: &lt; 24h</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Submit Maintenance Request</h3>
            <p className="text-xs text-slate-500">Describe the repair issue in your unit.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. Bathroom light fixture flickering"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC / Heating">HVAC / Heating</option>
                    <option value="Appliance">Appliance</option>
                    <option value="Door / Lock">Door / Lock</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="Low">Low (Routine)</option>
                    <option value="Medium">Medium (Attention needed)</option>
                    <option value="High">High (Urgent Repair)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description & Details</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide any additional details or access instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Photo Proof (Optional)</label>
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Upload photo of issue</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#FF6B00]">Select File</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B00] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
