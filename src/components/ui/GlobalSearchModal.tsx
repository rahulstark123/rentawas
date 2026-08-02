"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Building2, 
  Users, 
  Wrench, 
  Plus, 
  ArrowRight, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  X, 
  Command,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Properties" | "Tenants" | "Maintenance" | "Quick Actions";
  href?: string;
  action?: () => void;
  icon: any;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real database records when modal is opened
  useEffect(() => {
    if (!isOpen) return;

    const fetchSearchData = async () => {
      setLoading(true);
      try {
        const [propRes, tenantRes, maintRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/tenants"),
          fetch("/api/maintenance"),
        ]);

        if (propRes.ok) {
          const propJson = await propRes.json();
          setProperties(propJson.data || []);
        }
        if (tenantRes.ok) {
          const tenantJson = await tenantRes.json();
          setTenants(tenantJson.data || []);
        }
        if (maintRes.ok) {
          const maintJson = await maintRes.json();
          setTickets(maintJson.data || []);
        }
      } catch (err) {
        console.warn("Could not fetch global search data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchData();
  }, [isOpen]);

  // Auto focus on input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Real Database Search Index
  const searchIndex: SearchResultItem[] = [
    // 1. Quick Actions
    {
      id: "qa1",
      title: "Add New Property",
      subtitle: "Create a new building tower, floors, and room allocation",
      category: "Quick Actions",
      href: "/dashboard/properties",
      icon: Plus,
    },
    {
      id: "qa2",
      title: "Rent Payments Ledger",
      subtitle: "View collections, bank disbursals, and payment transactions",
      category: "Quick Actions",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
    {
      id: "qa3",
      title: "Template Documents Architect",
      subtitle: "Draft legally binding lease agreements & notices",
      category: "Quick Actions",
      href: "/dashboard/leases",
      icon: FileText,
    },
    {
      id: "qa4",
      title: "Portfolio Yield & Financial Analytics",
      subtitle: "View Net Operating Income and real-time telemetry",
      category: "Quick Actions",
      href: "/dashboard/analytics",
      icon: TrendingUp,
    },

    // 2. Real Database Properties
    ...properties.map((p) => ({
      id: `prop-${p.id}`,
      title: p.name,
      subtitle: `${p.address || "Property"} • ${p.totalUnits || p.units?.length || 0} Units`,
      category: "Properties" as const,
      href: `/dashboard/properties/${p.id}`,
      icon: Building2,
    })),

    // 3. Real Database Tenants
    ...tenants.map((t) => ({
      id: `tenant-${t.id}`,
      title: t.name,
      subtitle: `Tenant • ${t.email || t.phone || "Active Resident"}`,
      category: "Tenants" as const,
      href: `/dashboard/tenants`,
      icon: Users,
    })),

    // 4. Real Database Maintenance Tickets
    ...tickets.map((m) => ({
      id: `maint-${m.id}`,
      title: `${m.ticketCode || "TCK"}: ${m.title || m.issue || "Maintenance Ticket"}`,
      subtitle: `Status: ${m.status || "Pending"} • Priority: ${m.priority || "Normal"}`,
      category: "Maintenance" as const,
      href: `/dashboard/maintenance`,
      icon: Wrench,
    })),
  ];

  const filteredResults = searchIndex.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const categories: ("Quick Actions" | "Properties" | "Tenants" | "Maintenance")[] = [
    "Quick Actions",
    "Properties",
    "Tenants",
    "Maintenance",
  ];

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 z-50 animate-in fade-in duration-150">
      
      {/* Search Modal Dialog Card */}
      <div 
        className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden font-sans flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-[#FF6B00] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search properties, tenants, units, maintenance or quick actions..."
            className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-200/70 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0">
            <span>ESC</span>
          </div>
        </div>

        {/* Results Body List */}
        <div className="overflow-y-auto custom-scrollbar p-3 space-y-4 flex-1">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <p className="font-bold text-slate-700">No matching results found for "{query}"</p>
              <p className="text-[11px]">Try searching for property names, unit numbers, or tenant names.</p>
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredResults.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {cat}
                  </div>

                  <div className="space-y-1">
                    {catItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="px-3.5 py-2.5 rounded-2xl hover:bg-orange-50/80 hover:border-orange-200 border border-transparent flex items-center justify-between group cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-[#FF6B00] text-slate-600 group-hover:text-white transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF6B00] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold px-4">
          <div className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-slate-500" />
            <span>RentAwas Global Command Search</span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-slate-700 shadow-2xs">Ctrl / ⌘ K</kbd> to toggle anytime</span>
          </div>
        </div>

      </div>
    </div>
  );
}
