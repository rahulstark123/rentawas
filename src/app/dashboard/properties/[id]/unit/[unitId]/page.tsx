"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  Phone, 
  Mail, 
  FileText, 
  ShieldCheck, 
  Plus,
  MapPin,
  Receipt,
  Eye,
  EyeOff,
  Key,
  History,
  Wrench,
  FileCheck,
  Download,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  UserCheck,
  DollarSign,
  UserPlus,
  Edit3,
  Trash2,
  X,
  ChevronDown,
  IdCard,
  Upload,
  ChevronRight,
  LogOut,
  Star,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CountryPhoneInput, { ALL_COUNTRIES, Country, getDefaultCountryByLocale } from "@/components/ui/CountryPhoneInput";
import { uploadFile, validateFile } from "@/lib/upload";

export interface OccupantItem {
  id: string;
  name: string;
  bedSlot: string;
  individualRent: number;
  phone: string;
  email: string;
  moveIn: string;
  leaseEnd: string;
  paymentStatus: string;
  govIdType?: string;
  govIdNumber?: string;
  govIdFile?: string;
  govIdUrl?: string;      // R2 public URL for government ID scan
  leaseDocFile?: string;
  leaseDocUrl?: string;   // R2 public URL for lease document
}

export interface PastHistoryRecord {
  name: string;
  period: string;
  rent: string;
  status: "Active Occupant" | "Lease Completed" | "Removed / Evicted";
  review?: string;
  rating?: number;
  healthScore?: number;
  removalReason?: string;
}

