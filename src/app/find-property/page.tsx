"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EarlyAccessModal from "@/components/ui/EarlyAccessModal";
import {
  Search,
  MapPin,
  Building2,
  SlidersHorizontal,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Star,
  PhoneCall,
  Calendar,
  CheckCircle2,
  Sparkles,
  X,
  User,
  Mail,
  Heart,
  ChevronLeft,
  ChevronRight,
  Lock,
  Zap,
  Eye,
  EyeOff,
  Share2,
  Check,
  Compass,
  Layers,
  Shield,
  Info
} from "lucide-react";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { createUserProfileAndWorkspace } from "@/app/actions/authActions";
import { useWishlist } from "@/hooks/useWishlist";

const AMENITY_LABELS: Record<string, string> = {
  wifi: "High-Speed WiFi",
  parking: "Car Parking",
  gym: "Fitness Gym",
  security: "24x7 Security",
  ac: "Air Conditioning",
  backup: "Power Backup",
  tv: "Smart TV",
  kitchen: "Modular Kitchen",
  pool: "Swimming Pool",
  laundry: "Washing Machine",
  ev: "EV Charger",
  balcony: "Private Balcony",
  lift: "Elevator / Lift",
  ro: "RO Water Purifier",
  pet: "Pet Friendly",
  geyser: "Geyser",
  maid: "Housekeeping",
  study: "Study Desk",
  gated: "Gated Community",
  intercom: "Intercom Safety",
};

const formatAmenityTag = (tag: string): string => {
  if (!tag) return "";
  const lower = tag.toLowerCase().trim();
  return AMENITY_LABELS[lower] || (tag.charAt(0).toUpperCase() + tag.slice(1));
};

interface PropertyItem {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string;
  type: string;
  bhk: string;
  size: string;
  sqft?: number | null;
  deposit?: number | null;
  rating: number;
  reviewsCount: number;
  image: string;
  tags: string[];
  ownerName: string;
  ownerPhone: string;
  badge: string;
}

