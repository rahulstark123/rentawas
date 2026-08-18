"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Filter,
  Star,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  ChevronDown,
  Building2,
  ShieldCheck,
  Phone,
  FileText,
  UserCheck,
  DollarSign,
  History,
  Check,
  Zap,
  Briefcase,
  Eye,
  Award,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Wrench,
  HelpCircle,
  MapPin,
  Compass,
  Navigation,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { INDIA_LOCATION_DATA, CITY_LOCALITIES_DATA, DEFAULT_CITY_LOCALITIES } from "@/lib/indiaLocations";

// Helper function to extract symbol from expert's own currency (e.g. "INR (₹)", "USD ($)")
function getExpertCurrencySymbol(expertCurrency?: string) {
  if (!expertCurrency) return "₹";
  if (expertCurrency.includes("₹") || expertCurrency.toUpperCase().includes("INR")) return "₹";
  if (expertCurrency.includes("$") || expertCurrency.toUpperCase().includes("USD")) return "$";
  if (expertCurrency.includes("€") || expertCurrency.toUpperCase().includes("EUR")) return "€";
  if (expertCurrency.includes("£") || expertCurrency.toUpperCase().includes("GBP")) return "£";
  if (expertCurrency.toUpperCase().includes("AED")) return "AED ";
  const match = expertCurrency.match(/\(([^)]+)\)/);
  if (match) return match[1];
  return expertCurrency;
}

// Services List
const SERVICE_CATEGORIES = [
  "Plumbing & Water Leakage Specialist",
  "Electrician & Electrical Wiring Expert",
  "Househelp, Maid & Deep Cleaning Specialist",
  "AC & HVAC Servicing Engineer",
  "Carpentry & Woodwork Repair",
  "Pest Control & Sanitization",
  "Home Appliance Repair Specialist",
];

// Expert Data List
const EXPERTS_LIST = [
  {
    id: "EXP-101",
    name: "Anil Kumar",
    title: "Master Plumber & Water Leakage Specialist",
    avatar: "/rentawas experts/plumber.jpg",
    experience: "10+ Years Exp",
    rating: 4.9,
    reviewsCount: 142,
    fee: 599,
    services: ["Plumbing & Water Leakage Specialist"],
    bio: "Expert in deep pipeline leak detection, bathroom sanitary fittings, water pump repair, and pressure audits.",
  },
  {
    id: "EXP-102",
    name: "Rajesh Sharma",
    title: "Senior Electrician & Electrical Wiring Expert",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
    experience: "11+ Years Exp",
    rating: 4.8,
    reviewsCount: 98,
    fee: 499,
    services: ["Electrician & Electrical Wiring Expert"],
    bio: "Government-certified electrician specializing in MCB trip resolution, short circuit repairs, inverter setup, and house wiring.",
  },
  {
    id: "EXP-103",
    name: "Sunita Devi",
    title: "Househelp, Maid & Deep Cleaning Specialist",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    experience: "9+ Years Exp",
    rating: 4.9,
    reviewsCount: 115,
    fee: 399,
    services: ["Househelp, Maid & Deep Cleaning Specialist"],
    bio: "Verified full-time househelp providing deep home cleaning, kitchen sanitization, housekeeping, and daily assistance.",
  },
  {
    id: "EXP-104",
    name: "Ramesh Chand",
    title: "Master HVAC & AC Repair Specialist",
    avatar: "/rentawas experts/ac.jpg",
    experience: "12+ Years Exp",
    rating: 4.7,
    reviewsCount: 86,
    fee: 699,
    services: ["AC & HVAC Servicing Engineer"],
    bio: "Certified HVAC engineer specializing in commercial and residential split/window AC servicing, jet wash, and gas recharging.",
  },
  {
    id: "EXP-105",
    name: "Mohan Lal",
    title: "Master Carpenter & Interior Woodwork Expert",
    avatar: "/rentawas experts/Carpentar.jpg",
    experience: "13+ Years Exp",
    rating: 4.7,
    reviewsCount: 68,
    fee: 649,
    services: ["Carpentry & Woodwork Repair"],
    bio: "Specializes in modular kitchen repair, door lock installations, furniture restoration, and custom wooden wardrobe fittings.",
  },
  {
    id: "EXP-106",
    name: "Pooja Hegde",
    title: "Pest Control & Sanitization Auditor",
    avatar: "/rentawas experts/pest control.jpg",
    experience: "8+ Years Exp",
    rating: 4.8,
    reviewsCount: 92,
    fee: 799,
    services: ["Pest Control & Sanitization"],
    bio: "Eco-friendly termite, bedbug, cockroach, and rodent extermination specialist with 1-year service warranty.",
  },
  {
    id: "EXP-107",
    name: "Sanjay Verma",
    title: "Home Appliance Repair & Maintenance Technician",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    experience: "8+ Years Exp",
    rating: 4.8,
    reviewsCount: 76,
    fee: 549,
    services: ["Home Appliance Repair Specialist"],
    bio: "Specialist technician for washing machine repair, refrigerator servicing, microwave fixes, and water purifier installation.",
  },
  {
    id: "EXP-108",
    name: "Vikram Singh",
    title: "General Maintenance & Hardware Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    experience: "15+ Years Exp",
    rating: 4.9,
    reviewsCount: 164,
    fee: 499,
    services: ["Plumbing & Water Leakage Specialist", "Electrician & Electrical Wiring Expert"],
    bio: "All-in-one property handyman for wall drillings, door fixtures, plumbing fixes, and electrical switchboard installations.",
  },
];

// Default Initial Booking History
const INITIAL_HISTORY = [
  {
    id: "EX-BK-1",
    expertId: "EXP-101",
    expertName: "Anil Kumar",
    expertTitle: "Master Plumber & Water Leakage Specialist",
    avatar: "/rentawas experts/plumber.jpg",
    serviceBooked: "Plumbing & Water Leakage Specialist",
    date: "Aug 16, 2026",
    timeSlot: "11:00 AM",
    feePaid: 599,
    status: "Confirmed",
    property: "The Regent - Unit 302",
    createdAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "EX-BK-2",
    expertId: "EXP-102",
    expertName: "Rajesh Sharma",
    expertTitle: "Senior Electrician & Electrical Wiring Expert",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
    serviceBooked: "Electrician & Electrical Wiring Expert",
    date: "Aug 02, 2026",
    timeSlot: "03:30 PM",
    feePaid: 499,
    status: "Completed",
    property: "Horizon Towers - Unit 104",
    createdAt: "2026-08-01T14:20:00Z",
  },
];

// Initial Live Work On-Site Requests
const INITIAL_LIVE_WORKS = [
  {
    id: "EXP-JOB-1092",
    otpCode: "489201",
    expertName: "Anil Kumar",
    expertTitle: "Master Plumber & Water Leakage Specialist",
    avatar: "/rentawas experts/plumber.jpg",
    serviceType: "Plumbing & Water Leakage Specialist",
    property: "The Regent - Wing A (1st Floor, Unit 102)",
    scheduledDate: "Today, Aug 14, 2026",
    feePaid: 599,
    status: "Live Work In Progress",
    startedAt: Date.now() - 1120000,
    phone: "+91 98765 43210",
  },
];

function RentAwasExpertsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();

  const tabParam = searchParams.get("tab") || "book";
  const [activeTab, setActiveTab] = useState<"book" | "live" | "history">(
    tabParam === "history" ? "history" : tabParam === "live" ? "live" : "book"
  );

  useEffect(() => {
    if (tabParam === "history" || tabParam === "book" || tabParam === "live") {
      setActiveTab(tabParam as "book" | "live" | "history");
    }
  }, [tabParam]);

  // Live Experts from Database GET /api/admin/experts
  const [liveExperts, setLiveExperts] = useState<any[]>([]);
  const [loadingLiveExperts, setLoadingLiveExperts] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLiveExperts() {
      try {
        setLoadingLiveExperts(true);
        const res = await fetch("/api/admin/experts");
        const json = await res.json();
        if (res.ok && Array.isArray(json.experts)) {
          const mapped = json.experts.map((exp: any) => ({
            id: exp.id,
            name: exp.name,
            title: exp.specialization ? `${exp.trade} - ${exp.specialization}` : exp.trade,
            trade: exp.trade,
            avatar: exp.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
            experience: exp.experience || "5+ Yrs Exp",
            rating: exp.rating != null ? Number(exp.rating) : 5.0,
            reviewsCount: exp.reviewsCount != null ? Number(exp.reviewsCount) : 0,
            completedJobs: exp.completedJobs ?? 0,
            fee: exp.fee || 599,
            services: [exp.trade || "Home Maintenance"],
            bio: exp.specialization || `${exp.trade} specialist available for on-site booking.`,
            city: exp.city || "NCR",
            phone: exp.phone,
            email: exp.email,
            status: exp.status,
            isAvailable: exp.isAvailable,
            workStartTime: exp.workStartTime,
            workEndTime: exp.workEndTime,
            workDays: exp.workDays,
            bankHolder: exp.bankHolder,
            bankName: exp.bankName,
            accountNo: exp.accountNo,
            ifsc: exp.ifsc,
            upiId: exp.upiId,
            qrCodeUrl: exp.qrCodeUrl,
          }));
          setLiveExperts(mapped);
        }
      } catch (err) {
        console.error("Failed to load experts from API:", err);
      } finally {
        setLoadingLiveExperts(false);
      }
    }
    fetchLiveExperts();
  }, []);

  const [liveWorks, setLiveWorks] = useState<any[]>(INITIAL_LIVE_WORKS);

  // Live Timer Ticker for Active Work Cards
  const [nowTime, setNowTime] = useState<number>(0);

  useEffect(() => {
    setNowTime(Date.now());
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsedTime = (startedAt: number) => {
    if (!startedAt || !nowTime) return "00:00:00";
    const diffSec = Math.max(0, Math.floor((nowTime - startedAt) / 1000));
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Search & Multi-Select Dropdown State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  // Cascading Location Dropdown State (Country -> State -> City -> Area)
  const [selectedLocationCountry, setSelectedLocationCountry] = useState<string>("");
  const [selectedLocationState, setSelectedLocationState] = useState<string>("");
  const [selectedLocationCity, setSelectedLocationCity] = useState<string>("");
  const [selectedLocationAreas, setSelectedLocationAreas] = useState<string[]>([]);
  const [locationStep, setLocationStep] = useState<"country" | "state" | "city" | "area">("country");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState("");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [areaSearchQuery, setAreaSearchQuery] = useState("");
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Right-Side Drawer Sidebar Details State
  const [viewingExpertDetails, setViewingExpertDetails] = useState<any | null>(null);
  const [drawerReviews, setDrawerReviews] = useState<any[]>([]);
  const [loadingDrawerReviews, setLoadingDrawerReviews] = useState<boolean>(false);

  useEffect(() => {
    if (!viewingExpertDetails) {
      setDrawerReviews([]);
      return;
    }
    async function loadDrawerReviews() {
      try {
        setLoadingDrawerReviews(true);
        const params = new URLSearchParams();
        if (viewingExpertDetails.id) params.set("expertId", viewingExpertDetails.id);
        if (viewingExpertDetails.email) params.set("expertEmail", viewingExpertDetails.email);

        const res = await fetch(`/api/expert-reviews?${params.toString()}`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.reviews)) {
          setDrawerReviews(json.reviews);
        } else {
          setDrawerReviews([]);
        }
      } catch (err) {
        console.warn("Failed to load drawer reviews:", err);
        setDrawerReviews([]);
      } finally {
        setLoadingDrawerReviews(false);
      }
    }
    loadDrawerReviews();
  }, [viewingExpertDetails]);

  // Booking Modal State
  // Active User Session State
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    return tom.toISOString().split("T")[0];
  });
  const [selectedProperty, setSelectedProperty] = useState("Main Residential Property");
  const [selectedFloor, setSelectedFloor] = useState("Ground Floor");
  const [selectedUnit, setSelectedUnit] = useState("Unit 101");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address & Map Location Picker State (Used when user has no property)
  const [customAddress, setCustomAddress] = useState("");
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapPinCoords, setMapPinCoords] = useState<{ lat: number; lng: number; addressName: string }>({
    lat: 28.4595,
    lng: 77.0266,
    addressName: "Sector 29, Gurgaon, Delhi NCR"
  });
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // Pre-populate search query with customAddress if set on form when map picker modal opens
  useEffect(() => {
    if (isMapPickerOpen) {
      if (customAddress && customAddress.trim().length > 0) {
        setMapSearchQuery(customAddress);
        setMapPinCoords((prev) => ({
          ...prev,
          addressName: customAddress,
        }));
      } else {
        setMapSearchQuery("");
        setSuggestions([]);
      }
    }
  }, [isMapPickerOpen, customAddress]);

  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5);
    const normY = (y / rect.height - 0.5);

    const newLat = Number((mapPinCoords.lat - normY * 0.005).toFixed(5));
    const newLng = Number((mapPinCoords.lng + normX * 0.005).toFixed(5));

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`
      );
      const data = await res.json();
      const addr = data?.display_name || `Adjusted Location Pin (${newLat}° N, ${newLng}° E)`;
      setMapPinCoords({ lat: newLat, lng: newLng, addressName: addr });
      setMapSearchQuery(addr);
    } catch {
      const addr = `Adjusted Location Pin (${newLat}° N, ${newLng}° E)`;
      setMapPinCoords({ lat: newLat, lng: newLng, addressName: addr });
      setMapSearchQuery(addr);
    }
  };

  const movePinByOffset = async (latDelta: number, lngDelta: number) => {
    const newLat = Number((mapPinCoords.lat + latDelta).toFixed(5));
    const newLng = Number((mapPinCoords.lng + lngDelta).toFixed(5));

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`
      );
      const data = await res.json();
      const addr = data?.display_name || `Adjusted Location Pin (${newLat}° N, ${newLng}° E)`;
      setMapPinCoords({ lat: newLat, lng: newLng, addressName: addr });
      setMapSearchQuery(addr);
    } catch {
      const addr = `Adjusted Location Pin (${newLat}° N, ${newLng}° E)`;
      setMapPinCoords({ lat: newLat, lng: newLng, addressName: addr });
      setMapSearchQuery(addr);
    }
  };

  // Google Maps Search Engine & Intelligent Indian Geography Recommendations
  useEffect(() => {
    if (!mapSearchQuery || mapSearchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const cleanQuery = mapSearchQuery.trim();
    const queryLower = cleanQuery.toLowerCase();
    const matches: any[] = [];

    // 1. Primary Recommendation: Google Maps Search
    matches.push({
      display_name: `Search Google Maps for: "${cleanQuery}"`,
      queryValue: cleanQuery.toLowerCase().includes("india") ? cleanQuery : `${cleanQuery}, India`,
      type: "google",
      subtitle: "Live Google Maps Search & Pin Location",
    });

    // 2. Custom Address Recommendation
    matches.push({
      display_name: `Use exact typed address: "${cleanQuery}"`,
      queryValue: cleanQuery,
      type: "custom",
      subtitle: "Set exact address text for expert visit",
    });

    const addedSet = new Set<string>();

    // 3. Smart Street & Road Recommendations (e.g. Ramraji Road, MG Road, Ring Road, Main Road)
    if (queryLower.includes("road") || queryLower.includes("marg") || queryLower.includes("lane") || queryLower.includes("path") || queryLower.includes("ram") || queryLower.includes("street")) {
      const roadSuggestions = [
        `${cleanQuery}, Patna, Bihar, India`,
        `${cleanQuery}, Gurgaon, Delhi NCR, India`,
        `${cleanQuery}, New Delhi, India`,
        `${cleanQuery}, Bengaluru, Karnataka, India`,
        `${cleanQuery}, Mumbai, Maharashtra, India`,
      ];
      roadSuggestions.forEach((rs) => {
        if (!addedSet.has(rs)) {
          addedSet.add(rs);
          matches.push({
            display_name: rs,
            queryValue: rs,
            type: "road",
            subtitle: "Street & Highway Location Recommendation",
          });
        }
      });
    }

    // 4. Search local Indian cities & localities dataset for matching areas
    Object.entries(CITY_LOCALITIES_DATA).forEach(([cityName, locList]) => {
      locList.forEach((loc) => {
        const fullLoc = `${loc}, ${cityName}, India`;
        if (
          (loc.toLowerCase().includes(queryLower) ||
            cityName.toLowerCase().includes(queryLower) ||
            queryLower.includes(loc.toLowerCase())) &&
          matches.length < 12
        ) {
          if (!addedSet.has(fullLoc)) {
            addedSet.add(fullLoc);
            matches.push({
              display_name: fullLoc,
              queryValue: fullLoc,
              type: "locality",
              subtitle: `Locality in ${cityName}`,
            });
          }
        }
      });
    });

    // 5. Search inside INDIA_LOCATION_DATA cities
    Object.entries(INDIA_LOCATION_DATA).forEach(([stateName, citiesList]) => {
      citiesList.forEach((city) => {
        if (
          (city.toLowerCase().includes(queryLower) || stateName.toLowerCase().includes(queryLower)) &&
          matches.length < 15
        ) {
          const cityStr = `${city}, ${stateName}, India`;
          if (!addedSet.has(cityStr)) {
            addedSet.add(cityStr);
            matches.push({
              display_name: cityStr,
              queryValue: cityStr,
              type: "city",
              subtitle: `City in ${stateName}`,
            });
          }
        }
      });
    });

    setSuggestions(matches);
  }, [mapSearchQuery]);

  const selectGeocodedLocation = (item: any) => {
    const finalAddr = item.queryValue || item.display_name;
    setMapPinCoords((prev) => ({
      ...prev,
      addressName: finalAddr,
    }));
    setMapSearchQuery(finalAddr);
    setSuggestions([]);
  };

  const handleDetectGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            const addr = data?.display_name || `GPS Location (${lat}° N, ${lng}° E)`;
            setMapPinCoords({ lat, lng, addressName: addr });
            setMapSearchQuery(addr);
          } catch {
            const addr = `GPS Location (${lat}° N, ${lng}° E)`;
            setMapPinCoords({ lat, lng, addressName: addr });
            setMapSearchQuery(addr);
          }
        },
        () => {
          alert("Geolocation permission denied. Please type address or select locality.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Dynamic Real Database Properties State
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [loadingUserProps, setLoadingUserProps] = useState<boolean>(true);

  // Fetch real user properties from database
  useEffect(() => {
    async function loadProperties() {
      try {
        setLoadingUserProps(true);

        const tenantRes = await fetch("/api/tenant/me");
        const tenantJson = await tenantRes.json();
        const tenantData = tenantJson?.data;

        if (currentUser?.user_metadata?.role === "tenant" || (tenantData && tenantData.email && currentUser?.user_metadata?.role !== "landlord" && currentUser?.user_metadata?.role !== "owner")) {
          if (tenantData?.hasAssignedLease && tenantData?.propertyName) {
            setUserProperties([
              {
                id: tenantData.propertyId || "tenant-prop-1",
                name: tenantData.propertyName,
                address: tenantData.propertyAddress || "",
                units: [
                  {
                    id: tenantData.unitId || "unit-1",
                    unitNumber: tenantData.unitNumber || "Unit 101",
                    floorNumber: 1,
                  },
                ],
              },
            ]);
            setSelectedProperty(tenantData.propertyName);
            if (tenantData.unitNumber) {
              setSelectedUnit(tenantData.unitNumber);
            }
          } else {
            setUserProperties([]);
          }
        } else {
          const { ensureActiveWorkspaceId } = await import("@/lib/workspace");
          const wid = await ensureActiveWorkspaceId();
          if (wid) {
            const res = await fetch(`/api/properties?wid=${wid}`);
            const json = await res.json();
            const fetchedProps = Array.isArray(json.data)
              ? json.data
              : Array.isArray(json.properties)
              ? json.properties
              : [];

            if (res.ok && fetchedProps.length > 0) {
              setUserProperties(fetchedProps);
              const firstProp = fetchedProps[0];
              setSelectedProperty(firstProp.name);

              if (firstProp.units && firstProp.units.length > 0) {
                const firstUnit = firstProp.units[0];
                const fNum = firstUnit.floorNumber ?? 1;
                const fLabel = fNum === 0 ? "Ground Floor" : fNum === 1 ? "1st Floor" : fNum === 2 ? "2nd Floor" : fNum === 3 ? "3rd Floor" : `${fNum}th Floor`;
                setSelectedFloor(fLabel);
                setSelectedUnit(firstUnit.unitNumber || `Unit 101`);
              } else {
                setSelectedFloor("1st Floor");
              }
            } else {
              setUserProperties([]);
            }
          } else {
            setUserProperties([]);
          }
        }
      } catch (err) {
        console.error("Failed to load user properties:", err);
        setUserProperties([]);
      } finally {
        setLoadingUserProps(false);
      }
    }
    loadProperties();
  }, [currentUser]);

  // Booking History & Customer Rating State
  const [waitingConfirmationBooking, setWaitingConfirmationBooking] = useState<any | null>(null);

  // Customer Rating Expert Modal State
  const [selectedBookingForRating, setSelectedBookingForRating] = useState<any | null>(null);
  const [userStarRating, setUserStarRating] = useState<number>(5);
  const [userFeedbackTags, setUserFeedbackTags] = useState<string[]>(["Punctual & Professional", "High Quality Work"]);
  const [userReviewComment, setUserReviewComment] = useState<string>("");

  const openRatingModal = (booking: any) => {
    setSelectedBookingForRating(booking);
    setUserStarRating(booking.userRating || 5);
    setUserFeedbackTags(booking.userTags || ["Punctual & Professional", "High Quality Work"]);
    setUserReviewComment(booking.userComment || "");
  };

  // Booking Details Sidebar Drawer State
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any | null>(null);
  const [showBookingDetailsSidebar, setShowBookingDetailsSidebar] = useState<boolean>(false);

  const openBookingDetailsSidebar = (booking: any) => {
    setSelectedBookingForDetails(booking);
    setShowBookingDetailsSidebar(true);
  };

  const handleSubmitUserRating = async () => {
    if (!selectedBookingForRating) return;

    // Update local state
    setBookingHistory(
      bookingHistory.map((b) =>
        b.id === selectedBookingForRating.id
          ? {
              ...b,
              userRating: userStarRating,
              userFeedbackTags: userFeedbackTags,
              userComment: userReviewComment,
              isRated: true,
            }
          : b
      )
    );

    toast(`Thank you! Rated ${selectedBookingForRating.expertName} ${userStarRating} ⭐ stars!`, "success");
    setSelectedBookingForRating(null);

    try {
      // 1. Save rating for this specific booking
      await fetch("/api/expert-bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingNumber: selectedBookingForRating.id,
          userRating: userStarRating,
          userFeedbackTags: JSON.stringify(userFeedbackTags),
          userComment: userReviewComment,
          isRated: true,
        }),
      });

      // 2. Update specific expert's overall rating profile
      if (selectedBookingForRating.expertId) {
        await fetch("/api/admin/experts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedBookingForRating.expertId,
            rating: userStarRating,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to persist rating in database:", err);
    }
  };

  const toggleServiceSelection = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const toggleLocationArea = (area: string) => {
    if (selectedLocationAreas.includes(area)) {
      setSelectedLocationAreas(selectedLocationAreas.filter((a) => a !== area));
    } else {
      setSelectedLocationAreas([...selectedLocationAreas, area]);
    }
  };

  const clearAllFilters = () => {
    setSelectedServices([]);
    setSearchTerm("");
    setSelectedLocationCountry("");
    setSelectedLocationState("");
    setSelectedLocationCity("");
    setSelectedLocationAreas([]);
    setStateSearchQuery("");
    setCitySearchQuery("");
    setAreaSearchQuery("");
    setLocationStep("country");
  };

  // Filtered Experts List from Live Database (Shows only experts where BOOKING STATUS toggle is ON / Available)
  const filteredExperts = useMemo(() => {
    const sourceList = liveExperts;
    return sourceList.filter((exp) => {
      // 1. Strictly exclude experts whose BOOKING STATUS toggle is OFF / Inactive / Suspended / Offline
      const st = String(exp.status || "").toLowerCase();
      if (
        exp.isAvailable === false ||
        exp.isAvailable === "false" ||
        exp.isAvailable === 0 ||
        st.includes("suspended") ||
        st.includes("inactive") ||
        st.includes("offline") ||
        st.includes("busy") ||
        st.includes("unavailable")
      ) {
        return false;
      }

      // 2. Filter by search term
      const matchesSearch =
        searchTerm.trim() === "" ||
        exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.services.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      // 3. Filter by multi-selected services
      const matchesServices =
        selectedServices.length === 0 ||
        selectedServices.some((sel) => exp.services.includes(sel));

      // 4. Filter by Cascading Location (Country -> State -> City -> Area)
      let matchesLocation = true;
      if (selectedLocationAreas.length > 0) {
        matchesLocation = selectedLocationAreas.some(area => 
          exp.fullAddress?.toLowerCase().includes(area.toLowerCase()) ||
          exp.bio?.toLowerCase().includes(area.toLowerCase()) ||
          exp.city?.toLowerCase().includes(area.toLowerCase()) ||
          exp.title?.toLowerCase().includes(area.toLowerCase())
        );
      } else if (selectedLocationCity) {
        matchesLocation =
          exp.city?.toLowerCase().includes(selectedLocationCity.toLowerCase()) ||
          exp.fullAddress?.toLowerCase().includes(selectedLocationCity.toLowerCase()) ||
          exp.state?.toLowerCase().includes(selectedLocationCity.toLowerCase());
      } else if (selectedLocationState) {
        const stateCities = INDIA_LOCATION_DATA[selectedLocationState] || [];
        matchesLocation =
          exp.state?.toLowerCase().includes(selectedLocationState.toLowerCase()) ||
          exp.city?.toLowerCase().includes(selectedLocationState.toLowerCase()) ||
          stateCities.some((c) => exp.city?.toLowerCase().includes(c.toLowerCase()) || exp.city?.toLowerCase().includes(selectedLocationState.toLowerCase()));
      }

      return matchesSearch && matchesServices && matchesLocation;
    }).sort((a, b) => {
      const jobsDiff = (b.completedJobs || 0) - (a.completedJobs || 0);
      if (jobsDiff !== 0) return jobsDiff;
      const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (Number(b.reviewsCount) || 0) - (Number(a.reviewsCount) || 0);
    });
  }, [liveExperts, searchTerm, selectedServices, selectedLocationState, selectedLocationCity, selectedLocationAreas]);

  // Expert Cards Grid Pagination State (Max 9 cards per page)
  const [currentDashboardExpertPage, setCurrentDashboardExpertPage] = useState<number>(1);
  const EXPERTS_PER_PAGE = 9;

  // Reset page when filters change
  useEffect(() => {
    setCurrentDashboardExpertPage(1);
  }, [searchTerm, selectedServices, selectedLocationState, selectedLocationCity, selectedLocationAreas]);

  const totalDashboardExpertPages = Math.max(1, Math.ceil(filteredExperts.length / EXPERTS_PER_PAGE));
  const paginatedDashboardExperts = useMemo(() => {
    const start = (currentDashboardExpertPage - 1) * EXPERTS_PER_PAGE;
    return filteredExperts.slice(start, start + EXPERTS_PER_PAGE);
  }, [filteredExperts, currentDashboardExpertPage]);

  // Active User Session & Database Bookings State
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  // Booking History Pagination State (Max 10 per page)
  const [historyPage, setHistoryPage] = useState<number>(1);
  const HISTORY_PER_PAGE = 10;
  const totalHistoryPages = Math.max(1, Math.ceil(bookingHistory.length / HISTORY_PER_PAGE));
  const paginatedHistory = bookingHistory.slice(
    (historyPage - 1) * HISTORY_PER_PAGE,
    historyPage * HISTORY_PER_PAGE
  );

  // Fetch user-specific bookings filtered by who booked
  const fetchUserBookings = async (userId?: string, email?: string) => {
    try {
      setLoadingBookings(true);
      const params = new URLSearchParams();
      if (userId) params.set("bookedById", userId);
      else if (email) params.set("email", email);

      const res = await fetch(`/api/expert-bookings?${params.toString()}`);
      const json = await res.json();

      if (res.ok && Array.isArray(json.bookings)) {
        const mappedBookings = json.bookings.map((b: any) => ({
          id: b.bookingNumber || b.id,
          expertId: b.expertId,
          expertName: b.expertName,
          expertTitle: b.expertTitle || b.serviceBooked,
          avatar: b.expertAvatar || "",
          phone: b.expertPhone || b.phone || "",
          expertPhone: b.expertPhone || b.phone || "",
          serviceBooked: b.serviceBooked,
          date: b.bookingDate,
          timeSlot: b.timeSlot,
          feePaid: b.feePaid,
          status: b.status,
          property: b.property,
          createdAt: b.createdAt,
          otpCode: b.otpCode,
          userRating: b.userRating,
          userFeedbackTags: b.userFeedbackTags ? JSON.parse(b.userFeedbackTags) : [],
          userComment: b.userComment,
          isRated: b.isRated,
          startedAt: b.startedAt ? new Date(b.startedAt).getTime() : 0,
        }));

        setBookingHistory(mappedBookings);

        const activeUserBookings = mappedBookings
          .filter((b: any) => !String(b.status || "").toLowerCase().includes("completed"))
          .map((b: any) => ({
            id: b.id,
            expertId: b.expertId,
            otpCode: b.otpCode || "489201",
            expertName: b.expertName,
            expertTitle: b.expertTitle,
            avatar: b.avatar,
            phone: b.phone || b.expertPhone || "",
            expertPhone: b.phone || b.expertPhone || "",
            serviceBooked: b.serviceBooked,
            serviceType: b.serviceBooked || b.expertTitle || "Property Consultation",
            property: b.property,
            scheduledTime: `${b.date} • ${b.timeSlot}`,
            status: b.status === "Waiting Confirmation"
              ? "Waiting Confirmation from Expert"
              : b.status,
            visitStage: b.status === "Waiting Confirmation"
              ? "Booking Scheduled (Pending Start)"
              : b.status === "Completed"
              ? "Service Work Completed"
              : "In Progress",
            startedAt: b.startedAt ? new Date(b.startedAt).getTime() : 0,
            feePaid: b.feePaid ?? b.fee ?? 599,
            fee: b.feePaid ?? b.fee ?? 599,
            currency: b.currency || b.expertCurrency,
          }));

        setLiveWorks(activeUserBookings);
      } else {
        setLiveWorks([]);
      }
    } catch (err) {
      console.error("Failed to load user bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Single-shot load sequence on page mount: load user session & fetch active bookings once
  useEffect(() => {
    async function initOnLoad() {
      let userObj: any = null;
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          userObj = data.user;
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.warn("User session check on load:", err);
      }

      await fetchUserBookings(userObj?.id, userObj?.email);
    }

    initOnLoad();
  }, []);

  // Validation when clicking "Book Expert": verify online status before opening modal
  const handleBookExpertClick = async (expert: any) => {
    try {
      const res = await fetch("/api/admin/experts");
      const json = await res.json();

      let isOnlineStatus = expert.isAvailable !== false && String(expert.status || "").toLowerCase() !== "offline";

      if (res.ok && Array.isArray(json.experts)) {
        const latestExpert = json.experts.find(
          (e: any) => e.id === expert.id || (e.email && e.email.toLowerCase() === (expert.email || "").toLowerCase()) || e.name === expert.name
        );
        if (latestExpert) {
          isOnlineStatus = latestExpert.isAvailable !== false && String(latestExpert.status || "").toLowerCase() !== "offline" && String(latestExpert.status || "").toLowerCase() !== "busy";
        }

        // Re-fetch experts list from API so latest updated data is shown on the UI
        const mapped = json.experts.map((exp: any) => ({
          id: exp.id,
          name: exp.name,
          title: exp.specialization ? `${exp.trade} - ${exp.specialization}` : exp.trade,
          trade: exp.trade,
          avatar: exp.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
          experience: exp.experience || "5+ Yrs Exp",
          rating: exp.rating != null ? Number(exp.rating) : 5.0,
          reviewsCount: exp.reviewsCount != null ? Number(exp.reviewsCount) : 0,
          completedJobs: exp.completedJobs ?? 0,
          fee: exp.fee || 599,
          services: [exp.trade || "Home Maintenance"],
          bio: exp.specialization || `${exp.trade} specialist available for on-site booking.`,
          city: exp.city || "NCR",
          phone: exp.phone,
          email: exp.email,
          status: exp.status,
          isAvailable: exp.isAvailable,
        }));
        setLiveExperts(mapped);
      }

      if (!isOnlineStatus) {
        toast(`Sorry, ${expert.name} is currently offline and unavailable for new bookings.`, "error");
        return;
      }

      // Expert is online, open booking modal
      setSelectedExpert(expert);
    } catch (err) {
      console.warn("Expert online validation error:", err);
      if (expert.isAvailable === false || String(expert.status || "").toLowerCase() === "offline") {
        toast(`Sorry, ${expert.name} is currently offline and unavailable for new bookings.`, "error");
        return;
      }
      setSelectedExpert(expert);
    }
  };

  // Handle Confirm Booking with database persistence
  const handleConfirmBooking = async () => {
    if (!selectedExpert) return;

    // Validation if user has no property registered
    if (userProperties.length === 0 && !customAddress.trim() && !mapPinCoords.addressName) {
      toast("Please enter your service address or pick your location from map.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = new Date(bookingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const locationText = userProperties.length > 0 
        ? `${selectedProperty} (${selectedFloor}, ${selectedUnit})`
        : (customAddress.trim() || mapPinCoords.addressName || "On-Site Location");

      const timeSlotText = userProperties.length > 0
        ? `${selectedFloor}, ${selectedUnit}`
        : "On-Site Direct Visit";

      const res = await fetch("/api/expert-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId: selectedExpert.id,
          expertName: selectedExpert.name,
          expertTitle: selectedExpert.title,
          expertAvatar: selectedExpert.avatar,
          expertPhone: selectedExpert.phone,
          serviceBooked: selectedExpert.services?.[0] || selectedExpert.trade || "Home Service",
          bookingDate: formattedDate,
          timeSlot: timeSlotText,
          feePaid: selectedExpert.fee,
          property: locationText,
          notes: bookingNotes,
          bookedById: currentUser?.id || `user_${Date.now()}`,
          bookedByEmail: currentUser?.email || "user@rentawas.com",
          bookedByName: currentUser?.user_metadata?.fullName || currentUser?.user_metadata?.name || "RentAwas User",
          bookedByRole: currentUser?.user_metadata?.role || "owner",
        }),
      });

      const json = await res.json();

      if (res.ok && json.booking) {
        toast(`Booking request submitted! Saved to your account database.`, "success");
        setSelectedExpert(null);
        setWaitingConfirmationBooking({
          id: json.booking.bookingNumber,
          expertName: selectedExpert.name,
          serviceBooked: selectedExpert.services?.[0] || selectedExpert.trade,
          date: formattedDate,
          otpCode: json.booking.otpCode,
        });
        fetchUserBookings(currentUser?.id, currentUser?.email);
      } else {
        toast(json.error || "Failed to save booking.", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to submit booking.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-[#FF6B00]" />
            <span>RENT AWAS VERIFIED EXPERTS NETWORK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Book Certified Home &amp; Property Maintenance Experts
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
            Connect with background-checked plumbers, electricians, househelp, AC repair technicians, carpenters, pest control auditors, and home maintenance specialists.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-center">
            <div className="text-xl font-extrabold text-white">{filteredExperts.length}</div>
            <div className="text-[10px] font-bold text-slate-300 uppercase">EXPERTS</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("book");
              router.push("/dashboard/experts?tab=book");
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "book"
                ? "bg-[#0B132B] text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90"
            }`}
          >
            <Briefcase className="w-4 h-4 text-orange-400" />
            <span>Book Expert</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-[#FF6B00]">
              {filteredExperts.length}
            </span>
          </button>

          {/* CHOICE CHIP: MY BOOKINGS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("live");
              router.push("/dashboard/experts?tab=live");
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "live"
                ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90"
            }`}
          >
            <Zap className={`w-4 h-4 ${activeTab === "live" ? "text-amber-300" : "text-amber-500"}`} />
            <span>My Bookings</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "live" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
            }`}>
              {liveWorks.length} BOOKINGS
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("history");
              router.push("/dashboard/experts?tab=history");
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-[#0B132B] text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90"
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Your Booking History</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
              {bookingHistory.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: BOOK EXPERT TAB */}
      {activeTab === "book" && (
        <div className="space-y-6">
          {/* Multi-Select Services Filter & Search Controls Bar */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Left: Search Input Keyword */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search expert by name, designation, or specialty..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Middle: Multi-Select Services Dropdown Button */}
              <div ref={servicesDropdownRef} className="relative min-w-[280px]">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-between gap-2 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-4 h-4 text-[#FF6B00] shrink-0" />
                    <span className="truncate">
                      {selectedServices.length === 0
                        ? "Select Services Dropdown..."
                        : `${selectedServices.length} Service(s) Selected`}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-3 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Multi-Select Services</span>
                      {selectedServices.length > 0 && (
                        <button
                          onClick={() => setSelectedServices([])}
                          className="text-[11px] font-extrabold text-[#FF6B00] hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {SERVICE_CATEGORIES.map((service, idx) => {
                      const isSelected = selectedServices.includes(service);
                      return (
                        <label
                          key={idx}
                          onClick={() => toggleServiceSelection(service)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 transition-colors"
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            isSelected ? "bg-[#FF6B00] border-[#FF6B00] text-white" : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{service}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Location Cascading Dropdown (India -> State -> City -> Area) */}
              <div ref={locationDropdownRef} className="relative min-w-[240px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsLocationDropdownOpen(!isLocationDropdownOpen);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-between gap-2 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
                    <span className="truncate">
                      {selectedLocationAreas.length > 0
                        ? `📍 ${selectedLocationAreas.length} Area(s) in ${selectedLocationCity}`
                        : selectedLocationCity
                        ? `📍 ${selectedLocationCity}, ${selectedLocationState}`
                        : selectedLocationState
                        ? `📍 ${selectedLocationState} (All Cities)`
                        : selectedLocationCountry
                        ? `🇮🇳 India (Select State)`
                        : "Select Location (India)..."}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isLocationDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Cascading Dropdown Menu */}
                {isLocationDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-3 space-y-2.5 overflow-hidden">
                    
                    {/* Header & Back Controls */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1">
                      {locationStep === "country" && (
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Select Country</span>
                      )}
                      {locationStep === "state" && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocationStep("country");
                            setSelectedLocationCountry("");
                            setSelectedLocationState("");
                            setSelectedLocationCity("");
                            setSelectedLocationAreas([]);
                          }}
                          className="text-[11px] font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          ← Back to Country
                        </button>
                      )}
                      {locationStep === "city" && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocationStep("state");
                            setSelectedLocationCity("");
                            setSelectedLocationAreas([]);
                          }}
                          className="text-[11px] font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          ← Back to States ({selectedLocationState})
                        </button>
                      )}
                      {locationStep === "area" && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocationStep("city");
                            setSelectedLocationAreas([]);
                          }}
                          className="text-[11px] font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          ← Back to Cities ({selectedLocationCity})
                        </button>
                      )}

                      {(selectedLocationCountry || selectedLocationState || selectedLocationCity || selectedLocationAreas.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocationCountry("");
                            setSelectedLocationState("");
                            setSelectedLocationCity("");
                            setSelectedLocationAreas([]);
                            setLocationStep("country");
                          }}
                          className="text-[11px] font-extrabold text-red-500 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* STEP 1: COUNTRY SELECTOR (Only India as requested) */}
                    {locationStep === "country" && (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocationCountry("India");
                            setLocationStep("state");
                          }}
                          className="w-full px-3.5 py-3 rounded-xl text-xs font-extrabold text-left transition-all flex items-center justify-between bg-orange-50/80 hover:bg-orange-100 text-slate-900 border border-orange-200 cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base leading-none">🇮🇳</span>
                            <span className="text-sm font-extrabold">India</span>
                          </div>
                          <span className="text-[10px] font-black bg-[#FF6B00] text-white px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            <span>Select State</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </button>
                      </div>
                    )}

                    {/* STEP 2: STATE SELECTOR */}
                    {locationStep === "state" && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                          🇮🇳 India › Select State or UT ({Object.keys(INDIA_LOCATION_DATA).length} Total)
                        </div>

                        {/* State Search Bar */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={stateSearchQuery}
                            onChange={(e) => setStateSearchQuery(e.target.value)}
                            placeholder="Type state (e.g. Delhi, Maharashtra, UP)..."
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                          />
                        </div>

                        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-0.5">
                          {Object.keys(INDIA_LOCATION_DATA)
                            .filter((st) => st.toLowerCase().includes(stateSearchQuery.toLowerCase()))
                            .map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => {
                                  setSelectedLocationState(st);
                                  setSelectedLocationCity("");
                                  setSelectedLocationAreas([]);
                                  setLocationStep("city");
                                  setStateSearchQuery("");
                                }}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                                  selectedLocationState === st
                                    ? "bg-slate-900 text-white"
                                    : "hover:bg-slate-100 text-slate-800"
                                }`}
                              >
                                <span>{st}</span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: CITY SELECTOR */}
                    {locationStep === "city" && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                          🇮🇳 {selectedLocationState} › Click City for Local Areas
                        </div>

                        {/* City Search Bar */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            placeholder={`Type city name (e.g. Gurgaon, Mumbai)...`}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                          />
                        </div>

                        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-0.5">
                          {/* Dynamic Custom City Selection Option if typing */}
                          {citySearchQuery.trim() !== "" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLocationCity(citySearchQuery.trim());
                                setSelectedLocationAreas([]);
                                setLocationStep("area");
                                setCitySearchQuery("");
                              }}
                              className="w-full px-3 py-2 rounded-xl text-xs font-extrabold text-left bg-orange-50 text-[#FF6B00] border border-orange-200 hover:bg-orange-100 flex items-center justify-between cursor-pointer shadow-2xs"
                            >
                              <span>📍 Select Custom City: "{citySearchQuery.trim()}"</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Option: All Cities in selected state */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLocationCity("");
                              setSelectedLocationAreas([]);
                              setIsLocationDropdownOpen(false);
                              setCitySearchQuery("");
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                              !selectedLocationCity
                                ? "bg-[#FF6B00] text-white"
                                : "hover:bg-slate-100 text-slate-800 border border-dashed border-slate-300"
                            }`}
                          >
                            <span>All Cities in {selectedLocationState}</span>
                            {!selectedLocationCity && <Check className="w-3.5 h-3.5" />}
                          </button>

                          {/* City options */}
                          {(INDIA_LOCATION_DATA[selectedLocationState] || [])
                            .filter((ct) => ct.toLowerCase().includes(citySearchQuery.toLowerCase()))
                            .map((ct) => (
                              <button
                                key={ct}
                                type="button"
                                onClick={() => {
                                  setSelectedLocationCity(ct);
                                  setSelectedLocationAreas([]);
                                  setLocationStep("area");
                                  setCitySearchQuery("");
                                }}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                                  selectedLocationCity === ct
                                    ? "bg-slate-900 text-white"
                                    : "hover:bg-slate-100 text-slate-800"
                                }`}
                              >
                                <span>{ct}</span>
                                <span className="text-[10px] opacity-70 flex items-center gap-0.5">
                                  <span>Areas</span>
                                  <ChevronRight className="w-3 h-3" />
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 4: AREA / LOCALITY SELECTOR */}
                    {locationStep === "area" && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                          📍 {selectedLocationCity} › Select Specific Area / Sector
                        </div>

                        {/* Area Search & Custom Entry Bar */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={areaSearchQuery}
                            onChange={(e) => setAreaSearchQuery(e.target.value)}
                            placeholder={`Search area in ${selectedLocationCity} (e.g. Sector 56)...`}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                          />
                        </div>

                        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-0.5">
                          {/* Dynamic Custom Area Entry Button */}
                          {areaSearchQuery.trim() !== "" && (
                            <button
                              type="button"
                              onClick={() => {
                                toggleLocationArea(areaSearchQuery.trim());
                                setAreaSearchQuery("");
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-xs font-extrabold text-left transition-all flex items-center justify-between cursor-pointer shadow-2xs border ${
                                selectedLocationAreas.includes(areaSearchQuery.trim())
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : "bg-orange-50 text-[#FF6B00] border-orange-200 hover:bg-orange-100"
                              }`}
                            >
                              <span>📍 Select Custom Area: "{areaSearchQuery.trim()}"</span>
                              {selectedLocationAreas.includes(areaSearchQuery.trim()) ? (
                                <Check className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-[#FF6B00]" />
                              )}
                            </button>
                          )}

                          {/* Option: All Localities in selected city */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLocationAreas([]);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                              selectedLocationAreas.length === 0
                                ? "bg-[#FF6B00] text-white"
                                : "hover:bg-slate-100 text-slate-800 border border-dashed border-slate-300"
                            }`}
                          >
                            <span>All Areas in {selectedLocationCity}</span>
                            {selectedLocationAreas.length === 0 && <Check className="w-3.5 h-3.5" />}
                          </button>

                          {/* Area / Locality options */}
                          {(CITY_LOCALITIES_DATA[selectedLocationCity] || DEFAULT_CITY_LOCALITIES)
                            .filter((ar) => ar.toLowerCase().includes(areaSearchQuery.toLowerCase()))
                            .map((ar) => (
                              <button
                                key={ar}
                                type="button"
                                onClick={() => {
                                  toggleLocationArea(ar);
                                }}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                                  selectedLocationAreas.includes(ar)
                                    ? "bg-slate-900 text-white"
                                    : "hover:bg-slate-100 text-slate-800"
                                }`}
                              >
                                <span>{ar}</span>
                                {selectedLocationAreas.includes(ar) && <Check className="w-3.5 h-3.5 text-[#FF6B00]" />}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>

            {/* Active Selected Services & Location Tags Bar */}
            {(selectedServices.length > 0 || searchTerm || selectedLocationState || selectedLocationCity || selectedLocationAreas.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400">Active Filters:</span>
                
                {/* Location Filter Tag */}
                {(selectedLocationState || selectedLocationCity || selectedLocationAreas.length > 0) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white border border-slate-800 rounded-full text-xs font-extrabold shadow-2xs">
                    <MapPin className="w-3 h-3 text-[#FF6B00]" />
                    <span>
                      {selectedLocationAreas.length > 0
                        ? `${selectedLocationAreas.length} Area(s), ${selectedLocationCity}`
                        : selectedLocationCity
                        ? `${selectedLocationCity}, ${selectedLocationState}`
                        : selectedLocationState}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedLocationCountry("");
                        setSelectedLocationState("");
                        setSelectedLocationCity("");
                        setSelectedLocationAreas([]);
                        setLocationStep("country");
                      }}
                      className="hover:text-orange-400 cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Service Filter Tags */}
                {selectedServices.map((service, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#FF6B00] border border-orange-200 rounded-full text-xs font-extrabold"
                  >
                    <span>{service}</span>
                    <button
                      onClick={() => toggleServiceSelection(service)}
                      className="hover:text-slate-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline ml-2 cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            )}
          </div>

          {/* Expert Person Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingLiveExperts ? (
              <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/90">
                <span className="inline-block w-8 h-8 border-3 border-[#FF6B00]/20 border-t-[#FF6B00] rounded-full animate-spin mx-auto" />
                <div className="text-xs font-extrabold text-slate-700">Loading Verified RentAwas Experts...</div>
              </div>
            ) : filteredExperts.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/90">
                <Search className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800">No RentAwas Experts onboarded yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                  Onboard service partners in the Admin Panel to display them here for Landlords.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer inline-block mt-2"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              paginatedDashboardExperts.map((expert) => (
                <div
                  key={expert.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Header: Photo, Name, Rating & Exp */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        {expert.avatar ? (
                          <img
                            src={expert.avatar}
                            alt={expert.name}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white font-black text-xl flex items-center justify-center border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform">
                            {expert.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                              {expert.experience}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase">
                              ✓ {expert.completedJobs ?? 0} Jobs Done
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {/* Eye Icon Button for Right-Side Sidebar Drawer */}
                            <button
                              type="button"
                              onClick={() => setViewingExpertDetails(expert)}
                              className="p-1.5 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                              title="View Expert Profile, Past Work & Reviews"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {(!expert.reviewsCount || Number(expert.reviewsCount) === 0) ? (
                              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-emerald-700 text-xs font-black">
                                <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                                <span>New</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-700 text-xs font-black">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{Number(expert.rating || 5).toFixed(1)}</span>
                                <span className="text-slate-400 text-[10px]">({expert.reviewsCount})</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 truncate tracking-tight">
                          {expert.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold truncate">
                          {expert.title}
                        </p>
                      </div>
                    </div>

                    {/* Bio Description */}
                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                      {expert.bio}
                    </p>

                    {/* Offered Services Tags */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services Offered:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {expert.services.map((srv: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/90 text-[11px] font-bold text-slate-700"
                          >
                            ✓ {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Consultation Fee & Book Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee</div>
                      <div className="text-lg font-black text-slate-900">
                        {getExpertCurrencySymbol(expert.currency)}{expert.fee.toLocaleString()}
                        <span className="text-xs text-slate-500 font-medium"> / session</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookExpertClick(expert)}
                      className="px-4 py-2.5 bg-[#0B132B] hover:bg-[#FF6B00] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Book Expert</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Expert Cards Grid Pagination Controls Bar (Max 9 items per page) */}
          {filteredExperts.length > EXPERTS_PER_PAGE && (
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs font-bold text-slate-700">
              <div className="text-slate-500 text-xs">
                Showing{" "}
                <span className="font-black text-slate-900">
                  {Math.min((currentDashboardExpertPage - 1) * EXPERTS_PER_PAGE + 1, filteredExperts.length)}
                </span>{" "}
                to{" "}
                <span className="font-black text-slate-900">
                  {Math.min(currentDashboardExpertPage * EXPERTS_PER_PAGE, filteredExperts.length)}
                </span>{" "}
                of <span className="font-black text-slate-900">{filteredExperts.length}</span> Experts
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={currentDashboardExpertPage === 1}
                  onClick={() => {
                    setCurrentDashboardExpertPage((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl text-slate-800 font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalDashboardExpertPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => {
                      setCurrentDashboardExpertPage(pNum);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-9 h-9 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center cursor-pointer shadow-2xs ${
                      currentDashboardExpertPage === pNum
                        ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentDashboardExpertPage === totalDashboardExpertPages}
                  onClick={() => {
                    setCurrentDashboardExpertPage((prev) => Math.min(totalDashboardExpertPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl text-slate-800 font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY BOOKINGS TAB */}
      {activeTab === "live" && (
        <div className="space-y-6 font-sans">
          
          {/* My Bookings Banner Header */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>MY BOOKED MAINTENANCE EXPERTS DESK</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Expert Bookings &amp; Service Status
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                View all your booked maintenance &amp; property expert requests in one place. Track assigned experts, scheduled visit slots, live work stages, and security OTP verification codes.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-center backdrop-blur-xs">
                <div className="text-xl font-extrabold text-emerald-400">{liveWorks.length} Total</div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Booked Services</div>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveWorks.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800">No bookings placed yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                  When you book a RentAwas expert (even before work starts), your booking requests, scheduling info &amp; security OTP codes will automatically appear here.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("book");
                    router.push("/dashboard/experts?tab=book");
                  }}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl text-xs font-extrabold cursor-pointer inline-block mt-2 shadow-xs transition-all"
                >
                  Book an Expert Now
                </button>
              </div>
            ) : (
              liveWorks.map((work) => (
                <div
                  key={work.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md space-y-5 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Status Bar */}
                    {(() => {
                      const statusStr = String(work.status || "").toLowerCase();
                      const isPending = statusStr.includes("waiting") || statusStr.includes("pending");
                      const isAccepted = statusStr.includes("confirmed") || statusStr.includes("accepted");
                      const isCompleted = statusStr.includes("completed");
                      const isInProgress = statusStr.includes("in progress") || statusStr.includes("live");

                      return (
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-xs font-black text-amber-800 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                                ⏳ Awaiting Expert Confirmation
                              </span>
                            </div>
                          ) : isAccepted ? (
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                              <span className="text-xs font-black text-blue-800 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                                ✓ EXPERT ACCEPTED THE JOB
                              </span>
                            </div>
                          ) : isCompleted ? (
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                ✓ SERVICE WORK COMPLETED
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                🟢 LIVE ON-SITE WORK IN PROGRESS
                              </span>
                            </div>
                          )}

                          {isInProgress && (
                            <div className="font-mono text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                              <span>{formatElapsedTime(work.startedAt)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Assigned Expert Info Box */}
                    <div className="flex items-start gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <img
                        src={work.avatar}
                        alt={work.expertName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                            ✓ RentAwas Certified
                          </span>
                          <span className="text-xs font-black text-slate-900 font-mono">{work.id}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">{work.expertName}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">{work.expertTitle}</p>
                      </div>
                    </div>

                    {/* Property & Service Details Box */}
                    <div className="space-y-2 text-xs font-medium bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-900 font-extrabold border-b border-slate-100 pb-2">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#FF6B00]" />
                          <span>{work.property}</span>
                        </span>
                        <span className="text-emerald-700 font-black">{getExpertCurrencySymbol(work.currency)}{Number(work.feePaid ?? work.fee ?? 599).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 pt-1">
                        <span className="text-slate-500 font-bold">Service Type:</span>
                        <span className="font-extrabold text-slate-800">{work.serviceType}</span>
                      </div>
                    </div>

                    {/* 6-DIGIT SECURITY OTP CARD BOX */}
                    <div className="p-5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-slate-900 text-white rounded-2xl shadow-xl space-y-3 relative overflow-hidden border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">WORK COMPLETION SECURITY OTP</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">One-Time Passcode</span>
                      </div>

                      {/* Random 6-Digit OTP Display Box */}
                      <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/20">
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-300 uppercase">Share with Expert On-Site:</div>
                          <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400 tracking-widest">
                            {work.otpCode}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(work.otpCode);
                            toast(`Copied Security OTP ${work.otpCode} to clipboard!`, "success");
                          }}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer shrink-0 uppercase tracking-wider shadow-xs"
                        >
                          Copy OTP
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                        🔒 Provide this 6-digit code to <strong>{work.expertName}</strong> when work is complete to verify job accuracy &amp; release escrow payment.
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Quick Contact */}
                  {(() => {
                    const matchedExpert = liveExperts.find((e) => e.id === work.expertId || e.name === work.expertName);
                    const phoneToShow = work.phone || work.expertPhone || matchedExpert?.phone || "+91 98765 43210";
                    return (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <a
                          href={`tel:${phoneToShow}`}
                          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call Expert ({phoneToShow})</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            toast("Redirecting to RentAwas Support Desk...", "info");
                            router.push(typeof window !== "undefined" && window.location.pathname.startsWith("/tenant") ? "/tenant/support" : "/dashboard/support");
                          }}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                        >
                          Support Desk
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* VIEW 3: YOUR BOOKING HISTORY TAB */}
      {activeTab === "history" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                <span>Your Expert Consultations &amp; Service History</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">List of all scheduled, active, and completed expert bookings</p>
            </div>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold">
              {bookingHistory.length} Total Bookings
            </span>
          </div>

          <div className="space-y-4">
            {bookingHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium text-xs bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <History className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No expert consultations or service history yet.</p>
              </div>
            ) : (
              paginatedHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.expertName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white font-black text-lg flex items-center justify-center border border-slate-200 shrink-0">
                        {String(item.expertName || "EX").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">{item.expertName}</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          String(item.status || "").toLowerCase().includes("completed")
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : String(item.status || "").toLowerCase().includes("confirmed") || String(item.status || "").toLowerCase().includes("accepted")
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          ✓ {String(item.status || "").toLowerCase().includes("completed") ? "COMPLETED" : item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold">{item.serviceBooked}</p>
                      <div className="text-[11px] text-slate-500 font-medium flex flex-wrap items-center gap-3 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>{item.date} at {item.timeSlot}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.property}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Fee Paid</div>
                      <div className="text-base font-black text-slate-900">{getExpertCurrencySymbol(item.currency || item.expertCurrency)}{Number(item.feePaid ?? item.fee ?? 599).toLocaleString()}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isRated ? (
                        <button
                          type="button"
                          onClick={() => openRatingModal(item)}
                          className="px-3.5 py-2 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Rated {item.userRating}.0 ⭐</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openRatingModal(item)}
                          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-500/20 uppercase tracking-wider"
                        >
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Rate Service ⭐</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openBookingDetailsSidebar(item)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Bar for Booking History (Max 10 per page) */}
          {totalHistoryPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium">
                Showing <strong>{(historyPage - 1) * HISTORY_PER_PAGE + 1}</strong> to{" "}
                <strong>{Math.min(historyPage * HISTORY_PER_PAGE, bookingHistory.length)}</strong> of{" "}
                <strong>{bookingHistory.length}</strong> total bookings
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-200/80"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setHistoryPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        historyPage === pageNum
                          ? "bg-[#FF6B00] text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={historyPage === totalHistoryPages}
                  onClick={() => setHistoryPage((prev) => Math.min(totalHistoryPages, prev + 1))}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-200/80"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedExpert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedExpert(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              {selectedExpert.avatar ? (
                <img
                  src={selectedExpert.avatar}
                  alt={selectedExpert.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white font-black text-lg flex items-center justify-center border border-slate-200">
                  {selectedExpert.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{selectedExpert.name}</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedExpert.title}</p>
              </div>
            </div>

            {/* Booking Options Form */}
            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5 uppercase tracking-wider text-[10px]">
                  Select Consultation Date *
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                />
              </div>

              {/* IF USER HAS REGISTERED PROPERTIES */}
              {userProperties.length > 0 ? (
                <>
                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1.5 uppercase tracking-wider text-[10px]">
                      Select Property
                    </label>
                    <div className="relative">
                      <select
                        value={selectedProperty}
                        onChange={(e) => {
                          const propName = e.target.value;
                          setSelectedProperty(propName);
                          const foundProp = userProperties.find((p) => p.name === propName);
                          if (foundProp) {
                            if (foundProp.units && foundProp.units.length > 0) {
                              const firstUnit = foundProp.units[0];
                              setSelectedUnit(firstUnit.unitNumber || `Unit 101`);
                              const fNum = firstUnit.floorNumber ?? 1;
                              const fLabel = fNum === 0 ? "Ground Floor" : fNum === 1 ? "1st Floor" : fNum === 2 ? "2nd Floor" : fNum === 3 ? "3rd Floor" : `${fNum}th Floor`;
                              setSelectedFloor(fLabel);
                            } else {
                              setSelectedFloor("1st Floor");
                            }
                          }
                        }}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {userProperties.map((prop) => (
                          <option key={prop.id} value={prop.name}>
                            {prop.name} ({prop.address || prop.category || "Property"})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-extrabold text-slate-800 mb-1.5 uppercase tracking-wider text-[10px]">
                        Select Floor
                      </label>
                      <div className="relative">
                        <select
                          value={selectedFloor}
                          onChange={(e) => {
                            const newFloorLabel = e.target.value;
                            setSelectedFloor(newFloorLabel);

                            const selectedPropObj = userProperties.find((p) => p.name === selectedProperty);
                            if (selectedPropObj?.units && selectedPropObj.units.length > 0) {
                              const floorNumMatch = newFloorLabel.match(/\d+/);
                              const targetFloorNum = newFloorLabel.toLowerCase().includes("ground")
                                ? 0
                                : floorNumMatch
                                ? parseInt(floorNumMatch[0], 10)
                                : 1;

                              const floorUnits = selectedPropObj.units.filter((u: any) => (u.floorNumber ?? 1) === targetFloorNum);
                              if (floorUnits.length > 0) {
                                setSelectedUnit(floorUnits[0].unitNumber);
                              }
                            }
                          }}
                          className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                        >
                          {(() => {
                            const selectedPropObj = userProperties.find((p) => p.name === selectedProperty);
                            if (selectedPropObj) {
                              let floorNums: number[] = [];
                              if (selectedPropObj.units && selectedPropObj.units.length > 0) {
                                const unitFloors = selectedPropObj.units.map((u: any) => u.floorNumber ?? 1);
                                floorNums = Array.from(new Set(unitFloors)).sort((a: any, b: any) => a - b) as number[];
                              }
                              if (floorNums.length === 0) {
                                const maxF = Math.max(1, selectedPropObj.floors || 1);
                                floorNums = Array.from({ length: maxF }, (_, i) => i + 1);
                              }
                              return floorNums.map((fNum) => {
                                const label = fNum === 0 ? "Ground Floor" : fNum === 1 ? "1st Floor" : fNum === 2 ? "2nd Floor" : fNum === 3 ? "3rd Floor" : `${fNum}th Floor`;
                                return (
                                  <option key={fNum} value={label}>{label}</option>
                                );
                              });
                            }
                            return (
                              <>
                                <option value="1st Floor">1st Floor</option>
                                <option value="2nd Floor">2nd Floor</option>
                              </>
                            );
                          })()}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-800 mb-1.5 uppercase tracking-wider text-[10px]">
                        Select Unit / Flat
                      </label>
                      <div className="relative">
                        <select
                          value={selectedUnit}
                          onChange={(e) => setSelectedUnit(e.target.value)}
                          className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                        >
                          {(() => {
                            const selectedPropObj = userProperties.find((p) => p.name === selectedProperty);
                            if (selectedPropObj?.units && selectedPropObj.units.length > 0) {
                              const floorNumMatch = selectedFloor.match(/\d+/);
                              const targetFloorNum = selectedFloor.toLowerCase().includes("ground")
                                ? 0
                                : floorNumMatch
                                ? parseInt(floorNumMatch[0], 10)
                                : 1;

                              const floorUnits = selectedPropObj.units.filter((u: any) => (u.floorNumber ?? 1) === targetFloorNum);
                              const unitsToDisplay = floorUnits.length > 0 ? floorUnits : selectedPropObj.units;

                              return unitsToDisplay.map((u: any) => (
                                <option key={u.id} value={u.unitNumber}>
                                  {u.unitNumber} {u.isOccupied ? "(Occupied)" : "(Vacant)"}
                                </option>
                              ));
                            }
                            const floorNumMatch = selectedFloor.match(/\d+/);
                            const fallbackNum = floorNumMatch ? floorNumMatch[0] : "1";
                            return (
                              <>
                                <option value={`Unit ${fallbackNum}01`}>Unit {fallbackNum}01</option>
                                <option value={`Unit ${fallbackNum}02`}>Unit {fallbackNum}02</option>
                              </>
                            );
                          })()}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* IF USER DOES NOT HAVE REGISTERED PROPERTIES */
                <div className="space-y-3 p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-2xl">
                  <div className="space-y-1.5">
                    <label className="block font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">
                      Enter Service Address *
                    </label>
                    <input
                      type="text"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Royal Residency, Sector 28, Gurgaon"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  {/* Pick from Map Button */}
                  <button
                    type="button"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <MapPin className="w-4 h-4 text-[#FF6B00]" />
                    <span>Pick from Map for Correct Location</span>
                  </button>

                  {/* Map Pin Result Readout */}
                  {mapPinCoords.addressName && (
                    <div className="text-[11px] font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#FF6B00] shrink-0" />
                      <span className="truncate">📍 Pin: {mapPinCoords.addressName}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5 uppercase tracking-wider text-[10px]">
                  Special Instructions / Notes (Optional)
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Water leak in kitchen sink; please call before coming..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Payable Fee</div>
                  <div className="text-base font-black text-slate-900">{getExpertCurrencySymbol(selectedExpert.currency)}{selectedExpert.fee.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedExpert(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Expert Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAP PICKER MODAL */}
      {isMapPickerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative font-sans text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6B00] flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Pick Exact Location from Map</h3>
                  <p className="text-[11px] font-medium text-slate-500">Click anywhere on map or search locality for pin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapPickerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input & Detect GPS Button */}
            <div className="space-y-2 relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    placeholder="Search area, landmark, street address (e.g. Bandra, Patna, DLF Gurgaon)..."
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  {isSearchingMap && (
                    <Loader2 className="w-3.5 h-3.5 text-[#FF6B00] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  title="Detect current GPS location"
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>GPS</span>
                </button>
              </div>

              {/* Real-time Recommendations Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-11 left-0 right-14 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 font-sans animate-in fade-in duration-150">
                  <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Location Recommendations</span>
                    <span className="text-[#FF6B00]">{suggestions.length} Options</span>
                  </div>
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectGeocodedLocation(item)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-orange-50/80 transition-colors flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === "google" ? (
                          <div className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center font-bold text-[10px]">
                            G
                          </div>
                        ) : item.type === "road" ? (
                          <Compass className="w-4 h-4 text-purple-600" />
                        ) : item.type === "city" ? (
                          <Building2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-900 group-hover:text-[#FF6B00] truncate">
                          {item.display_name}
                        </div>
                        {item.subtitle && (
                          <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Location Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-[11px] font-bold">
                {[
                  "DLF Phase 1, Gurgaon",
                  "Indiranagar, Bengaluru",
                  "Boring Road, Patna",
                  "Andheri West, Mumbai",
                  "Connaught Place, Delhi",
                  "Banjara Hills, Hyderabad"
                ].map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMapSearchQuery(loc);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-[#FF6B00] rounded-lg border border-slate-200/80 whitespace-nowrap cursor-pointer transition-all"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Google Maps Embed */}
            <div className="h-64 rounded-2xl bg-slate-900 relative overflow-hidden border border-slate-800 flex items-center justify-center select-none shadow-inner group">
              <iframe
                key={mapPinCoords.addressName || mapSearchQuery}
                title="Google Maps Location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapSearchQuery || mapPinCoords.addressName)}&output=embed`}
                className="w-full h-full border-0 pointer-events-auto"
                allowFullScreen
                loading="lazy"
              />

              {/* Floating Address Tag */}
              <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none">
                <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-extrabold rounded-xl border border-orange-500/40 shadow-lg flex items-center gap-1.5 w-fit max-w-full truncate">
                  <Navigation className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                  <span className="truncate">{mapPinCoords.addressName}</span>
                </div>
              </div>

              {/* Floating GPS Readout */}
              <div className="absolute bottom-2 right-2 z-10 px-2.5 py-1 bg-slate-900/90 text-[10px] font-mono font-bold text-slate-300 rounded-md border border-slate-700 pointer-events-none shadow-md">
                GPS: {mapPinCoords.lat.toFixed(4)} N, {mapPinCoords.lng.toFixed(4)} E
              </div>
            </div>

            {/* Pin Micro-Nudge & Directional Location Adjuster */}
            <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Adjust Pin Location</span>
                <span className="text-[11px] font-bold text-slate-700">Nudge pin position to exact gate or entrance</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => movePinByOffset(0.0005, 0)}
                  title="Move Pin North"
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-[#FF6B00] hover:border-orange-500/40 font-black text-xs flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                >
                  ⬆️
                </button>
                <button
                  type="button"
                  onClick={() => movePinByOffset(-0.0005, 0)}
                  title="Move Pin South"
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-[#FF6B00] hover:border-orange-500/40 font-black text-xs flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                >
                  ⬇️
                </button>
                <button
                  type="button"
                  onClick={() => movePinByOffset(0, -0.0005)}
                  title="Move Pin West"
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-[#FF6B00] hover:border-orange-500/40 font-black text-xs flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                >
                  ⬅️
                </button>
                <button
                  type="button"
                  onClick={() => movePinByOffset(0, 0.0005)}
                  title="Move Pin East"
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-[#FF6B00] hover:border-orange-500/40 font-black text-xs flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                >
                  ➡️
                </button>
              </div>
            </div>

            {/* Selected Address Output */}
            <div className="p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold text-[#FF6B00] uppercase tracking-wider block">Selected Location Address</span>
              <p className="text-xs font-black text-slate-900 leading-snug">
                {mapSearchQuery ? `${mapSearchQuery}` : mapPinCoords.addressName}
              </p>
            </div>

            {/* Confirm Location Button */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsMapPickerOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalAddr = mapSearchQuery ? `${mapSearchQuery}` : mapPinCoords.addressName;
                  setCustomAddress(finalAddr);
                  setMapPinCoords({
                    ...mapPinCoords,
                    addressName: finalAddr
                  });
                  setIsMapPickerOpen(false);
                }}
                className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Pin Location</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT-HAND SIDE SLIDE-OVER DRAWER PANEL (Expert Full Profile, Work History & Reviews) */}
      {viewingExpertDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0" onClick={() => setViewingExpertDetails(null)} />

          {/* Drawer Sidebar Container */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 font-sans border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Expert Profile &amp; Past Work</span>
              </div>

              <button
                onClick={() => setViewingExpertDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content Scroll Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Expert Top Banner */}
              <div className="flex items-start gap-4">
                <img
                  src={viewingExpertDetails.avatar}
                  alt={viewingExpertDetails.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                    {viewingExpertDetails.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {viewingExpertDetails.title}
                  </p>
                </div>
              </div>

              {/* Joining Date & Key Metrics Box */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200/90 rounded-2xl">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Joined RentAwas</div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Joined {viewingExpertDetails.createdAt ? new Date(viewingExpertDetails.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "March 2024"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Completed Sessions</div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>{viewingExpertDetails.completedJobs ?? 0} Completed</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Client Rating</div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    {(!viewingExpertDetails.reviewsCount || Number(viewingExpertDetails.reviewsCount) === 0) ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase">
                        New Partner (0 Reviews)
                      </span>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{Number(viewingExpertDetails.rating || 5).toFixed(1)} / 5.0 ({viewingExpertDetails.reviewsCount} Reviews)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Experience</div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>{viewingExpertDetails.experience}</span>
                  </div>
                </div>
              </div>

              {/* Bio & Background */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Professional Bio</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                  {viewingExpertDetails.bio}
                </p>
              </div>

              {/* Past Work & Key Portfolio Accomplishments */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#FF6B00]" />
                  <span>Past Work &amp; Track Record</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-700">Specialist in {viewingExpertDetails.title || viewingExpertDetails.trade} with {viewingExpertDetails.experience || "verified experience"}.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-700">Operating in {viewingExpertDetails.city || "NCR"} ({viewingExpertDetails.workDays || "Mon-Sat"}, {viewingExpertDetails.workStartTime || "08:00 AM"} – {viewingExpertDetails.workEndTime || "08:00 PM"}).</span>
                  </div>
                </div>
              </div>

              {/* Past Client Reviews */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Client Reviews &amp; Feedback</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">{loadingDrawerReviews ? "Loading..." : `${drawerReviews.length} Reviews`}</span>
                </div>

                <div className="space-y-3">
                  {loadingDrawerReviews ? (
                    <div className="p-4 text-center text-xs font-bold text-slate-400 animate-pulse bg-slate-50 rounded-xl border">
                      Loading verified reviews for {viewingExpertDetails.name}...
                    </div>
                  ) : drawerReviews.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center text-xs text-slate-500 font-medium">
                      No client reviews for this expert yet. Book and leave the first review!
                    </div>
                  ) : (
                    drawerReviews.map((rev: any) => (
                      <div key={rev.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900">{rev.clientName} ({rev.clientRole})</span>
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                            ★ {Number(rev.rating).toFixed(1)}
                          </div>
                        </div>
                        <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                          &quot;{rev.comment}&quot;
                        </p>
                        <div className="text-[10px] text-slate-400 font-bold">{rev.date} • Verified RentAwas Client</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer Sticky Action Bar */}
            <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 z-20 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee</div>
                <div className="text-lg font-black text-slate-900">
                  {getExpertCurrencySymbol(viewingExpertDetails.currency)}{viewingExpertDetails.fee.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500"> / session</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const target = viewingExpertDetails;
                  setViewingExpertDetails(null);
                  setSelectedExpert(target);
                }}
                className="px-5 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <UserCheck className="w-4 h-4" />
                <span>Book This Expert</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* WAITING FOR EXPERT CONFIRMATION MODAL */}
      {waitingConfirmationBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-center">
            <button
              onClick={() => setWaitingConfirmationBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pulsing Status Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-4 border-amber-200 text-amber-600 flex items-center justify-center relative">
              <Clock className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </span>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                ⏳ WAITING FOR CONFIRMATION FROM EXPERT END
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Booking Request Dispatched</h3>
              <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                Your request <strong>{waitingConfirmationBooking.id}</strong> has been sent to <strong>{waitingConfirmationBooking.expertName}</strong>. Waiting for the expert to approve &amp; accept your booking from their RentAwas Partner Portal.
              </p>
            </div>

            {/* Booking Details Summary Box */}
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Expert</span>
                <span className="font-extrabold text-slate-900">{waitingConfirmationBooking.expertName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Property &amp; Unit</span>
                <span className="font-bold text-slate-800">{waitingConfirmationBooking.property}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Booking Status</span>
                <span className="font-black text-amber-600">Pending Expert Accept</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setWaitingConfirmationBooking(null);
                  setActiveTab("history");
                  router.push("/dashboard/experts?tab=history");
                }}
                className="w-full py-3 bg-[#0B132B] hover:bg-[#FF6B00] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md uppercase tracking-wider"
              >
                View in Booking History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CUSTOMER RATING & REVIEW EXPERT SERVICE ──────────────────── */}
      {selectedBookingForRating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative font-sans animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            <button
              type="button"
              onClick={() => setSelectedBookingForRating(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <img
                src={selectedBookingForRating.avatar}
                alt={selectedBookingForRating.expertName}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black uppercase mb-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>Rate Completed Expert Service</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedBookingForRating.expertName}</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedBookingForRating.serviceBooked} • {selectedBookingForRating.property}</p>
              </div>
            </div>

            {/* Rating Controls Form */}
            <div className="space-y-5 text-xs font-sans">
              
              {/* STAR RATING PICKER */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3 text-center">
                <label className="block font-extrabold text-amber-950 uppercase tracking-wider text-[11px]">
                  How would you rate your overall service experience?
                </label>

                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserStarRating(star)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                        star <= userStarRating
                          ? "bg-white border-amber-400 text-amber-500 shadow-md scale-110"
                          : "bg-white/60 border-slate-200 text-slate-300 hover:text-amber-400"
                      }`}
                    >
                      <Star className={`w-6 h-6 ${star <= userStarRating ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  ))}
                </div>

                <div className="text-xs font-black text-amber-900">
                  {userStarRating === 5 ? "⭐ 5.0 - Excellent Work! Highly Recommended" : userStarRating === 4 ? "⭐ 4.0 - Very Good & Prompt Service" : userStarRating === 3 ? "⭐ 3.0 - Satisfactory Work" : "⭐ Needs Improvement"}
                </div>
              </div>

              {/* QUICK FEEDBACK TAGS */}
              <div className="space-y-2">
                <label className="block font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                  Select Key Highlights &amp; Feedback Badges
                </label>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Punctual & Professional",
                    "High Quality Work",
                    "Clean & Neat Worksite",
                    "Polite & Respectful",
                    "Fair Pricing & Transparent",
                    "Quick Problem Resolution",
                  ].map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!userFeedbackTags.includes(tag)) {
                          setUserFeedbackTags([...userFeedbackTags, tag]);
                        } else {
                          setUserFeedbackTags(userFeedbackTags.filter((t) => t !== tag));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        userFeedbackTags.includes(tag)
                          ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {userFeedbackTags.includes(tag) ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* WRITTEN REVIEW COMMENT TEXTAREA */}
              <div className="space-y-1.5">
                <label className="block font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                  Write Optional Service Review (Visible on Expert Profile)
                </label>
                <textarea
                  value={userReviewComment}
                  onChange={(e) => setUserReviewComment(e.target.value)}
                  rows={3}
                  placeholder="e.g. Anil arrived on time, fixed the water leak cleanly, and verified pressure test. Highly recommended!"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedBookingForRating(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitUserRating}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Star className="w-4 h-4 fill-white text-white" />
                <span>Submit Rating &amp; Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* BOOKING DETAILS RIGHT SIDEBAR DRAWER */}
      {showBookingDetailsSidebar && selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setShowBookingDetailsSidebar(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 relative z-10">
              
              {/* Drawer Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 text-[10px] font-black font-mono">
                      {selectedBookingForDetails.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      String(selectedBookingForDetails.status || "").toLowerCase().includes("completed")
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : String(selectedBookingForDetails.status || "").toLowerCase().includes("confirmed") || String(selectedBookingForDetails.status || "").toLowerCase().includes("accepted")
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}>
                      {String(selectedBookingForDetails.status || "").toLowerCase().includes("completed") ? "✓ COMPLETED" : selectedBookingForDetails.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight pt-1">
                    Booking &amp; Consultation Summary
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBookingDetailsSidebar(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Scroll Area */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs font-medium text-slate-700">
                
                {/* Section 1: Assigned Expert Profile Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Maintenance Partner</div>
                  <div className="flex items-center gap-3">
                    {selectedBookingForDetails.avatar ? (
                      <img
                        src={selectedBookingForDetails.avatar}
                        alt={selectedBookingForDetails.expertName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white font-black text-base flex items-center justify-center shrink-0">
                        {String(selectedBookingForDetails.expertName || "EX").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-sm truncate">{selectedBookingForDetails.expertName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">{selectedBookingForDetails.expertTitle || selectedBookingForDetails.serviceBooked}</p>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 pt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>RentAwas Verified Master Expert</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Phone / Contact Action */}
                  {(() => {
                    const matchedExpert = liveExperts.find((e) => e.id === selectedBookingForDetails.expertId || e.name === selectedBookingForDetails.expertName);
                    const phone = selectedBookingForDetails.phone || selectedBookingForDetails.expertPhone || matchedExpert?.phone || "+91 98765 43210";
                    return (
                      <a
                        href={`tel:${phone}`}
                        className="mt-2 w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call Expert ({phone})</span>
                      </a>
                    );
                  })()}
                </div>

                {/* Section 2: Service Visit Schedule & Location */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Visit Details</div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <Wrench className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Requested Trade Category</div>
                        <div className="font-extrabold text-slate-900 text-xs">{selectedBookingForDetails.serviceBooked}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Scheduled Time Slot</div>
                        <div className="font-extrabold text-slate-900 text-xs">{selectedBookingForDetails.date} at {selectedBookingForDetails.timeSlot}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Service Premises Location</div>
                        <div className="font-extrabold text-slate-900 text-xs">{selectedBookingForDetails.property}</div>
                      </div>
                    </div>

                    {/* 6-Digit OTP Box */}
                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 uppercase">
                        <span>Work Verification Security OTP:</span>
                        <span className="font-mono font-black text-amber-700">{selectedBookingForDetails.otpCode || "489201"}</span>
                      </div>
                      <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                        Share this 6-digit code with {selectedBookingForDetails.expertName} upon on-site visit completion.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Financial Payment Summary */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Breakdown</span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      ✓ ESCROW PROTECTED
                    </span>
                  </div>

                  <div className="space-y-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Consultation &amp; Visit Fee</span>
                      <span className="font-bold text-slate-900">{getExpertCurrencySymbol(selectedBookingForDetails.currency)}{Number(selectedBookingForDetails.feePaid ?? selectedBookingForDetails.fee ?? 599).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">RentAwas Platform Surcharge</span>
                      <span className="font-bold text-emerald-600">₹0 (0% Free)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Taxes &amp; Service Insurance</span>
                      <span className="font-bold text-slate-900">₹0 (Included)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-sm font-black text-slate-900">
                    <span>Total Amount Paid</span>
                    <span className="text-base text-emerald-700">{getExpertCurrencySymbol(selectedBookingForDetails.currency)}{Number(selectedBookingForDetails.feePaid ?? selectedBookingForDetails.fee ?? 599).toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Transaction Ref:</span>
                    <span className="font-bold text-slate-800">ESCROW-{selectedBookingForDetails.id}</span>
                  </div>
                </div>

                {/* Section 4: What Happened / Work Completion Audit Log */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Work &amp; Audit Log</div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-medium space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        {String(selectedBookingForDetails.status || "").toLowerCase().includes("completed")
                          ? "Service Visit Completed & Verified"
                          : "Booking Scheduled & Awaiting On-Site Visit"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {String(selectedBookingForDetails.status || "").toLowerCase().includes("completed")
                        ? "Expert performed diagnostic inspection and resolved property maintenance requirements. Work report verified by tenant/landlord."
                        : `Assigned partner ${selectedBookingForDetails.expertName} is scheduled to arrive at your premises during the chosen time slot.`}
                    </p>
                  </div>
                </div>

                {/* Section 5: Ratings & Client Feedback */}
                {selectedBookingForDetails.isRated ? (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Your Submitted Rating</span>
                      <span className="font-extrabold text-xs text-amber-800">{selectedBookingForDetails.userRating}.0 ★★★★★</span>
                    </div>
                    {selectedBookingForDetails.userFeedbackTags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedBookingForDetails.userFeedbackTags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md border border-amber-200">
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {selectedBookingForDetails.userComment && (
                      <p className="text-xs text-amber-950 font-medium italic pt-1 border-t border-amber-200/60">
                        &ldquo;{selectedBookingForDetails.userComment}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-slate-900 text-xs">Have you completed this visit?</div>
                      <div className="text-[10px] text-slate-500 font-medium">Rate your experience &amp; help keep RentAwas quality high!</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingDetailsSidebar(false);
                        openRatingModal(selectedBookingForDetails);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-md shrink-0 uppercase tracking-wider"
                    >
                      Rate ⭐
                    </button>
                  </div>
                )}

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <Link
                  href={typeof window !== "undefined" && window.location.pathname.startsWith("/tenant") ? "/tenant/support" : "/dashboard/support"}
                  className="flex-1 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-extrabold text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Support Desk</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowBookingDetailsSidebar(false)}
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RentAwasExpertsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-extrabold text-slate-500 space-y-3">
          <span className="inline-block w-8 h-8 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading Experts Workspace...</p>
        </div>
      }
    >
      <RentAwasExpertsContent />
    </Suspense>
  );
}
