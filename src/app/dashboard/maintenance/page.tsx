"use client";

import { useState, useEffect } from "react";
import { 
  Wrench, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  X, 
  Search, 
  Building2, 
  Layers, 
  ArrowRight, 
  Check, 
  Play, 
  FileText,
  LayoutGrid,
  Table,
  Trash2,
  Loader2,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface TicketItem {
  id: string;
  realId: string;
  ticketNumber?: string;
  tenant: string;
  tenantId?: string;
  unit: string;
  unitId?: string;
  property: string;
  propertyId?: string;
  issue: string;
  description?: string;
  category?: string;
  priority: "High" | "Medium" | "Low" | "Emergency";
  status: "New Requests" | "In Progress" | "Resolved";
  date: string;
  cost?: number;
  loggedBy?: string;
}

export default function MaintenancePage() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [loading, setLoading] = useState<boolean>(true);

  const [tickets, setTickets] = useState<TicketItem[]>([]);

  // Live database dropdown lists for Create Ticket modal
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [unitsList, setUnitsList] = useState<any[]>([]);
  const [tenantsList, setTenantsList] = useState<any[]>([]);

  // Modal State for New Ticket Creation (Property -> Floor -> Unit Cascading Selects)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [propertyUnits, setPropertyUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [newIssue, setNewIssue] = useState("");
  const [newCategory, setNewCategory] = useState("General Repair");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low" | "Emergency">("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real tickets from global /api/maintenance API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/maintenance");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const formatted: TicketItem[] = json.data.map((t: any) => {
            // Map DB status to UI columns ("Open" / "Pending" -> "New Requests")
            let uiStatus: "New Requests" | "In Progress" | "Resolved" = "New Requests";
            const rawStatus = (t.status || "").toLowerCase();
            if (rawStatus.includes("progress")) {
              uiStatus = "In Progress";
            } else if (rawStatus.includes("resolved") || rawStatus.includes("completed")) {
              uiStatus = "Resolved";
            }

            const propName = t.property?.name || "Property";
            const unitNo = t.unit?.unitNumber || "Unit";
            const tenantName = t.tenant?.name || t.loggedBy || "Resident";

            return {
              id: t.ticketNumber || `TCK-${t.id.slice(-4)}`,
              realId: t.id,
              ticketNumber: t.ticketNumber,
              tenant: tenantName,
              tenantId: t.tenantId,
              unit: unitNo,
              unitId: t.unitId,
              property: propName,
              propertyId: t.propertyId,
              issue: t.issue,
              description: t.notes || t.issue,
              category: t.category || "General Repair",
              priority: t.priority === "Emergency" ? "High" : (t.priority || "Medium"),
              status: uiStatus,
              date: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
              cost: t.cost,
              loggedBy: t.loggedBy,
            };
          });
          setTickets(formatted);
        }
      }
    } catch (err) {
      console.warn("Could not fetch maintenance tickets from API:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown metadata for create modal
  const fetchMetadata = async () => {
    try {
      const [propsRes, tenantsRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/tenants"),
      ]);
      if (propsRes.ok) {
        const json = await propsRes.json();
        if (json.data && Array.isArray(json.data)) {
          setPropertiesList(json.data);
          if (json.data.length > 0) {
            setSelectedPropertyId(json.data[0].id);
          }
        }
      }
      if (tenantsRes.ok) {
        const json = await tenantsRes.json();
        if (json.data && Array.isArray(json.data)) {
          setTenantsList(json.data);
        }
      }
    } catch (err) {
      console.warn("Could not load maintenance dropdown metadata:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchMetadata();
  }, []);

  // Cascading Property Change Handler
  const handlePropertyChange = async (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedFloor("");
    setSelectedUnitId("");
    setSelectedTenantId("");
    setPropertyUnits([]);

    if (!propertyId) return;

    setLoadingUnits(true);
    try {
      const res = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/units`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setPropertyUnits(json.data);
          setLoadingUnits(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not fetch units for property:", err);
    }

    // Comprehensive fallback units for all floors
    const fallbackUnits: any[] = [];
    for (let f = 1; f <= 5; f++) {
      fallbackUnits.push(
        { id: `${propertyId}-u${f}01`, unitNumber: `Unit ${f}01`, floorNumber: f, isOccupied: false },
        { id: `${propertyId}-u${f}02`, unitNumber: `Unit ${f}02`, floorNumber: f, isOccupied: true },
        { id: `${propertyId}-u${f}03`, unitNumber: `Unit ${f}03`, floorNumber: f, isOccupied: false }
      );
    }
    setPropertyUnits(fallbackUnits);
    setLoadingUnits(false);
  };

  const handleFloorChange = (floorStr: string) => {
    setSelectedFloor(floorStr);
    setSelectedUnitId("");
    setSelectedTenantId("");
  };

  // Derive floors & units for current selections
  const selectedPropertyObj = propertiesList.find((p) => p.id === selectedPropertyId);
  const derivedFloorsFromUnits = Array.from(
    new Set(propertyUnits.map((u) => u.floorNumber || 1))
  ).sort((a, b) => (a as number) - (b as number));

  const availableFloors: number[] = derivedFloorsFromUnits.length > 0
    ? (derivedFloorsFromUnits as number[])
    : selectedPropertyObj?.totalFloors
    ? Array.from({ length: selectedPropertyObj.totalFloors }, (_, i) => i + 1)
    : [1, 2, 3, 4, 5];

  const filteredUnitsForFloor = propertyUnits.filter((u) => {
    if (!selectedFloor) return true;
    return String(u.floorNumber || 1) === String(selectedFloor);
  });

  const filteredTenantsForUnit = tenantsList.filter((t) => {
    if (selectedUnitId && t.unitId) {
      return t.unitId === selectedUnitId;
    }
    if (selectedPropertyId && t.propertyId) {
      return t.propertyId === selectedPropertyId;
    }
    return true;
  });

  // Handle status update in database
  const handleStatusChange = async (targetId: string, newStatus: "New Requests" | "In Progress" | "Resolved") => {
    const dbStatus = newStatus === "New Requests" ? "Open" : newStatus;
    try {
      const res = await fetch(`/api/maintenance/${encodeURIComponent(targetId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: dbStatus }),
      });
      if (res.ok) {
        toast(`Ticket status updated to "${newStatus}"`, "success");
        fetchTickets();
      } else {
        toast("Failed to update ticket status", "error");
      }
    } catch (err) {
      toast("Failed to update ticket status", "error");
    }
  };

  // Handle delete ticket from database
  const handleDeleteTicket = async (targetId: string, ticketNumber: string) => {
    if (!confirm(`Are you sure you want to delete ticket ${ticketNumber}?`)) return;
    try {
      const res = await fetch(`/api/maintenance/${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast(`Maintenance ticket ${ticketNumber} deleted!`, "success");
        fetchTickets();
      } else {
        toast("Failed to delete maintenance ticket", "error");
      }
    } catch (err) {
      toast("Failed to delete maintenance ticket", "error");
    }
  };

  // Submit new maintenance ticket to database
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.trim()) {
      toast("Please enter a maintenance issue summary.", "info");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTenant = tenantsList.find((t) => t.id === selectedTenantId);

      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue: newIssue.trim(),
          category: newCategory,
          priority: newPriority,
          status: "Open",
          notes: newDescription,
          tenantId: selectedTenantId || null,
          unitId: selectedUnitId || null,
          propertyId: selectedPropertyId || null,
          loggedBy: selectedTenant ? `${selectedTenant.name} (Tenant)` : "Admin / Property Staff",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        toast(json.message || "Maintenance ticket logged successfully!", "success");
        setNewIssue("");
        setNewDescription("");
        setShowCreateModal(false);
        fetchTickets();
      } else {
        toast("Failed to create maintenance ticket", "error");
      }
    } catch (err) {
      console.error("Create ticket submit error:", err);
      toast("An error occurred while logging ticket", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ("New Requests" | "In Progress" | "Resolved")[] = [
    "New Requests",
    "In Progress",
    "Resolved",
  ];

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    const matchesSearch =
      t.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 font-sans pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-orange-50 text-[#FF6B00]">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Maintenance &amp; Repair Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Centralized database telemetry across all properties. Tenant requests land under <strong>New Requests</strong>.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {/* Overview Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterStatus("New Requests")}
          className={`p-5 bg-white border rounded-2xl shadow-2xs cursor-pointer transition-all ${
            filterStatus === "New Requests" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">📥 New Requests</span>
            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
              {tickets.filter((t) => t.status === "New Requests").length}
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {tickets.filter((t) => t.status === "New Requests").length} Reported
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tenant issues pending initial review</p>
        </div>

        <div 
          onClick={() => setFilterStatus("In Progress")}
          className={`p-5 bg-white border rounded-2xl shadow-2xs cursor-pointer transition-all ${
            filterStatus === "In Progress" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">⏳ In Progress</span>
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-black text-xs flex items-center justify-center">
              {tickets.filter((t) => t.status === "In Progress").length}
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {tickets.filter((t) => t.status === "In Progress").length} Under Repair
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Work actively being serviced</p>
        </div>

        <div 
          onClick={() => setFilterStatus("Resolved")}
          className={`p-5 bg-white border rounded-2xl shadow-2xs cursor-pointer transition-all ${
            filterStatus === "Resolved" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">✓ Resolved</span>
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
              {tickets.filter((t) => t.status === "Resolved").length}
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {tickets.filter((t) => t.status === "Resolved").length} Completed
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Fixed &amp; verified in database</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {["All", "New Requests", "In Progress", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {st === "All" ? `All Tickets (${tickets.length})` : st}
            </button>
          ))}
        </div>

        {/* Search Field & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenant or issue..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          {/* View Switcher Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-[#FF6B00] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#FF6B00] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Table Data View"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-white border border-slate-200 rounded-3xl">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Fetching live maintenance records from database...</p>
        </div>
      ) : (
        <>
          {/* VIEW MODE 1: 3 Columns Workflow Kanban Board */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-150">
              {columns.map((col) => {
                const colTickets = filteredTickets.filter((t) => t.status === col);
                return (
                  <div key={col} className="bg-slate-100/90 border border-slate-200 rounded-3xl p-5 space-y-4 min-h-[480px]">
                    
                    {/* Column Header */}
                    <div className="flex items-center justify-between font-extrabold text-xs text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          col === "New Requests" ? "bg-amber-500" : col === "In Progress" ? "bg-blue-500" : "bg-emerald-500"
                        }`} />
                        <span>{col}</span>
                      </div>

                      <span className="w-6 h-6 rounded-full bg-white text-slate-900 font-black text-[11px] flex items-center justify-center shadow-2xs border border-slate-200">
                        {colTickets.length}
                      </span>
                    </div>

                    {/* Tickets Cards List */}
                    <div className="space-y-3">
                      {colTickets.length === 0 ? (
                        <div className="p-8 text-center bg-white/60 border border-dashed border-slate-200 rounded-2xl">
                          <span className="text-xs font-bold text-slate-400">No {col.toLowerCase()} tickets.</span>
                        </div>
                      ) : (
                        colTickets.map((t) => (
                          <div
                            key={t.realId || t.id}
                            className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 transition-all hover:shadow-md relative group"
                          >
                            {/* Ticket Top Meta */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {t.id}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  t.priority === "High"
                                    ? "bg-rose-100 text-rose-800"
                                    : t.priority === "Medium"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                                  {t.priority}
                                </span>

                                <button
                                  onClick={() => handleDeleteTicket(t.realId, t.id)}
                                  title="Delete Ticket"
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Issue Description */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{t.issue}</h4>
                                {t.category && (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[9px] rounded">
                                    {t.category}
                                  </span>
                                )}
                              </div>
                              {t.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>
                              )}
                            </div>

                            {/* Resident & Unit */}
                            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5 text-xs">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>{t.tenant}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium pl-5">
                                {t.unit} • {t.property}
                              </div>
                            </div>

                            {/* Footer & Status Actions */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-slate-400 font-medium">{t.date}</span>

                              {col === "New Requests" && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(t.realId, "In Progress")}
                                  className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-white" />
                                  <span>Start Work</span>
                                </button>
                              )}

                              {col === "In Progress" && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(t.realId, "Resolved")}
                                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark Resolved</span>
                                </button>
                              )}

                              {col === "Resolved" && (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-lg flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Resolved ✓</span>
                                </span>
                              )}
                            </div>

                          </div>
                        ))
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: Full Data Table View */}
          {viewMode === "table" && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4 font-sans animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-slate-900 text-sm">Maintenance Data Ledger</span>
                <span className="text-xs font-bold text-slate-500">{filteredTickets.length} Tickets Filtered</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                      <th className="pb-3 px-3">Ticket ID</th>
                      <th className="pb-3 px-3">Issue Summary &amp; Category</th>
                      <th className="pb-3 px-3">Resident &amp; Location</th>
                      <th className="pb-3 px-3">Priority</th>
                      <th className="pb-3 px-3">Date Reported</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTickets.map((t) => (
                      <tr key={t.realId || t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-800">{t.id}</td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{t.issue}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {t.category || "General Repair"}
                            </span>
                            {t.description && <span className="truncate max-w-xs">{t.description}</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{t.tenant}</div>
                          <div className="text-[11px] text-slate-500">{t.unit} • {t.property}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            t.priority === "High" ? "bg-rose-100 text-rose-800" : t.priority === "Medium" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 font-semibold">{t.date}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                            t.status === "New Requests" ? "bg-amber-100 text-amber-800" : t.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {t.status === "New Requests" && (
                              <button
                                onClick={() => handleStatusChange(t.realId, "In Progress")}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] transition-all cursor-pointer"
                              >
                                Start Work
                              </button>
                            )}
                            {t.status === "In Progress" && (
                              <button
                                onClick={() => handleStatusChange(t.realId, "Resolved")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] transition-all cursor-pointer"
                              >
                                Mark Resolved
                              </button>
                            )}
                            {t.status === "Resolved" && (
                              <span className="text-emerald-600 font-extrabold text-[11px]">Completed ✓</span>
                            )}

                            <button
                              onClick={() => handleDeleteTicket(t.realId, t.id)}
                              title="Delete Ticket"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE MAINTENANCE TICKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">Report Maintenance Issue</h3>
                  <p className="text-xs text-slate-500 mt-1">Logs directly to PostgreSQL database under New Requests</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Property Dropdown (Cascading Step 1) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">1. Select Property *</label>
                <div className="relative">
                  <select
                    required
                    value={selectedPropertyId}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer appearance-none pr-9"
                  >
                    <option value="">-- Select Property --</option>
                    {propertiesList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Floor & 3. Room/Unit Cascading Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">2. Select Floor *</label>
                  <div className="relative">
                    <select
                      required
                      disabled={!selectedPropertyId}
                      value={selectedFloor}
                      onChange={(e) => handleFloorChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer appearance-none pr-9 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!selectedPropertyId ? "-- Select Property First --" : "-- Select Floor --"}
                      </option>
                      {availableFloors.map((fl) => (
                        <option key={fl} value={fl}>Floor {fl}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">3. Select Room / Unit *</label>
                  <div className="relative">
                    <select
                      required
                      disabled={!selectedFloor || loadingUnits}
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer appearance-none pr-9 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loadingUnits
                          ? "Loading units..."
                          : !selectedFloor
                          ? "-- Select Floor First --"
                          : filteredUnitsForFloor.length === 0
                          ? "-- No units on this floor --"
                          : "-- Select Unit --"}
                      </option>
                      {filteredUnitsForFloor.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unitNumber} {u.isOccupied ? "(Occupied)" : "(Vacant)"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Submitter Tenant Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Submitter Resident / Logged By</label>
                <div className="relative">
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer appearance-none pr-9"
                  >
                    <option value="">Admin / Property Staff</option>
                    {filteredTenantsForUnit.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} {t.unit?.unitNumber ? `(${t.unit.unitNumber})` : ""}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Maintenance Issue Summary *</label>
                <input
                  type="text"
                  required
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder="e.g. Bathroom Faucet Leaking or Air Filter Replacement"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <div className="relative">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer appearance-none pr-9"
                    >
                      <option value="General Repair">General Repair</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="HVAC / AC">HVAC / AC</option>
                      <option value="Appliance">Appliance</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Housekeeping / Cleaning">Housekeeping / Cleaning</option>
                      <option value="Pest Control">Pest Control</option>
                      <option value="Security / Locks">Security / Locks</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Priority Level</label>
                  <div className="relative">
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer appearance-none pr-9"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Issue Description &amp; Notes</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide additional details about the repair needed..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
