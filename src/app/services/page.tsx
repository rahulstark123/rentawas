"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RentAwasExpertsSection from "@/components/landing/RentAwasExpertsSection";
import ComingSoonModal from "@/components/ui/ComingSoonModal";
import { supabase } from "@/lib/supabase";
import {
  Wrench,
  Zap,
  Hammer,
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  UserCheck,
  Bell,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  BadgeCheck,
  SlidersHorizontal,
  ThumbsUp,
  Smartphone,
  Heart,
  Filter,
  Check,
  Lock,
  LogIn,
  Navigation,
  Compass,
  Building2,
  Loader2
} from "lucide-react";

import { INDIA_LOCATION_DATA, CITY_LOCALITIES_DATA, DEFAULT_CITY_LOCALITIES } from "@/lib/indiaLocations";

const SERVICE_CATEGORY_OPTIONS = [
  { id: "ac", label: "AC Repair & HVAC Servicing" },
  { id: "plumbing", label: "Plumbing & Leakage Specialist" },
  { id: "carpentry", label: "Carpentry & Custom Woodwork" },
  { id: "househelp", label: "Househelp, Maid & Deep Cleaning" },
  { id: "pest", label: "Pest Control & Sanitization" },
  { id: "relocation", label: "Packers & Movers Shifting" },
  { id: "laundry", label: "Laundry & Dry Cleaning" },
  { id: "locksmith", label: "Locksmith & Key Duplicate" },
];

