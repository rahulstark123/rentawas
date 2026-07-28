"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EarlyAccessModal from "@/components/ui/EarlyAccessModal";
import {
  MapPin,
  Bed,
  Maximize2,
  ShieldCheck,
  Star,
  PhoneCall,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Building2,
  Check,
  User,
  Clock,
  Zap,
  Compass,
  Layers,
  Info,
  X,
  Images,
  ChevronLeft,
  ChevronRight,
  WifiOff,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";
import { useToast } from "@/components/ui/Toast";

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
  description?: string;
  deposit?: number | null;
  location: string;
  city: string;
  price: string;
  type: string;
  bhk: string;
  size: string;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  mainImage?: string;
  coverImage?: string;
  tags: string[];
  ownerName: string;
  ownerPhone: string;
  badge: string;
}

const DEFAULT_PROPERTIES: PropertyItem[] = [
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
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
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
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
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
    type: "PG Bed",
    bhk: "1 Bed",
    size: "Private Room",
    rating: 4.9,
    reviewsCount: 22,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["3 Meals Included", "Daily Housekeeping", "High-Speed WiFi"],
    ownerName: "Rajesh Kumar (Manager)",
    ownerPhone: "+91 99887 76655",
    badge: "Verified Owner • Meals Included",
  },
  {
    id: "PROP-104",
    title: "Emerald Vista 3BHK Penthouse",
    location: "Banjara Hills, Road No. 12",
    city: "Hyderabad",
    price: "₹45,000",
    type: "Apartment",
    bhk: "3 BHK",
    size: "2,100 sq.ft",
    rating: 5.0,
    reviewsCount: 18,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Luxury Interiors", "Covered Parking", "Clubhouse Access"],
    ownerName: "Dr. Vikram Reddy (Owner)",
    ownerPhone: "+91 97000 11223",
    badge: "Verified Owner • Zero Brokerage",
  },
];

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const propertyId = params?.id as string;

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState<"network_error" | "not_found">("not_found");
  const [errorMessage, setErrorMessage] = useState("");

  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Photo Lightbox Carousel State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Lead Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [moveInDate, setMoveInDate] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Review System State & Rating Categories
  interface ReviewItem {
    id: string;
    author: string;
    status: string;
    date: string;
    overallRating: number;
    conditionRating: number;
    localityRating: number;
    landlordRating: number;
    headline: string;
    comment: string;
    tags: string[];
  }

  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([
    {
      id: "REV-101",
      author: "Rahul Raj",
      status: "Current Resident",
      date: "July 2026",
      overallRating: 5,
      conditionRating: 5,
      localityRating: 5,
      landlordRating: 5,
      headline: "Extremely peaceful locality with great connectivity!",
      comment: "Living here for over 8 months. The landlord is super helpful and repairs are addressed within hours. Gated security and fiber wifi make work from home seamless.",
      tags: ["Peaceful Locality", "Prompt Maintenance", "Zero Brokerage"],
    },
    {
      id: "REV-102",
      author: "Ananya Sharma",
      status: "Verified Past Tenant",
      date: "June 2026",
      overallRating: 4.5,
      conditionRating: 4,
      localityRating: 5,
      landlordRating: 5,
      headline: "Safe neighborhood for working women & 100% deposit refund",
      comment: "Smooth move-in and complete deposit returned without any unjustified deductions upon move-out. Walking distance to market and metro.",
      tags: ["Safe for Women", "100% Deposit Refund", "Metro Connectivity"],
    },
  ]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);
  const [allReviewsFilter, setAllReviewsFilter] = useState("All");
  const [reviewerName, setReviewerName] = useState("");
  const [residentStatus, setResidentStatus] = useState("Current Resident");
  const [overallRating, setOverallRating] = useState(5);
  const [conditionRating, setConditionRating] = useState(5);
  const [localityRating, setLocalityRating] = useState(5);
  const [landlordRating, setLandlordRating] = useState(5);
  const [reviewHeadline, setReviewHeadline] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>(["Zero Brokerage"]);

  const REVIEW_TAG_OPTIONS = [
    "Peaceful Locality",
    "Prompt Maintenance",
    "Zero Brokerage",
    "Safe for Women",
    "Metro Connectivity",
    "100% Deposit Refund",
    "Spacious & Ventilated",
    "Great Landlord",
  ];

  const toggleReviewTag = (tag: string) => {
    if (selectedReviewTags.includes(tag)) {
      setSelectedReviewTags(selectedReviewTags.filter((t) => t !== tag));
    } else {
      setSelectedReviewTags([...selectedReviewTags, tag]);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      toast("Please enter your name and review feedback.", "error");
      return;
    }

    const newReview: ReviewItem = {
      id: `REV-${Date.now()}`,
      author: reviewerName.trim(),
      status: residentStatus,
      date: "Just now",
      overallRating,
      conditionRating,
      localityRating,
      landlordRating,
      headline: reviewHeadline.trim() || "Verified Resident Review",
      comment: reviewComment.trim(),
      tags: selectedReviewTags,
    };

    setReviewsList([newReview, ...reviewsList]);
    setIsReviewModalOpen(false);
    toast("Thank you! Your resident review has been published.", "success");

    setReviewerName("");
    setReviewHeadline("");
    setReviewComment("");
  };

  const defaultGalleryFallbacks = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
  ];

  const loadProperty = async () => {
    if (!propertyId) return;
    setIsLoading(true);
    setHasError(false);
    try {
      // Fetch ID-wise from GET /api/listings/[id]
      const res = await fetch(`/api/listings/${encodeURIComponent(propertyId)}`);
      
      if (res.status === 404) {
        const found = DEFAULT_PROPERTIES.find((p) => p.id.toLowerCase() === propertyId?.toLowerCase());
        if (found) {
          setProperty(found);
          setIsLoading(false);
          return;
        }
        setHasError(true);
        setErrorType("not_found");
        setErrorMessage("Property not found. This listing may have been removed or rented out.");
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const json = await res.json();

      if (json.success && json.data) {
        const item = json.data;
        
        const uploadedPhotos: string[] = [];
        if (item.mainImage) uploadedPhotos.push(item.mainImage);
        if (item.coverImage && !uploadedPhotos.includes(item.coverImage)) {
          uploadedPhotos.push(item.coverImage);
        }
        if (Array.isArray(item.galleryImages)) {
          item.galleryImages.forEach((img: string) => {
            if (img && typeof img === "string" && !uploadedPhotos.includes(img)) {
              uploadedPhotos.push(img);
            }
          });
        }
        if (Array.isArray(item.images)) {
          item.images.forEach((img: string) => {
            if (img && typeof img === "string" && !uploadedPhotos.includes(img)) {
              uploadedPhotos.push(img);
            }
          });
        }
        if (item.image && !uploadedPhotos.includes(item.image)) {
          uploadedPhotos.push(item.image);
        }

        // Fill up to at least 5 images using default gallery fallbacks
        const mergedImages = [...uploadedPhotos];
        defaultGalleryFallbacks.forEach((fb) => {
          if (mergedImages.length < 5 && !mergedImages.includes(fb)) {
            mergedImages.push(fb);
          }
        });

        setProperty({
          id: item.id,
          title: item.title,
          description: item.description || "",
          deposit: item.deposit,
          location: item.locality || item.location || item.city || "Prime Locality",
          city: item.city || item.stateName || "Metropolis",
          price: typeof item.rent === "number" ? `₹${item.rent.toLocaleString("en-IN")}` : item.rent || "₹0",
          type: item.propertyType || "Apartment",
          bhk: item.propertyType || "Apartment",
          size: item.deposit ? `Deposit: ₹${item.deposit.toLocaleString("en-IN")}` : item.availableFrom || "Ready to Move",
          rating: 4.9,
          reviewsCount: 14,
          image: uploadedPhotos[0] || mergedImages[0],
          images: mergedImages,
          mainImage: item.mainImage || uploadedPhotos[0] || mergedImages[0],
          coverImage: item.coverImage || (uploadedPhotos.length > 1 ? uploadedPhotos[1] : mergedImages[1] || mergedImages[0]),
          tags: Array.isArray(item.amenities) && item.amenities.length > 0 
            ? item.amenities.map(formatAmenityTag) 
            : ["Zero Fee", "Direct Owner", "Verified", "Immediate Move-In"],
          ownerName: item.contactPersonName ? `${item.contactPersonName} (Owner)` : "Property Landlord",
          ownerPhone: item.contactNumber || item.ownerPhone || "+91 Contact via RentAwas",
          badge: "Verified Owner • Zero Fee",
        });
        setIsLoading(false);
        return;
      }

      // Try local static fallback list if API fails
      const found = DEFAULT_PROPERTIES.find((p) => p.id.toLowerCase() === propertyId?.toLowerCase());
      if (found) {
        const merged = [...(found.images || [found.image])];
        defaultGalleryFallbacks.forEach((fb) => {
          if (merged.length < 5 && !merged.includes(fb)) {
            merged.push(fb);
          }
        });
        setProperty({ ...found, images: merged });
        setIsLoading(false);
        return;
      }

      setHasError(true);
      setErrorType("not_found");
      setErrorMessage("The property listing you requested could not be found.");
    } catch (err) {
      console.error("Error loading property detail:", err);
      const found = DEFAULT_PROPERTIES.find((p) => p.id.toLowerCase() === propertyId?.toLowerCase());
      if (found) {
        setProperty({ ...found, images: defaultGalleryFallbacks });
        setIsLoading(false);
        return;
      }
      setHasError(true);
      setErrorType("network_error");
      setErrorMessage("Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast("Property URL copied to clipboard!", "success");
      setTimeout(() => setCopiedLink(false), 3000);
    }
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
          listingId: property?.id,
        }),
      });
      setLeadSubmitted(true);
      toast("Inquiry submitted! Owner contact unlocked.", "success");
    } catch (err) {
      console.error("Inquiry submit error:", err);
      setLeadSubmitted(true);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between">
        <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} variant="light" />
        <div className="max-w-7xl mx-auto px-6 py-20 w-full animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-40 bg-slate-200 rounded-2xl col-span-2" />
            <div className="h-40 bg-slate-200 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error State View (Network Failure or 404 Not Found)
  if (hasError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between">
        <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} variant="light" />

        <main className="pt-24 pb-20 px-6 max-w-xl mx-auto w-full flex-1 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xl w-full">
            <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-200 text-[#FF6B00] flex items-center justify-center mx-auto shadow-inner">
              {errorType === "network_error" ? (
                <WifiOff className="w-10 h-10 animate-pulse" />
              ) : (
                <AlertCircle className="w-10 h-10 text-amber-500" />
              )}
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                {errorType === "network_error" ? "Connection Issue" : "404 Not Found"}
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                {errorType === "network_error" ? "Network Connection Failed" : "Property Not Found"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto font-medium">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {errorType === "network_error" && (
                <button
                  onClick={loadProperty}
                  className="w-full sm:flex-1 py-3 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Connection</span>
                </button>
              )}
              <Link
                href="/find-property"
                className="w-full sm:flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Properties</span>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
        <EarlyAccessModal isOpen={isEarlyAccessOpen} onClose={() => setIsEarlyAccessOpen(false)} />
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-600 flex flex-col justify-between">

      {/* Top Header */}
      <Navbar onOpenEarlyAccess={() => setIsEarlyAccessOpen(true)} variant="light" />

      {/* Main Container */}
      <main className="pt-20 pb-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full space-y-6 flex-1">

        {/* Back Link & Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 pt-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#FF6B00] transition-colors cursor-pointer font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Property Listings</span>
          </button>

          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <Link href="/" className="hover:text-slate-600">Home</Link>
            <span>/</span>
            <Link href="/find-property" className="hover:text-slate-600">Find Property</Link>
            <span>/</span>
            <span className="text-slate-700 font-bold">{property.city}</span>
            <span>/</span>
            <span className="text-slate-900 font-extrabold truncate max-w-[150px] sm:max-w-xs">{property.title}</span>
          </div>
        </div>

        {/* Hero Gallery Grid (Airbnb / MagicBricks Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-3xl overflow-hidden shadow-md bg-white border border-slate-200/90 relative group">
          {/* Main Primary Cover Container (Photo 1) */}
          <div
            onClick={() => { setLightboxIndex(0); setIsLightboxOpen(true); }}
            className="lg:col-span-2 relative h-80 sm:h-96 md:h-[460px] bg-slate-900 overflow-hidden cursor-pointer"
          >
            {/* Background Cover Image Banner */}
            <Image
              src={property.coverImage || property.images?.[1] || property.images?.[0] || property.image}
              alt={`${property.title} Cover Banner`}
              fill
              unoptimized
              priority
              className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-xs font-extrabold text-white uppercase tracking-wider shadow-md">
                {property.bhk}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-xs font-extrabold text-white uppercase tracking-wider shadow-md flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                100% Zero Brokerage
              </span>
            </div>

            {/* Square Main Photo positioned in Bottom Left */}
            <div className="absolute bottom-4 left-4 flex items-end gap-3 z-10">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(0);
                  setIsLightboxOpen(true);
                }}
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 aspect-square rounded-2xl border-4 border-white shadow-2xl overflow-hidden relative shrink-0 group/sq cursor-pointer bg-slate-950"
              >
                <Image
                  src={property.mainImage || property.images?.[0] || property.image}
                  alt={`${property.title} Main Photo`}
                  fill
                  unoptimized
                  className="object-cover group-hover/sq:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-1.5 left-1.5 bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Main Photo
                </div>
              </div>

              {/* Price Overlay alongside Square Main Photo */}
              <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Rent</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{property.price} <span className="text-xs font-semibold text-slate-500">/ month</span></div>
              </div>
            </div>

            {/* Floating All Photos Action Chip */}
            <div className="absolute bottom-4 right-4 bg-slate-950/80 hover:bg-slate-950 text-white backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg border border-white/20 transition-all z-10">
              <Images className="w-4 h-4 text-orange-400" />
              <span>View All {property.images?.length || 1} Photos</span>
            </div>
          </div>

          {/* Side Thumbnail Grid (Photo 2 & Photo 3 with +X More Photos Overlay) */}
          <div className="hidden lg:grid grid-rows-2 gap-4 h-[460px]">
            {/* Photo 2 */}
            <div
              onClick={() => { setLightboxIndex(1); setIsLightboxOpen(true); }}
              className="relative h-full w-full bg-slate-100 overflow-hidden cursor-pointer group/thumb"
            >
              <Image
                src={property.images?.[1] || property.images?.[0] || property.image}
                alt={`${property.title} Interior 2`}
                fill
                unoptimized
                className="object-cover group-hover/thumb:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Photo 3 with +X More Photos Overlay */}
            <div
              onClick={() => { setLightboxIndex(2); setIsLightboxOpen(true); }}
              className="relative h-full w-full bg-slate-100 overflow-hidden cursor-pointer group/thumb"
            >
              <Image
                src={property.images?.[2] || property.images?.[0] || property.image}
                alt={`${property.title} Interior 3`}
                fill
                unoptimized
                className="object-cover group-hover/thumb:scale-105 transition-transform duration-500"
              />

              {/* +X More Photos Overlay */}
              {(property.images?.length || 0) > 3 ? (
                <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs flex flex-col items-center justify-center text-white transition-opacity group-hover/thumb:bg-slate-950/50">
                  <Images className="w-7 h-7 text-amber-400 mb-1" />
                  <span className="text-lg font-black tracking-tight">+{property.images.length - 2} More Photos</span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Click to Open Gallery</span>
                </div>
              ) : (
                <div className="absolute bottom-3 right-3 bg-slate-950/70 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                  <Images className="w-3.5 h-3.5 text-orange-400" />
                  <span>Gallery</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Main Details & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (Details & Specifications) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Title & Location Header */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-extrabold uppercase tracking-wider inline-block mb-2">
                    {property.type}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {property.title}
                  </h1>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 font-bold text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-2xl border border-amber-200 shrink-0 w-fit">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs">{property.rating} ({reviewsList.length || property.reviewsCount} Verified Reviews)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Write a Review</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>{property.location}, {property.city}</span>
              </div>
            </div>

            {/* About This Home Description */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Description
              </h3>
              {property.description?.trim() ? (
                <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                  {property.description}
                </p>
              ) : (
                <>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Welcome to {property.title}, a beautifully designed {property.bhk} rental home situated in the prime locality of {property.location}, {property.city}. Featuring abundant natural sunlight, high-grade flooring, modern electrical fixtures, and prompt maintenance services managed by RentAwas.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Ideal for working professionals and small families seeking zero-brokerage direct landlord renting. Walking distance to public transport, metro stations, tech hubs, supermarkets, and dining.
                  </p>
                </>
              )}
            </div>

            {/* Quick Overview Badges Grid */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Property Overview & Specs
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
                    <Bed className="w-4 h-4 text-[#FF6B00]" />
                    Bedrooms
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{property.bhk}</div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
                    <Maximize2 className="w-4 h-4 text-[#FF6B00]" />
                    Built-Up Area
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{property.size}</div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-[#FF6B00]" />
                    Furnishing
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">Semi-Furnished</div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    Availability
                  </div>
                  <div className="font-extrabold text-emerald-600 text-sm">Immediate Move-In</div>
                </div>
              </div>
            </div>

            {/* Pricing & Deposit Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Financial Breakdown & Fees
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-orange-50/50 border border-orange-200/60 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Rent</div>
                  <div className="text-xl font-black text-slate-900">{property.price}</div>
                  <div className="text-[11px] text-slate-500">Billed monthly</div>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security Deposit</div>
                  <div className="text-xl font-black text-emerald-700">
                    {property.deposit ? `₹${Number(property.deposit).toLocaleString("en-IN")}` : "₹0 Deposit"}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold">100% Refundable</div>
                </div>

                <div className="p-4 bg-purple-50/50 border border-purple-200/60 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brokerage Fee</div>
                  <div className="text-xl font-black text-purple-700">₹0 Fee</div>
                  <div className="text-[11px] text-purple-600 font-semibold">Direct Owner Listing</div>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Amenities & Facilities Included
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.tags.map((tag, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{tag}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>24/7 CCTV & Gated Security</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>High-Speed WiFi</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Covered Parking</span>
                </div>
              </div>
            </div>

            {/* Resident Ratings & Reviews Section */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Resident Ratings & Reviews ({reviewsList.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Verified feedback from current residents and past tenants.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer shrink-0 w-fit"
                >
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* 4 Category Score Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Overall Rating</div>
                  <div className="text-lg font-black text-slate-900 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>4.9 / 5</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Property Quality</div>
                  <div className="text-lg font-black text-slate-900">4.8 / 5</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Locality & Safety</div>
                  <div className="text-lg font-black text-slate-900">5.0 / 5</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Landlord Service</div>
                  <div className="text-lg font-black text-slate-900">4.9 / 5</div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 pt-2">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#0B132B] text-white font-extrabold text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{rev.author}</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                              {rev.status}
                            </span>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400">{rev.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-xl text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.overallRating}.0</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{rev.headline}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{rev.comment}</p>

                    {/* Review Tag Badges */}
                    {rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                            ✓ {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Sticky Landlord & Action Sidebar) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

            {/* Contact Owner Direct Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-xl shadow-slate-200/50">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Rent</div>
                <div className="text-3xl font-black text-slate-900">{property.price} <span className="text-xs font-semibold text-slate-500">/ mo</span></div>
                <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 pt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Zero Brokerage Listing</span>
                </div>
              </div>

              {/* Landlord Profile Box */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 text-[#FF6B00] font-extrabold text-sm flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{property.ownerName}</div>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E56000] active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contact Owner Direct</span>
              </button>

              {/* Secondary Share Button */}
              <button
                onClick={handleShare}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>{copiedLink ? "Link Copied!" : "Share Property"}</span>
              </button>

              {/* See All Reviews Section */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAllReviewsModalOpen(true)}
                  className="w-full py-3.5 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/90 text-amber-900 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer shadow-2xs"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  <span>See All Reviews ({reviewsList.length})</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Direct Owner Lead Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <div className="bg-[#0B132B] p-5 text-white relative">
              <button
                type="button"
                onClick={() => { setIsContactModalOpen(false); setLeadSubmitted(false); }}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Zero Brokerage Direct Lead
              </span>
              <h3 className="text-lg font-bold text-white line-clamp-1 pr-8">{property.title}</h3>
              <p className="text-xs text-slate-300">{property.ownerName} • {property.price}/mo</p>
            </div>

            {leadSubmitted ? (
              <div className="p-7 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">Owner Contact Unlocked!</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Thank you <strong>{leadName}</strong>. We have notified <strong>{property.ownerName}</strong> of your interest. You can reach the owner directly at <strong>{property.ownerPhone}</strong>!
                  </p>
                </div>
                <button
                  onClick={() => { setIsContactModalOpen(false); setLeadSubmitted(false); }}
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

      {/* Full-Screen Photo Lightbox Carousel Modal */}
      {isLightboxOpen && property.images && property.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 font-sans animate-in fade-in duration-200">

          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between text-white shrink-0 z-10 max-w-7xl mx-auto w-full">
            <div>
              <h3 className="text-sm font-extrabold text-white truncate max-w-xs sm:max-w-md">{property.title}</h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Photo {lightboxIndex + 1} of {property.images.length}
              </p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Main Stage Image */}
          <div className="relative flex-1 max-w-5xl w-full mx-auto my-4 flex items-center justify-center">
            <div className="relative w-full h-full max-h-[72vh] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={property.images[lightboxIndex]}
                alt={`${property.title} Photo ${lightboxIndex + 1}`}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {/* Previous Button */}
            <button
              onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer border border-white/20 shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={() => setLightboxIndex((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer border border-white/20 shadow-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Bottom Thumbnail Strip */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-2 shrink-0 max-w-3xl mx-auto w-full">
            {property.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all shrink-0 cursor-pointer border-2 ${lightboxIndex === idx ? "border-[#FF6B00] scale-105 shadow-md" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
              >
                <Image
                  src={imgUrl}
                  alt={`Thumb ${idx + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            ))}
          </div>

        </div>
      )}

      {/* Write a Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#0B132B] p-5 text-white relative shrink-0">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                Resident Review
              </span>
              <h3 className="text-lg font-bold text-white pr-8">Write a Review for {property.title}</h3>
              <p className="text-xs text-slate-300">Share your honest experience for future tenants</p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleReviewSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Reviewer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Rahul Raj"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Resident Status *
                  </label>
                  <select
                    value={residentStatus}
                    onChange={(e) => setResidentStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    <option value="Current Resident">Current Resident</option>
                    <option value="Verified Past Tenant">Verified Past Tenant</option>
                    <option value="Visited / Prospect">Visited / Prospect</option>
                  </select>
                </div>
              </div>

              {/* 4 Rating Category Star Selectors */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Rating Categories (1 - 5 Stars) *
                </label>

                <div className="space-y-2">
                  {/* Category 1: Overall */}
                  <div className="flex items-center justify-between p-2.5 bg-amber-50/50 border border-amber-200/80 rounded-xl">
                    <span className="text-xs font-extrabold text-amber-900">Overall Property Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setOverallRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star className={`w-4 h-4 ${star <= overallRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                      <span className="text-xs font-black text-slate-900 ml-1">{overallRating}.0</span>
                    </div>
                  </div>

                  {/* Category 2: Property Condition */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-xs font-bold text-slate-700">Property Quality & Construction</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setConditionRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star className={`w-4 h-4 ${star <= conditionRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                      <span className="text-xs font-black text-slate-900 ml-1">{conditionRating}.0</span>
                    </div>
                  </div>

                  {/* Category 3: Locality & Safety */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-xs font-bold text-slate-700">Locality, Transport & Safety</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setLocalityRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star className={`w-4 h-4 ${star <= localityRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                      <span className="text-xs font-black text-slate-900 ml-1">{localityRating}.0</span>
                    </div>
                  </div>

                  {/* Category 4: Landlord & Responsiveness */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-xs font-bold text-slate-700">Landlord Responsiveness</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setLandlordRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star className={`w-4 h-4 ${star <= landlordRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                      <span className="text-xs font-black text-slate-900 ml-1">{landlordRating}.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Headline */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  value={reviewHeadline}
                  onChange={(e) => setReviewHeadline(e.target.value)}
                  placeholder="e.g. Peaceful flat with super responsive landlord!"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Review Feedback Comment */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Experience & Feedback *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about locality, water/electricity, landlord behavior, or security..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Tag Selection Pills */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Highlight Key Pros & Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {REVIEW_TAG_OPTIONS.map((tag) => {
                    const isSelected = selectedReviewTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleReviewTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FF6B00] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
              >
                Submit Resident Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* See All Reviews Modal */}
      {isAllReviewsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#0B132B] p-5 text-white relative shrink-0 flex items-center justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  Verified Resident Reviews
                </span>
                <h3 className="text-lg font-bold text-white line-clamp-1">Ratings & Reviews ({reviewsList.length})</h3>
                <p className="text-xs text-slate-300">{property.title} • {property.location}</p>
              </div>

              <div className="flex items-center gap-2 mr-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsAllReviewsModalOpen(false);
                    setIsReviewModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Write Review</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsAllReviewsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Category Scores Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-1 text-center sm:text-left">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Overall Rating</div>
                  <div className="text-lg font-black text-slate-900 flex items-center justify-center sm:justify-start gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>4.9 / 5</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 text-center sm:text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Property Quality</div>
                  <div className="text-lg font-black text-slate-900">4.8 / 5</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 text-center sm:text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Locality & Safety</div>
                  <div className="text-lg font-black text-slate-900">5.0 / 5</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 text-center sm:text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Landlord Service</div>
                  <div className="text-lg font-black text-slate-900">4.9 / 5</div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
                {["All", "Current Resident", "Verified Past Tenant"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAllReviewsFilter(tab)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      allReviewsFilter === tab
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList
                  .filter((r) => allReviewsFilter === "All" || r.status === allReviewsFilter)
                  .map((rev) => (
                    <div key={rev.id} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#0B132B] text-white font-extrabold text-xs flex items-center justify-center">
                            {rev.author.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{rev.author}</span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                                {rev.status}
                              </span>
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400">{rev.date}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-xl text-xs font-black">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{rev.overallRating}.0</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{rev.headline}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{rev.comment}</p>

                      {/* Review Tag Badges */}
                      {rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {rev.tags.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                              ✓ {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                {reviewsList.filter((r) => allReviewsFilter === "All" || r.status === allReviewsFilter).length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                    No reviews found for filter "{allReviewsFilter}".
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Showing {reviewsList.length} resident reviews</span>
              <button
                onClick={() => setIsAllReviewsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Early Access Modal */}
      <EarlyAccessModal isOpen={isEarlyAccessOpen} onClose={() => setIsEarlyAccessOpen(false)} />
    </div>
  );
}
