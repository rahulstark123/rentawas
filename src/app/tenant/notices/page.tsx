"use client";

import { useState, useEffect } from "react";
import { Megaphone, Calendar, Bell, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TenantNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotices() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || "";

        // First fetch tenant details to get tenant's property name/id
        let propId = "";
        let propName = "";
        if (userEmail) {
          const tenantRes = await fetch(`/api/tenant/me?email=${encodeURIComponent(userEmail)}`);
          if (tenantRes.ok) {
            const tenantJson = await tenantRes.json();
            if (tenantJson.data) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Building Notices &amp; Announcements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Official community announcements and bulletins from property management.
        </p>
      </div>

      {/* Notices Stream */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <Loader2 className="w-7 h-7 text-[#FF6B00] animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Active Notices</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no active announcements or property alerts for your residence.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 uppercase">
                    {n.category || "General Notice"}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    n.priority === "Urgent" ? "bg-red-100 text-red-700" : n.priority === "Important" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                  }`}>
                    {n.priority} Priority
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
