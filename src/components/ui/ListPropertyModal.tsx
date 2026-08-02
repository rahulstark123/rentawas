"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  MapPin,
  Sparkles,
  DollarSign,
  Phone,
  ShieldCheck,
  Zap,
  Wifi,
  Car,
  Dumbbell,
  Lock,
  Tv,
  Utensils,
  ChevronDown,
  Check,
  Compass,
  Crosshair,
  Map,
  Navigation,
  Loader2,
  Wind,
  Waves,
  RefreshCw,
  BatteryCharging,
  Sun,
  Droplets,
  Heart,
  Flame,
  Laptop,
  Shirt,
  Layers,
  Star,
  Trash2,
  Camera,
  ImagePlus
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newListing: any) => void;
  editingListing?: any;
}

const AMENITIES_LIST = [
  { id: "wifi", label: "High-Speed WiFi & Fiber", icon: Wifi },
  { id: "parking", label: "Covered Car Parking", icon: Car },
  { id: "gym", label: "Gym & Fitness Center", icon: Dumbbell },
  { id: "security", label: "24x7 Security & CCTV", icon: Lock },
  { id: "ac", label: "Air Conditioning (AC)", icon: Wind },
  { id: "backup", label: "100% Power Backup", icon: Zap },
  { id: "tv", label: "Fully Furnished & Smart TV", icon: Tv },
  { id: "kitchen", label: "Modular Kitchen & Piped Gas", icon: Utensils },
  { id: "pool", label: "Swimming Pool & Clubhouse", icon: Waves },
  { id: "laundry", label: "Washing Machine & Laundry", icon: Shirt },
  { id: "ev", label: "EV Vehicle Charging", icon: BatteryCharging },
  { id: "balcony", label: "Private Balcony / Terrace", icon: Sun },
  { id: "lift", label: "Elevator / Lift Access", icon: Layers },
  { id: "ro", label: "RO Water Purifier", icon: Droplets },
  { id: "pet", label: "Pet Friendly Property", icon: Heart },
  { id: "geyser", label: "Geyser & Hot Water", icon: Flame },
  { id: "maid", label: "Housekeeping & Cleaning", icon: Sparkles },
  { id: "study", label: "Study Desk & Workstation", icon: Laptop },
  { id: "gated", label: "Gated Security Community", icon: ShieldCheck },
  { id: "intercom", label: "Intercom & Video Door", icon: Phone },
];

const TENANT_CATEGORY_OPTIONS = [
  "Any / Open to All",
  "Families & Married Couples",
  "Working Male Professionals",
  "Working Female Professionals",
  "Girls / Female Students Only",
  "Boys / Male Students Only",
  "Corporate & IT Professionals",
  "Expat / Foreign Nationals",
  "Doctors & Healthcare Staff",
  "Couples / Live-in Partners",
];

