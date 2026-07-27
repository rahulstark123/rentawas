"use client";

import { useState, useEffect } from "react";
import { Megaphone, Calendar, Search, Loader2, Pin, Globe, Building2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TenantNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  useEffect(() => {
    async function loadNotices() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || "";

        let propId = "";
        let propName = "";
        if (userEmail) {
          const tenantRes = await fetch(`/api/tenant/me?email=${encodeURIComponent(userEmail)}`);
          if (tenantRes.ok) {
            const tenantJson = await tenantRes.json();
            if (tenantJson.data) {
              setTenantInfo(tenantJson.data);
              propId = tenantJson.data.propertyId || "";
              propName = tenantJson.data.propertyName || "";
            }
          }
        }

        const queryParams = new URLSearchParams();
        if (userEmail) queryParams.set("tenantEmail", userEmail);
        if (propId) queryParams.set("propertyId", propId);
        if (propName) queryParams.append("propertyId", propName);

        const res = await fetch(`/api/announcements?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setNotices(json.data);
          } else {
            setNotices([]);
          }
        }
      } catch (err) {
        console.error("Error loading tenant notices:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, []);

  const categories = [
    "All",
    "General Notice",
    "Maintenance Alert",
    "Policy Update",
    "Community Event",
    "Emergency Alert",
  ];

  const filteredNotices = notices.filter((n) => {
    const matchesCat = selectedCategory === "All" || (n.category || "General Notice") === selectedCategory;
    const matchesSearch =
      (n.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Building Notices &amp; Announcements
          </h1>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
            <Megaphone className="w-3.5 h-3.5 text-purple-600" />
            <span>{notices.length} Active</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Official community updates &amp; announcements for{" "}
          <span className="font-bold text-slate-800">
            {tenantInfo?.propertyName || "your residence"} — {tenantInfo?.unitNumber || "Unit"}
          </span>.
        </p>
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

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Notices Stream - COMPACT CARD GRID VIEW */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <Loader2 className="w-7 h-7 text-[#FF6B00] animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading building notices...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Active Building Notices</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no active announcements matching your filters for {tenantInfo?.propertyName || "your residence"}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNotices.map((n) => (
            <div
              key={n.id}
              className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-3 hover:shadow-md transition-all flex flex-col justify-between relative ${
                n.isPinned
                  ? "border-amber-400/90 ring-2 ring-amber-400/20 bg-amber-50/10"
                  : "border-slate-200/90"
              }`}
            >
              {/* Header Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {n.isPinned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider flex items-center gap-1">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>Pinned</span>
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                      {n.category || "General Notice"}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        n.priority === "Urgent"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : n.priority === "Important"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {n.priority || "Normal"} Priority
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </span>
                </div>

                {/* Card Title & Content */}
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight pt-1">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {n.content}
                </p>
              </div>

              {/* Card Footer info */}
              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between font-medium">
                <span>Official Building Notice</span>
                <span>By {n.creatorName || "Property Management"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
