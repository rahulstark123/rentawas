"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { 
  Wrench, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Megaphone, 
  Plus,
  Pin,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useTenantMe } from "@/hooks/useTenantMe";
import { getTenantMonthRentStatus } from "@/lib/rentReceipts";

export default function TenantDashboardPage() {
  const { formatCurrency } = useCurrency();
  const { data: tenantMe, isLoading: meLoading } = useTenantMe();
  const [notices, setNotices] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>({
    name: "Resident",
    propertyName: "The Regent",
    unitNumber: "Unit 302",
    monthlyRent: 3200,
    leaseStart: "2025-08-01",
    leaseEnd: "2026-07-31",
    documents: [],
    maintenances: [],
  });

  const wid = tenantMe?.workspaceId != null ? Number(tenantMe.workspaceId) : NaN;
  const email = tenantMe?.email || "";
  const propertyId = tenantMe?.propertyId || "";

  const { data: announcementsData, isLoading: annLoading } = useQuery({
    queryKey: ["tenant-announcements", wid, email, propertyId],
    enabled: !!tenantMe && !isNaN(wid) && wid > 0,
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set("workspaceId", String(wid));
      if (email) queryParams.set("tenantEmail", email);
      if (propertyId) queryParams.set("propertyId", propertyId);
      if (tenantMe?.propertyName) queryParams.append("propertyId", tenantMe.propertyName);

      const annRes = await fetch(`/api/announcements?${queryParams.toString()}`);
      if (!annRes.ok) return [];
      const annJson = await annRes.json();
      const list = Array.isArray(annJson.data) ? annJson.data : [];
      return [...list].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    },
  });

  useEffect(() => {
    if (tenantMe) setTenant(tenantMe);
  }, [tenantMe]);

  useEffect(() => {
    if (announcementsData) {
      setNotices(announcementsData);
    } else if (!annLoading && tenantMe && (isNaN(wid) || wid <= 0)) {
      setNotices([]);
    }
  }, [announcementsData, annLoading, tenantMe, wid]);

  const loading = meLoading || (!!tenantMe && annLoading);

  const rentVal = tenant.monthlyRent || 3200;
  const dueMonthLabel = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const currentMonthRentStatus = getTenantMonthRentStatus(tenant?.bills, dueMonthLabel);
  const noPaymentDueThisMonth = currentMonthRentStatus !== "due";

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-72 bg-slate-100 rounded-md" />
          </div>
          <div className="h-8 w-48 bg-slate-100 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 min-h-[220px]">
            <div className="h-6 w-28 bg-slate-700 rounded-full" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-700 rounded" />
              <div className="h-10 w-40 bg-slate-600 rounded-lg" />
              <div className="h-3 w-56 bg-slate-700 rounded" />
            </div>
            <div className="pt-4 border-t border-slate-700 flex justify-end">
              <div className="h-4 w-32 bg-slate-700 rounded" />
            </div>
          </div>
          <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="space-y-3 mt-2">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-slate-50 rounded-lg" />
                <div className="h-10 bg-slate-50 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 p-3 border border-slate-100 rounded-xl">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-3.5 w-full bg-slate-200 rounded" />
                <div className="h-3 w-2/3 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {tenant.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Resident Dashboard for <span className="font-bold text-slate-800">{tenant.propertyName} — {tenant.unitNumber}</span>.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5 w-fit">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lease Active & Account Verified</span>
        </span>
      </div>

      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Rent Due Primary Action Card (7 Cols) */}
        <div className="md:col-span-7 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                noPaymentDueThisMonth
                  ? "bg-emerald-400/20 border border-emerald-400/30 text-emerald-200"
                  : "bg-amber-400/20 border border-amber-400/30 text-amber-300"
              }`}>
                {noPaymentDueThisMonth ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                <span>
                  {noPaymentDueThisMonth ? `${dueMonthLabel} Paid` : `${dueMonthLabel} Due`}
                </span>
              </span>

              <span className="text-xs font-bold text-slate-300">Monthly Billing</span>
            </div>

            <div>
              {noPaymentDueThisMonth ? (
                <>
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    No payment due for this month
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {formatCurrency(rentVal)} recorded
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    <span>
                      {currentMonthRentStatus === "pending_verification"
                        ? "Awaiting landlord verification"
                        : `${dueMonthLabel} rent is already on file`}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {dueMonthLabel} Rent Due
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white mt-1">{formatCurrency(rentVal)}</div>
                  <div className="text-xs text-slate-300 mt-1">
                    <span>Includes Base Rent &amp; Assigned Premises</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-700/80 flex justify-end">
            <Link
              href="/tenant/payments"
              className="text-xs font-bold text-slate-300 hover:text-white underline"
            >
              View Payment Receipts
            </Link>
          </div>
        </div>

        {/* Active Lease Overview Card (5 Cols) */}
        <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                Active Lease Contract
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Demised Premises</span>
                <span className="font-bold text-slate-900">{tenant.propertyName} — {tenant.unitNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Start Date</span>
                  <span className="font-bold text-slate-800">{tenant.leaseStart || "2025-08-01"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">End Date</span>
                  <span className="font-bold text-slate-800">{tenant.leaseEnd || "2026-07-31"}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Resident Email</span>
                <span className="font-bold text-slate-900">{tenant.email}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/tenant/documents"
              className="text-xs font-bold text-purple-700 hover:underline uppercase tracking-wider"
            >
              View All My Documents ({Array.isArray(tenant.documents) ? tenant.documents.length : 8} Files)
            </Link>
          </div>
        </div>

      </div>

      {/* Main Grid: My Active Maintenance (Left 7) & Building Announcements (Right 5) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Active Maintenance Requests (7 Cols) */}
        <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">My Repair & Maintenance Requests</h3>
                <p className="text-xs text-slate-500">Track real-time status of reported unit issues.</p>
              </div>
            </div>

            <Link
              href="/tenant/maintenance"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl transition-all shadow-xs uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Issue</span>
            </Link>
          </div>

          {/* Ticket List or Empty State */}
          {Array.isArray(tenant.maintenances) && tenant.maintenances.length > 0 ? (
            <div className="space-y-3">
              {tenant.maintenances.slice(0, 2).map((m: any, idx: number) => (
                <div key={m.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      Ticket #{m.ticketNumber || m.id || (400 + idx)} — {m.issue || m.title || "Repair Request"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 uppercase">
                      {m.status || "Open"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {m.notes || m.description || "Ticket logged with Property Manager."}
                  </p>
                  <div className="text-[11px] text-slate-400 font-medium pt-1 flex items-center justify-between">
                    <span>Category: {m.category || "General"}</span>
                    <span>Priority: {m.priority || "Normal"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-2">
              <p className="text-xs font-bold text-slate-700">No active repair tickets logged.</p>
              <p className="text-[11px] text-slate-500">Need something fixed? Click &quot;Submit Issue&quot; to report a repair request.</p>
            </div>
          )}
        </div>

        {/* Building Announcements (5 Cols) */}
        <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">Building Notices</h3>
                <p className="text-xs text-slate-500 truncate">Live community updates for your residence.</p>
              </div>
            </div>
            <Link
              href="/tenant/notices"
              className="text-[11px] font-bold text-purple-700 hover:underline uppercase tracking-wider shrink-0"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {notices.length === 0 ? (
              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1.5">
                <p className="text-xs font-bold text-slate-700">No active building notices</p>
                <p className="text-[11px] text-slate-500">
                  Announcements from your landlord will appear here.
                </p>
              </div>
            ) : (
              notices.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border ${
                    n.isPinned
                      ? "bg-amber-50/60 border-amber-200"
                      : n.priority === "Urgent"
                      ? "bg-red-50/50 border-red-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-slate-900 leading-snug">{n.title || "Building Notice"}</div>
                    {n.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                    {n.content || n.body || ""}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                      {n.category || "General Notice"}
                    </span>
                    {n.createdAt && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
