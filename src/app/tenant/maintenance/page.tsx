"use client";

import { useState, useEffect } from "react";
import { Wrench, Plus, CheckCircle2, AlertCircle, Clock, Send, Upload, Loader2, ChevronDown, X, Camera, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TenantMaintenancePage() {
  const [tenant, setTenant] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [customCategory, setCustomCategory] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [desc, setDesc] = useState("");
  const [proofImages, setProofImages] = useState<string[]>(["", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const compressPhoto = (file: File, index: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;

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
          setProofImages((prev) => {
            const next = [...prev];
            next[index] = dataUrl;
            return next;
          });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
                images: Array.isArray(m.images) ? m.images : m.imageUrl ? [m.imageUrl] : [],
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

    const finalCategory = category === "Other" ? (customCategory.trim() || "Other Maintenance") : category;
    const activeImages = proofImages.filter(Boolean);

    setIsSubmitting(true);
    try {
      if (tenant && tenant.id !== "demo-tenant-id") {
        await fetch("/api/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issue: issueTitle,
            category: finalCategory,
            priority: urgency,
            notes: desc,
            images: activeImages,
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
            category: finalCategory,
            issue: issueTitle,
            urgency,
            status: "Open",
            date: "Just now",
            notes: desc || "Ticket received. Property Manager review in progress.",
            images: activeImages,
          },
          ...prev,
        ]);
      }

      setIssueTitle("");
      setCategory("Plumbing");
      setCustomCategory("");
      setDesc("");
      setProofImages(["", "", ""]);
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
                {Array.isArray(t.images) && t.images.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {t.images.map((img: string, i: number) => (
                      <div key={i} className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 shadow-2xs">
                        <img src={img} alt={`Proof Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto font-sans"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Submit Maintenance Request</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Describe the repair issue in your unit. Property Management will review &amp; dispatch vendors.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {/* Issue Title */}
              <div>
                <label className="block font-extrabold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. Bathroom light fixture flickering or A/C cooling issue"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white transition-all"
                />
              </div>

              {/* Category & Urgency side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white transition-all appearance-none cursor-pointer truncate"
                    >
                      <option value="Plumbing">Plumbing (Pipes, Taps, Drainage)</option>
                      <option value="Electrical">Electrical (Lights, Switches, Wiring)</option>
                      <option value="HVAC / Heating">HVAC / Air Conditioning & Heating</option>
                      <option value="Appliance Repair">Appliance (Fridge, Washing Machine, Geyser, Stove)</option>
                      <option value="Carpentry & Doors">Carpentry (Doors, Locks, Cabinets, Windows)</option>
                      <option value="Walls & Seepage">Walls, Paint, Seepage & Plaster</option>
                      <option value="Flooring & Tiles">Flooring, Tiles & Grout</option>
                      <option value="Pest Control">Pest Control & Extermination</option>
                      <option value="Internet & Smart Fixtures">Internet, Wi-Fi, Intercom & Smart Locks</option>
                      <option value="Windows & Blinds">Windows, Glass & Blinds</option>
                      <option value="Roof & Ceiling Leakage">Roof & Ceiling Leakage</option>
                      <option value="Safety & Smoke Detectors">Safety & Smoke Detectors</option>
                      <option value="Other">Other (Specify Custom Issue)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Urgency Priority *
                  </label>
                  <div className="relative">
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="Low">Low (Routine maintenance)</option>
                      <option value="Medium">Medium (Attention needed soon)</option>
                      <option value="High">High (Urgent Repair needed)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Custom Category Input field when 'Other' is selected */}
              {category === "Other" && (
                <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <label className="block font-extrabold text-[#FF6B00] uppercase text-[11px]">
                    Specify Custom Maintenance Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Geyser thermostat failure, balcony railing rust, chimney exhaust noise..."
                    className="w-full px-3.5 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white transition-all"
                  />
                </div>
              )}

              {/* Description & Details */}
              <div>
                <label className="block font-extrabold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Description &amp; Access Details
                </label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide any additional details or access instructions for maintenance staff..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white transition-all"
                />
              </div>

              {/* Photo Proof Upload (Up to 3 Compressed Pictures) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Photo Proof (Optional • Max 3 Pictures)
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">Auto-Compressed</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-center space-y-1.5 relative overflow-hidden"
                    >
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block truncate">
                        {idx === 0 ? "Main Photo *" : `Photo ${idx + 1}`}
                      </span>

                      {proofImages[idx] ? (
                        <div className="space-y-1.5">
                          <div className="w-full h-20 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs relative group">
                            <img
                              src={proofImages[idx]}
                              alt={`Issue Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setProofImages((prev) => {
                                const next = [...prev];
                                next[idx] = "";
                                return next;
                              });
                            }}
                            className="text-[10px] font-bold text-rose-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-slate-300 hover:border-orange-500/50 hover:bg-orange-50/30 rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer block min-h-[82px] group">
                          <Camera className="w-5 h-5 text-slate-400 group-hover:text-[#FF6B00] transition-colors" />
                          <span className="text-[10px] font-bold text-slate-600 group-hover:text-[#FF6B00]">Add Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                compressPhoto(file, idx);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-50 rounded-xl shadow-md uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isSubmitting ? "Submitting Ticket..." : "Submit Ticket"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
