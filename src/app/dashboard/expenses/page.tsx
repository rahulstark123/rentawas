"use client";

import { useState, useEffect } from "react";
import { 
  Receipt, 
  Plus, 
  Building2, 
  DollarSign, 
  Calendar, 
  Paperclip, 
  FileText, 
  Search, 
  Filter, 
  X, 
  Upload, 
  CheckCircle2, 
  Eye, 
  Download, 
  Trash2,
  ChevronDown,
  ShieldCheck,
  TrendingDown,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface PropertyExpenseItem {
  id: string;
  property: string;
  unit: string;
  title: string;
  category: string;
  amount: string;
  numericAmount: number;
  date: string;
  vendor: string;
  paymentMethod: string;
  receiptName: string;
  receiptType: "pdf" | "image";
  status: "Verified & Paid" | "Pending Audit";
  realId?: string;
}

export default function PropertyExpensesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PropertyExpenseItem | null>(null);

  // Cascading Location Dropdowns State (Property -> Floor -> Unit)
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [propertyUnits, setPropertyUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Form states
  const [targetProperty, setTargetProperty] = useState("The Regent - Wing A");
  const [targetUnit, setTargetUnit] = useState("Unit 304");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [category, setCategory] = useState("Maintenance & Repairs");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("2026-07-24");
  const [vendor, setVendor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Wire / ACH Transfer");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [expensesList, setExpensesList] = useState<PropertyExpenseItem[]>([]);

  // Fetch live expenses from PostgreSQL database
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/expenses?wid=1");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const formatted: PropertyExpenseItem[] = json.data.map((item: any) => {
            const propName = item.property?.name && item.property.name.length > 2 ? item.property.name : "The Regent - Wing A";
            const unitNo = item.unit?.unitNumber || "General Building";
            const numAmt = item.amount || 0;

            return {
              id: item.expenseNumber || `EXP-${item.id.slice(-3)}`,
              realId: item.id,
              property: propName,
              unit: unitNo,
              title: item.title,
              category: item.category || "Maintenance & Repairs",
              amount: `$${numAmt.toLocaleString()}`,
              numericAmount: numAmt,
              date: item.date ? new Date(item.date).toISOString().split("T")[0] : "2026-07-24",
              vendor: item.vendor || "Local Vendor",
              paymentMethod: item.paymentMethod || "Bank Wire / ACH Transfer",
              receiptName: item.receiptName || "invoice_receipt.pdf",
              receiptType: item.receiptName?.endsWith(".jpg") || item.receiptName?.endsWith(".png") ? "image" : "pdf",
              status: (item.status as any) || "Verified & Paid",
            };
          });
          setExpensesList(formatted);
        }
      }
    } catch (err) {
      console.warn("Could not fetch expenses from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Fetch live properties list from API
  useEffect(() => {
    fetch("/api/properties?wid=1")
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setPropertiesList(json.data);
        } else {
          setPropertiesList([
            { id: "prop-regent", name: "The Regent - Wing A", totalFloors: 5 },
            { id: "prop-horizon", name: "Downtown Horizon Suites", totalFloors: 4 },
            { id: "prop-oakwood", name: "Oakwood Executive Residency", totalFloors: 3 },
            { id: "prop-skyline", name: "Skyline Manor", totalFloors: 4 },
          ]);
        }
      })
      .catch(() => {
        setPropertiesList([
          { id: "prop-regent", name: "The Regent - Wing A", totalFloors: 5 },
          { id: "prop-horizon", name: "Downtown Horizon Suites", totalFloors: 4 },
          { id: "prop-oakwood", name: "Oakwood Executive Residency", totalFloors: 3 },
          { id: "prop-skyline", name: "Skyline Manor", totalFloors: 4 },
        ]);
      });
  }, []);

  const handlePropertyChange = async (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedFloor("");
    setSelectedUnitId("");
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

    // Fallback units for all floors
    const fallbackUnits: any[] = [];
    for (let f = 1; f <= 5; f++) {
      fallbackUnits.push(
        { id: `${propertyId}-u${f}01`, unitNumber: `Unit ${f}01`, floorNumber: f },
        { id: `${propertyId}-u${f}02`, unitNumber: `Unit ${f}02`, floorNumber: f },
        { id: `${propertyId}-u${f}03`, unitNumber: `Unit ${f}03`, floorNumber: f }
      );
    }
    setPropertyUnits(fallbackUnits);
    setLoadingUnits(false);
  };

  const handleFloorChange = (floorStr: string) => {
    setSelectedFloor(floorStr);
    setSelectedUnitId("");
  };

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

  const totalYtdExpenses = expensesList.reduce((acc, curr) => acc + curr.numericAmount, 0);
  const thisMonthExpenses = expensesList
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, curr) => acc + curr.numericAmount, 0);

  const totalWithReceipts = expensesList.filter((e) => e.receiptName && e.receiptName.trim()).length;
  const receiptPercentage = expensesList.length > 0 ? Math.round((totalWithReceipts / expensesList.length) * 100) : 0;

  // Find top category by spending amount
  const categoryTotals: Record<string, number> = {};
  expensesList.forEach((e) => {
    const cat = e.category || "General Repair";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + e.numericAmount;
  });

  let topCategory = "No Expenses Yet";
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, sum]) => {
    if (sum > topCategoryAmount) {
      topCategoryAmount = sum;
      topCategory = cat;
    }
  });

  const uniquePropertiesCount = new Set(expensesList.map((e) => e.property)).size;

  const filteredExpenses = expensesList.filter((e) => {
    if (selectedPropertyFilter !== "all" && e.property !== selectedPropertyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.unit.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !amount) return;

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: expenseTitle,
          category,
          amount: parseFloat(amount),
          date: expenseDate,
          vendor: vendor || "Local Vendor",
          paymentMethod,
          receiptName: attachedFile || "property_receipt_attached.pdf",
          propertyId: selectedPropertyId || null,
          unitId: selectedUnitId || null,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        toast(json.message || `Expense recorded successfully!`, "success");
        fetchExpenses();
      } else {
        toast("Failed to save expense record", "error");
      }
    } catch (err) {
      toast("Failed to save expense record", "error");
    }

    setShowAddModal(false);
    setSelectedPropertyId("");
    setSelectedFloor("");
    setSelectedUnitId("");
    setExpenseTitle("");
    setAmount("");
    setVendor("");
    setAttachedFile(null);
  };

  const handleDeleteExpense = async (exp: PropertyExpenseItem) => {
    const targetId = exp.realId || exp.id;
    try {
      const res = await fetch(`/api/expenses/${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast(`Expense record "${exp.title}" deleted!`, "info");
        fetchExpenses();
      } else {
        setExpensesList((prev) => prev.filter((e) => e.id !== exp.id && e.realId !== targetId));
        toast(`Expense record removed!`, "info");
      }
    } catch {
      setExpensesList((prev) => prev.filter((e) => e.id !== exp.id && e.realId !== targetId));
      toast(`Expense record removed!`, "info");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Property Expenses & Bill Receipts
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              <span>Bill Attachment Vault</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record property purchases, maintenance bills, CapEx outlays, and attached receipt invoices.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total YTD Portfolio Outlay</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">${totalYtdExpenses.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {uniquePropertiesCount > 0 ? `Across ${uniquePropertiesCount} Building ${uniquePropertiesCount === 1 ? "Portfolio" : "Portfolios"}` : "No recorded outlay yet"}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Month Outlay</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">${thisMonthExpenses.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <span>Current Month Outlay</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attached Bill Receipts</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Paperclip className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-600">{receiptPercentage}% Verified</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {expensesList.length > 0 ? `${totalWithReceipts} of ${expensesList.length} receipts attached` : "0 receipts uploaded"}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Cost Category</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-black text-slate-900 truncate">{topCategory}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {topCategoryAmount > 0 ? `$${topCategoryAmount.toLocaleString()} total spent` : "Record your first expense"}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses, vendors, bills, units..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-60">
              <select
                value={selectedPropertyFilter}
                onChange={(e) => setSelectedPropertyFilter(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
              >
                <option value="all">All Properties & Buildings</option>
                {propertiesList.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Expense ID</th>
                <th className="py-3 px-4">Property & Unit</th>
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-4">Vendor & Payee</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Bill Receipt</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <span className="font-extrabold text-slate-800 text-sm">No Property Expenses Recorded</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        No expense entries recorded in database. Click &ldquo;Record New Expense&rdquo; above to log purchases.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{exp.id}</td>
                  
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-900 block">{exp.property}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{exp.unit}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{exp.title}</span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block mt-0.5">
                      {exp.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 block">{exp.vendor}</span>
                    <span className="text-[10px] text-slate-400">{exp.paymentMethod}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">{exp.date}</td>

                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-900 text-sm block">{exp.amount}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setSelectedReceipt(exp)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#FF6B00] text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteExpense(exp)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Expense Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------- MODAL: RECORD NEW EXPENSE MODAL ------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleAddExpense}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl relative max-h-[88vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">Record Property Expense</h3>
                  <p className="text-xs text-slate-500 mt-1">Log property purchases & attach bill receipts.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setAttachedFile(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs overflow-y-auto max-h-[58vh] pr-1.5 custom-scrollbar grow">
              {/* 1. Select Property */}
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

              {/* 2. Select Floor & 3. Select Room/Unit */}
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
                          {u.unitNumber}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Expense Item / Title</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. New HVAC Compressor Replacement"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Expense Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                      <option value="Capital Expenditure (CapEx)">Capital Expenditure (CapEx)</option>
                      <option value="Property Insurance & Legal">Property Insurance & Legal</option>
                      <option value="Utilities (Water/Electricity/Gas)">Utilities (Water/Electricity/Gas)</option>
                      <option value="Janitorial, Cleaning & Hygiene">Janitorial, Cleaning & Hygiene</option>
                      <option value="Landscaping & Lawn Care">Landscaping & Lawn Care</option>
                      <option value="Property Taxes & Municipal Fees">Property Taxes & Municipal Fees</option>
                      <option value="Property Management Fees">Property Management Fees</option>
                      <option value="Pest Control & Extermination">Pest Control & Extermination</option>
                      <option value="Security Systems & Guarding">Security Systems & Guarding</option>
                      <option value="HVAC & Elevator Servicing">HVAC & Elevator Servicing</option>
                      <option value="Plumbing & Sewage Maintenance">Plumbing & Sewage Maintenance</option>
                      <option value="Painting, Flooring & Renovations">Painting, Flooring & Renovations</option>
                      <option value="Marketing & Tenant Acquisition">Marketing & Tenant Acquisition</option>
                      <option value="Internet, Cable & Wi-Fi Facilities">Internet, Cable & Wi-Fi Facilities</option>
                      <option value="Waste Management & Trash Removal">Waste Management & Trash Removal</option>
                      <option value="Software & Tech Platform Fees">Software & Tech Platform Fees</option>
                      <option value="General Building Supplies">General Building Supplies</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Expense Amount ($ / ₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1450"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Vendor / Contractor Name</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Seattle HVAC Specialists"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer pr-9"
                    >
                      <option value="Bank Wire / ACH Transfer">Bank Wire / ACH Transfer</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="Company Check / Cheque">Company Check / Cheque</option>
                      <option value="Cash / Petty Cash">Cash / Petty Cash</option>
                      <option value="NetBanking / UPI">NetBanking / UPI</option>
                      <option value="Corporate Credit Line">Corporate Credit Line</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Upload Bill / Receipt Attachment Dropzone */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Attach Invoice / Bill Receipt (Optional)</label>
                {attachedFile ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-extrabold text-slate-900 block truncate">{attachedFile}</span>
                        <span className="text-[10px] text-emerald-700 font-bold block">Bill Receipt Attached</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2 hover:bg-slate-100/70 transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">No bill receipt attached</span>
                      <span className="text-[10px] text-slate-400 block">Drag & drop or select PDF / photo receipt</span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs cursor-pointer">
                      <Paperclip className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Select Bill File</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAttachedFile(file.name);
                            toast(`Attached bill receipt: ${file.name}`, "success");
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
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
                <Plus className="w-4 h-4" />
                <span>Save Property Expense</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- BILL RECEIPT PREVIEW DRAWER ------------------- */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">Bill Receipt Preview</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedReceipt.receiptName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Document Simulation */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Vendor Invoice</span>
                  <span className="text-sm font-extrabold text-white">{selectedReceipt.vendor}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {selectedReceipt.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Expense Item:</span>
                  <span className="font-bold text-white">{selectedReceipt.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Property & Unit:</span>
                  <span className="font-bold text-white">{selectedReceipt.property} ({selectedReceipt.unit})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction Date:</span>
                  <span>{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                  <span className="font-bold text-white">Total Amount Billed:</span>
                  <span className="font-black text-orange-400">{selectedReceipt.amount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => toast(`Downloading ${selectedReceipt.receiptName}...`, "info")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Original PDF</span>
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer uppercase tracking-wider"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