export default function ServicesPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [targetBookingUrl, setTargetBookingUrl] = useState<string>("");

  // Expert Booking Modal State (Opens Directly on Landing Page)
  const [selectedExpertForBooking, setSelectedExpertForBooking] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    return tom.toISOString().split("T")[0];
  });
  const [bookingNotes, setBookingNotes] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Registered Properties & Location Selection State
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("Main Property");
  const [selectedFloor, setSelectedFloor] = useState("Ground Floor");
  const [selectedUnit, setSelectedUnit] = useState("Unit 101");
  const [waitingConfirmationBooking, setWaitingConfirmationBooking] = useState<any | null>(null);

  // Interactive Map Location Picker State
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

  // Google Maps Search Engine & Indian Geography Autocomplete Logic
  useEffect(() => {
    if (!mapSearchQuery || mapSearchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const cleanQuery = mapSearchQuery.trim();
    const queryLower = cleanQuery.toLowerCase();
    const matches: any[] = [];

    // 1. Top Option: Search Google Maps for typed address
    matches.push({
      display_name: `📍 Search Google Maps for: "${cleanQuery}"`,
      queryValue: cleanQuery.toLowerCase().includes("india") ? cleanQuery : `${cleanQuery}, India`,
      isGoogleSearch: true,
    });

    // 2. Option: Use exact typed address
    matches.push({
      display_name: `📍 Use exact address: "${cleanQuery}"`,
      queryValue: cleanQuery,
      isCustom: true,
    });

    // 3. Search local Indian cities & localities dataset for real-time matches
    const matchedLocalities: string[] = [];

    // Search inside CITY_LOCALITIES_DATA
    Object.entries(CITY_LOCALITIES_DATA).forEach(([cityName, locList]) => {
      locList.forEach((loc) => {
        const fullLoc = `${loc}, ${cityName}`;
        if (
          (loc.toLowerCase().includes(queryLower) ||
            cityName.toLowerCase().includes(queryLower) ||
            queryLower.includes(loc.toLowerCase())) &&
          matchedLocalities.length < 8
        ) {
          if (!matchedLocalities.includes(fullLoc)) {
            matchedLocalities.push(fullLoc);
            matches.push({
              display_name: `${loc}, ${cityName}, India`,
              queryValue: `${loc}, ${cityName}, India`,
            });
          }
        }
      });
    });

    // Search inside INDIA_LOCATION_DATA cities
    Object.entries(INDIA_LOCATION_DATA).forEach(([stateName, citiesList]) => {
      citiesList.forEach((city) => {
        if (
          (city.toLowerCase().includes(queryLower) || stateName.toLowerCase().includes(queryLower)) &&
          matchedLocalities.length < 12
        ) {
          const cityStr = `${city}, ${stateName}`;
          if (!matchedLocalities.includes(cityStr)) {
            matchedLocalities.push(cityStr);
            matches.push({
              display_name: `${city}, ${stateName}, India`,
              queryValue: `${city}, ${stateName}, India`,
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

  useEffect(() => {
    if (!supabase?.auth) return;
    let subscription: any = null;
    try {
      supabase.auth.getSession().then((res) => {
        if (res?.data?.session) {
          setUserSession(res.data.session);
        }
      }).catch(() => {});

      const authRes = supabase.auth.onAuthStateChange((_event, session) => {
        setUserSession(session);
      });
      subscription = authRes?.data?.subscription;
    } catch (e) {}
    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  // Fetch properties if user is logged in
  useEffect(() => {
    if (!userSession) {
      setUserProperties([]);
      return;
    }
    async function loadProperties() {
      try {
        const userEmail = userSession?.user?.email;
        const role = userSession?.user?.user_metadata?.role || "tenant";

        // 1. If logged-in user is a Tenant / Resident
        const tenantRes = await fetch("/api/tenant/me");
        const tenantJson = await tenantRes.json();
        const tenantData = tenantJson?.data;

        if (role === "tenant" || (tenantData && tenantData.email && role !== "landlord" && role !== "owner")) {
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
            // New user / tenant with no property assigned -> EMPTY array
            setUserProperties([]);
          }
        } else {
          // 2. Landlord / Owner -> Fetch workspace properties
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
                setSelectedUnit(firstUnit.unitNumber || "Unit 101");
                const fNum = firstUnit.floorNumber ?? 1;
                const fLabel = fNum === 0 ? "Ground Floor" : fNum === 1 ? "1st Floor" : fNum === 2 ? "2nd Floor" : `${fNum}th Floor`;
                setSelectedFloor(fLabel);
              }
            } else {
              setUserProperties([]);
            }
          } else {
            setUserProperties([]);
          }
        }
      } catch (err) {
        setUserProperties([]);
      }
    }
    loadProperties();
  }, [userSession]);

  const handleBookClick = (expertObj: any, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (userSession) {
      setSelectedExpertForBooking(expertObj);
    } else {
      setSelectedExpertForBooking(expertObj);
      setIsLoginModalOpen(true);
    }
  };

  const handleConfirmLandingBooking = async () => {
    if (!selectedExpertForBooking) return;

    if (userProperties.length === 0 && !customAddress.trim() && !mapPinCoords.addressName) {
      alert("Please enter your service address or pick your location from map.");
      return;
    }

    setIsSubmittingBooking(true);

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
          expertId: selectedExpertForBooking.id,
          expertName: selectedExpertForBooking.name || selectedExpertForBooking.title,
          expertTitle: selectedExpertForBooking.trade || selectedExpertForBooking.title || "Home Service",
          expertAvatar: selectedExpertForBooking.avatar || selectedExpertForBooking.image || "",
          expertPhone: selectedExpertForBooking.phone || "",
          serviceBooked: selectedExpertForBooking.trade || selectedExpertForBooking.title || "Home Service",
          bookingDate: formattedDate,
          timeSlot: timeSlotText,
          feePaid: selectedExpertForBooking.fee || 599,
          property: locationText,
          notes: bookingNotes,
          bookedById: userSession?.user?.id || `user_${Date.now()}`,
          bookedByEmail: userSession?.user?.email || "user@rentawas.com",
          bookedByName: userSession?.user?.user_metadata?.fullName || userSession?.user?.user_metadata?.name || "RentAwas Customer",
          bookedByRole: userSession?.user?.user_metadata?.role || "customer",
        }),
      });

      const json = await res.json();

      if (res.ok && json.booking) {
        setWaitingConfirmationBooking({
          id: json.booking.bookingNumber,
          expertName: selectedExpertForBooking.name || selectedExpertForBooking.title,
          serviceBooked: selectedExpertForBooking.trade || selectedExpertForBooking.title,
          date: formattedDate,
          property: locationText,
          otpCode: json.booking.otpCode,
        });
        setSelectedExpertForBooking(null);
      } else {
        alert(json.error || "Failed to submit booking request.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit booking.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Home Service Booking Coming Soon!");
  const [activeDomainId, setActiveDomainId] = useState("ac");
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

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

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsServicesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCategorySelection = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Live Experts from Database GET /api/admin/experts
  const [liveExperts, setLiveExperts] = useState<any[]>([]);
  const [loadingExperts, setLoadingExperts] = useState<boolean>(true);

  useEffect(() => {
    async function fetchExperts() {
      try {
        setLoadingExperts(true);
        const res = await fetch("/api/admin/experts");
        const json = await res.json();
        if (res.ok && Array.isArray(json.experts)) {
          setLiveExperts(json.experts);
        }
      } catch (err) {
        console.error("Failed to load experts from API:", err);
      } finally {
        setLoadingExperts(false);
      }
    }
    fetchExperts();
  }, []);

  const filteredLiveExperts = useMemo(() => {
    if (liveExperts.length === 0) return [];
    return liveExperts.filter((exp) => {
      const st = String(exp.status || "").toLowerCase();
      if (
        exp.isAvailable === false ||
        exp.isAvailable === "false" ||
        exp.isAvailable === 0 ||
        st.includes("suspended") ||
        st.includes("inactive") ||
        st.includes("offline")
      ) {
        return false;
      }

      const matchesSearch =
        searchQuery.trim() === "" ||
        exp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.trade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.city?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCat = true;
      if (selectedCategories.length > 0) {
        const trade = (exp.trade || "").toLowerCase();
        const spec = (exp.specialization || "").toLowerCase();
        matchesCat = selectedCategories.some((catId) => {
          if (catId === "ac") return trade.includes("ac") || trade.includes("hvac") || spec.includes("ac");
          if (catId === "plumbing") return trade.includes("plumb") || spec.includes("pipe") || spec.includes("leak") || spec.includes("water");
          if (catId === "carpentry") return trade.includes("carpent") || spec.includes("wood") || spec.includes("furniture");
          if (catId === "househelp") return trade.includes("househelp") || trade.includes("clean") || trade.includes("maid");
          if (catId === "pest") return trade.includes("pest") || spec.includes("termite");
          if (catId === "relocation") return trade.includes("packer") || trade.includes("mover") || trade.includes("relocat");
          if (catId === "laundry") return trade.includes("laundry") || trade.includes("dry");
          if (catId === "locksmith") return trade.includes("lock") || spec.includes("key");
          return false;
        });
      }

      let matchesLocation = true;
      if (selectedLocationAreas.length > 0) {
        matchesLocation = selectedLocationAreas.some(area => 
          exp.fullAddress?.toLowerCase().includes(area.toLowerCase()) ||
          exp.bio?.toLowerCase().includes(area.toLowerCase()) ||
          exp.city?.toLowerCase().includes(area.toLowerCase()) ||
          exp.trade?.toLowerCase().includes(area.toLowerCase())
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

      return matchesSearch && matchesCat && matchesLocation;
    });
  }, [liveExperts, searchQuery, selectedCategories, selectedLocationState, selectedLocationCity, selectedLocationAreas]);

  // Pagination State (Max 9 cards per page)
  const [currentExpertPage, setCurrentExpertPage] = useState(1);
  const EXPERTS_PER_PAGE = 9;

  // Reset page when filters change
  useEffect(() => {
    setCurrentExpertPage(1);
  }, [searchQuery, selectedCategories, selectedLocationState, selectedLocationCity, selectedLocationAreas]);

  const totalLiveExpertPages = Math.max(1, Math.ceil(filteredLiveExperts.length / EXPERTS_PER_PAGE));
  const paginatedLiveExperts = useMemo(() => {
    const start = (currentExpertPage - 1) * EXPERTS_PER_PAGE;
    return filteredLiveExperts.slice(start, start + EXPERTS_PER_PAGE);
  }, [filteredLiveExperts, currentExpertPage]);



  const cardStoriesData = [
    {
      id: "rentawas-advantage",
      badge: "THE RENTAWAS ADVANTAGE",
      title: "Why RentAwas Experts?",
      subtitle: "Connecting you directly with background-checked local maintenance specialists. Built for absolute transparency, instant availability, and complete peace of mind.",
      accent: "text-[#FF6B00]",
      badgeBg: "bg-orange-500/10 border-orange-500/30 text-[#FF6B00]",
      quote: "Why worry about unverified technicians? Every RentAwas expert is Aadhaar & identity background checked, offers fixed upfront rates, and guarantees work with a service warranty.",
      authorName: "The RentAwas Standard",
      authorRole: "100% Aadhaar & Identity Verified Network",
      authorInitials: "VS",
      cardTag: "Trust & Safety",
      imageSrc: "/1st section.png",
      highlights: [
        {
          title: "100% Aadhaar & Government ID Verified",
          desc: "Every technician is identity-checked and Aadhaar-verified before taking any booking.",
          icon: ShieldCheck,
          iconColor: "text-emerald-600",
        },
        {
          title: "Fixed Transparent Rates & Escrow Security",
          desc: "No hidden fees or post-job price inflation. Funds remain locked until work completion.",
          icon: BadgeCheck,
          iconColor: "text-[#FF6B00]",
        },
        {
          title: "6-Digit OTP Security & Re-service Guarantee",
          desc: "Verify work using a one-time OTP and enjoy hassle-free service warranty.",
          icon: Clock,
          iconColor: "text-purple-600",
        },
      ],
      chips: [" Verified Identity", " Upfront Pricing", " Service Cover"],
    },
    {
      id: "tenant-story",
      badge: "TENANT SUCCESS STORY",
      title: "Meet Abhya — A tenant who gets all her home solutions in one place.",
      subtitle: "From sudden late-night plumbing leaks to annual AC servicing, Abhya manages her entire rental apartment maintenance with 1-tap RentAwas expert booking and 6-digit OTP safety.",
      accent: "text-blue-600",
      badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-600",
      quote: "“When my bathroom pipeline burst at 10 PM, I booked on RentAwas. A local verified plumber arrived, fixed the leak, and I verified completion with my 6-digit OTP.”",
      authorName: "Abhya Sharma",
      authorRole: "Tenant • Resident in Gurgaon",
      authorInitials: "AS",
      cardTag: "Tenant Verified Review",
      imageSrc: "/section 2.png",
      highlights: [
        {
          title: "1-Tap Instant Service Dispatch",
          desc: "Request certified plumbers, electricians, or househelp right from your smartphone.",
          icon: Zap,
          iconColor: "text-blue-600",
        },
        {
          title: "6-Digit OTP Work Security",
          desc: "Share your OTP code only when the technician completes the job to your satisfaction.",
          icon: ShieldCheck,
          iconColor: "text-emerald-600",
        },
        {
          title: "Fixed Escrow Payment Protection",
          desc: "Upfront pricing with zero hidden charges. Funds locked until work completion.",
          icon: BadgeCheck,
          iconColor: "text-[#FF6B00]",
        },
      ],
      chips: [" Instant Booking", " 6-Digit OTP", " Fixed Rates"],
    },
    {
      id: "locality-experts",
      badge: "NEIGHBORHOOD EXPERTS",
      title: "Experts From Your Own Locality",
      subtitle: "Connect directly with independent, Aadhaar & identity-verified electricians, plumbers, carpenters, and househelp operating right within your city neighborhood.",
      accent: "text-emerald-600",
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
      quote: "“RentAwas connects me directly to jobs in my neighborhood. I earn fair wages without paying middleman commissions, and customers trust me because I am background-verified.”",
      authorName: "Manoj Kumar",
      authorRole: "Master Electrician • Delhi NCR",
      authorInitials: "MK",
      cardTag: "Expert Spotlight",
      imageSrc: "/section 3.png",
      highlights: [
        {
          title: "Rapid Local Arrival",
          desc: "Local neighborhood technicians arrive quickly with professional equipment.",
          icon: Clock,
          iconColor: "text-emerald-600",
        },
        {
          title: "100% Aadhaar & Government ID Verified",
          desc: "Complete identity checks and background verification for tenant safety.",
          icon: UserCheck,
          iconColor: "text-[#FF6B00]",
        },
        {
          title: "Transparent & Fair Local Rates",
          desc: "Direct earnings for independent specialists with 100% transparent pricing.",
          icon: BadgeCheck,
          iconColor: "text-purple-600",
        },
      ],
      chips: [" Direct Local Work", " Zero Middlemen", " Verified Badge"],
    },
    {
      id: "landlords-managers",
      badge: "LANDLORD & MANAGER BENEFIT",
      title: "Effortless Maintenance for Landlords & Property Managers",
      subtitle: "Ensure your rental units remain pristine without endless phone calls. RentAwas coordinates doorstep work completion, digital invoice logs, and service warranty automatically.",
      accent: "text-purple-600",
      badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-600",
      quote: "“Managing 15 rental flats used to take 20 calls a day for repairs. Now my tenants book on RentAwas, jobs are tracked digitally, and I get automated expense logs without lifting a finger.”",
      authorName: "Sunil Verma",
      authorRole: "Property Owner • Bhopal",
      authorInitials: "SV",
      cardTag: "Landlord Feedback",
      imageSrc: "/landign 3.png",
      highlights: [
        {
          title: "Zero Phone Call Coordination",
          desc: "Tenants book verified experts directly with digital audit logs for property owners.",
          icon: ShieldCheck,
          iconColor: "text-purple-600",
        },
        {
          title: "Digital Work Verification Log",
          desc: "Track completed maintenance visits with photo proof and verified digital logs.",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
        },
        {
          title: "Automated Maintenance Expense Invoices",
          desc: "Keep property repair costs logged and exported in one central dashboard.",
          icon: BadgeCheck,
          iconColor: "text-[#FF6B00]",
        },
      ],
      chips: [" Automated Logs", " Zero Phone Calls", " Digital Audit"],
    },
  ];

  const domainHubs = [
    {
      id: "ac",
      title: "AC & Climate Servicing",
      badge: "Fast 15-30 Min Arrival",
      icon: Wrench,
      accentColor: "from-[#FF6B00] to-amber-500",
      accentText: "text-[#FF6B00]",
      bgGlow: "bg-orange-500/10 border-orange-500/30",
      desc: "Full jet wash cleaning, refrigerant gas charging, filter sanitization & cooling efficiency diagnostics by verified HVAC engineers.",
      stats: [
        { label: "Eta Arrival", val: "15-30 Mins" },
        { label: "Warranty", val: "30-Day Free Cover" },
        { label: "Fix Rate", val: "100% Transparent" },
      ],
      highlights: ["High-Pressure Jet Wash", "R32 / R410a Gas Top-up", "Copper Pipe Leakage Seal", "Compressor Health Audit"],
    },
    {
      id: "plumbing",
      title: "Plumbing & Water Systems",
      badge: "Zero Damage Guarantee",
      icon: Wrench,
      accentColor: "from-cyan-500 to-blue-500",
      accentText: "text-cyan-400",
      bgGlow: "bg-cyan-500/10 border-cyan-500/30",
      desc: "Instant tap leak sealing, pipe fitting, water heater geyser installation, overhead tank cleaning & sanitaryware repair.",
      stats: [
        { label: "Response", val: "Under 20 Mins" },
        { label: "Specialists", val: "Certified Plumbers" },
        { label: "Equipment", val: "Professional Tooling" },
      ],
      highlights: ["Tap & Flush Tank Sealing", "Overhead Water Tank Wash", "Geyser Element Fitting", "Drain Blockage Removal"],
    },
    {
      id: "carpentry",
      title: "Carpentry & Custom Furniture",
      badge: "Precision Wood Tools",
      icon: Hammer,
      accentColor: "from-amber-500 to-orange-500",
      accentText: "text-amber-400",
      bgGlow: "bg-amber-500/10 border-amber-500/30",
      desc: "High-security lock fitting, modular kitchen drawer repair, bed/table fixing & custom wooden furniture adjustments.",
      stats: [
        { label: "Hardware", val: "Genuine Spares" },
        { label: "Placement", val: "Master Artisans" },
        { label: "Mess", val: "Zero Cleanup Left" },
      ],
      highlights: ["Digital Keypad Lock Setup", "Modular Kitchen Hinges", "Door Alignment & Latches", "Bed & Sofa Frame Fix"],
    },
    {
      id: "househelp",
      title: "Domestic Househelp & Staff",
      badge: "Police Verified Background",
      icon: UserCheck,
      accentColor: "from-purple-500 to-indigo-500",
      accentText: "text-purple-400",
      bgGlow: "bg-purple-500/10 border-purple-500/30",
      desc: "Full-time & daily Aadhaar-verified maids, home cooks, laundry staff, infant nannies & elderly care companions.",
      stats: [
        { label: "Verification", val: "100% Aadhaar Checked" },
        { label: "Replacement", val: "Free Guarantee" },
        { label: "Match Time", val: "Same Day Pairing" },
      ],
      highlights: ["Daily Utensil & Floor Clean", "Home Cooked Meals", "Newborn Infant Care", "Trial Period Available"],
    },
    {
      id: "electrical",
      title: "Electrical & Smart Wiring",
      badge: "Safety Certified Work",
      icon: Zap,
      accentColor: "from-emerald-500 to-teal-500",
      accentText: "text-emerald-400",
      bgGlow: "bg-emerald-500/10 border-emerald-500/30",
      desc: "Short circuit troubleshooting, MCB box upgrades, ceiling fan / chandelier installations & smart home CCTV security.",
      stats: [
        { label: "Safety", val: "IS Code Compliant" },
        { label: "Parts", val: "Heavy Duty Wires" },
        { label: "Emergency", val: "24/7 Availability" },
      ],
      highlights: ["MCB Tripping Diagnosis", "Ceiling Fan / Light Setup", "Smart CCTV Camera Wire", "Inverter Battery Connect"],
    },
    {
      id: "cleaning",
      title: "Deep Cleaning & Pest Control",
      badge: "Eco-Friendly Odourless",
      icon: ShieldCheck,
      accentColor: "from-pink-500 to-rose-500",
      accentText: "text-pink-400",
      bgGlow: "bg-pink-500/10 border-pink-500/30",
      desc: "Full house deep sanitization, odourless anti-cockroach gel, termite treatment, bed bug eradication & sofa shampooing.",
      stats: [
        { label: "Chemicals", val: "Child & Pet Safe" },
        { label: "Protection", val: "6-Month Warranty" },
        { label: "Shampooing", val: "High Extraction" },
      ],
      highlights: ["Cockroach Herbal Gel", "Anti-Termite Soil Spray", "Sofa & Mattress Wash", "Kitchen Degreasing"],
    },
  ];

  const cities = [
    "Delhi NCR",
    "Bhopal",
    "Gurgaon",
  ];

  const marqueeRow1 = [
    { label: "🚰 Plumbing & Pipe Leak Fix", icon: Wrench },
    { label: "⚡ Electrical & Wiring Work", icon: Zap },
    { label: "🔨 Carpentry & Woodwork", icon: Hammer },
    { label: "🧹 Househelp & Maid Staff", icon: UserCheck },
    { label: "❄️ AC Deep Servicing & Gas Topup", icon: Wrench },
    { label: "🔑 Emergency Locksmith & Keys", icon: ShieldCheck },
  ];

  const testimonialsRow1 = [
    {
      stars: 5,
      quote: "Great work, my home was left spotless and fresh. The AC jet wash was thorough, and I really appreciated the technician's attention to detail. I'll definitely recommend it. 👍",
      name: "Pradnyesh",
      locality: "Suncity, Gurgaon",
      initial: "P",
      color: "bg-orange-50 text-[#FF6B00] border-orange-200",
    },
    {
      stars: 5,
      quote: "The services have definitely improved compared to local unverified mechanics. Preferences and safety guidelines are kept as top priority. Thank you for making our lives easier!",
      name: "Ridhi Saluja",
      locality: "Sector 56, Gurgaon",
      initial: "R",
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      stars: 5,
      quote: "I'd say it was great value for money. The pipe leak urgency was handled within 20 minutes, without compromising quality. Really satisfied with the experience.",
      name: "Kirti",
      locality: "Sector 56, Gurgaon",
      initial: "K",
      color: "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30",
    },
    {
      stars: 5,
      quote: "The service was simple and effective. It met my expectations without any hassle or extra hidden fees. Good overall experience.",
      name: "Neha",
      locality: "Sector 57, Gurgaon",
      initial: "N",
      color: "bg-orange-100 text-orange-900 border-orange-200",
    },
    {
      stars: 5,
      quote: "Booked a modular kitchen carpenter. The specialist arrived with modern woodworking tools, aligned all hinges perfectly, and left zero mess.",
      name: "Aakash Verma",
      locality: "DLF Phase 5, Gurgaon",
      initial: "A",
      color: "bg-amber-100 text-amber-900 border-amber-200",
    },
  ];

  const testimonialsRow2 = [
    {
      stars: 5,
      quote: "Really impressive compared to other platforms. The service was reliable, background-checked, and communication was clear and fast — very pleased!",
      name: "Rabia",
      locality: "Suncity, Gurgaon",
      initial: "R",
      color: "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30",
    },
    {
      stars: 5,
      quote: "Seamless experience from booking to completion. The househelp staff was courteous, police-verified, punctual, and did a fantastic job.",
      name: "Ritika",
      locality: "Sector 57, Gurgaon",
      initial: "R",
      color: "bg-orange-50 text-[#FF6B00] border-orange-200",
    },
    {
      stars: 5,
      quote: "Really liked your service, it was smooth, efficient, and just what I needed for MCB tripping issues. Would definitely recommend to others. ☀️",
      name: "Sameer",
      locality: "Sector 57, Gurgaon",
      initial: "S",
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      stars: 5,
      quote: "Absolutely excellent service! The deep sanitization team was prompt and professional throughout. Would love to use it again.",
      name: "Karishma",
      locality: "Suncity, Gurgaon",
      initial: "K",
      color: "bg-orange-100 text-orange-900 border-orange-200",
    },
    {
      stars: 5,
      quote: "As a tenant living alone in Noida, having background-verified experts with 6-digit OTP verification gives complete peace of mind. Excellent work!",
      name: "Meera Deshmukh",
      locality: "Sector 62, Noida",
      initial: "M",
      color: "bg-amber-100 text-amber-900 border-amber-200",
    },
  ];

  const marqueeRow2 = [
    { label: "🐜 Pest Control & Cockroach Spray", icon: ShieldCheck },
    { label: "📦 Packers & Movers House Shifting", icon: Clock },
    { label: "🧺 Doorstep Laundry & Steam Press", icon: Sparkles },
    { label: "🚿 Water Heater & Geyser Repair", icon: Wrench },
    { label: "🪑 Sofa & Carpet Deep Washing", icon: Sparkles },
    { label: "👶 Verified Nanny & Childcare Help", icon: UserCheck },
  ];

  const marqueeRow3 = [
    { label: "🍳 Modular Kitchen Repair & Hinge Fix", icon: Hammer },
    { label: "🎨 Home Painting & Wall Waterproofing", icon: Sparkles },
    { label: "🌪️ Kitchen Chimney & Hob Servicing", icon: Wrench },
    { label: "📹 CCTV Camera & Smart Lock Setup", icon: ShieldCheck },
    { label: "☀️ Solar Panel Installation & Repair", icon: Zap },
    { label: "💧 RO Water Purifier Servicing", icon: Wrench },
  ];

  const marqueeRow4 = [
    { label: "✨ Full House Deep Cleaning", icon: Sparkles },
    { label: "🪟 Window Glass & Balcony Washing", icon: Sparkles },
    { label: "🛢️ Overhead Water Tank Sanitization", icon: Wrench },
    { label: "🪴 Garden & Lawn Trimming", icon: Sparkles },
    { label: "🧱 Masonry & Floor Tile Repair", icon: Hammer },
    { label: "🚘 Doorstep Car Wash & Interior Cleaning", icon: Sparkles },
  ];

  const serviceList = [
    {
      id: "ac-repair",
      category: "ac",
      title: "AC Deep Servicing & Gas Charging",
      desc: "Full jet wash cleaning, gas top-up, filter wash & cooling inspection by verified technicians.",
      image: "/rentawas experts/ac.jpg",
      startingPrice: "₹499",
      eta: "15-30 Mins",
      rating: "4.9",
      reviews: "3,820",
      features: ["Jet Pump Wash", "Gas Checkup Included", "30-Day Guarantee"],
    },
    {
      id: "plumber-pipe",
      category: "plumbing",
      title: "Plumbing Leakage & Sanitary Fitting",
      desc: "Instant tap repair, pipe leak sealing, bathroom fitting, flush tank repair & water heater setup.",
      image: "/rentawas experts/plumber.jpg",
      startingPrice: "₹199",
      eta: "20-30 Mins",
      rating: "4.8",
      reviews: "5,140",
      features: ["Certified Plumbers", "No Cleanup Hassle", "Fixed Pricing"],
    },
    {
      id: "carpenter-furniture",
      category: "carpentry",
      title: "Carpentry & Custom Furniture Repair",
      desc: "Door lock installation, modular kitchen drawer fix, bed repair & custom woodwork adjustments.",
      image: "/rentawas experts/Carpentar.jpg",
      startingPrice: "₹249",
      eta: "30-45 Mins",
      rating: "4.9",
      reviews: "2,980",
      features: ["Precision Wood Tooling", "Locks & Hinges", "Spare Parts Help"],
    },
    {
      id: "househelp-daily",
      category: "househelp",
      title: "Full-Time & Daily Househelp / Maid",
      desc: "Background verified domestic staff for utensil washing, floor mopping, dusting & meal cooking.",
      image: "/rentawas experts/Househelp.jpg",
      startingPrice: "₹2,499 / mo",
      eta: "Same Day Placement",
      rating: "4.9",
      reviews: "8,450",
      features: ["Aadhaar Verified Staff", "Replacement Guarantee", "Trial Available"],
    },
    {
      id: "pest-control-home",
      category: "pest",
      title: "Complete Home Pest Control & Spray",
      desc: "Odourless anti-cockroach gel, termite eradication, bed bug treatment & mosquito sanitization.",
      image: "/rentawas experts/pest control.jpg",
      startingPrice: "₹799",
      eta: "60 Mins",
      rating: "4.8",
      reviews: "1,920",
      features: ["Child & Pet Safe Chemicals", "Government Approved", "6-Month Warranty"],
    },
    {
      id: "packers-movers-shift",
      category: "relocation",
      title: "Home Shifting & Packers & Movers",
      desc: "Stress-free local house shifting, bubble wrapping, furniture dismantling, loading & transport.",
      image: "/rentawas experts/packers movers.jpg",
      tag: "Popular Shifting",
      startingPrice: "₹3,999",
      eta: "Scheduled Booking",
      rating: "4.9",
      reviews: "4,110",
      features: ["Transit Insurance Covered", "Dedicated Truck", "Unpacking Support"],
    },
    {
      id: "laundry-dryclean",
      category: "laundry",
      title: "Laundry, Steam Pressing & Dry Cleaning",
      desc: "Doorstep laundry pickup, hygienic detergent wash, steam press & 24-hour return delivery.",
      image: "/rentawas experts/laundry.jpg",
      startingPrice: "₹69 / kg",
      eta: "24-Hour Return",
      rating: "4.7",
      reviews: "2,350",
      features: ["Doorstep Pickup & Drop", "Antibacterial Wash", "Stain Removal"],
    },
    {
      id: "childcare-nanny",
      category: "househelp",
      title: "Verified Childcare & Babysitter Help",
      desc: "Trained infant nannies, after-school babysitting & elderly care companions in your locality.",
      image: "/rentawas experts/child care.jpg",
      startingPrice: "₹3,500 / mo",
      eta: "Same Day Matching",
      rating: "4.9",
      reviews: "1,420",
      features: ["Police Verified Background", "CPR Trained", "Flexible Hours"],
    },
    {
      id: "locksmith-emergency",
      category: "locksmith",
      title: "Emergency Locksmith & Key Duplicate",
      desc: "24/7 emergency door unlock, key cutting, digital keypad lock installation & safe opening.",
      image: "/rentawas experts/locksmith.jpg",
      startingPrice: "₹349",
      eta: "15 Mins Emergency",
      rating: "4.9",
      reviews: "980",
      features: ["24/7 Availability", "Zero Damage Lock Pick", "Digital Lock Setup"],
    },
  ];

  const filteredServices = serviceList.filter((s) => {
    const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(s.category);
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalServicesPages = Math.max(1, Math.ceil(filteredServices.length / EXPERTS_PER_PAGE));
  const paginatedServices = useMemo(() => {
    const start = (currentExpertPage - 1) * EXPERTS_PER_PAGE;
    return filteredServices.slice(start, start + EXPERTS_PER_PAGE);
  }, [filteredServices, currentExpertPage]);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifySuccess(true);
    setTimeout(() => {
      setNotifySuccess(false);
      setIsNotifyModalOpen(false);
      setNotifyEmail("");
    }, 2500);
  };

  const triggerComingSoon = (serviceTitle: string) => {
    setModalTitle(`${serviceTitle} — Coming Soon!`);
    setIsComingSoonModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar variant="dark" />

      {/* SECTION 1: HERO SECTION (FULL SCREEN VIEWPORT) */}
      <section className="relative pt-24 sm:pt-28 pb-16 sm:pb-24 bg-slate-950 text-white overflow-hidden border-b border-slate-800 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        {/* Glow Ambient Highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#FF6B00]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Headline, Proof, Badges & City Pills */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Main Headline */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Connect with House Help &amp;{" "}
                <span className="text-[#FF6B00]">Verified Local Experts</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 font-medium text-base sm:text-lg max-w-2xl leading-relaxed">
                Connect directly with certified local specialists for all your home needs — from AC servicing and plumbing fixes to carpentry, househelp, electrical work, and complete property maintenance.
              </p>

              {/* Status & App Badges */}
              <div className="pt-2 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Pre-Launch Status */}
                  <div className="px-3.5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Coming Soon</span>
                  </div>
                </div>

              </div>

              {/* Live in Cities Pills */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Launching Soon In:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {cities.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCity(c)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${selectedCity === c
                        ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-md"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* App Store Download Badges (Google Play & Indus Appstore) */}
              <div className="pt-4 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => triggerComingSoon("Google Play Store App")}
                  className="hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer inline-block group"
                  title="Get it on Google Play"
                >
                  <Image
                    src="/googlePlayButton.png"
                    alt="Get it on Google Play"
                    width={160}
                    height={52}
                    className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-md border border-slate-700/80 group-hover:border-[#FF6B00]/60 transition-colors"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => triggerComingSoon("Indus Appstore App")}
                  className="hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer inline-block group"
                  title="Download on Indus Appstore"
                >
                  <Image
                    src="/indusAppstore.jpg"
                    alt="Download on Indus Appstore"
                    width={160}
                    height={52}
                    className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-md border border-slate-700/80 group-hover:border-[#FF6B00]/60 transition-colors"
                  />
                </button>
              </div>

              {/* Become a RentAwas Expert CTA Link Button */}
              <div className="pt-3">
                <a
                  href="https://forms.anshapps.com/rentawas-s-workspace/rentawas-experts-form"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-orange-500/20 uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] border border-orange-400/30"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Become a RentAwas Expert</span>
                </a>
              </div>

            </div>

            {/* Right Column: Hero Graphic Banner Image */}
            <div className="lg:col-span-7 relative flex justify-center lg:justify-end items-center">
              <div className="relative w-full max-w-3xl lg:translate-x-20 lg:-mr-10">
                <Image
                  src="/rentawas experts/experts.png"
                  alt="RentAwas Verified Home Experts & Technicians"
                  width={1000}
                  height={800}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: 2-ROW SAME-DIRECTION SMOOTH SLOW-MOTION MARQUEE WALL */}
      <section className="py-6 sm:py-8 bg-slate-950 border-y border-slate-800/90 font-sans overflow-hidden">
        <div className="relative w-full overflow-hidden space-y-3">
          {/* Side Fade Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent z-10 pointer-events-none" />

          {/* Row 1: Leftward Smooth Glide */}
          <motion.div
            className="flex gap-3 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
          >
            {[...marqueeRow1, ...marqueeRow3, ...marqueeRow1, ...marqueeRow3].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={`r1-${idx}`}
                  className="px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap border flex items-center gap-2.5 bg-slate-900/90 text-slate-200 border-slate-800 shadow-md backdrop-blur-md"
                >
                  <div className="w-6 h-6 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[#FF6B00] shrink-0">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </motion.div>

          {/* Row 2: Leftward Smooth Glide (Same Direction) */}
          <motion.div
            className="flex gap-3 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 55, ease: "linear" }}
          >
            {[...marqueeRow2, ...marqueeRow4, ...marqueeRow2, ...marqueeRow4].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={`r2-${idx}`}
                  className="px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap border flex items-center gap-2.5 bg-slate-900/90 text-slate-200 border-slate-800 shadow-md backdrop-blur-md"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SECTION: BOOK VERIFIED LOCAL EXPERTS (CARDS TO BOOK EXPERTS) */}
      <section id="book-experts-section" className="py-16 sm:py-20 bg-white font-sans border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Header */}
          <div className="border-b border-slate-100 pb-6">
            <div className="space-y-3 text-left max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Book Local Experts
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Select your required home service category below to view rates and book background-checked technicians instantly.
              </p>
            </div>
          </div>

          {/* Category Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Multi-Select Services Types Dropdown */}
            <div ref={servicesDropdownRef} className="relative w-full sm:w-72 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsServicesDropdownOpen(!isServicesDropdownOpen);
                  setIsLocationDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between gap-2 cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <Filter className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  <span className="truncate">
                    {selectedCategories.length === 0
                      ? "Select Service Types (Multi-Select)..."
                      : `${selectedCategories.length} Service Type(s) Selected`}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isServicesDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Multi-Select Dropdown Menu */}
              {isServicesDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-3 space-y-2 max-h-80 overflow-y-auto custom-scrollbar font-sans text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Choose Service Types</span>
                    {selectedCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategories([])}
                        className="text-[11px] font-extrabold text-[#FF6B00] hover:underline cursor-pointer"
                      >
                        Clear All ({selectedCategories.length})
                      </button>
                    )}
                  </div>
                  {SERVICE_CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-bold transition-colors ${
                          isSelected ? "bg-orange-50/70 text-slate-900" : "text-slate-700"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          isSelected ? "bg-[#FF6B00] border-[#FF6B00] text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <span>{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Input & Location Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
              {/* Location Cascading Dropdown (India -> State -> City -> Area) */}
              <div ref={locationDropdownRef} className="relative w-full sm:w-64 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between gap-2 cursor-pointer transition-all"
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
                        : "Filter by State / Location..."}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isLocationDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Cascading Dropdown Menu */}
                {isLocationDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-3 space-y-2.5 overflow-hidden text-slate-900 font-sans">
                    
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
                          Clear Filter
                        </button>
                      )}
                    </div>

                    {/* STEP 1: COUNTRY SELECTOR */}
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
                    {locationStep === "city" && selectedLocationState && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                          {selectedLocationState} › Select City
                        </div>

                        {/* City Search Bar */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            placeholder={`Search city in ${selectedLocationState}...`}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                          />
                        </div>

                        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-0.5">
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
                                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 4: AREA / LOCALITY SELECTOR */}
                    {locationStep === "area" && selectedLocationCity && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                          {selectedLocationCity} › Select Localities
                        </div>

                        {/* Area Search Bar */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={areaSearchQuery}
                            onChange={(e) => setAreaSearchQuery(e.target.value)}
                            placeholder={`Search locality in ${selectedLocationCity}...`}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                          />
                        </div>

                        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-0.5">
                          {(CITY_LOCALITIES_DATA[selectedLocationCity] || DEFAULT_CITY_LOCALITIES)
                            .filter((ar) => ar.toLowerCase().includes(areaSearchQuery.toLowerCase()))
                            .map((ar, aIdx) => {
                              const isSelected = selectedLocationAreas.includes(ar);
                              return (
                                <label
                                  key={aIdx}
                                  onClick={() => {
                                    if (selectedLocationAreas.includes(ar)) {
                                      setSelectedLocationAreas(selectedLocationAreas.filter(a => a !== ar));
                                    } else {
                                      setSelectedLocationAreas([...selectedLocationAreas, ar]);
                                    }
                                  }}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 transition-colors"
                                >
                                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                    isSelected ? "bg-[#FF6B00] border-[#FF6B00] text-white" : "border-slate-300 bg-white"
                                  }`}>
                                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  </div>
                                  <span>{ar}</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search service..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          {/* Service Cards Grid (Using Actual Live Experts from API) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingExperts ? (
              // Loading Skeleton State
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 animate-pulse">
                  <div className="h-48 bg-slate-100 rounded-2xl" />
                  <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))
            ) : filteredLiveExperts.length > 0 ? (
              // Render Actual Experts from API (Max 9 per page)
              paginatedLiveExperts.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Expert Photo Banner */}
                    <div className="h-52 sm:h-56 relative overflow-hidden bg-slate-900">
                      <Image
                        src={exp.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"}
                        alt={exp.name}
                        fill
                        unoptimized
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-extrabold text-slate-900 flex items-center gap-1 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
                        <span>{exp.rating != null ? Number(exp.rating).toFixed(1) : "5.0"}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({exp.completedJobs ?? 0} jobs)</span>
                      </div>



                      {/* Name & City Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <div className="flex items-center gap-1 text-xs text-orange-300 font-bold uppercase tracking-wider mb-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{exp.city || "NCR"}</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug drop-shadow-md flex items-center gap-1.5">
                          <span>{exp.name}</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20 shrink-0" />
                        </h3>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3.5 text-left">
                      <div>
                        <span className="text-xs font-extrabold text-[#FF6B00] block uppercase tracking-wider">
                          {exp.trade || "Home Maintenance"}
                        </span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2 mt-0.5">
                          {exp.specialization || `${exp.trade} specialist available for on-site property booking.`}
                        </p>
                      </div>

                      {/* Experience & Status Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200/80 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-500" />
                          <span>{exp.experience || "5+ Yrs Exp"}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200/80 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Aadhaar Verified</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Visiting Fee & Book Expert Button */}
                  <div className="p-5 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between gap-3 bg-slate-50/50">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Visiting Fee</span>
                      <span className="text-lg font-black text-slate-900">₹{exp.fee || 599}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleBookClick(exp, e)}
                      className="px-4.5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-orange-500/25 transition-all flex items-center gap-2 group/btn cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Book Expert</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Fallback Category Cards (Max 9 per page)
              paginatedServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Image Banner */}
                    <div className="h-48 sm:h-52 relative overflow-hidden bg-slate-100">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-extrabold text-slate-900 flex items-center gap-1 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
                        <span>{service.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({service.reviews})</span>
                      </div>

                      {/* ETA Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-emerald-400 flex items-center gap-1 shadow-md">
                        <Clock className="w-3 h-3" />
                        <span>{service.eta}</span>
                      </div>

                      {/* Title overlay */}
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug drop-shadow-md">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3.5 text-left">
                      <div>
                        <span className="text-xs font-extrabold text-[#FF6B00] block uppercase tracking-wider">
                          {service.category}
                        </span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2 mt-0.5">
                          {service.desc || (service as any).description}
                        </p>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {service.features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200/80 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#FF6B00]" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Starting Price & Book Button */}
                  <div className="p-5 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between gap-3 bg-slate-50/50">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Starts at</span>
                      <span className="text-lg font-black text-slate-900">{service.startingPrice}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleBookClick({
                        id: service.id,
                        name: service.title,
                        trade: service.category,
                        title: service.title,
                        avatar: service.image,
                        fee: parseInt(service.startingPrice.replace(/[^\d]/g, "")) || 499,
                      }, e)}
                      className="px-4.5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-orange-500/25 transition-all flex items-center gap-2 group/btn cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Book Expert</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls Bar (Max 9 items per page) */}
          {((filteredLiveExperts.length > EXPERTS_PER_PAGE) || (filteredLiveExperts.length === 0 && filteredServices.length > EXPERTS_PER_PAGE)) && (
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs font-bold text-slate-700">
              <div className="text-slate-500 text-xs">
                Showing{" "}
                <span className="font-black text-slate-900">
                  {Math.min(
                    (currentExpertPage - 1) * EXPERTS_PER_PAGE + 1,
                    filteredLiveExperts.length > 0 ? filteredLiveExperts.length : filteredServices.length
                  )}
                </span>{" "}
                to{" "}
                <span className="font-black text-slate-900">
                  {Math.min(
                    currentExpertPage * EXPERTS_PER_PAGE,
                    filteredLiveExperts.length > 0 ? filteredLiveExperts.length : filteredServices.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-black text-slate-900">
                  {filteredLiveExperts.length > 0 ? filteredLiveExperts.length : filteredServices.length}
                </span>{" "}
                {filteredLiveExperts.length > 0 ? "Experts" : "Services"}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={currentExpertPage === 1}
                  onClick={() => {
                    setCurrentExpertPage((prev) => Math.max(1, prev - 1));
                    document.getElementById("book-experts-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-3 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl text-slate-800 font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {Array.from(
                  { length: filteredLiveExperts.length > 0 ? totalLiveExpertPages : totalServicesPages },
                  (_, i) => i + 1
                ).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => {
                      setCurrentExpertPage(pNum);
                      document.getElementById("book-experts-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-9 h-9 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center cursor-pointer shadow-2xs ${
                      currentExpertPage === pNum
                        ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentExpertPage === (filteredLiveExperts.length > 0 ? totalLiveExpertPages : totalServicesPages)}
                  onClick={() => {
                    setCurrentExpertPage((prev) =>
                      Math.min(filteredLiveExperts.length > 0 ? totalLiveExpertPages : totalServicesPages, prev + 1)
                    );
                    document.getElementById("book-experts-section")?.scrollIntoView({ behavior: "smooth" });
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
      </section>

      {/* SECTION 3: REAL STORIES & PROVEN TRUST (Interactive Showcase) */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC] font-sans border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Header Banner */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>REAL STORIES FROM RENTAWAS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              RentAwas is transforming how tenants, verified locality experts, and property owners connect
            </h2>
            <p className="text-slate-600 text-base sm:text-lg font-medium max-w-2xl mx-auto">
              Turning rental maintenance headaches into 1-tap peace of mind.
            </p>
          </div>

          {/* Story Selection Tabs */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto pb-2">
            {cardStoriesData.map((story, idx) => (
              <button
                key={story.id}
                onClick={() => setActiveStoryIndex(idx)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${activeStoryIndex === idx
                  ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                  }`}
              >
                <span>{story.title.split(" — ")[0].split("?")[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Story Card Display */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStoryIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                {/* Left Side: Story Details & Highlights */}
                <div className="lg:col-span-6 space-y-6 text-left">
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${cardStoriesData[activeStoryIndex].badgeBg}`}>
                    <Sparkles className="w-4 h-4" />
                    <span>{cardStoriesData[activeStoryIndex].badge}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {cardStoriesData[activeStoryIndex].title}
                  </h3>

                  <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed italic border-l-2 border-[#FF6B00] pl-4 py-0.5">
                    {cardStoriesData[activeStoryIndex].subtitle}
                  </p>

                  {/* Highlights List */}
                  {cardStoriesData[activeStoryIndex].highlights.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {cardStoriesData[activeStoryIndex].highlights.map((h, hIdx) => {
                        const IconComp = h.icon;
                        return (
                          <div key={hIdx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs space-y-1">
                            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm sm:text-base">
                              <IconComp className={`w-4 h-4 ${h.iconColor}`} />
                              <span>{h.title}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium pl-6 leading-relaxed">
                              {h.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Feature Chips & Book Experts CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {cardStoriesData[activeStoryIndex].chips.map((chip, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    <Link
                      href="/dashboard/experts"
                      className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.98] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-orange-500/25 transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Book Experts</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Right Side: Showcase Image or Quote Card */}
                <div className={`lg:col-span-6 flex items-center justify-center h-[380px] sm:h-[440px] relative rounded-3xl overflow-hidden ${cardStoriesData[activeStoryIndex].imageSrc
                  ? "bg-transparent border-none shadow-none"
                  : "bg-slate-50 border border-slate-100"
                  }`}>
                  {cardStoriesData[activeStoryIndex].imageSrc ? (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <Image
                        src={cardStoriesData[activeStoryIndex].imageSrc}
                        alt={cardStoriesData[activeStoryIndex].title}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full p-6 sm:p-8 space-y-4 flex flex-col justify-between text-left">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${cardStoriesData[activeStoryIndex].badgeBg}`}>
                          0{activeStoryIndex + 1} / 04 — {cardStoriesData[activeStoryIndex].badge}
                        </span>
                        <span className="text-xs font-extrabold text-[#FF6B00] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-[#FF6B00]" />
                          {cardStoriesData[activeStoryIndex].cardTag}
                        </span>
                      </div>

                      <div className="space-y-3 my-auto">
                        <div className="text-[#FF6B00] font-serif text-4xl leading-none select-none">“</div>
                        <p className="text-slate-900 text-base sm:text-lg font-bold leading-relaxed tracking-tight -mt-2">
                          {cardStoriesData[activeStoryIndex].quote}
                        </p>
                      </div>

                      <div className="flex items-center gap-3.5 pt-3.5 border-t border-slate-200">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                          {cardStoriesData[activeStoryIndex].authorInitials}
                        </div>
                        <div className="leading-tight">
                          <div className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                            <span>{cardStoriesData[activeStoryIndex].authorName}</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {cardStoriesData[activeStoryIndex].authorRole}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* SECTION 4: BOOK OUR EXPERTS IN ONE CLICK & MOBILE APP SHOWCASE */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-b border-slate-800 font-sans">
        {/* Glow ambient backdrops */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-10 w-[550px] h-[550px] bg-[#FF6B00]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Headline, Features, App Badges */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest">
                  <Smartphone className="w-4 h-4" />
                  <span>RentAwas Mobile App</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                  Book Our Experts In <span className="text-[#FF6B00]">One Click</span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
                  Get verified technicians, plumbers, electricians &amp; househelp delivered to your home in minutes right from your phone. Zero hassle, fixed pricing, and real-time live tracking.
                </p>
              </div>

              {/* Value Proposition Card */}
              <div className="space-y-3.5">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-start gap-4 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">1-Tap Instant Service Dispatch</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Select your home issue, confirm your address, and dispatch an expert with a single tap.</p>
                  </div>
                </div>
              </div>

              {/* App Store & Play Store Download Badges */}
              <div className="pt-2 space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                  Coming Soon To Google Play &amp; Indus Appstore:
                </span>

                <div className="flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => triggerComingSoon("Google Play Store App")}
                    className="hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer inline-block group"
                    title="Get it on Google Play"
                  >
                    <Image
                      src="/googlePlayButton.png"
                      alt="Get it on Google Play"
                      width={160}
                      height={52}
                      className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-md border border-slate-700/80 group-hover:border-[#FF6B00]/60 transition-colors"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerComingSoon("Indus Appstore App")}
                    className="hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer inline-block group"
                    title="Download on Indus Appstore"
                  >
                    <Image
                      src="/indusAppstore.jpg"
                      alt="Download on Indus Appstore"
                      width={160}
                      height={52}
                      className="h-12 sm:h-14 w-auto object-contain rounded-xl shadow-md border border-slate-700/80 group-hover:border-[#FF6B00]/60 transition-colors"
                    />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Static Smartphone Mockup */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-[320px] aspect-[9/18] bg-slate-900 rounded-[48px] p-3.5 border-4 border-slate-700 shadow-2xl shadow-orange-500/20">
                {/* Speaker Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <div className="w-10 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Inner Screen Canvas — RentAwas Mobile App Screenshot */}
                <div className="w-full h-full bg-slate-950 rounded-[38px] overflow-hidden relative border border-slate-800 font-sans">
                  <Image
                    src="/mobilerentawas.jpeg"
                    alt="RentAwas Mobile App Preview"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION (SLOWLY MOVING INFINITE MARQUEE) */}
      <section className="py-20 bg-[#F8FAFC] border-t border-b border-slate-200 overflow-hidden font-sans relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-left mb-12">
          <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest block">
            COMMUNITY TRUST &amp; STORIES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Trusted By RentAwas Families.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real experiences from property managers, landlords, and residents relying on RentAwas maintenance experts.
          </p>
        </div>

        {/* Marquee Row 1 (Moving Slowly Left) */}
        <div className="relative w-full overflow-hidden mb-6">
          {/* Edge Blur Gradients */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-6 w-max animate-marquee-left">
            {[...testimonialsRow1, ...testimonialsRow1, ...testimonialsRow1].map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] sm:w-[350px] p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 shrink-0 flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                {/* 5 Orange Stars */}
                <div className="flex items-center gap-1 text-[#FF6B00]">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FF6B00] text-[#FF6B00]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center border shrink-0 ${item.color}`}>
                    {item.initial}
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-extrabold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 block">{item.locality}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Moving Slowly Right) */}
        <div className="relative w-full overflow-hidden">
          {/* Edge Blur Gradients */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-6 w-max animate-marquee-right">
            {[...testimonialsRow2, ...testimonialsRow2, ...testimonialsRow2].map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] sm:w-[350px] p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 shrink-0 flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                {/* 5 Orange Stars */}
                <div className="flex items-center gap-1 text-[#FF6B00]">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FF6B00] text-[#FF6B00]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center border shrink-0 ${item.color}`}>
                    {item.initial}
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-extrabold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 block">{item.locality}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW RENTAWAS EXPERTS WORKS */}
      <section className="py-16 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
              Simple &amp; Guaranteed
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How RentAwas Home Services Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              3 easy steps to getting trusted, background-verified experts at your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Select Service &amp; Locality</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose AC repair, plumbing, carpentry, househelp, or electrical services in your city locality.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Matched with Verified Expert</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get paired with background-checked local independent specialists with fixed transparent pricing.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Doorstep Expert Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your assigned specialist arrives at your scheduled time and resolves your home issue professionally.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: WANT TO BECOME RENTAWAS EXPERTS? */}
      <RentAwasExpertsSection />

      <Footer />

      {/* NOTIFY ME LOCALITY MODAL */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-[#FF6B00] flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Request Services in Your City</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pre-launch notification alert</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNotifyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notifySuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-black text-white">Notification Saved!</h4>
                <p className="text-xs text-emerald-300">
                  We will notify you on <span className="font-bold text-white">{notifyEmail}</span> as soon as RentAwas Home Services launches in <span className="font-bold text-white">{selectedCity}</span>!
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Selected Locality / City
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedCity}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-orange-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address or Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="Enter your email or phone..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Notify Me On Launch</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* COMING SOON MODAL */}
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
        title={modalTitle}
      />

      {/* EXPERT BOOKING FORM MODAL (OPENS DIRECTLY ON LANDING PAGE) */}
      <AnimatePresence>
        {selectedExpertForBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-left overflow-hidden font-sans text-slate-900"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedExpertForBooking(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header: Photo, Name, Trade */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                {selectedExpertForBooking.avatar || selectedExpertForBooking.image ? (
                  <img
                    src={selectedExpertForBooking.avatar || selectedExpertForBooking.image}
                    alt={selectedExpertForBooking.name || selectedExpertForBooking.title}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white font-black text-lg flex items-center justify-center border border-slate-200 shrink-0">
                    {(selectedExpertForBooking.name || selectedExpertForBooking.title || "EX").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {selectedExpertForBooking.name || selectedExpertForBooking.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedExpertForBooking.trade || selectedExpertForBooking.specialization || "Home Service Specialist"}
                  </p>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-4 text-xs font-sans">
                {/* Consultation Date */}
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
                            if (foundProp && foundProp.units && foundProp.units.length > 0) {
                              const firstUnit = foundProp.units[0];
                              setSelectedUnit(firstUnit.unitNumber || `Unit 101`);
                              const fNum = firstUnit.floorNumber ?? 1;
                              const fLabel = fNum === 0 ? "Ground Floor" : fNum === 1 ? "1st Floor" : fNum === 2 ? "2nd Floor" : `${fNum}th Floor`;
                              setSelectedFloor(fLabel);
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
                            onChange={(e) => setSelectedFloor(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                          >
                            <option value="Ground Floor">Ground Floor</option>
                            <option value="1st Floor">1st Floor</option>
                            <option value="2nd Floor">2nd Floor</option>
                            <option value="3rd Floor">3rd Floor</option>
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
                            <option value="Unit 101">Unit 101</option>
                            <option value="Unit 102">Unit 102</option>
                            <option value="Unit 201">Unit 201</option>
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

                    {/* Map Pin Readout */}
                    {mapPinCoords.addressName && (
                      <div className="text-[11px] font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#FF6B00] shrink-0" />
                        <span className="truncate">📍 Pin: {mapPinCoords.addressName}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Special Notes */}
                <div>
                  <label className="block font-extrabold text-slate-800 mb-1.5 uppercase tracking-wider text-[10px]">
                    Special Instructions / Notes (Optional)
                  </label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Water leak in bathroom; please call before arrival..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* Fee Summary */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Visiting Fee</div>
                    <div className="text-base font-black text-slate-900">₹{selectedExpertForBooking.fee || 599}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedExpertForBooking(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLandingBooking}
                  disabled={isSubmittingBooking}
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {isSubmittingBooking ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Expert Booking</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAP PICKER MODAL ON LANDING PAGE */}
      {isMapPickerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative font-sans text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

      {/* WAITING CONFIRMATION MODAL ON LANDING PAGE */}
      {waitingConfirmationBooking && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative font-sans text-center text-slate-900">
            <button
              onClick={() => setWaitingConfirmationBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-4 border-amber-200 text-amber-600 flex items-center justify-center relative">
              <Clock className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </span>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                ⏳ WAITING FOR CONFIRMATION FROM EXPERT
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Booking Request Dispatched</h3>
              <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                Your request <strong>{waitingConfirmationBooking.id}</strong> has been sent to <strong>{waitingConfirmationBooking.expertName}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Expert</span>
                <span className="font-extrabold text-slate-900">{waitingConfirmationBooking.expertName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Location Address</span>
                <span className="font-bold text-slate-800">{waitingConfirmationBooking.property}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Booking Status</span>
                <span className="font-black text-amber-600">Pending Expert Accept</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/dashboard/experts?tab=history"
                className="w-full py-3 bg-[#0B132B] hover:bg-[#FF6B00] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md uppercase tracking-wider block text-center"
              >
                View in Dashboard Bookings
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