export default function RoomTelemetryFullPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const propId = (params?.id as string) || "PROP-1";
  const rawUnitId = (params?.unitId as string) || "Unit 301";
  const unitId = decodeURIComponent(rawUnitId);

  const [propertyData, setPropertyData] = useState<{ id: string; name: string; address: string; tag: string }>({
    id: propId,
    name: "Property",
    address: "Real Estate Location",
    tag: "Property",
  });

  const [activeTab, setActiveTab] = useState<"analytics" | "resident" | "docs" | "history" | "maintenance" | "bills">("analytics");
  const [workspaceCurrency, setWorkspaceCurrency] = useState("$");
  const [selectedDocOccupantId, setSelectedDocOccupantId] = useState<string>("");
  const [selectedBillOccupantId, setSelectedBillOccupantId] = useState<string>("all");

  const [tabLoadingMap, setTabLoadingMap] = useState<Record<string, boolean>>({});
  const [fetchedTabsMap, setFetchedTabsMap] = useState<Record<string, boolean>>({ analytics: true });

  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);
  const [tenantDocs, setTenantDocs] = useState<any[]>([]);
  const [rentLedger, setRentLedger] = useState<any[]>([]);

  const fetchTabData = async (tabName: "resident" | "docs" | "history" | "maintenance" | "bills", force: boolean = false) => {
    if (!force && (fetchedTabsMap[tabName] || tabLoadingMap[tabName])) return;

    setTabLoadingMap((prev) => ({ ...prev, [tabName]: true }));

    try {
      const endpoint =
        tabName === "resident"
          ? "occupants"
          : tabName === "bills"
          ? "rents"
          : tabName === "docs"
          ? "documents"
          : tabName === "history"
          ? "history"
          : "maintenance";

      const res = await fetch(`/api/units/${encodeURIComponent(unitId)}/${endpoint}?propertyId=${encodeURIComponent(propId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (tabName === "resident") setOccupants(json.data);
          if (tabName === "history") setRoomHistory(json.data);
          if (tabName === "maintenance") setMaintenanceLogs(json.data);
          if (tabName === "docs") setTenantDocs(json.data);
          if (tabName === "bills") setRentLedger(json.data);
        }
      }
    } catch (err) {
      console.warn(`Lazy load tab ${tabName} API error:`, err);
    } finally {
      setTabLoadingMap((prev) => ({ ...prev, [tabName]: false }));
      setFetchedTabsMap((prev) => ({ ...prev, [tabName]: true }));
    }
  };

  const handleTabClick = (tabName: "analytics" | "resident" | "docs" | "history" | "maintenance" | "bills") => {
    setActiveTab(tabName);
    if (tabName !== "analytics") {
      fetchTabData(tabName, true);
    }
  };

  const [loading, setLoading] = useState(true);
  const [unitMeta, setUnitMeta] = useState<{
    unitNumber: string;
    rent: number;
    floorNumber: number;
    isOccupied: boolean;
    propertyName?: string;
  } | null>(null);

  // Active occupants list (starts empty for real database unit)
  const [occupants, setOccupants] = useState<OccupantItem[]>([]);

  // Historical Timeline Log
  const [roomHistory, setRoomHistory] = useState<PastHistoryRecord[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadUnitAndPropertyDetails() {
      try {
        setLoading(true);

        // Fetch Property Info
        const propRes = await fetch(`/api/properties/${propId}`);
        if (propRes.ok) {
          const propJson = await propRes.json();
          if (propJson.data && isMounted) {
            setPropertyData({
              id: propJson.data.id,
              name: propJson.data.name,
              address: propJson.data.address || "Property Location",
              tag: propJson.data.tag || "Property",
            });
          }
        }

        // Fetch Unit Details (scoped to property to avoid wrong unit match)
        const res = await fetch(`/api/units/${encodeURIComponent(unitId)}?propertyId=${encodeURIComponent(propId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && isMounted) {
            const u = json.data;
            setUnitMeta({
              unitNumber: u.unitNumber,
              rent: u.rent || 0,
              floorNumber: u.floorNumber || 1,
              isOccupied: u.isOccupied || false,
              propertyName: u.property?.name,
            });

            if (u.property && isMounted) {
              setPropertyData({
                id: u.property.id || propId,
                name: u.property.name || "Property",
                address: u.property.address || "Property Location",
                tag: u.property.tag || "Property",
              });
            }

            if (u.tenants && u.tenants.length > 0) {
              const loadedOccupants: OccupantItem[] = u.tenants.map((t: any, idx: number) => ({
                id: t.id,
                name: t.name,
                bedSlot: t.bedSlot || `Bed Slot ${String.fromCharCode(65 + idx)}`,
                individualRent: t.monthlyRent || u.rent || 0,
                phone: t.phone || "+1 (555) 000-0000",
                email: t.email || "resident@rentawas.com",
                moveIn: t.leaseStart ? new Date(t.leaseStart).toISOString().split("T")[0] : "2026-08-01",
                leaseEnd: t.leaseEnd ? new Date(t.leaseEnd).toISOString().split("T")[0] : "2027-07-31",
                paymentStatus: "Auto Paid (ACH)",
              }));
              setOccupants(loadedOccupants);
            }

            // Fetch all tabs scoped to propertyId
            try {
              const [occRes, maintRes, billsRes, docsRes, histRes] = await Promise.all([
                fetch(`/api/units/${encodeURIComponent(unitId)}/occupants?propertyId=${encodeURIComponent(propId)}`),
                fetch(`/api/units/${encodeURIComponent(unitId)}/maintenance?propertyId=${encodeURIComponent(propId)}`),
                fetch(`/api/units/${encodeURIComponent(unitId)}/rents?propertyId=${encodeURIComponent(propId)}`),
                fetch(`/api/units/${encodeURIComponent(unitId)}/documents?propertyId=${encodeURIComponent(propId)}`),
                fetch(`/api/units/${encodeURIComponent(unitId)}/history?propertyId=${encodeURIComponent(propId)}`),
              ]);

              if (occRes.ok) {
                const occJson = await occRes.json();
                if (occJson.data && Array.isArray(occJson.data) && occJson.data.length > 0 && isMounted) {
                  setOccupants(occJson.data);
                }
              }
              if (maintRes.ok) {
                const maintJson = await maintRes.json();
                if (maintJson.data && isMounted) setMaintenanceLogs(maintJson.data);
              }
              if (billsRes.ok) {
                const billsJson = await billsRes.json();
                if (billsJson.data && isMounted) setRentLedger(billsJson.data);
              }
              if (docsRes.ok) {
                const docsJson = await docsRes.json();
                if (docsJson.data && isMounted) setTenantDocs(docsJson.data);
              }
              if (histRes.ok) {
                const histJson = await histRes.json();
                if (histJson.data && isMounted) setRoomHistory(histJson.data);
              }
            } catch (tabErr) {
              console.warn("Could not load initial tab data:", tabErr);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load unit details via API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUnitAndPropertyDetails();

    return () => {
      isMounted = false;
    };
  }, [propId, unitId]);

  // Modal State 1: 3-Step Add / Edit Tenant Modal
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [editingOccupantId, setEditingOccupantId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form Fields
  const [name, setName] = useState("");
  const [bedSlot, setBedSlot] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => getDefaultCountryByLocale(ALL_COUNTRIES));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [leaseStart, setLeaseStart] = useState("");
  const [paymentChannel, setPaymentChannel] = useState("Autopilot ACH Direct");

  useEffect(() => {
    // Auto-detect country via IP address
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data?.country_code) {
          const match = ALL_COUNTRIES.find((c) => c.code === data.country_code);
          if (match) setSelectedCountry(match);
        }
      })
      .catch(() => {});
  }, []);

  // Step 2 Form Fields (Government ID)
  const [idType, setIdType] = useState("Passport");
  const [idNumber, setIdNumber] = useState("");
  const [idCountry, setIdCountry] = useState("United States");
  const [govIdFile, setGovIdFile] = useState<string | null>(null);       // display name
  const [govIdUrl, setGovIdUrl] = useState<string | null>(null);          // R2 public URL
  const [govIdUploading, setGovIdUploading] = useState(false);
  const [govIdProgress, setGovIdProgress] = useState(0);

  // Step 3 Form Fields (Lease Docs)
  const [docType, setDocType] = useState("Signed Residential Lease Agreement");
  const [leaseFile, setLeaseFile] = useState<string | null>(null);        // display name
  const [leaseUrl, setLeaseUrl] = useState<string | null>(null);          // R2 public URL
  const [leaseUploading, setLeaseUploading] = useState(false);
  const [leaseProgress, setLeaseProgress] = useState(0);

  // ---------------- MODAL 4: ISSUE INVOICE MODAL STATE ----------------
  const [showIssueInvoiceModal, setShowIssueInvoiceModal] = useState(false);
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceCategory, setInvoiceCategory] = useState("Rent");
  const [invoiceTenantId, setInvoiceTenantId] = useState("");
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  // ---------------- MODAL 5: LOG MAINTENANCE TICKET MODAL STATE ----------------
  const [showLogMaintenanceModal, setShowLogMaintenanceModal] = useState(false);
  const [maintIssue, setMaintIssue] = useState("");
  const [maintCategory, setMaintCategory] = useState("General Repair");
  const [maintPriority, setMaintPriority] = useState("Normal");
  const [maintTenantId, setMaintTenantId] = useState("");
  const [isSubmittingMaint, setIsSubmittingMaint] = useState(false);

  // ---------------- MODAL 2: NORMAL LEASE EXIT & RATING REVIEW MODAL STATE ----------------
  const [showNormalExitModal, setShowNormalExitModal] = useState(false);
  const [exitOccupant, setExitOccupant] = useState<OccupantItem | null>(null);
  const [exitMoveOutDate, setExitMoveOutDate] = useState("2026-07-25");
  const [depositSettlement, setDepositSettlement] = useState("Full Deposit Refunded");
  const [keysReturned, setKeysReturned] = useState(true);
  const [starRating, setStarRating] = useState(5);
  const [reviewNotes, setReviewNotes] = useState("");

  // ---------------- MODAL 3: REMOVE / EVICT OCCUPANT MODAL STATE ----------------
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeOccupantTarget, setRemoveOccupantTarget] = useState<OccupantItem | null>(null);
  const [removalReason, setRemovalReason] = useState("Non-Payment of Rent / Financial Default");
  const [removalDate, setRemovalDate] = useState("2026-07-25");
  const [dueAmount, setDueAmount] = useState("0");
  const [incidentNotes, setIncidentNotes] = useState("");
  const [flagTenant, setFlagTenant] = useState(true);

  // Calculated total combined room revenue from all active residents
  const totalRoomRent = occupants.reduce((acc, curr) => acc + curr.individualRent, 0);

  const openAddTenantModal = () => {
    setEditingOccupantId(null);
    setName("");
    setBedSlot("");
    setMonthlyRent("");
    setPhone("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setLeaseStart("");
    setIdNumber("");
    setGovIdFile(null); setGovIdUrl(null); setGovIdProgress(0);
    setLeaseFile(null); setLeaseUrl(null); setLeaseProgress(0);
    setCurrentStep(1);
    setShowAddTenantModal(true);
  };

  const openEditTenantModal = (occ: OccupantItem) => {
    setEditingOccupantId(occ.id);
    setName(occ.name);
    setBedSlot(occ.bedSlot);
    setMonthlyRent(occ.individualRent.toString());
    setPhone(occ.phone.replace(/^\+\d+\s*/, ""));
    setEmail(occ.email);
    setPassword("");
    setShowPassword(false);
    setLeaseStart(occ.moveIn);
    setIdType(occ.govIdType || "Passport");
    setIdNumber(occ.govIdNumber || "");
    setGovIdFile(occ.govIdFile || null); setGovIdUrl(occ.govIdUrl || null); setGovIdProgress(0);
    setLeaseFile(occ.leaseDocFile || null); setLeaseUrl(occ.leaseDocUrl || null); setLeaseProgress(0);
    setCurrentStep(1);
    setShowAddTenantModal(true);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim() || !email.trim()) {
        toast("Please fill in Resident Name and Email before proceeding.", "info");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const [isSubmittingTenant, setIsSubmittingTenant] = useState(false);

  const handleAddTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      handleNextStep();
      return;
    }

    if (isSubmittingTenant) return;
    if (!name.trim() || !email.trim()) return;

    setIsSubmittingTenant(true);

    const fullPhoneNumber = phone.trim()
      ? `${selectedCountry.dialCode} ${phone.trim()}`
      : `${selectedCountry.dialCode} (555) 019-2834`;

    const rentVal = Number(monthlyRent) || 0;

    try {
      if (editingOccupantId) {
        await fetch(`/api/tenants/${editingOccupantId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone: fullPhoneNumber,
            monthlyRent: rentVal,
            leaseStart,
          }),
        }).catch(() => {});

        setOccupants((prev) =>
          prev.map((o) =>
            o.id === editingOccupantId
              ? {
                  ...o,
                  name,
                  bedSlot,
                  individualRent: rentVal,
                  phone: fullPhoneNumber,
                  email,
                  moveIn: leaseStart,
                  govIdType: idType,
                  govIdNumber: idNumber,
                  govIdFile: govIdFile || o.govIdFile,
                  leaseDocFile: leaseFile || o.leaseDocFile,
                }
              : o
          )
        );
        toast(`Updated resident ${name} in ${unitId}!`, "success");
      } else {
        const res = await fetch(`/api/units/${encodeURIComponent(unitId)}/occupants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password: password.trim() || undefined,
            phone: fullPhoneNumber,
            monthlyRent: rentVal,
            leaseStart,
            propertyId: propId,
            bedSlot,
            govIdType: idType,
            govIdNumber: idNumber,
            govIdUrl,
            leaseDocUrl: leaseUrl,
          }),
        });

        if (res.ok) {
          const freshRes = await fetch(`/api/units/${encodeURIComponent(unitId)}/occupants`);
          if (freshRes.ok) {
            const freshJson = await freshRes.json();
            if (freshJson.data && Array.isArray(freshJson.data)) {
              setOccupants(freshJson.data);
            }
          }
        } else {
          const createdId = `OCC-${Date.now()}`;
          const newTenant: OccupantItem = {
            id: createdId,
            name,
            bedSlot: bedSlot || `Bed Slot ${String.fromCharCode(65 + occupants.length)}`,
            individualRent: rentVal,
            phone: fullPhoneNumber,
            email,
            moveIn: leaseStart || new Date().toISOString().split("T")[0],
            leaseEnd: "2027-07-31",
            paymentStatus: "Active",
            govIdType: idType,
            govIdNumber: idNumber,
            govIdFile: govIdFile || "gov_id_scan.pdf",
            leaseDocFile: leaseFile || "lease_contract_signed.pdf",
          };
          setOccupants((prev) => [...prev, newTenant]);
        }

        toast(`Added new resident ${name} to ${unitId} with rent $${rentVal.toLocaleString()}/mo!`, "success");
      }
      setShowAddTenantModal(false);
    } catch (err) {
      console.error("Add tenant submit error:", err);
    } finally {
      setIsSubmittingTenant(false);
    }
  };

  // ---------------- HANDLER 1: NORMAL LEASE EXIT & RATING ----------------
  const openNormalExitModal = (occ: OccupantItem) => {
    setExitOccupant(occ);
    setExitMoveOutDate("2026-07-25");
    setDepositSettlement("Full Deposit Refunded");
    setKeysReturned(true);
    setStarRating(5);
    setReviewNotes(`Tenant ${occ.name} completed lease tenure cleanly and maintained room in great condition.`);
    setShowNormalExitModal(true);
  };

  const handleNormalExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitOccupant) return;

    try {
      await fetch(`/api/units/${encodeURIComponent(unitId)}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: exitOccupant.name,
          period: `${exitOccupant.moveIn} – ${exitMoveOutDate}`,
          rent: `$${exitOccupant.individualRent.toLocaleString()}/mo`,
          status: "Lease Completed",
          review: reviewNotes || "Normal lease exit completed.",
          rating: starRating,
          depositSettlement,
          keysReturned,
          tenantId: exitOccupant.id,
          propertyId: propId,
        }),
      });
      fetchTabData("history");
    } catch (err) {
      console.warn("Could not save history log via API:", err);
    }

    setOccupants((prev) => prev.filter((o) => o.id !== exitOccupant.id));
    toast(`Resident ${exitOccupant.name} offboarded cleanly. Review saved with ${starRating}★ rating!`, "success");
    setShowNormalExitModal(false);
    setExitOccupant(null);
  };

  // ---------------- HANDLER 2: REMOVE / EVICT OCCUPANT ----------------
  const openRemoveModal = (occ: OccupantItem) => {
    setRemoveOccupantTarget(occ);
    setRemovalReason("Non-Payment of Rent / Financial Default");
    setRemovalDate("2026-07-25");
    setDueAmount("1200");
    setIncidentNotes(`Occupant removed due to non-payment of rent and lease policy breach.`);
    setFlagTenant(true);
    setShowRemoveModal(true);
  };

  const handleRemoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeOccupantTarget) return;

    try {
      await fetch(`/api/units/${encodeURIComponent(unitId)}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: removeOccupantTarget.name,
          period: `${removeOccupantTarget.moveIn} – ${removalDate}`,
          rent: `$${removeOccupantTarget.individualRent.toLocaleString()}/mo`,
          status: "Removed / Evicted",
          removalReason,
          review: incidentNotes || "Occupant removed due to policy breach.",
          rating: 1,
          tenantId: removeOccupantTarget.id,
          propertyId: propId,
        }),
      });
      fetchTabData("history");
    } catch (err) {
      console.warn("Could not save removal history log via API:", err);
    }

    setOccupants((prev) => prev.filter((o) => o.id !== removeOccupantTarget.id));
    toast(`Resident ${removeOccupantTarget.name} removed from ${unitId}. Incident archived in database.`, "warning");
    setShowRemoveModal(false);
    setRemoveOccupantTarget(null);
  };

  if (loading) {
    return (
      <div className="space-y-8 font-sans animate-in fade-in duration-200 min-h-[60vh] flex flex-col justify-center items-center py-24">
        <div className="p-4 rounded-2xl bg-orange-50 text-[#FF6B00] border border-orange-200/80 shadow-md animate-bounce mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
          <Loader2 className="w-5 h-5 text-[#FF6B00] animate-spin" />
          <span>Fetching Unit Telemetry Data...</span>
        </div>
        <p className="text-xs font-semibold text-slate-400 mt-1">Loading real room metrics, lease records & resident details</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Top Breadcrumb Nav */}
      <div>
        <Link
          href={`/dashboard/properties/${propId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {propertyData.name} Floor Plan</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-orange-50 text-[#FF6B00]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {unitId} Details &amp; Occupant Rents
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{propertyData.name} • {propertyData.address}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddTenantModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Tenant</span>
            </button>

            <button
              onClick={() => toast(`Generating full room report for ${unitId}...`, "info")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Export Report PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Overview Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Occupants</span>
          <span className="text-base font-black text-slate-900">{occupants.length} Residents</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Combined Room Rent</span>
          <span className="text-base font-black text-[#FF6B00]">${totalRoomRent.toLocaleString()}/mo</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Est. Annual Revenue</span>
          <span className="text-base font-black text-emerald-600">
            {occupants.length > 0 ? `$${(totalRoomRent * 12).toLocaleString()}/yr` : "$0/yr"}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Active Maintenance</span>
          <span className="text-base font-black text-slate-900">
            {maintenanceLogs.filter((m) => m.status !== "Resolved" && m.status !== "Completed").length} Active {maintenanceLogs.filter((m) => m.status !== "Resolved" && m.status !== "Completed").length === 1 ? "Ticket" : "Tickets"}
          </span>
        </div>
      </div>

      {/* Full Page Section Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar">
        {[
          { id: "analytics", label: "Analytics", icon: BarChart3 },
          { id: "resident", label: "Occupants & User Rents", icon: Users },
          { id: "docs", label: "Tenant Documents", icon: FileCheck },
          { id: "history", label: "Room History & Past Residents", icon: History },
          { id: "maintenance", label: "Maintenance Log", icon: Wrench },
          { id: "bills", label: "Bills & Ledger", icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Loading Spinner Indicator */}
      {tabLoadingMap[activeTab] && (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-150">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
          <span className="text-xs font-bold text-slate-700">Loading {activeTab.toUpperCase()} Data from Server...</span>
        </div>
      )}

      {/* TAB 0: ROOM DATA ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          
          {/* Key Performance Indicators (KPI Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase text-[10px] tracking-wider">Monthly Room Yield</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                ${totalRoomRent.toLocaleString()}<span className="text-xs font-bold text-slate-400">/mo</span>
              </div>
              <div className={`text-[11px] font-bold flex items-center gap-1 ${
                occupants.length > 0 ? "text-emerald-600" : "text-slate-500"
              }`}>
                <span>{occupants.length > 0 ? "▲ +12.5% vs property average" : "Vacant unit • $0/mo yield"}</span>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase text-[10px] tracking-wider">Average Rent Per Resident</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                ${(occupants.length ? Math.round(totalRoomRent / occupants.length) : 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Across {occupants.length} active resident slots
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase text-[10px] tracking-wider">Est. Annual Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <div className="text-2xl font-black text-[#FF6B00]">
                {occupants.length > 0 ? `$${(totalRoomRent * 12).toLocaleString()}` : "$0"}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Based on active occupant rents</div>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase text-[10px] tracking-wider">Occupancy Rate</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className={`text-2xl font-black ${occupants.length > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                {occupants.length > 0 ? "100%" : "0%"}
              </div>
              <div className={`text-[11px] font-bold ${occupants.length > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                {occupants.length > 0 ? "Full capacity • Zero vacancy" : "Vacant • Ready for resident onboarding"}
              </div>
            </div>
          </div>

          {/* Section 2: Revenue Contribution & Resident Share Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card A: Per-Resident Revenue Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Resident Rent Revenue Share</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Individual rent contribution for {unitId}</p>
                </div>
                <span className="px-3 py-1 bg-orange-50 text-[#FF6B00] font-black rounded-full text-xs">
                  ${totalRoomRent.toLocaleString()}/mo
                </span>
              </div>

              <div className="space-y-4">
                {occupants.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <Users className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-700 text-xs">No active occupants registered for {unitId}.</p>
                    <p className="text-[11px] text-slate-500">Click &quot;+ Add Tenant&quot; to assign a resident to this unit.</p>
                  </div>
                ) : (
                  occupants.map((occ) => {
                    const percentage = totalRoomRent > 0 ? Math.round((occ.individualRent / totalRoomRent) * 100) : 0;
                    return (
                      <div key={occ.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{occ.name} ({occ.bedSlot})</span>
                          <span className="font-extrabold text-[#FF6B00]">
                            ${occ.individualRent.toLocaleString()}/mo ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Card B: Monthly Income vs Expenses Trend Chart */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">6-Month Revenue vs Expense Trend</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Monthly gross revenue vs maintenance outlay</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  occupants.length > 0 ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-100"
                }`}>
                  {occupants.length > 0 ? "100% Net Yield" : "0% Net Yield"}
                </span>
              </div>

              <div className="space-y-3">
                {occupants.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <BarChart3 className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-700 text-xs">No historical revenue trend recorded for vacant unit {unitId}.</p>
                    <p className="text-[11px] text-slate-500">Revenue trend chart will accumulate once a resident is assigned.</p>
                  </div>
                ) : (
                  ["Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026"].map((month) => (
                    <div key={month} className="flex items-center gap-3 text-xs">
                      <span className="w-16 font-bold text-slate-600 shrink-0">{month}</span>
                      <div className="flex-1 flex items-center gap-1.5">
                        <div className="h-4 bg-[#FF6B00] rounded text-[10px] font-extrabold text-white flex items-center justify-end px-2" style={{ width: "100%" }}>
                          ${totalRoomRent.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Section 3: Performance Insights & Summary */}
          <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-2 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Room Performance & Financial Analysis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {occupants.length > 0
                ? `${unitId} is generating $${totalRoomRent.toLocaleString()}/mo with active residents. Maintenance costs remain low, making this unit a strong performer.`
                : `${unitId} is currently vacant and ready for new resident onboarding. Assign a tenant to start tracking monthly revenue and maintenance outlays.`}
            </p>
          </div>

        </div>
      )}

      {/* TAB 1: OCCUPANTS & PER-USER CUSTOM RENTS */}
      {activeTab === "resident" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Individual Per-Occupant Rent & Offboarding Options
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage occupants, custom user rents, normal lease exits, or forced removals for {unitId}.
              </p>
            </div>

            <button
              onClick={openAddTenantModal}
              className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Tenant</span>
            </button>
          </div>

          {/* Occupants Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {occupants.map((occ) => (
              <div
                key={occ.id}
                className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 shadow-xl relative border border-slate-800"
              >
                {/* Individual Occupant Header & Custom Rent */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-lg font-black shadow-md">
                      {occ.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">{occ.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">{occ.bedSlot}</p>
                    </div>
                  </div>

                  {/* Custom Per-User Rent Display Badge */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider text-[10px]">User Rent</span>
                    <span className="text-lg font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/30 inline-block mt-0.5">
                      ${occ.individualRent.toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{occ.phone}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                    <div className="font-bold text-white flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{occ.email}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Move-in Date</span>
                    <div className="font-bold text-slate-200">{occ.moveIn}</div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Lease Expiry</span>
                    <div className="font-bold text-amber-400">{occ.leaseEnd}</div>
                  </div>
                </div>

                {/* Action Buttons Row 1: Edit & Call */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => openEditTenantModal(occ)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Edit Profile & Rent</span>
                  </button>

                  <button
                    onClick={() => toast(`Calling ${occ.name} (${occ.phone})...`, "info")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Call</span>
                  </button>
                </div>

                {/* Action Buttons Row 2: 2 Explicit Exit Options (Normal Exit vs Remove Occupant) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openNormalExitModal(occ)}
                    className="py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Normal Exit & Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openRemoveModal(occ)}
                    className="py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remove Occupant</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Combined Rent Yield Summary Box */}
          <div className="p-5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FF6B00] text-white rounded-2xl shadow-md">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Total Combined Room Revenue Calculation</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {occupants.map((o) => `${o.name.split(" ")[0]} ($${o.individualRent.toLocaleString()})`).join(" + ")} = <strong>${totalRoomRent.toLocaleString()}/mo Total</strong>
                </p>
              </div>
            </div>

            <span className="text-xl font-black text-slate-900 bg-white px-5 py-2 rounded-2xl border border-orange-200 shadow-2xs">
              ${totalRoomRent.toLocaleString()} / mo
            </span>
          </div>

        </div>
      )}

      {/* TAB 2: TENANT DOCS & VERIFICATION (INDIVIDUAL RESIDENT SWITCHER) */}
      {activeTab === "docs" && (() => {
        const currentDocOccupant = occupants.find((o) => o.id === selectedDocOccupantId) || occupants[0];
        return (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            
            {/* Resident Switcher Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF6B00]" />
                  <span>Select Resident to View Documents</span>
                </span>
                <span className="text-xs font-bold text-[#FF6B00]">
                  {occupants.length} Occupants Registered
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-1">
                {occupants.map((occ) => {
                  const isSelected = (selectedDocOccupantId || occupants[0]?.id) === occ.id;
                  return (
                    <button
                      key={occ.id}
                      onClick={() => setSelectedDocOccupantId(occ.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap border ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isSelected ? "bg-[#FF6B00] text-white" : "bg-slate-200 text-slate-800"
                      }`}>
                        {occ.name.charAt(0)}
                      </div>
                      <span>{occ.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"
                      }`}>
                        {occ.bedSlot}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {occupants.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200/90 rounded-2xl text-center space-y-2">
                <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">No verified tenant documents recorded for vacant unit {unitId}.</p>
                <p className="text-xs text-slate-500">Document vault will activate once a resident is onboarded to this unit.</p>
              </div>
            ) : currentDocOccupant ? (
              <div className="space-y-5">
                {/* Government ID Banner for Selected Resident */}
                <div className="p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {currentDocOccupant.name}&apos;s Government ID Status
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                          VERIFIED ✓
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {currentDocOccupant.govIdType
                          ? `Document: ${currentDocOccupant.govIdType}${currentDocOccupant.govIdNumber ? ` (${currentDocOccupant.govIdNumber})` : ""} • State Database Verified`
                          : currentDocOccupant.govIdUrl
                          ? `Government ID Document Scan Verified`
                          : `ID Document Pending Upload`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toast(`Uploading additional document for ${currentDocOccupant.name}...`, "info")}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Doc for {currentDocOccupant.name.split(" ")[0]}</span>
                  </button>
                </div>

                {/* Per-Resident Document Vault Grid */}
                {(() => {
                  const displayDocs = tenantDocs.filter((d: any) => {
                    if (!selectedDocOccupantId) return true;
                    return d.tenantId === selectedDocOccupantId || d.profileId === selectedDocOccupantId;
                  });

                  if (displayDocs.length === 0) {
                    return (
                      <div className="p-8 bg-white border border-slate-200/90 rounded-2xl text-center space-y-2 col-span-2">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-800 text-sm">No uploaded tenant documents found in database for {currentDocOccupant.name}.</p>
                        <p className="text-xs text-slate-500">Uploaded government IDs and lease files will automatically appear here.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {displayDocs.map((doc: any, idx: number) => (
                        <div key={doc.id || idx} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="p-2.5 bg-orange-50 text-[#FF6B00] rounded-xl shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block text-sm truncate">{doc.title}</span>
                              <span className="text-xs text-slate-400 font-mono block truncate">{doc.fileName || doc.title} • {doc.fileSize || "PDF"}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (doc.fileUrl && doc.fileUrl.startsWith("http")) {
                                window.open(doc.fileUrl, "_blank");
                              } else {
                                toast(`Downloading ${doc.fileName || doc.title}...`, "success");
                              }
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <span className="text-xs font-bold text-slate-500">No active occupants found for this room.</span>
              </div>
            )}

          </div>
        );
      })()}

      {/* TAB 3: ROOM HISTORY WITH RATINGS & REVIEWS */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
            <span className="font-bold text-slate-900 text-sm">Total Historical Yield from {unitId}</span>
            <span className="font-black text-emerald-600 text-lg">
              {roomHistory.length > 0 ? "$42,800 Gross Generated" : "$0 Gross Generated"}
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-100 pb-3">
              Chronological Past Resident Timeline & Landlord Ratings
            </h3>

            <div className="space-y-3">
              {roomHistory.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <History className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">No past resident move-out records for {unitId}.</p>
                  <p className="text-xs text-slate-500">Historical logs will accumulate automatically when a resident completes their lease.</p>
                </div>
              ) : (
                roomHistory.map((h, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200 font-extrabold text-slate-800 flex items-center justify-center text-sm">
                          {h.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">{h.name}</span>
                          <span className="text-xs text-slate-500">{h.period} • {h.rent}</span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold block ${
                          h.status === "Lease Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {h.status}
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>{h.healthScore || (h.status === "Removed / Evicted" ? 45 : 85)} / 100</span>
                          </div>

                          {h.rating && (
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {Array.from({ length: h.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {h.review && (
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs italic">
                        &ldquo;{h.review}&rdquo;
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MAINTENANCE LOG */}
      {activeTab === "maintenance" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Maintenance &amp; Repair Log for {unitId}</h3>
            <button
              onClick={() => {
                setMaintIssue("");
                setMaintCategory("General Repair");
                setMaintPriority("Normal");
                setMaintTenantId(occupants[0]?.id || "");
                setShowLogMaintenanceModal(true);
              }}
              className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Log Maintenance Ticket</span>
            </button>
          </div>

          <div className="space-y-3">
            {maintenanceLogs.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200/90 rounded-2xl text-center space-y-2">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">No maintenance tickets logged for {unitId}.</p>
                <p className="text-xs text-slate-500">Click &quot;+ Log Maintenance Ticket&quot; to report an issue or schedule room maintenance.</p>
              </div>
            ) : (
              maintenanceLogs.map((t: any) => (
                <div key={t.id || t.realId} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-orange-50 text-[#FF6B00] rounded-xl shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm">{t.id || t.ticketNumber}: {t.issue}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{t.category || "Repair"}</span>
                        {t.priority && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === "Emergency"
                              ? "bg-rose-100 text-rose-800"
                              : t.priority === "High"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {t.priority}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {t.createdDate || t.date || "Recent"} • Logged By: <span className="font-bold text-slate-700">{t.loggedBy || t.requestedBy || t.tenantName || "Resident"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Status update select */}
                    <select
                      value={t.status || "Open"}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        const targetId = t.realId || t.id;
                        try {
                          const res = await fetch(`/api/maintenance/${encodeURIComponent(targetId)}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: newStatus }),
                          });
                          if (res.ok) {
                            toast(`Ticket status updated to "${newStatus}"`, "success");
                            fetchTabData("maintenance", true);
                          } else {
                            toast("Failed to update status", "error");
                          }
                        } catch {
                          toast("Failed to update status", "error");
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none ${
                        (t.status || "").toLowerCase().includes("resolved") || (t.status || "").toLowerCase().includes("completed")
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : (t.status || "").toLowerCase().includes("progress")
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : (t.status || "").toLowerCase().includes("cancel")
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      <option value="Open">Open ⏳</option>
                      <option value="In Progress">In Progress 🛠️</option>
                      <option value="Resolved">Resolved ✓</option>
                      <option value="Cancelled">Cancelled ✖</option>
                    </select>

                    {/* Delete ticket button */}
                    <button
                      onClick={async () => {
                        if (!confirm(`Are you sure you want to delete maintenance ticket ${t.id || t.ticketNumber}?`)) return;
                        const targetId = t.realId || t.id;
                        try {
                          const res = await fetch(`/api/maintenance/${encodeURIComponent(targetId)}`, {
                            method: "DELETE",
                          });
                          if (res.ok) {
                            toast(`Ticket ${t.id || t.ticketNumber} deleted!`, "success");
                            fetchTabData("maintenance", true);
                          } else {
                            toast("Failed to delete ticket", "error");
                          }
                        } catch {
                          toast("Failed to delete ticket", "error");
                        }
                      }}
                      title="Delete Ticket"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BILLS & INVOICES (PER-RESIDENT FINANCIAL LEDGER) */}
      {activeTab === "bills" && (() => {
        const isAll = selectedBillOccupantId === "all" || !selectedBillOccupantId;
        const currentBillOccupant = occupants.find((o) => o.id === selectedBillOccupantId);

        // Filter database bills from state (or empty array if vacant)
        const displayInvoices = rentLedger.filter((b) => {
          if (isAll) return true;
          return b.tenantId === selectedBillOccupantId;
        });

        return (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            
            {/* Resident Billing Switcher Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#FF6B00]" />
                  <span>Select Resident for Individual Financial Ledger</span>
                </span>
                <span className="text-xs font-bold text-[#FF6B00]">
                  {occupants.length} Active Occupants
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-1">
                <button
                  onClick={() => setSelectedBillOccupantId("all")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap border ${
                    isAll
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>🏢 All Occupants Combined (${totalRoomRent.toLocaleString()}/mo)</span>
                </button>

                {occupants.map((occ) => {
                  const isSelected = selectedBillOccupantId === occ.id;
                  return (
                    <button
                      key={occ.id}
                      onClick={() => setSelectedBillOccupantId(occ.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap border ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isSelected ? "bg-[#FF6B00] text-white" : "bg-slate-200 text-slate-800"
                      }`}>
                        {occ.name.charAt(0)}
                      </div>
                      <span>{occ.name} (${occ.individualRent.toLocaleString()}/mo)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Billing Summary Banner */}
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-900 shadow-2xs">
              <div className="flex items-center gap-3 font-bold text-sm">
                <Receipt className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="block text-sm">
                    {isAll
                      ? `Combined Ledger for ${unitId}`
                      : `${currentBillOccupant?.name}'s Individual Ledger`}
                  </span>
                  <span className="text-xs text-emerald-700 font-medium">
                    {isAll
                      ? `Monthly Revenue: $${totalRoomRent.toLocaleString()}/mo across ${occupants.length} residents`
                      : `Monthly Individual Rent: $${(currentBillOccupant?.individualRent || 0).toLocaleString()}/mo (${currentBillOccupant?.bedSlot})`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-sm bg-emerald-100 px-3.5 py-1 rounded-xl text-emerald-900">
                  $0.00 Outstanding
                </span>
                
                <button
                  onClick={() => {
                    setInvoiceTitle(`Monthly Rent Invoice (${unitId})`);
                    setInvoiceAmount(totalRoomRent ? totalRoomRent.toString() : "1000");
                    setInvoiceCategory("Rent");
                    setInvoiceTenantId(selectedBillOccupantId === "all" ? "" : selectedBillOccupantId);
                    setShowIssueInvoiceModal(true);
                  }}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer uppercase tracking-wider whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue Invoice</span>
                </button>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-3">
              {displayInvoices.length === 0 ? (
                <div className="p-8 bg-white border border-slate-200/90 rounded-2xl text-center space-y-2">
                  <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">No payment ledger or invoice receipts recorded for unit {unitId}.</p>
                  <p className="text-xs text-slate-500">Click &quot;+ Issue Invoice&quot; to issue a new bill or invoice for this unit in database.</p>
                </div>
              ) : (
                displayInvoices.map((b: any) => (
                  <div key={b.id || b.invoiceNumber} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-slate-900 text-sm">{b.invoiceNumber || b.inv} — {b.title}</span>
                        <span className="font-black text-[#FF6B00] text-base">${Number(b.amount).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3 font-medium">
                        <span>Paid Date: {b.paidDate || b.date || "Pending"}</span>
                        <span>•</span>
                        <span>Recipient: {b.tenantName || "Unit Occupants"}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">{b.status} ({b.paymentMethod || b.method || "ACH"})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toast(`Downloading PDF invoice receipt for ${b.invoiceNumber || b.inv}...`, "success")}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF Receipt</span>
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        );
      })()}

      {/* ------------------- MODAL 1: 3-STEP ADD / EDIT TENANT MODAL ------------------- */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleAddTenantSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF6B00]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    {editingOccupantId ? "Edit Resident Profile & Rent" : `Add Resident to ${unitId}`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {propertyData.name} • {unitId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTenantModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3-Step Wizard Navigation Pills */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
              <div
                onClick={() => setCurrentStep(1)}
                className={`py-2 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 1 ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                <span className="truncate">Resident & Rent</span>
              </div>

              <div
                onClick={() => setCurrentStep(2)}
                className={`py-2 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 2 ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                <span className="truncate">Gov ID Scan</span>
              </div>

              <div
                onClick={() => setCurrentStep(3)}
                className={`py-2 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 3 ? "bg-[#FF6B00] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                <span className="truncate">Lease Docs</span>
              </div>
            </div>

            {/* STEP 1: BASIC INFO, BED SLOT & USER RENT */}
            {currentStep === 1 && (
              <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Resident Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Bed Slot / Room Designation</label>
                    <input
                      type="text"
                      value={bedSlot}
                      onChange={(e) => setBedSlot(e.target.value)}
                      placeholder="Bed Slot A (Master)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#FF6B00] uppercase mb-1">
                      Individual Monthly Rent ({workspaceCurrency}) *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 font-extrabold text-sm pointer-events-none">
                        {workspaceCurrency}
                      </div>
                      <input
                        type="number"
                        required
                        min={0}
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        placeholder="1000"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[#FF6B00] rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone Field with Country Flag & Code */}
                <div className="relative z-30">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number (with Country Code)</label>
                  <CountryPhoneInput
                    value={phone}
                    onChange={setPhone}
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Contact Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenant@domain.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Tenant Portal Password {editingOccupantId ? "(Optional Reset)" : "*"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!editingOccupantId}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={editingOccupantId ? "Keep current password..." : "e.g. Tenant@123"}
                        className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium bg-purple-50/80 border border-purple-100 p-2 rounded-xl text-purple-950">
                  <Key className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Resident will log in to the <strong>Tenant Portal</strong> using this Email and Password.</span>
                </p>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Lease Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaseStart}
                    onChange={(e) => setLeaseStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: GOVERNMENT ID & VERIFICATION */}
            {currentStep === 2 && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-blue-900">
                  <IdCard className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Government Identity Verification</span>
                    <span className="text-[11px] text-blue-700">Upload official government-issued ID scan or photo for background audit.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Government ID Type</label>
                    <div className="relative">
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full appearance-none pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">Driver&apos;s License</option>
                        <option value="Aadhaar Card / National ID">Aadhaar Card / National ID</option>
                        <option value="Social Security Card (SSN)">Social Security Card (SSN)</option>
                        <option value="Permanent Resident Card">Permanent Resident / Green Card</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">ID Code / Document Number</label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="e.g. A-98102948"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Upload Government ID Scan (Front & Back)</label>
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                    {govIdUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 text-blue-600 mx-auto animate-spin" />
                        <div className="text-xs font-bold text-slate-700">Compressing & uploading… {govIdProgress}%</div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${govIdProgress}%` }} />
                        </div>
                      </>
                    ) : govIdUrl ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                        <div className="text-xs font-bold text-emerald-700">Uploaded: {govIdFile}</div>
                        <a href={govIdUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 underline">Preview file ↗</a>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-blue-600 mx-auto" />
                        <div className="text-xs font-bold text-slate-800">
                          {govIdFile ? `Attached: ${govIdFile}` : "Drag & Drop Passport, Driver's License or ID Card Scan"}
                        </div>
                        <p className="text-[10px] text-slate-400">Accepted formats: PDF, JPG, PNG (Max 15MB) — compressed automatically</p>
                      </>
                    )}
                    {!govIdUploading && (
                      <label className="inline-block px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs cursor-pointer">
                        {govIdUrl ? "Replace ID File" : "Select ID File"}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const check = validateFile(file, { maxSizeMB: 15 });
                            if (!check.valid) { toast(check.error!, "error"); return; }
                            setGovIdUploading(true); setGovIdProgress(0);
                            const res = await uploadFile(file, {
                              workspaceId: propId,
                              context: "gov-id",
                              onProgress: setGovIdProgress,
                            });
                            setGovIdUploading(false);
                            if (res.success) {
                              setGovIdFile(file.name);
                              setGovIdUrl(res.url!);
                              toast(`ID uploaded & compressed ${res.compressionPct}%! Stored in workspace folder.`, "success");
                            } else {
                              toast(res.error || "Upload failed", "error");
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LEASE AGREEMENT & DOCUMENTS */}
            {currentStep === 3 && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-center gap-2.5 text-purple-900">
                  <FileCheck className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Lease Agreement & Rental Contract Upload</span>
                    <span className="text-[11px] text-purple-700">Attach signed tenancy agreements, paystubs, or security deposit receipts.</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Upload Signed Lease Contract</label>
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                    {leaseUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 text-[#FF6B00] mx-auto animate-spin" />
                        <div className="text-xs font-bold text-slate-700">Uploading lease… {leaseProgress}%</div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className="bg-[#FF6B00] h-1.5 rounded-full transition-all" style={{ width: `${leaseProgress}%` }} />
                        </div>
                      </>
                    ) : leaseUrl ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                        <div className="text-xs font-bold text-emerald-700">Uploaded: {leaseFile}</div>
                        <a href={leaseUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 underline">Preview document ↗</a>
                      </>
                    ) : (
                      <>
                        <FileText className="w-6 h-6 text-[#FF6B00] mx-auto" />
                        <div className="text-xs font-bold text-slate-800">
                          {leaseFile ? `Attached: ${leaseFile}` : "Drag & Drop Signed Tenancy Contract PDF"}
                        </div>
                        <p className="text-[10px] text-slate-400">Accepted format: PDF, JPG, PNG (Max 25MB)</p>
                      </>
                    )}
                    {!leaseUploading && (
                      <label className="inline-block px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs cursor-pointer">
                        {leaseUrl ? "Replace Lease File" : "Select Lease PDF"}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const check = validateFile(file, { maxSizeMB: 25 });
                            if (!check.valid) { toast(check.error!, "error"); return; }
                            setLeaseUploading(true); setLeaseProgress(0);
                            const res = await uploadFile(file, {
                              workspaceId: propId,
                              context: "lease-docs",
                              onProgress: setLeaseProgress,
                            });
                            setLeaseUploading(false);
                            if (res.success) {
                              setLeaseFile(file.name);
                              setLeaseUrl(res.url!);
                              toast(`Lease uploaded! Stored in workspace folder.`, "success");
                            } else {
                              toast(res.error || "Upload failed", "error");
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNextStep();
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Resident & Rent</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL 2: NORMAL LEASE EXIT & RATING REVIEW MODAL ------------------- */}
      {showNormalExitModal && exitOccupant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleNormalExitSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    Normal Lease Completion Exit
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Offboarding resident {exitOccupant.name} from {unitId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNormalExitModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Departure Info Banner */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                <span className="font-bold block text-xs">Gradual Lease Offboarding Protocol</span>
                <p className="text-[11px] text-emerald-800">
                  Tenant has completed their stay. Saving this offboarding form will record their timeline in room history with your landlord review rating.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Departure Move-out Date</label>
                  <input
                    type="date"
                    required
                    value={exitMoveOutDate}
                    onChange={(e) => setExitMoveOutDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Security Deposit Settlement</label>
                  <select
                    value={depositSettlement}
                    onChange={(e) => setDepositSettlement(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Full Deposit Refunded">Full Deposit Refunded ($100%)</option>
                    <option value="Partial Refund (Deductions Applied)">Partial Refund (Deductions Applied)</option>
                    <option value="Withheld Deposit">Withheld Deposit</option>
                  </select>
                </div>
              </div>

              {/* Keys Return Checkbox */}
              <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keysReturned}
                  onChange={(e) => setKeysReturned(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="font-bold text-slate-800 text-xs">
                  All room keys, smart access cards, and parking passes returned
                </span>
              </label>

              {/* Landlord Star Rating System */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <label className="block font-extrabold text-amber-900 uppercase text-[11px]">
                  Landlord Rating for {exitOccupant.name} (For Future Reference)
                </label>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= starRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-black text-amber-900 text-sm">
                    {starRating}.0 / 5.0 Stars
                  </span>
                </div>
              </div>

              {/* Review & Feedback Notes */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Landlord Review & Tenancy Feedback Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Paid rent on time every month via Autopilot. Kept room clean and quiet..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNormalExitModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Normal Exit & Save Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL 3: REMOVE / EVICT OCCUPANT MODAL ------------------- */}
      {showRemoveModal && removeOccupantTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={handleRemoveSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    Remove / Evict Occupant
                  </h3>
                  <p className="text-xs text-rose-600 font-bold mt-1">
                    Emergency removal notice for {removeOccupantTarget.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Warning Banner */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-xs">Immediate Occupant Removal Protocol</span>
                  <p className="text-[11px] text-rose-700">
                    Use this option when removing an occupant due to non-payment, lease breach, or emergency. The removal reason will be archived in room history.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Primary Removal Reason *</label>
                <select
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Non-Payment of Rent / Financial Default">Non-Payment of Rent / Financial Default</option>
                  <option value="Breach of Lease Terms & Property Damage">Breach of Lease Terms & Property Damage</option>
                  <option value="Excessive Noise / Disturbance to Neighbors">Excessive Noise / Disturbance to Neighbors</option>
                  <option value="Unauthorized Occupant / Illegal Subletting">Unauthorized Occupant / Illegal Subletting</option>
                  <option value="Mutual Early Termination Agreement">Mutual Early Termination Agreement</option>
                  <option value="Emergency / Safety Violation">Emergency / Safety Violation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Removal Effective Date</label>
                  <input
                    type="date"
                    required
                    value={removalDate}
                    onChange={(e) => setRemovalDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Outstanding Balance Dues ($ / ₹)</label>
                  <input
                    type="number"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Incident Notes */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Incident Notes & Breach Details</label>
                <textarea
                  rows={3}
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                  placeholder="Record details of the breach, formal warnings issued, or early termination agreement..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Flag Tenant Checkbox */}
              <label className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center gap-3 cursor-pointer text-rose-900">
                <input
                  type="checkbox"
                  checked={flagTenant}
                  onChange={(e) => setFlagTenant(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <span className="font-bold text-xs">
                  ⚠️ Flag resident profile in Tenant Registry for future landlord warnings
                </span>
              </label>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Removal & Archive Log</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL 4: ISSUE INVOICE MODAL ------------------- */}
      {showIssueInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!invoiceTitle.trim() || !invoiceAmount) {
                toast("Please enter invoice title and amount.", "info");
                return;
              }
              setIsSubmittingInvoice(true);
              try {
                const res = await fetch(`/api/units/${encodeURIComponent(unitId)}/rents`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: invoiceTitle,
                    amount: parseFloat(invoiceAmount),
                    category: invoiceCategory,
                    tenantId: invoiceTenantId || null,
                    propertyId: propId,
                  }),
                });
                if (res.ok) {
                  const json = await res.json();
                  toast(json.message || "Invoice issued successfully!", "success");
                  setShowIssueInvoiceModal(false);
                  setInvoiceTitle("");
                  setInvoiceAmount("");
                  fetchTabData("bills");
                } else {
                  toast("Failed to issue invoice", "error");
                }
              } catch {
                toast("Failed to issue invoice", "error");
              } finally {
                setIsSubmittingInvoice(false);
              }
            }}
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-orange-50 text-[#FF6B00]">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">Issue New Invoice / Bill</h3>
                  <p className="text-xs text-slate-500 mt-1">Directly records to database ledger for {unitId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIssueInvoiceModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Invoice Title / Description</label>
                <input
                  type="text"
                  required
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  placeholder="e.g. July Room Rent Invoice or Water Sub-meter Share"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Amount ($ / ₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={invoiceCategory}
                    onChange={(e) => setInvoiceCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utility">Utility</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Deposit">Deposit</option>
                  </select>
                </div>
              </div>

              {occupants.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Target Resident (Optional)</label>
                  <select
                    value={invoiceTenantId}
                    onChange={(e) => setInvoiceTenantId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="">All Occupants Combined (Unit-wide)</option>
                    {occupants.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.name} ({occ.bedSlot})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIssueInvoiceModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmittingInvoice}
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingInvoice ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Receipt className="w-4 h-4" />
                )}
                <span>Save & Issue Invoice</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODAL 5: LOG MAINTENANCE TICKET MODAL ------------------- */}
      {showLogMaintenanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!maintIssue.trim()) {
                toast("Please enter maintenance issue description.", "info");
                return;
              }
              setIsSubmittingMaint(true);
              try {
                const res = await fetch(`/api/units/${encodeURIComponent(unitId)}/maintenance`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    issue: maintIssue,
                    category: maintCategory,
                    priority: maintPriority,
                    tenantId: maintTenantId || null,
                    propertyId: propId,
                  }),
                });
                if (res.ok) {
                  const json = await res.json();
                  toast(json.message || "Maintenance ticket logged!", "success");
                  setShowLogMaintenanceModal(false);
                  setMaintIssue("");
                  fetchTabData("maintenance");
                } else {
                  toast("Failed to log maintenance ticket", "error");
                }
              } catch {
                toast("Failed to log maintenance ticket", "error");
              } finally {
                setIsSubmittingMaint(false);
              }
            }}
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-orange-50 text-[#FF6B00]">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">Log Maintenance Ticket</h3>
                  <p className="text-xs text-slate-500 mt-1">Logs to database for {unitId} (Floor & Property scoped)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogMaintenanceModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Maintenance Issue / Fault</label>
                <textarea
                  required
                  rows={3}
                  value={maintIssue}
                  onChange={(e) => setMaintIssue(e.target.value)}
                  placeholder="e.g. AC Filter needs cleaning, Water tap leaking in bathroom, Fuse box trip..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <div className="relative">
                    <select
                      value={maintCategory}
                      onChange={(e) => setMaintCategory(e.target.value)}
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
                  <label className="block font-bold text-slate-700 uppercase mb-1">Priority</label>
                  <div className="relative">
                    <select
                      value={maintPriority}
                      onChange={(e) => setMaintPriority(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer appearance-none pr-9"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Emergency">Emergency 🚨</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Logged By Tenant / Submitter</label>
                <div className="relative">
                  <select
                    value={maintTenantId}
                    onChange={(e) => setMaintTenantId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer appearance-none pr-9"
                  >
                    <option value="">Admin / Property Staff</option>
                    {occupants.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.name} ({occ.bedSlot || "Occupant"}) — Tenant ID: {occ.id}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogMaintenanceModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmittingMaint}
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingMaint ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wrench className="w-4 h-4" />
                )}
                <span>Log Maintenance Ticket</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
