"use client";

import { useState, useEffect } from "react";
import { 
  Megaphone, 
  Plus, 
  Search, 
  Building2, 
  Users, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  Send, 
  Filter, 
  X,
  Loader2,
  Sparkles,
  ShieldAlert,
  Bell
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface PropertyOption {
  id: string;
  name: string;
  totalUnits?: number;
}

interface TenantOption {
  id: string;
  name: string;
  email: string;
  unit?: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  targetScope: "ALL_PROPERTIES" | "SPECIFIC_PROPERTIES" | "SPECIFIC_TENANTS";
  targetProperties: string[];
  targetTenants: string[];
  creatorName?: string;
  createdAt: string;
}

export default function LandlordAnnouncementsPage() {
  const { toast } = useToast();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General Notice");
  const [priority, setPriority] = useState("Normal");
  const [targetScope, setTargetScope] = useState<"ALL_PROPERTIES" | "SPECIFIC_PROPERTIES" | "SPECIFIC_TENANTS">("ALL_PROPERTIES");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);

  // Fetch announcements, properties, and tenants
  const fetchData = async () => {
    try {
      setLoading(true);

      const [annRes, propRes, tenantRes] = await Promise.all([
        fetch("/api/announcements"),
        fetch("/api/properties"),
        fetch("/api/tenants"),
      ]);

      if (annRes.ok) {
        const annJson = await annRes.json();
        setAnnouncements(annJson.data || []);
      }

      if (propRes.ok) {
        const propJson = await propRes.json();
        setProperties(propJson.data || []);
      }

      if (tenantRes.ok) {
        const tenantJson = await tenantRes.json();
        setTenants(tenantJson.data || []);
      }
    } catch (err) {
      console.error("Error fetching announcements data:", err);
      toast("Failed to load announcements data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setTitle("");
    setContent("");
    setCategory("General Notice");
    setPriority("Normal");
    setTargetScope("ALL_PROPERTIES");
    setSelectedProperties([]);
    setSelectedTenants([]);
    setShowModal(true);
  };

  const handlePropertyToggle = (propId: string) => {
    setSelectedProperties((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]
    );
  };

  const handleTenantToggle = (tenantEmail: string) => {
    setSelectedTenants((prev) =>
      prev.includes(tenantEmail) ? prev.filter((e) => e !== tenantEmail) : [...prev, tenantEmail]
    );
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast("Please provide an announcement title and message content.", "info");
      return;
    }

    if (targetScope === "SPECIFIC_PROPERTIES" && selectedProperties.length === 0) {
      toast("Please select at least one target property.", "info");
      return;
    }

    if (targetScope === "SPECIFIC_TENANTS" && selectedTenants.length === 0) {
      toast("Please select at least one target resident.", "info");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category,
          priority,
          targetScope,
          targetProperties: targetScope === "SPECIFIC_PROPERTIES" ? selectedProperties : [],
          targetTenants: targetScope === "SPECIFIC_TENANTS" ? selectedTenants : [],
          creatorName: "Landlord / Portfolio Admin",
        }),
      });

      if (res.ok) {
        toast(`Announcement "${title}" published successfully!`, "success");
        setShowModal(false);
        fetchData();
      } else {
        toast("Failed to publish announcement", "error");
      }
    } catch (err) {
      console.error("Create announcement error:", err);
      toast("Error creating announcement", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/announcements/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Announcement removed.", "warning");
        fetchData();
      } else {
        toast("Failed to delete announcement.", "error");
      }
    } catch (err) {
      console.error("Delete announcement error:", err);
      toast("Error deleting announcement", "error");
    }
  };

  const categories = [
    "All",
    "General Notice",
    "Maintenance Alert",
    "Policy Update",
    "Community Event",
    "Emergency Alert",
  ];

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesCat = selectedCategory === "All" || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Announcements &amp; Resident Notices
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
              <Megaphone className="w-3.5 h-3.5 text-purple-600" />
              <span>{announcements.length} Published</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Broadcast notices across your entire portfolio, specific properties, or targeted residents.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Announcement</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Portfolio Broadcasts</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {announcements.filter((a) => a.targetScope === "ALL_PROPERTIES").length} Notices
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Sent to all portfolio residents</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property-Targeted Notices</span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {announcements.filter((a) => a.targetScope === "SPECIFIC_PROPERTIES").length} Bulletins
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Scoped to designated buildings</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Individual / Direct Notices</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {announcements.filter((a) => a.targetScope === "SPECIFIC_TENANTS").length} Messages
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Direct targeted resident alerts</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
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
            placeholder="Search announcements..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Announcements Stream */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <Loader2 className="w-7 h-7 text-[#FF6B00] animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading portfolio announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Megaphone className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Announcements Found</h3>
            <p className="text-xs text-slate-500">
              No notices match your current filters. Click &quot;+ Create Announcement&quot; to broadcast a notice to residents.
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow relative"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                    {item.category}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.priority === "Urgent"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : item.priority === "Important"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.priority} Priority
                  </span>

                  {/* Target Scope Badge */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1">
                    {item.targetScope === "ALL_PROPERTIES" && (
                      <>
                        <Globe className="w-3 h-3 text-blue-600" />
                        <span>All Portfolio Properties</span>
                      </>
                    )}
                    {item.targetScope === "SPECIFIC_PROPERTIES" && (
                      <>
                        <Building2 className="w-3 h-3 text-purple-600" />
                        <span>Targeted Properties ({item.targetProperties.length})</span>
                      </>
                    )}
                    {item.targetScope === "SPECIFIC_TENANTS" && (
                      <>
                        <Users className="w-3 h-3 text-amber-600" />
                        <span>Targeted Residents ({item.targetTenants.length})</span>
                      </>
                    )}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </div>

              {/* Target Details Badge if specific */}
              {item.targetScope === "SPECIFIC_PROPERTIES" && item.targetProperties.length > 0 && (
                <div className="text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-slate-600 font-medium">
                  <strong>Targeted Properties:</strong> {item.targetProperties.join(", ")}
                </div>
              )}

              {item.targetScope === "SPECIFIC_TENANTS" && item.targetTenants.length > 0 && (
                <div className="text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-slate-600 font-medium">
                  <strong>Targeted Residents:</strong> {item.targetTenants.join(", ")}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-medium">
                <span>Published on {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span>By {item.creatorName || "Landlord / Management"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleCreateAnnouncement}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Create Portfolio Announcement</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Elevator Servicing on Saturday / Water Maintenance"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="General Notice">General Notice</option>
                    <option value="Maintenance Alert">Maintenance Alert</option>
                    <option value="Policy Update">Policy Update</option>
                    <option value="Community Event">Community Event</option>
                    <option value="Emergency Alert">Emergency Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="Important">Important Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>

              {/* TARGET AUDIENCE SCOPE SELECTION (USER EXPLICIT REQUIREMENT) */}
              <div className="space-y-2 border-t border-b border-slate-100 py-3">
                <label className="block font-bold text-slate-800 uppercase tracking-wider">
                  Target Audience / Scope *
                </label>

                <div className="space-y-2">
                  <label
                    onClick={() => setTargetScope("ALL_PROPERTIES")}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetScope === "ALL_PROPERTIES"
                        ? "bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetScope"
                      checked={targetScope === "ALL_PROPERTIES"}
                      onChange={() => setTargetScope("ALL_PROPERTIES")}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-purple-600" />
                        <span>All Portfolio Properties</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Broadcast to all residents across every building</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setTargetScope("SPECIFIC_PROPERTIES")}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetScope === "SPECIFIC_PROPERTIES"
                        ? "bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetScope"
                      checked={targetScope === "SPECIFIC_PROPERTIES"}
                      onChange={() => setTargetScope("SPECIFIC_PROPERTIES")}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Specific Properties Only</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Select designated properties from your portfolio</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setTargetScope("SPECIFIC_TENANTS")}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetScope === "SPECIFIC_TENANTS"
                        ? "bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetScope"
                      checked={targetScope === "SPECIFIC_TENANTS"}
                      onChange={() => setTargetScope("SPECIFIC_TENANTS")}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>Specific Set of People / Tenants</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Select specific individual residents or emails</div>
                    </div>
                  </label>
                </div>

                {/* SPECIFIC PROPERTIES CHECKBOX LIST */}
                {targetScope === "SPECIFIC_PROPERTIES" && (
                  <div className="mt-3 p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800 uppercase block text-[10px]">Select Target Properties:</span>
                    {properties.length === 0 ? (
                      <p className="text-slate-500 text-[11px]">No properties created yet in workspace.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                        {properties.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                            <input
                              type="checkbox"
                              checked={selectedProperties.includes(p.name)}
                              onChange={() => handlePropertyToggle(p.name)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>{p.name} ({p.totalUnits || 0} Units)</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SPECIFIC TENANTS CHECKBOX LIST */}
                {targetScope === "SPECIFIC_TENANTS" && (
                  <div className="mt-3 p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800 uppercase block text-[10px]">Select Target Residents:</span>
                    {tenants.length === 0 ? (
                      <p className="text-slate-500 text-[11px]">No tenants created yet in workspace.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                        {tenants.map((t) => (
                          <label key={t.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                            <input
                              type="checkbox"
                              checked={selectedTenants.includes(t.email)}
                              onChange={() => handleTenantToggle(t.email)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>{t.name} ({t.email})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter complete notice announcement details for residents..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Publish Notice</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