export default function FindPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);

  // Filter States
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedBhk, setSelectedBhk] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");

  // Lead Contact & Detail Modal State
  const [viewingPropertyDetail, setViewingPropertyDetail] = useState<PropertyItem | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [moveInDate, setMoveInDate] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // User Session & Wishlist Auth Control
  const [userSession, setUserSession] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingWishlistProperty, setPendingWishlistProperty] = useState<PropertyItem | null>(null);

  // In-Place Auth Modal Form States
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authCountry, setAuthCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { likedProperties, toggleWishlist, addToWishlist } = useWishlist(!!userSession);

  // API & Pagination States
  const [apiListings, setApiListings] = useState<PropertyItem[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMarketplaceListings = async () => {
    setIsLoadingListings(true);
    try {
      const params = new URLSearchParams();
      params.set("isLive", "true");
      params.set("page", String(currentPage));
      params.set("limit", "12"); // 12 per page: 3 cols x 4 rows

      if (searchLocation.trim()) params.set("search", searchLocation.trim());
      if (selectedType !== "All") params.set("propertyType", selectedType);
      if (selectedBhk !== "All") params.set("bhk", selectedBhk);
      if (selectedPrice !== "All") params.set("maxRent", selectedPrice);

      const res = await fetch(`/api/listings?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          location: item.locality || item.city || item.location || "Prime Location",
          city: item.city || item.stateName || "Metropolis",
          price: typeof item.rent === "number" ? `₹${item.rent.toLocaleString("en-IN")}` : item.rent || "₹0",
          type: item.propertyType || "Apartment",
          bhk: item.propertyType || "Apartment",
          sqft: item.sqft ?? null,
          deposit: item.deposit ?? null,
          size: item.sqft
            ? `${Number(item.sqft).toLocaleString("en-IN")} sq. ft.`
            : item.availableFrom || "Ready to Move",
          rating: item.avgRating ? Number(item.avgRating).toFixed(1) : 4.8,
          reviewsCount: item.reviewCount !== undefined ? item.reviewCount : 0,
          image: item.mainImage || item.image || item.coverImage || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
          tags: Array.isArray(item.amenities) && item.amenities.length > 0
            ? item.amenities.slice(0, 3).map(formatAmenityTag)
            : ["Zero Fee", "Direct Owner", "Verified"],
          ownerName: item.contactPersonName ? `${item.contactPersonName} (Owner)` : "Property Landlord",
          ownerPhone: item.contactNumber || item.ownerPhone || "+91 Contact via RentAwas",
          badge: item.whatsappEnabled ? "Verified Owner • Direct WhatsApp" : "Verified Owner • Zero Fee",
        }));

        setApiListings(mapped);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalCount(json.pagination.total || mapped.length);
        }
      }
    } catch (err) {
      console.error("Error fetching marketplace listings:", err);
    } finally {
      setIsLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceListings();
  }, [currentPage, selectedType, selectedBhk, selectedPrice]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchMarketplaceListings();
  };

  const propertiesList: PropertyItem[] = [
    {
      id: "PROP-101",
      title: "The Regent Luxury 2BHK Residence",
      location: "100 Feet Road, Indiranagar",
      city: "Bengaluru",
      price: "₹28,500",
      type: "Apartment",
      bhk: "2 BHK",
      size: "1,150 sq.ft",
      rating: 4.9,
      reviewsCount: 14,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      tags: ["Fully Furnished", "Zero Brokerage", "Gated Security"],
      ownerName: "Alexander Wright (Owner)",
      ownerPhone: "+91 98765 43210",
      badge: "Verified Owner • Zero Fee",
    },
    {
      id: "PROP-102",
      title: "Horizon Heights Executive Studio",
      location: "Sector 3, HSR Layout",
      city: "Bengaluru",
      price: "₹18,000",
      type: "Studio",
      bhk: "1 BHK",
      size: "650 sq.ft",
      rating: 4.8,
      reviewsCount: 9,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      tags: ["Fully Furnished", "WiFi Included", "Power Backup"],
      ownerName: "Priya Nair (Owner)",
      ownerPhone: "+91 98123 45678",
      badge: "Verified Owner • Instant Move-In",
    },
    {
      id: "PROP-103",
      title: "Royal Stays Premium PG & Co-Living",
      location: "Cyber City, Phase 2",
      city: "Gurgaon",
      price: "₹12,500",
      type: "PG / Co-Living",
      bhk: "Single Bed",
      size: "Private Room",
      rating: 4.9,
      reviewsCount: 22,
      image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      tags: ["3 Meals Included", "High-Speed WiFi", "Daily Housekeeping"],
      ownerName: "Rajesh Sharma (PG Operator)",
      ownerPhone: "+91 97654 32109",
      badge: "Zero Deposit Offer",
    },
    {
      id: "PROP-104",
      title: "Oakwood Residency 3BHK Penthouse",
      location: "Central Avenue, Powai",
      city: "Mumbai",
      price: "₹55,000",
      type: "Apartment",
      bhk: "3 BHK",
      size: "1,850 sq.ft",
      rating: 5.0,
      reviewsCount: 18,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      tags: ["Lake View Balcony", "Clubhouse & Gym", "2 Car Parking"],
      ownerName: "Kavita Mehta (Owner)",
      ownerPhone: "+91 99887 76655",
      badge: "Verified Owner • Luxury",
    },
    {
      id: "PROP-105",
      title: "Greenview Terraces 2BHK Apartment",
      location: "Viman Nagar",
      city: "Pune",
      price: "₹24,000",
      type: "Apartment",
      bhk: "2 BHK",
      size: "1,050 sq.ft",
      rating: 4.7,
      reviewsCount: 11,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      tags: ["Semi-Furnished", "Modular Kitchen", "Swimming Pool"],
      ownerName: "Vikramaditya Rao (Owner)",
      ownerPhone: "+91 96543 21098",
      badge: "Verified Owner • Zero Brokerage",
    },
    {
      id: "PROP-106",
      title: "Urban Comfort Shared Co-Living Space",
      location: "Financial District, Gachibowli",
      city: "Hyderabad",
      price: "₹8,500",
      type: "PG / Co-Living",
      bhk: "2 Sharing",
      size: "Shared Suite",
      rating: 4.8,
      reviewsCount: 16,
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      tags: ["AC Room", "Gaming Lounge", "Biometric Entry"],
      ownerName: "Siddharth Roy (Host)",
      ownerPhone: "+91 95432 10987",
      badge: "Zero Deposit Offer",
    },
    {
      id: "PROP-107",
      title: "Elite Palm Towers 3BHK Luxury Flat",
      location: "Golf Course Road, DLF Phase 5",
      city: "Gurgaon",
      price: "₹45,000",
      type: "Apartment",
      bhk: "3 BHK",
      size: "1,600 sq.ft",
      rating: 4.9,
      reviewsCount: 15,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      tags: ["Fully Furnished", "Golf View", "EV Charger"],
      ownerName: "Ananya Gupta (Owner)",
      ownerPhone: "+91 94321 09876",
      badge: "Verified Owner • Premium",
    },
    {
      id: "PROP-108",
      title: "Sunrise Parkview 1BHK Garden Flat",
      location: "2nd Avenue, Anna Nagar",
      city: "Chennai",
      price: "₹16,500",
      type: "Apartment",
      bhk: "1 BHK",
      size: "720 sq.ft",
      rating: 4.7,
      reviewsCount: 7,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      tags: ["Park Facing", "24/7 Water Supply", "Zero Brokerage"],
      ownerName: "Karthik Subramanian",
      ownerPhone: "+91 93210 98765",
      badge: "Verified Owner • Direct Contact",
    },
  ];

  // Filter Logic
  const filteredProperties = propertiesList.filter((item) => {
    // Location filter
    const matchesLocation =
      searchLocation === "" ||
      item.title.toLowerCase().includes(searchLocation.toLowerCase()) ||
      item.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
      item.city.toLowerCase().includes(searchLocation.toLowerCase());

    // Type filter
    const matchesType =
      selectedType === "All" || item.type.toLowerCase().includes(selectedType.toLowerCase());

    // BHK filter
    const matchesBhk =
      selectedBhk === "All" || item.bhk.toLowerCase().includes(selectedBhk.toLowerCase());

    // Price filter
    let matchesPrice = true;
    const numericPrice = parseInt(item.price.replace(/[^\d]/g, ""), 10);
    if (selectedPrice === "under15k") matchesPrice = numericPrice <= 15000;
    if (selectedPrice === "15k-30k") matchesPrice = numericPrice > 15000 && numericPrice <= 30000;
    if (selectedPrice === "30k-50k") matchesPrice = numericPrice > 30000 && numericPrice <= 50000;
    if (selectedPrice === "above50k") matchesPrice = numericPrice > 50000;

    return matchesLocation && matchesType && matchesBhk && matchesPrice;
  });

  const toggleLike = (property: PropertyItem) => {
    if (!userSession) {
      setPendingWishlistProperty(property);
      setIsLoginModalOpen(true);
      return;
    }
    void toggleWishlist(property);
  };

  const handleInPlaceAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthSubmitting(true);
    try {
      const formattedPhone = `${authCountry.dialCode} ${authPhone.trim()}`;

      if (authModalMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (data?.session) {
          setUserSession(data.session);
        } else {
          // Demo fallback session
          setUserSession({ user: { email: authEmail.trim() || "tenant@rentawas.com" } });
        }
      } else {
        // 1. Supabase auth signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: {
              fullName: authFullName.trim(),
              role: "tenant",
              phone: formattedPhone,
              trialStartedAt: new Date().toISOString(),
              trialDays: 14,
            },
          },
        });

        if (authData?.session) {
          setUserSession(authData.session);
        } else {
          setUserSession({ user: { email: authEmail.trim() || "tenant@rentawas.com" } });
        }

        // 2. Generate database profile & workspace (same as main signup page)
        const userId = authData?.user?.id || `user_${Date.now()}`;
        await createUserProfileAndWorkspace({
          userId,
          email: authEmail.trim(),
          fullName: authFullName.trim(),
          phone: formattedPhone,
          role: "tenant",
        });
      }

      if (pendingWishlistProperty) {
        void addToWishlist(pendingWishlistProperty);
        setPendingWishlistProperty(null);
      }

      setIsLoginModalOpen(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthFullName("");
      setAuthPhone("");
    } catch (err) {
      console.error("In-place auth error:", err);
      // Fallback auth completion
      setUserSession({ user: { email: authEmail.trim() || "tenant@rentawas.com" } });
      if (pendingWishlistProperty) {
        void addToWishlist(pendingWishlistProperty);
        setPendingWishlistProperty(null);
      }
      setIsLoginModalOpen(false);
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleInPlaceDemoLogin = () => {
    setUserSession({ user: { email: "tenant@rentawas.com" } });
    if (pendingWishlistProperty) {
      void addToWishlist(pendingWishlistProperty);
      setPendingWishlistProperty(null);
    }
    setIsLoginModalOpen(false);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      toast("Please enter your name and phone number.", "error");
      return;
    }
    setIsSubmittingLead(true);
    try {
      const formattedPhone = `${selectedCountry.dialCode} ${leadPhone.trim()}`;
      await fetch("/api/listings/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: leadName.trim(),
          phone: formattedPhone,
          moveInDate,
          listingId: selectedProperty?.id,
        }),
      });
      setLeadSubmitted(true);
      toast("Contact request sent to property owner!", "success");
    } catch (err) {
      console.error("Inquiry submit error:", err);
      setLeadSubmitted(true);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const closeContactModal = () => {
    setSelectedProperty(null);
    setLeadSubmitted(false);
    setLeadName("");
    setLeadPhone("");
    setMoveInDate("");
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar variant="dark" onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} />

      {/* Top Hero Search Section */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-[#0B132B] via-[#141E38] to-[#0B132B] text-white relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 fill-[#FF6B00]" />
            <span>100% Free Property Marketplace • Zero Brokerage</span>
          </div>

          <h1
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Find Your Next Home — <span className="text-[#FF6B00]">Zero Brokerage</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover thousands of verified apartments, flats, PG beds, and rental homes direct from landlords & property managers on RentAwas.
          </p>

          {/* Airbnb/NoBroker-style Floating Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-3xl p-3 sm:p-4 shadow-2xl border border-slate-200 text-slate-900 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-left">

            {/* Search Location Input */}
            <div className="sm:col-span-4 relative border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 sm:pr-3">
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Location / City
                </label>
                
                {/* Eye Icon Info Tooltip / Popover */}
                <div className="relative group">
                  <button
                    type="button"
                    className="p-0.5 text-slate-400 hover:text-[#FF6B00] transition-colors cursor-pointer flex items-center gap-0.5"
                    title="View searchable location filters"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Tooltip / Popover Bubble */}
                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-60 bg-[#0B132B] text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700 z-50 text-[11px] font-sans hidden group-hover:block animate-in fade-in duration-150">
                    <div className="font-extrabold text-amber-400 text-xs mb-2 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Search Supported Parameters:</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 font-medium">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                        <span><strong>Location / Locality</strong> (e.g. Indiranagar)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                        <span><strong>City Name</strong> (e.g. Gurgaon, Mumbai)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                        <span><strong>State Name</strong> (e.g. Karnataka)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                        <span><strong>Pincode / Postal Code</strong> (e.g. 560038)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mr-1.5" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="e.g. Indiranagar, Gurgaon, Mumbai"
                  className="w-full text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Property Type Dropdown */}
            <div className="sm:col-span-5 border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 sm:pr-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">
                Property Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All">All Property Types</option>

                <optgroup label="🏢 Residential Apartments & Condos">
                  <option value="Flat / Apartment">Flat / Apartment (1BHK, 2BHK, 3BHK...)</option>
                  <option value="Condominium (Condo)">Condominium (Condo)</option>
                  <option value="Studio Apartment / 1 RK">Studio Apartment / 1 RK</option>
                  <option value="Penthouse & Terrace Unit">Penthouse &amp; Terrace Unit</option>
                  <option value="Loft & Duplex Suite">Loft &amp; Duplex Suite</option>
                  <option value="Executive Serviced Apartment">Executive Serviced Apartment</option>
                </optgroup>

                <optgroup label="🏡 Houses & Independent Villas">
                  <option value="House / Villa">Independent House / Villa</option>
                  <option value="Builder Floor (Individual Floor)">Builder Floor (Individual Floor)</option>
                  <option value="Townhouse / Row House">Townhouse / Row House</option>
                  <option value="Bungalow / Gated Villa">Bungalow / Gated Villa</option>
                  <option value="Farmhouse / Estate">Farmhouse / Estate</option>
                </optgroup>

                <optgroup label="🎓 Hostels, PG & Student Housing">
                  <option value="Independent Private Boys Hostel">Independent Private Boys Hostel</option>
                  <option value="Independent Private Girls Hostel">Independent Private Girls Hostel</option>
                  <option value="College & University Student Hostel">College &amp; University Student Hostel</option>
                  <option value="School / Boarding School Hostel">School / Boarding School Hostel</option>
                  <option value="PG / Paying Guest (Boys/Girls/Co-Ed)">PG / Paying Guest (Boys, Girls, Co-Ed)</option>
                  <option value="Working Professionals Hostel / Co-Living">Working Professionals Hostel / Co-Living</option>
                  <option value="Co-Living Shared Suite / Pod">Co-Living Shared Suite / Pod</option>
                </optgroup>

                <optgroup label="🏢 Commercial & Business Spaces">
                  <option value="Commercial Office Space">Commercial Office Space</option>
                  <option value="Retail Shop / Showroom">Retail Shop / Showroom</option>
                  <option value="Co-Working Space">Co-Working Space / Desk</option>
                  <option value="Warehouse / Storage Bay">Warehouse / Storage Bay</option>
                </optgroup>
              </select>
            </div>

            {/* Budget Range Filter */}
            <div className="sm:col-span-3 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">
                  Monthly Rent
                </label>
                <select
                  value={selectedPrice}
                  onChange={(e) => { setSelectedPrice(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="All">Any Rent</option>
                  <option value="under15k">Under ₹15,000</option>
                  <option value="15k-30k">₹15,000 - ₹30,000</option>
                  <option value="30k-50k">₹30,000 - ₹50,000</option>
                  <option value="above50k">Above ₹50,000</option>
                </select>
              </div>

              <button
                type="submit"
                className="p-3 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-bold text-slate-200">
            <button
              onClick={() => {
                setSelectedType("All");
                setSelectedBhk("All");
                setSelectedPrice("All");
                setSearchLocation("");
                setCurrentPage(1);
              }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
            >
              🔥 Show All ({totalCount})
            </button>
            <button
              onClick={() => { setSelectedType("Flat / Apartment"); setCurrentPage(1); }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
            >
              🏢 Family Apartments
            </button>
            <button
              onClick={() => { setSelectedType("House / Villa"); setCurrentPage(1); }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
            >
              🏡 Houses &amp; Villas
            </button>
            <button
              onClick={() => { setSelectedType("PG / Paying Guest (Boys/Girls/Co-Ed)"); setCurrentPage(1); }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
            >
              🎓 Hostels &amp; PG Beds
            </button>
            <button
              onClick={() => { setSelectedType("Commercial Office Space"); setCurrentPage(1); }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
            >
              💼 Commercial Offices
            </button>
            <button
              onClick={() => { setSelectedPrice("under15k"); setCurrentPage(1); }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
            >
              💰 Under ₹15,000
            </button>
          </div>

        </div>
      </section>

      {/* Main Property Listings Grid */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-6 sm:px-8 space-y-6 flex-1 w-full">

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Verified Rental Properties
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {apiListings.length} of {totalCount} active property listings • Page {currentPage} of {totalPages}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Zero Brokerage</span>
            </span>
          </div>
        </div>

        {/* Listings Grid (3 Columns, 12 Items Per Page) */}
        {isLoadingListings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : apiListings.length === 0 ? (
          /* Empty State: Properties Coming Soon */
          <div className="bg-[#0B132B] text-white rounded-3xl p-10 sm:p-14 text-center space-y-5 max-w-2xl mx-auto shadow-2xl border border-slate-800 my-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-[10px] font-black uppercase tracking-wider border border-[#FF6B00]/30 inline-block">
                Marketplace Expansion
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Properties Coming Soon
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                We are onboarding landlords & property owners daily in this region. Be the first to get notified when new verified homes drop!
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchLocation("");
                  setSelectedType("All");
                  setSelectedBhk("All");
                  setSelectedPrice("All");
                  setCurrentPage(1);
                }}
                className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiListings.map((p) => (
                <div
                  key={p.id}
                  onClick={() => window.open(`/find-property/${p.id}`, "_blank", "noopener,noreferrer")}
                  className="bg-white border border-slate-200/90 hover:border-[#FF6B00]/40 rounded-2xl overflow-hidden shadow-2xs hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Property Image Container */}
                    <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Overlay Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-extrabold text-white uppercase tracking-wider">
                          {p.type}
                        </span>
                      </div>

                      {/* Wishlist Heart — visible on hover when logged in; stays visible when saved */}
                      {userSession && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(p);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-300 cursor-pointer ${
                            likedProperties[p.id]
                              ? "bg-red-500 text-white opacity-100"
                              : "bg-white/90 text-slate-600 hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100"
                          }`}
                          title={likedProperties[p.id] ? "Remove from Wishlist" : "Save to Wishlist"}
                          aria-label={likedProperties[p.id] ? "Remove from Wishlist" : "Save to Wishlist"}
                        >
                          <Heart
                            className={`w-4 h-4 ${likedProperties[p.id] ? "fill-white" : ""}`}
                          />
                        </button>
                      )}

                      {/* Price Tag Overlay */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-slate-200">
                        <span className="text-sm font-black text-slate-900">{p.price}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase"> / month</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>{p.location}, {p.city}</span>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{p.rating} ({p.reviewsCount})</span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors leading-snug line-clamp-1">
                        {p.title}
                      </h3>

                      {/* Key Specs */}
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 py-1 border-y border-slate-100">
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          {p.bhk}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                          {p.size}
                        </span>
                      </div>

                      {/* Amenity Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer - Reveals smoothly on hover */}
                  <div className="p-5 pt-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Link
                      href={`/find-property/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* High-Performance Airbnb/Zillow-style Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-500">
                  Showing Page {currentPage} of {totalPages} ({totalCount} total verified properties)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 400, behavior: "smooth" });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${currentPage === pageNum
                          ? "bg-[#FF6B00] text-white shadow-md"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </section>

      <Footer />

      {/* Early Access Modal Trigger */}
      <EarlyAccessModal
        isOpen={isEarlyAccessOpen}
        onClose={() => setIsEarlyAccessOpen(false)}
      />

      {/* Direct Owner Contact Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 font-sans">

            {/* Header */}
            <div className="bg-[#0B132B] p-5 text-white relative">
              <button
                onClick={closeContactModal}
                className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                Zero Brokerage Direct Lead
              </span>
              <h3 className="text-lg font-bold text-white line-clamp-1">{selectedProperty.title}</h3>
              <p className="text-xs text-slate-300">{selectedProperty.ownerName} • {selectedProperty.price}/mo</p>
            </div>

            {/* Modal Body */}
            {leadSubmitted ? (
              <div className="p-7 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">Owner Contact Shared!</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Thank you <strong>{leadName}</strong>. We have notified <strong>{selectedProperty.ownerName}</strong> of your interest. You can reach the owner directly at <strong>{selectedProperty.ownerPhone}</strong>!
                  </p>
                </div>
                <button
                  onClick={closeContactModal}
                  className="w-full py-2.5 bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-xs uppercase tracking-wider cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Alexander Wright"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone Number *
                  </label>
                  <CountryPhoneInput
                    value={leadPhone}
                    onChange={setLeadPhone}
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Expected Move-In Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-70"
                >
                  {isSubmittingLead ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4" />
                      <span>Get Owner Contact Number</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Property Details View Modal */}
      {viewingPropertyDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col my-auto">

            {/* Sticky Modal Top Bar */}
            <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-[10px] font-extrabold uppercase tracking-wider">
                  {viewingPropertyDetail.type}
                </span>
                <span className="text-xs font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {viewingPropertyDetail.title}
                </span>
              </div>
              <button
                onClick={() => setViewingPropertyDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* Hero Image & Price Overlay */}
              <div className="relative h-64 sm:h-80 w-full bg-slate-100 rounded-2xl overflow-hidden shadow-inner group">
                <Image
                  src={viewingPropertyDetail.image}
                  alt={viewingPropertyDetail.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-extrabold text-white uppercase tracking-wider">
                    {viewingPropertyDetail.bhk}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Zero Brokerage
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Rent</div>
                  <div className="text-xl font-black text-slate-900">{viewingPropertyDetail.price} <span className="text-xs font-normal text-slate-500">/ mo</span></div>
                </div>
              </div>

              {/* Title & Rating Header */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {viewingPropertyDetail.title}
                  </h2>
                  <div className="flex items-center gap-1.5 font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 shrink-0 w-fit">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs">{viewingPropertyDetail.rating} ({viewingPropertyDetail.reviewsCount} Verified Reviews)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                  <span>{viewingPropertyDetail.location}, {viewingPropertyDetail.city}</span>
                </div>
              </div>

              {/* Pricing Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Rent</div>
                  <div className="text-sm font-extrabold text-slate-900">{viewingPropertyDetail.price}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Deposit</div>
                  <div className="text-sm font-extrabold text-emerald-600">
                    {viewingPropertyDetail.deposit
                      ? `₹${Number(viewingPropertyDetail.deposit).toLocaleString("en-IN")} (Refundable)`
                      : "₹0 Deposit"}
                  </div>
                </div>
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brokerage Fee</div>
                  <div className="text-sm font-extrabold text-purple-600">₹0 (Zero Brokerage)</div>
                </div>
              </div>

              {/* Key Property Specs */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Property Overview Specs</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="text-slate-400 font-bold flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5" />
                      Configuration
                    </div>
                    <div className="font-extrabold text-slate-900">{viewingPropertyDetail.bhk}</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="text-slate-400 font-bold flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Built-Up Area
                    </div>
                    <div className="font-extrabold text-slate-900">
                      {viewingPropertyDetail.sqft
                        ? `${Number(viewingPropertyDetail.sqft).toLocaleString("en-IN")} sq. ft.`
                        : "—"}
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="text-slate-400 font-bold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Property Type
                    </div>
                    <div className="font-extrabold text-slate-900">{viewingPropertyDetail.type}</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="text-slate-400 font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Available From
                    </div>
                    <div className="font-extrabold text-emerald-600">
                      {(viewingPropertyDetail as any).availableFrom || "Immediate Move-In"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Amenities & Facilities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {viewingPropertyDetail.tags.map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{tag}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>24/7 Security CCTV</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>High-Speed Wifi</span>
                  </div>
                </div>
              </div>

              {/* Owner Profile & Direct Action Box */}
              <div className="p-5 bg-gradient-to-br from-[#0B132B] to-[#1E293B] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Direct Verified Owner</span>
                  </div>
                  <div className="text-base font-extrabold text-white">{viewingPropertyDetail.ownerName}</div>
                  <div className="text-xs text-slate-300">Fast Response Rate (99% within 15 mins)</div>
                </div>

                <button
                  onClick={() => {
                    const target = viewingPropertyDetail;
                    setViewingPropertyDetail(null);
                    setSelectedProperty(target);
                  }}
                  className="px-6 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider flex items-center gap-2 shrink-0 cursor-pointer transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Contact Owner Direct</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* In-Place Auth Modal for Wishlist */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">

            {/* Close Button */}
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 pt-1">
              <div className="w-14 h-14 bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                <Heart className="w-7 h-7 fill-white text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Log In to Save to Wishlist
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                {pendingWishlistProperty
                  ? `Save "${pendingWishlistProperty.title}" to your personal wishlist!`
                  : "Save your favorite rental homes to access them anytime."}
              </p>

              {/* Pre-Selected Role Chip */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-[11px] font-extrabold uppercase tracking-wider mt-1">
                <User className="w-3.5 h-3.5" />
                <span>Tenant / Normal User</span>
              </div>
            </div>

            {/* Auth Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthModalMode("login")}
                className={`py-2 rounded-lg transition-all cursor-pointer ${authModalMode === "login" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthModalMode("signup")}
                className={`py-2 rounded-lg transition-all cursor-pointer ${authModalMode === "signup" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* In-Place Auth Form */}
            <form onSubmit={handleInPlaceAuth} className="space-y-3">
              {authModalMode === "signup" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Mobile Phone Number with Country Code Picker (Sign Up Only) */}
              {authModalMode === "signup" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone Number
                  </label>
                  <CountryPhoneInput
                    value={authPhone}
                    onChange={setAuthPhone}
                    selectedCountry={authCountry}
                    onCountryChange={setAuthCountry}
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAuthPassword ? "text" : "password"}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAuthPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-70 mt-1"
              >
                {isAuthSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{authModalMode === "login" ? "Sign In & Save Property" : "Sign Up & Save Property"}</span>
                )}
              </button>
            </form>

            <div className="relative my-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Or Instant Entry
              </span>
            </div>

            {/* 1-Click Instant Demo Login Button */}
            <button
              type="button"
              onClick={handleInPlaceDemoLogin}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>⚡ Instant Demo Save & Access</span>
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