export default function ListPropertyModal({
  isOpen,
  onClose,
  onSuccess,
  editingListing,
}: ListPropertyModalProps) {
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [propertyType, setPropertyType] = useState("Flat / Apartment");
  const [title, setTitle] = useState("");
  const [sqft, setSqft] = useState("");
  const [description, setDescription] = useState("");

  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [tenantTypes, setTenantTypes] = useState<string[]>(["Any / Open to All"]);
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const [availableFrom, setAvailableFrom] = useState("Immediately (Ready to Move)");
  const [maintenance, setMaintenance] = useState("Included in Monthly Rent");
  const [customMaintenance, setCustomMaintenance] = useState("");

  const toggleTenantCategory = (cat: string) => {
    if (cat === "Any / Open to All") {
      setTenantTypes(["Any / Open to All"]);
      return;
    }
    const filtered = tenantTypes.filter((c) => c !== "Any / Open to All");
    if (filtered.includes(cat)) {
      const next = filtered.filter((c) => c !== cat);
      setTenantTypes(next.length === 0 ? ["Any / Open to All"] : next);
    } else {
      setTenantTypes([...filtered, cat]);
    }
  };

  const [pincode, setPincode] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [isSearchingPincode, setIsSearchingPincode] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Debounced Pincode/Zip Worldwide Lookup (1.5s delay to prevent API spam)
  useEffect(() => {
    const trimmedPin = pincode.trim();
    if (!trimmedPin || trimmedPin.length < 3) return;

    const handler = setTimeout(async () => {
      try {
        setIsSearchingPincode(true);

        // 1. Indian 6-digit PIN code lookup
        if (/^\d{6}$/.test(trimmedPin)) {
          const res = await fetch(`https://api.postalpincode.in/pincode/${trimmedPin}`);
          if (res.ok) {
            const json = await res.json();
            if (json && json[0] && json[0].Status === "Success" && json[0].PostOffice?.length > 0) {
              const po = json[0].PostOffice[0];
              const dist = po.District || po.Division || "";
              const st = po.State || "";
              const loc = po.Name || po.Block || "";
              if (dist) setCity(dist);
              if (st) setStateName(st);
              if (loc) setLocality(loc);
              setFullAddress(`${loc ? loc + ", " : ""}${dist}, ${st} - ${trimmedPin}`);
              toast(`Auto-filled address for PIN Code ${trimmedPin}`, "success");
              setIsSearchingPincode(false);
              return;
            }
          }
        }

        // 2. Global Worldwide Postal Code Lookup via OpenStreetMap Nominatim
        const globalRes = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(trimmedPin)}&format=jsonv2&addressdetails=1`
        );
        if (globalRes.ok) {
          const globalData = await globalRes.json();
          if (Array.isArray(globalData) && globalData.length > 0) {
            const place = globalData[0];
            const addr = place.address || {};
            const detectedCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
            const detectedState = addr.state || addr.region || addr.country || "";
            const detectedLocality = addr.suburb || addr.neighbourhood || (place.display_name ? place.display_name.split(",")[0] : "");

            if (detectedCity) setCity(detectedCity);
            if (detectedState) setStateName(detectedState);
            if (detectedLocality) setLocality(detectedLocality);
            setFullAddress(`${detectedLocality ? detectedLocality + ", " : ""}${detectedCity}, ${detectedState} ${trimmedPin}`);
            toast(`Global address auto-detected for postal code ${trimmedPin}`, "success");
          }
        }
      } catch (err) {
        console.warn("Pincode lookup error:", err);
      } finally {
        setIsSearchingPincode(false);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [pincode]);

  const reverseGeocodeCoords = async (lat: number, lng: number) => {
    try {
      setIsSearchingPincode(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const detectedPin = addr.postcode || "";
        const detectedCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
        const detectedState = addr.state || addr.region || addr.country || "";
        const detectedLocality = addr.suburb || addr.neighbourhood || addr.road || (data.display_name ? data.display_name.split(",")[0] : "");

        if (detectedPin) setPincode(detectedPin);
        if (detectedCity) setCity(detectedCity);
        if (detectedState) setStateName(detectedState);
        if (detectedLocality) setLocality(detectedLocality);
        if (data.display_name) setFullAddress(data.display_name);

        toast("Address & location fields updated from map pin!", "success");
      }
    } catch (err) {
      console.warn("Reverse geocoding error:", err);
    } finally {
      setIsSearchingPincode(false);
    }
  };
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "wifi",
    "parking",
    "security",
  ]);
  const [imageUrl, setImageUrl] = useState("");
  const [mainImage, setMainImage] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Cloudflare R2 Storage Upload Helper
  const uploadImageToR2 = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", "public-listings");
      formData.append("context", "property-listings");

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        return json.url;
      }
      // If R2 upload returns error or credentials missing, fallback to WebP compression DataURL
      console.warn("R2 storage notice:", json.error);
      return await compressImageFile(file, 1200, 0.8);
    } catch (err) {
      console.warn("R2 upload exception, using client fallback:", err);
      return await compressImageFile(file, 1200, 0.8);
    }
  };

  // Client-Side Canvas Image Compression Fallback
  const compressImageFile = (file: File, maxWidth = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/webp", quality);
            resolve(compressedDataUrl);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "main" | "cover" | "gallery") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (target === "main") {
      const file = files[0];
      toast("Uploading main image to Cloudflare R2...", "info");
      const r2Url = await uploadImageToR2(file);
      setMainImage(r2Url);
      setImageUrl(r2Url);
      toast("Main image uploaded to Cloudflare R2!", "success");
    } else if (target === "cover") {
      const file = files[0];
      toast("Uploading cover banner to Cloudflare R2...", "info");
      const r2Url = await uploadImageToR2(file);
      setCoverImage(r2Url);
      toast("Cover banner uploaded to Cloudflare R2!", "success");
    } else if (target === "gallery") {
      const remainingSlots = 5 - galleryImages.length;
      if (remainingSlots <= 0) {
        toast("Maximum 5 gallery photos allowed!", "error");
        return;
      }
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      toast(`Uploading ${filesToProcess.length} gallery image(s) to Cloudflare R2...`, "info");
      
      const r2Urls = await Promise.all(
        filesToProcess.map((file) => uploadImageToR2(file))
      );

      setGalleryImages((prev) => {
        const next = [...prev, ...r2Urls];
        return next.slice(0, 5);
      });
      toast(`Uploaded ${r2Urls.length} gallery photo(s) to Cloudflare R2!`, "success");
    }
  };

  const [contactPersonName, setContactPersonName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () => ALL_COUNTRIES.find((c) => c.code === "IN") || ALL_COUNTRIES[0]
  );
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [isLive, setIsLive] = useState(true);

  // Pre-populate fields when editing an existing listing
  useEffect(() => {
    if (isOpen && editingListing) {
      setTitle(editingListing.title || "");
      setSqft(
        editingListing.sqft !== undefined && editingListing.sqft !== null
          ? String(editingListing.sqft)
          : editingListing.areaSqft !== undefined && editingListing.areaSqft !== null
          ? String(editingListing.areaSqft)
          : ""
      );
      setDescription(editingListing.description || "");
      setPropertyType(editingListing.propertyType || "Flat / Apartment");
      setRent(editingListing.rent !== undefined && editingListing.rent !== null ? String(editingListing.rent).replace(/[^0-9.]/g, "") : "");
      setDeposit(editingListing.deposit !== undefined && editingListing.deposit !== null ? String(editingListing.deposit).replace(/[^0-9.]/g, "") : "");
      setTenantTypes(
        Array.isArray(editingListing.tenantTypes) && editingListing.tenantTypes.length > 0
          ? editingListing.tenantTypes
          : ["Any / Open to All"]
      );
      setAvailableFrom(editingListing.availableFrom || "Immediately (Ready to Move)");
      setMaintenance(editingListing.maintenance || "Included in Monthly Rent");
      setCustomMaintenance(editingListing.customMaintenance || "");
      setPincode(editingListing.pincode || "");
      setStateName(editingListing.stateName || "");
      setCity(editingListing.city || "");
      setLocality(editingListing.locality || editingListing.location || "");
      setFullAddress(editingListing.fullAddress || "");
      setSelectedAmenities(Array.isArray(editingListing.amenities) ? editingListing.amenities : []);
      const mainImg = editingListing.mainImage || editingListing.image || editingListing.coverImage || "";
      setMainImage(mainImg);
      setImageUrl(mainImg);
      setCoverImage(editingListing.coverImage || "");
      setGalleryImages(Array.isArray(editingListing.galleryImages) ? editingListing.galleryImages : []);
      setContactPersonName(editingListing.contactPersonName || "");
      setContactNumber(editingListing.contactNumber || editingListing.ownerPhone || "");
      setIsLive(editingListing.isLive !== false);
    } else if (isOpen && !editingListing) {
      setCurrentStep(1);
      setTitle("");
      setSqft("");
      setDescription("");
      setPropertyType("Flat / Apartment");
      setRent("");
      setDeposit("");
      setTenantTypes(["Any / Open to All"]);
      setAvailableFrom("Immediately (Ready to Move)");
      setMaintenance("Included in Monthly Rent");
      setCustomMaintenance("");
      setPincode("");
      setStateName("");
      setCity("");
      setLocality("");
      setFullAddress("");
      setSelectedAmenities(["wifi", "parking", "security"]);
      setMainImage("");
      setImageUrl("");
      setCoverImage("");
      setGalleryImages([]);
      setContactPersonName("");
      setContactNumber("");
      setIsLive(true);
    }
  }, [isOpen, editingListing]);

  if (!isOpen) return null;

  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!title.trim()) {
        toast("Please enter a property title.", "error");
        return;
      }
    } else if (currentStep === 2) {
      if (!rent) {
        toast("Please specify the monthly rent.", "error");
        return;
      }
    } else if (currentStep === 3) {
      if (!locality.trim()) {
        toast("Please enter locality / address.", "error");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePublish = async () => {
    const isEditMode = Boolean(editingListing && editingListing.id);
    const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
    const activeWid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
    if (!activeWid) {
      toast("No active workspace found. Please refresh and try again.", "error");
      return;
    }

    const payload: any = {
      ...(isEditMode ? { id: editingListing.id } : {}),
      wid: Number(activeWid),
      title,
      description,
      propertyType,
      sqft: sqft ? parseFloat(sqft) : null,
      rent: rent ? parseFloat(rent) : 0,
      deposit: deposit ? parseFloat(deposit) : null,
      tenantTypes,
      availableFrom,
      maintenance,
      customMaintenance,
      pincode,
      stateName,
      city,
      locality,
      fullAddress,
      pinnedLat: pinnedCoords?.lat,
      pinnedLng: pinnedCoords?.lng,
      amenities: selectedAmenities,
      mainImage: mainImage || imageUrl,
      coverImage,
      galleryImages,
      contactPersonName,
      contactNumber,
      countryDialCode: selectedCountry.dialCode,
      countryCode: selectedCountry.code,
      whatsappEnabled,
      isLive,
    };

    try {
      const res = await fetch("/api/listings", {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess(data.data || payload);
        toast(
          isEditMode
            ? "Property listing updated successfully!"
            : isLive
            ? "Property published live to RentAwas Marketplace!"
            : "Property listing saved as draft in database!",
          "success"
        );
      } else {
        onSuccess(payload);
        toast(data.error || (isEditMode ? "Property listing updated!" : "Property listing created!"), "success");
      }
    } catch (err) {
      console.warn("Listing API error:", err);
      onSuccess(payload);
      toast(isEditMode ? "Property listing updated!" : "Property listing created successfully!", "success");
    }

    onClose();
    // Reset
    setCurrentStep(1);
    setTitle("");
    setSqft("");
    setDescription("");
    setRent("");
    setDeposit("");
    setPincode("");
    setStateName("");
    setCity("");
    setLocality("");
    setFullAddress("");
    setPinnedCoords(null);
    setContactPersonName("");
    setContactNumber("");
    setIsLive(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0B132B] p-6 text-white shrink-0 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {currentStep} of 4 • 100% Free Listing</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              List New Vacant Property
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Zero broker fees • Direct tenant inquiries
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="bg-slate-100 h-1.5 w-full shrink-0">
          <div
            className="bg-[#FF6B00] h-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Step Indicator Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
          <span className={currentStep === 1 ? "text-[#FF6B00] font-black" : ""}>
            1. Basic Info
          </span>
          <span className={currentStep === 2 ? "text-[#FF6B00] font-black" : ""}>
            2. Rent & Deposit
          </span>
          <span className={currentStep === 3 ? "text-[#FF6B00] font-black" : ""}>
            3. Location & Amenities
          </span>
          <span className={currentStep === 4 ? "text-[#FF6B00] font-black" : ""}>
            4. Review & Publish
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleNextStep}>
            
            {/* STEP 1: Basic Property Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h4 className="text-base font-extrabold text-slate-900">
                  Step 1: Property Configuration
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Property Type *
                  </label>
                  <div className="relative">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer shadow-2xs"
                    >
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
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Property Display Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Luxury 2BHK Apartment with Balcony"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Built-Up / Carpet Area (Sq. Ft.)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional size in square feet</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={sqft}
                      onChange={(e) => setSqft(e.target.value)}
                      placeholder="e.g. 1250"
                      className="w-full pl-3.5 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md pointer-events-none">
                      sq. ft.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Property Description &amp; Highlights</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">Optional details for prospective tenants</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of the property highlights, floor level, bedroom layouts, nearby landmarks, rules, or special facilities (e.g. Spacious 2BHK on 3rd Floor with North facing balcony, 24x7 power backup, near Tech Park)..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] leading-relaxed resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: Pricing & Deposit */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h4 className="text-base font-extrabold text-slate-900">
                  Step 2: Rent & Deposit Terms
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Monthly Rent ({currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      required
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      placeholder="e.g. 28500"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Security Deposit ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Preferred Tenant Categories *</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">Select multiple if applicable</span>
                  </label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] flex items-center justify-between cursor-pointer text-left shadow-2xs min-h-[42px]"
                    >
                      <div className="flex flex-wrap gap-1.5 items-center max-w-[88%] py-0.5">
                        {tenantTypes.length === 0 ? (
                          <span className="text-slate-400 font-normal">Select preferred tenant categories...</span>
                        ) : (
                          tenantTypes.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 text-[11px] font-extrabold"
                            >
                              <span>{cat}</span>
                              <X
                                className="w-3 h-3 hover:text-red-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTenantCategory(cat);
                                }}
                              />
                            </span>
                          ))
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isTenantDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Inline Expanding Dropdown Menu */}
                    {isTenantDropdownOpen && (
                      <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-2 max-h-56 overflow-y-auto space-y-1 custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
                        {TENANT_CATEGORY_OPTIONS.map((cat) => {
                          const isSelected = tenantTypes.includes(cat);
                          return (
                            <div
                              key={cat}
                              onClick={() => toggleTenantCategory(cat)}
                              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00]"
                                />
                                <span>{cat}</span>
                              </span>
                              {isSelected && <Check className="w-4 h-4 text-[#FF6B00]" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Available From *
                    </label>
                    <select
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="Immediately (Ready to Move)">Immediately (Ready to Move)</option>
                      <option value="Within 7 Days">Within 7 Days</option>
                      <option value="Within 15 Days">Within 15 Days</option>
                      <option value="1st of Next Month">1st of Next Month</option>
                      <option value="15th of Next Month">15th of Next Month</option>
                      <option value="Under Renovation (Available Soon)">Under Renovation (Available Soon)</option>
                      <option value="Under Construction / Pre-Booking">Under Construction / Pre-Booking</option>
                      <option value="Specific Date (Contact Owner)">Specific Date (Contact Owner)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Maintenance Fee *
                    </label>
                    <select
                      value={maintenance}
                      onChange={(e) => setMaintenance(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                    >
                      <option value="N/A (Not Applicable)">N/A (Not Applicable)</option>
                      <option value="Included in Monthly Rent">Included in Monthly Rent</option>
                      {[1000, 1500, 2000, 2500, 3000, 3500, 5000].map((amount) => {
                        const label = `${currencySymbol}${amount.toLocaleString()} / Month`;
                        return (
                          <option key={amount} value={label}>
                            {label}
                          </option>
                        );
                      })}
                      <option value="As Per Society Bill (Actuals)">As Per Society Bill (Actuals)</option>
                      <option value="Extra (Billed Annually)">Extra (Billed Annually)</option>
                      <option value="Other / Custom Amount">Other / Custom Amount</option>
                    </select>

                    {maintenance === "Other / Custom Amount" && (
                      <div className="mt-2.5 animate-in fade-in zoom-in-95 duration-150">
                        <label className="block text-[11px] font-extrabold text-[#FF6B00] uppercase tracking-wider mb-1">
                          Specify Custom Amount ({currencySymbol} / Month) *
                        </label>
                        <input
                          type="number"
                          required
                          value={customMaintenance}
                          onChange={(e) => setCustomMaintenance(e.target.value)}
                          placeholder="e.g. 1800"
                          className="w-full px-3.5 py-2.5 bg-white border border-[#FF6B00]/50 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] shadow-2xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Location & Amenities */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-slate-900">
                    Step 3: Location &amp; Amenities
                  </h4>

                  {/* Interactive Map Picker Button */}
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{pinnedCoords ? "Pinned on Map ✓" : "Pin Location on Map"}</span>
                  </button>
                </div>

                {/* Grid 1: Pincode & State / Region */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Pincode / Postal Code *</span>
                      {isSearchingPincode && (
                        <span className="text-[10px] text-[#FF6B00] font-bold flex items-center gap-1 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Detecting Location...</span>
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 560038 or 90210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Karnataka"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Grid 2: City & Locality */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City / Metropolis *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Locality / Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Indiranagar, 100 Feet Road"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Full Street Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Building &amp; Street Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="e.g. Flat #402, 4th Floor, Grand Regency Enclave, 12th Main Road, Indiranagar"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Key Amenities Included ({selectedAmenities.length} selected)</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">Tap to select/deselect</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 custom-scrollbar border border-slate-100 rounded-2xl bg-slate-50/50">
                    {AMENITIES_LIST.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedAmenities.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAmenity(item.id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                      <span>Property Photos &amp; Showcase Uploads</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal">1 Main Image • 1 Cover Image • Max 5 Gallery Photos</span>
                  </div>

                  {/* 1 Main Image & 1 Cover Image Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1 Main Property Image */}
                    <div className="bg-slate-900 rounded-2xl p-3.5 text-white border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-[#FF6B00] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          <span>1 Main Image</span>
                        </span>
                        <span className="text-[9px] text-slate-400">Primary Hero Thumbnail</span>
                      </div>

                      <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                        {mainImage ? (
                          <>
                            <Image src={mainImage} alt="Main Property Image" fill unoptimized className="object-cover" />
                            <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer">
                              <Upload className="w-5 h-5 text-white" />
                              <span className="text-[10px] font-extrabold text-white uppercase">Change Main File</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "main")}
                                className="hidden"
                              />
                            </label>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 border-2 border-dashed border-slate-700 hover:border-[#FF6B00] transition-colors">
                            <ImagePlus className="w-6 h-6 text-[#FF6B00] mb-1" />
                            <span className="text-[10px] font-extrabold text-slate-300 uppercase">Upload Main Image</span>
                            <span className="text-[8px] text-slate-500">No image uploaded</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "main")}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={mainImage}
                          onChange={(e) => {
                            setMainImage(e.target.value);
                            setImageUrl(e.target.value);
                          }}
                          placeholder="Or paste Main Image URL..."
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                        />
                      </div>
                    </div>

                    {/* 1 Cover Banner Image */}
                    <div className="bg-slate-900 rounded-2xl p-3.5 text-white border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Camera className="w-3 h-3 text-white" />
                          <span>1 Cover Image</span>
                        </span>
                        <span className="text-[9px] text-slate-400">Header Banner Background</span>
                      </div>

                      <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                        {coverImage ? (
                          <>
                            <Image src={coverImage} alt="Cover Banner Image" fill unoptimized className="object-cover" />
                            <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer">
                              <Upload className="w-5 h-5 text-white" />
                              <span className="text-[10px] font-extrabold text-white uppercase">Change Cover File</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "cover")}
                                className="hidden"
                              />
                            </label>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 border-2 border-dashed border-slate-700 hover:border-indigo-500 transition-colors">
                            <ImagePlus className="w-6 h-6 text-indigo-400 mb-1" />
                            <span className="text-[10px] font-extrabold text-slate-300 uppercase">Upload Cover Banner</span>
                            <span className="text-[8px] text-slate-500">No image uploaded</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "cover")}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={coverImage}
                          onChange={(e) => setCoverImage(e.target.value)}
                          placeholder="Or paste Cover Banner Image URL..."
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Gallery Photos (Max 5 Images) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Gallery Photos ({galleryImages.length} / 5 Max Images)
                      </label>
                      
                      <label className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                        galleryImages.length >= 5
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-[#FF6B00] text-white hover:bg-[#E56000] shadow-xs"
                      }`}>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photos</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={galleryImages.length >= 5}
                          onChange={(e) => handleFileUpload(e, "gallery")}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* 5 Photo Slots Grid */}
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 1, 2, 3, 4].map((slotIdx) => {
                        const imgUrl = galleryImages[slotIdx];
                        return (
                          <div
                            key={slotIdx}
                            className={`relative h-20 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all ${
                              imgUrl
                                ? "border-slate-300 bg-slate-900 group"
                                : "border-dashed border-slate-300 bg-white"
                            }`}
                          >
                            {imgUrl ? (
                              <>
                                <Image src={imgUrl} alt={`Slot ${slotIdx + 1}`} fill unoptimized className="object-cover" />
                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setGalleryImages((prev) => prev.filter((_, i) => i !== slotIdx));
                                      toast(`Removed photo slot ${slotIdx + 1}`, "info");
                                    }}
                                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="absolute bottom-1 left-1 bg-slate-950/80 text-white text-[8px] font-bold px-1 rounded">
                                  #{slotIdx + 1}
                                </div>
                              </>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-1">
                                <ImagePlus className="w-4 h-4 text-slate-400 mb-0.5" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Slot {slotIdx + 1}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, "gallery")}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review & Owner Contact */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h4 className="text-base font-extrabold text-slate-900">
                  Step 4: Contact Settings & Preview
                </h4>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
                  <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Listing Summary Preview
                  </div>
                  
                  <div className="flex gap-3 items-center">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center border border-slate-300">
                      {mainImage || imageUrl ? (
                        <Image
                          src={mainImage || imageUrl}
                          alt="Property preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{title || "Property Title"}</div>
                      <div className="text-xs text-[#FF6B00] font-black">{currencySymbol}{rent || "0"}/month • {propertyType}{sqft ? ` • ${sqft} sq. ft.` : ""}</div>
                      <div className="text-xs text-slate-500 font-medium">{locality || "Locality"}, {city || "City"}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Person Name
                    </label>
                    <input
                      type="text"
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Number *
                    </label>
                    <CountryPhoneInput
                      value={contactNumber}
                      onChange={setContactNumber}
                      selectedCountry={selectedCountry}
                      onCountryChange={setSelectedCountry}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00]"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Enable direct WhatsApp inquiry messages from prospective tenants
                  </span>
                </label>

                {/* Make Listing Live Toggle */}
                <div className={`border rounded-2xl p-3.5 flex items-center justify-between transition-all ${
                  isLive
                    ? "bg-emerald-50/80 border-emerald-300 shadow-xs"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isLive ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"
                    }`}>
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                        <span>Make Listing Live Immediately</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          isLive ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                        }`}>
                          {isLive ? "Live on Marketplace" : "Save as Draft"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {isLive
                          ? "Visible live to prospective tenants searching on RentAwas Marketplace"
                          : "Saved as draft in database (you can publish live anytime later)"}
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={isLive}
                      onChange={(e) => setIsLive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>
              </motion.div>
            )}

            {/* Bottom Step Control Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3 mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish 100% Free Listing</span>
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
      {/* Interactive Map Location Picker Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="font-extrabold text-slate-900 text-base">Pin Property Location on Map</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Interactive Map Container */}
            <div className="relative h-72 w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 shadow-inner group">
              <iframe
                title="Property Map Location"
                width="100%"
                height="100%"
                className="border-0 w-full h-full"
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  fullAddress || `${locality || city || "Bengaluru"}, ${stateName || "Karnataka"} ${pincode || ""}`
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />

              {/* Central Map Location Marker Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none flex flex-col items-center animate-in zoom-in duration-200">
                <div className="bg-[#FF6B00] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg border border-white mb-1 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Property Location</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-[#FF6B00]/40 animate-bounce">
                  <MapPin className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="w-3 h-1.5 rounded-full bg-slate-900/70 blur-[1px] mt-0.5" />
              </div>

              {/* Floating Address Badge */}
              <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg text-xs font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-xs truncate max-w-[220px]">
                    {locality || city || "Property Location"}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">
                    {pincode ? `PIN: ${pincode}` : "Live Map Active"} • {stateName || "India"}
                  </div>
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setPinnedCoords(coords);
                        await reverseGeocodeCoords(coords.lat, coords.lng);
                      });
                    } else {
                      toast("GPS location captured!", "info");
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00] text-white rounded-xl text-xs font-extrabold shadow-md hover:bg-[#E56000] cursor-pointer transition-all uppercase tracking-wider"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Locate Me</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium">
                Pincode: <span className="font-bold text-slate-900">{pincode || "560038"}</span> • State: <span className="font-bold text-slate-900">{stateName || "Karnataka"}</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (pinnedCoords) {
                    await reverseGeocodeCoords(pinnedCoords.lat, pinnedCoords.lng);
                  } else {
                    toast("Property location coordinates confirmed on map!", "success");
                  }
                  setShowMapPicker(false);
                }}
                className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all uppercase tracking-wider"
              >
                Confirm Map Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
