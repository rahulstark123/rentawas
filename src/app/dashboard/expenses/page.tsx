"use client";

import { useState } from "react";
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
}

export default function PropertyExpensesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PropertyExpenseItem | null>(null);

  // Form states
  const [targetProperty, setTargetProperty] = useState("The Regent - Wing A");
  const [targetUnit, setTargetUnit] = useState("Unit 304");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [category, setCategory] = useState("Maintenance & Repairs");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("2026-07-24");
  const [vendor, setVendor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Autopilot Corporate ACH");
  const [attachedFile, setAttachedFile] = useState<string | null>("invoice_hvac_repair_jul26.pdf");

  const [expensesList, setExpensesList] = useState<PropertyExpenseItem[]>([
    {
      id: "EXP-901",
      property: "The Regent - Wing A",
      unit: "Unit 304",
      title: "New Commercial HVAC Compressor Replacement",
      category: "Maintenance & Repairs",
      amount: "$1,450",
      numericAmount: 1450,
      date: "2026-07-24",
      vendor: "Seattle HVAC Specialists LLC",
      paymentMethod: "Autopilot Corporate ACH",
      receiptName: "receipt_hvac_compressor_jul26.pdf",
      receiptType: "pdf",
      status: "Verified & Paid",
    },
    {
      id: "EXP-902",
      property: "Downtown Horizon Suites",
      unit: "Suite 104",
      title: "Elevator Hydraulic Motor Annual Servicing & Oil Flush",
      category: "Capital Expenditure (CapEx)",
      amount: "$3,800",
      numericAmount: 3800,
      date: "2026-07-20",
      vendor: "Otis Elevator Co.",
      paymentMethod: "Corporate Wire Transfer",
      receiptName: "otis_elevator_service_bill.pdf",
      receiptType: "pdf",
      status: "Verified & Paid",
    },
    {
      id: "EXP-903",
      property: "The Regent - Wing A",
      unit: "Unit 102",
      title: "Kitchen Plumbing Faucet & Drainage Pipe Replacement",
      category: "Maintenance & Repairs",
      amount: "$420",
      numericAmount: 420,
      date: "2026-07-18",
      vendor: "QuickPlumb Pro Co.",
      paymentMethod: "Credit Card",
      receiptName: "plumbing_repair_receipt.jpg",
      receiptType: "image",
      status: "Verified & Paid",
    },
    {
      id: "EXP-904",
      property: "Oakwood Executive Residency",
      unit: "General Building",
      title: "Annual Municipal Fire Safety & Alarm System Inspection",
      category: "Property Insurance & Legal",
      amount: "$1,200",
      numericAmount: 1200,
      date: "2026-07-15",
      vendor: "Seattle Municipal Fire Safety",
      paymentMethod: "Autopilot Corporate ACH",
      receiptName: "fire_safety_cert_invoice.pdf",
      receiptType: "pdf",
      status: "Verified & Paid",
    },
    {
      id: "EXP-905",
      property: "Skyline Manor",
      unit: "Unit 201",
      title: "Smart Digital Door Lock Replacement & Hub Pairing",
      category: "Maintenance & Repairs",
      amount: "$350",
      numericAmount: 350,
      date: "2026-07-10",
      vendor: "August Smart Lock Tech",
      paymentMethod: "Credit Card",
      receiptName: "smartlock_invoice_201.pdf",
      receiptType: "pdf",
      status: "Verified & Paid",
    },
  ]);

  const totalYtdExpenses = expensesList.reduce((acc, curr) => acc + curr.numericAmount, 0);

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

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !amount) return;

    const numAmt = Number(amount) || 0;
    const newExpense: PropertyExpenseItem = {
      id: `EXP-${Math.floor(900 + Math.random() * 90)}`,
      property: targetProperty,
      unit: targetUnit,
      title: expenseTitle,
      category,
      amount: `$${numAmt.toLocaleString()}`,
      numericAmount: numAmt,
      date: expenseDate,
      vendor: vendor || "Local Vendor",
      paymentMethod,
      receiptName: attachedFile || "property_receipt_attached.pdf",
      receiptType: attachedFile?.endsWith(".jpg") || attachedFile?.endsWith(".png") ? "image" : "pdf",
      status: "Verified & Paid",
    };

    setExpensesList([newExpense, ...expensesList]);
    toast(`Expense of $${numAmt} recorded for ${targetProperty} (${targetUnit})!`, "success");
    setExpenseTitle("");
    setAmount("");
    setVendor("");
    setShowAddModal(false);
  };

  const handleDeleteExpense = (id: string, title: string) => {
    setExpensesList(expensesList.filter((e) => e.id !== id));
    toast(`Expense record "${title}" removed.`, "info");
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
            <div className="text-xs text-slate-500 font-medium mt-0.5">Across 4 Building Portfolios</div>
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
            <div className="text-2xl font-black text-slate-900">$5,670</div>
            <div className="text-xs text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <span>-4.2% below budget</span>
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
            <div className="text-2xl font-black text-emerald-600">100% Verified</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">All bills uploaded & audited</div>
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
            <div className="text-xl font-black text-slate-900">Maintenance & CapEx</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">HVAC & Plumbing Repairs</div>
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
                <option value="The Regent - Wing A">The Regent - Wing A</option>
                <option value="Downtown Horizon Suites">Downtown Horizon Suites</option>
                <option value="Oakwood Executive Residency">Oakwood Executive Residency</option>
                <option value="Skyline Manor">Skyline Manor</option>
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
              {filteredExpenses.map((exp) => (
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
                      onClick={() => handleDeleteExpense(exp.id, exp.title)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Expense Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------- MODAL: RECORD NEW EXPENSE MODAL ------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleAddExpense}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Target Property</label>
                  <div className="relative">
                    <select
                      value={targetProperty}
                      onChange={(e) => setTargetProperty(e.target.value)}
                      className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="The Regent - Wing A">The Regent - Wing A</option>
                      <option value="Downtown Horizon Suites">Downtown Horizon Suites</option>
                      <option value="Oakwood Executive Residency">Oakwood Executive Residency</option>
                      <option value="Skyline Manor">Skyline Manor</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Unit / Building</label>
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="e.g. Unit 304 or General"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
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
                      <option value="Utilities (Water/Gas/Electric)">Utilities (Water/Gas/Electric)</option>
                      <option value="Janitorial & Landscaping">Janitorial & Landscaping</option>
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
                      className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Autopilot Corporate ACH">Autopilot Corporate ACH</option>
                      <option value="Corporate Credit Card">Corporate Credit Card</option>
                      <option value="Corporate Wire Transfer">Corporate Wire Transfer</option>
                      <option value="Petty Cash">Petty Cash</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Bill / Receipt Attachment Dropzone */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Attach Invoice / Bill Receipt</label>
                <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                  <Upload className="w-6 h-6 text-[#FF6B00] mx-auto" />
                  <div className="text-xs font-bold text-slate-800">
                    {attachedFile ? `Attached: ${attachedFile}` : "Drag & Drop Invoice PDF or Photo Receipt"}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile("uploaded_receipt_invoice.pdf");
                      toast("Bill receipt attached to expense record!", "success");
                    }}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs cursor-pointer"
                  >
                    Select File
                  </button>
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
