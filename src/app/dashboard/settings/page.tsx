"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Building2, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  Save, 
  Plus, 
  DollarSign, 
  Check, 
  Trash2,
  ChevronDown,
  Blocks,
  Zap,
  Search,
  ExternalLink,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Globe,
  Sparkles,
  Sliders,
  Puzzle,
  ArrowRight,
  FileText,
  PhoneCall,
  FileCheck,
  Eye,
  EyeOff,
  Copy,
  X,
  Lock,
  Edit3,
  UserX,
  Mail
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import CountryPhoneInput, { ALL_COUNTRIES, Country } from "@/components/ui/CountryPhoneInput";

export const ALL_CURRENCIES = [
  { code: "USD", symbol: "$", name: "USD ($) — United States Dollar" },
  { code: "INR", symbol: "₹", name: "INR (₹) — Indian Rupee" },
  { code: "EUR", symbol: "€", name: "EUR (€) — Eurozone Euro" },
  { code: "GBP", symbol: "£", name: "GBP (£) — British Pound" },
  { code: "AED", symbol: "AED", name: "AED (AED) — UAE Dirham" },
  { code: "CAD", symbol: "$", name: "CAD ($) — Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "AUD ($) — Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "JPY (¥) — Japanese Yen" },
  { code: "CHF", symbol: "CHF", name: "CHF (CHF) — Swiss Franc" },
  { code: "SGD", symbol: "$", name: "SGD ($) — Singapore Dollar" },
  { code: "HKD", symbol: "$", name: "HKD ($) — Hong Kong Dollar" },
  { code: "NZD", symbol: "$", name: "NZD ($) — New Zealand Dollar" },
  { code: "SAR", symbol: "SAR", name: "SAR (SAR) — Saudi Riyal" },
  { code: "QAR", symbol: "QAR", name: "QAR (QAR) — Qatari Riyal" },
  { code: "KWD", symbol: "KWD", name: "KWD (KWD) — Kuwaiti Dinar" },
  { code: "BHD", symbol: "BHD", name: "BHD (BHD) — Bahraini Dinar" },
  { code: "OMR", symbol: "OMR", name: "OMR (OMR) — Omani Rial" },
  { code: "CNY", symbol: "¥", name: "CNY (¥) — Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "KRW (₩) — South Korean Won" },
  { code: "MYR", symbol: "RM", name: "MYR (RM) — Malaysian Ringgit" },
  { code: "THB", symbol: "฿", name: "THB (฿) — Thai Baht" },
  { code: "IDR", symbol: "Rp", name: "IDR (Rp) — Indonesian Rupiah" },
  { code: "PHP", symbol: "₱", name: "PHP (₱) — Philippine Peso" },
  { code: "VND", symbol: "₫", name: "VND (₫) — Vietnamese Dong" },
  { code: "BDT", symbol: "৳", name: "BDT (৳) — Bangladeshi Taka" },
  { code: "PKR", symbol: "₨", name: "PKR (₨) — Pakistani Rupee" },
  { code: "LKR", symbol: "Rs", name: "LKR (Rs) — Sri Lankan Rupee" },
  { code: "NPR", symbol: "Rs", name: "NPR (Rs) — Nepalese Rupee" },
  { code: "ZAR", symbol: "R", name: "ZAR (R) — South African Rand" },
  { code: "NGN", symbol: "₦", name: "NGN (₦) — Nigerian Naira" },
  { code: "KES", symbol: "KSh", name: "KES (KSh) — Kenyan Shilling" },
  { code: "EGP", symbol: "EGP", name: "EGP (EGP) — Egyptian Pound" },
  { code: "MXN", symbol: "$", name: "MXN ($) — Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "BRL (R$) — Brazilian Real" },
  { code: "ARS", symbol: "$", name: "ARS ($) — Argentine Peso" },
  { code: "CLP", symbol: "$", name: "CLP ($) — Chilean Peso" },
  { code: "COP", symbol: "$", name: "COP ($) — Colombian Peso" },
  { code: "PEN", symbol: "S/", name: "PEN (S/) — Peruvian Sol" },
  { code: "RUB", symbol: "₽", name: "RUB (₽) — Russian Ruble" },
  { code: "TRY", symbol: "₺", name: "TRY (₺) — Turkish Lira" },
  { code: "PLN", symbol: "zł", name: "PLN (zł) — Polish Zloty" },
  { code: "SEK", symbol: "kr", name: "SEK (kr) — Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "NOK (kr) — Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "DKK (kr) — Danish Krone" },
  { code: "HUF", symbol: "Ft", name: "HUF (Ft) — Hungarian Forint" },
  { code: "CZK", symbol: "Kč", name: "CZK (Kč) — Czech Koruna" },
  { code: "ILS", symbol: "₪", name: "ILS (₪) — Israeli New Shekel" },
  { code: "JOD", symbol: "JOD", name: "JOD (JOD) — Jordanian Dinar" },
  { code: "LBP", symbol: "LBP", name: "LBP (LBP) — Lebanese Pound" },
  { code: "IQD", symbol: "IQD", name: "IQD (IQD) — Iraqi Dinar" },
  { code: "TWD", symbol: "NT$", name: "TWD (NT$) — New Taiwan Dollar" },
  { code: "MAD", symbol: "MAD", name: "MAD (MAD) — Moroccan Dirham" },
  { code: "GHS", symbol: "GH₵", name: "GHS (GH₵) — Ghanaian Cedi" },
  { code: "MUR", symbol: "Rs", name: "MUR (Rs) — Mauritian Rupee" },
];

export const ALL_TIMEZONES = [
  { code: "UTC-12:00", name: "(UTC-12:00) International Date Line West" },
  { code: "UTC-11:00", name: "(UTC-11:00) Midway Island, Samoa" },
  { code: "UTC-10:00", name: "(UTC-10:00) Hawaii-Aleutian Standard Time" },
  { code: "UTC-09:30", name: "(UTC-09:30) Marquesas Islands" },
  { code: "UTC-09:00", name: "(UTC-09:00) Alaska Standard Time" },
  { code: "UTC-08:00", name: "(UTC-08:00) Pacific Time (US & Canada)" },
  { code: "UTC-07:00", name: "(UTC-07:00) Mountain Time (US & Canada)" },
  { code: "UTC-06:00", name: "(UTC-06:00) Central Time (US & Canada), Mexico City" },
  { code: "UTC-05:00", name: "(UTC-05:00) Eastern Time (US & Canada), Bogota, Lima" },
  { code: "UTC-04:00", name: "(UTC-04:00) Atlantic Time (Canada), Caracas, Santiago" },
  { code: "UTC-03:30", name: "(UTC-03:30) Newfoundland Standard Time" },
  { code: "UTC-03:00", name: "(UTC-03:00) Brasilia, Buenos Aires, Montevideo" },
  { code: "UTC-02:00", name: "(UTC-02:00) Mid-Atlantic, South Georgia" },
  { code: "UTC-01:00", name: "(UTC-01:00) Azores, Cape Verde Islands" },
  { code: "UTC+00:00", name: "(UTC+00:00) Greenwich Mean Time (London, Dublin, Lisbon, Casablanca)" },
  { code: "UTC+01:00", name: "(UTC+01:00) Central European Time (Paris, Berlin, Rome, Madrid, Amsterdam)" },
  { code: "UTC+02:00", name: "(UTC+02:00) Eastern European Time (Athens, Cairo, Helsinki, Johannesburg)" },
  { code: "UTC+03:00", name: "(UTC+03:00) Moscow, Riyadh, Kuwait, Nairobi, Istanbul" },
  { code: "UTC+03:30", name: "(UTC+03:30) Tehran Standard Time" },
  { code: "UTC+04:00", name: "(UTC+04:00) Gulf Standard Time (Dubai, Abu Dhabi, Muscat, Baku)" },
  { code: "UTC+04:30", name: "(UTC+04:30) Kabul Standard Time" },
  { code: "UTC+05:00", name: "(UTC+05:00) Pakistan Standard Time (Karachi, Tashkent, Yekaterinburg)" },
  { code: "UTC+05:30", name: "(UTC+05:30) Indian Standard Time (New Delhi, Mumbai, Bengaluru, Kolkata)" },
  { code: "UTC+05:45", name: "(UTC+05:45) Nepal Time (Kathmandu)" },
  { code: "UTC+06:00", name: "(UTC+06:00) Bangladesh Standard Time (Dhaka, Almaty, Astana)" },
  { code: "UTC+06:30", name: "(UTC+06:30) Myanmar Time (Yangon, Cocos Islands)" },
  { code: "UTC+07:00", name: "(UTC+07:00) Indochina Time (Bangkok, Jakarta, Hanoi, Phnom Penh)" },
  { code: "UTC+08:00", name: "(UTC+08:00) China Standard Time (Beijing, Singapore, Hong Kong, Perth, Taipei)" },
  { code: "UTC+08:45", name: "(UTC+08:45) Eucla Australia Standard Time" },
  { code: "UTC+09:00", name: "(UTC+09:00) Japan Standard Time (Tokyo, Seoul, Osaka, Pyongyang)" },
  { code: "UTC+09:30", name: "(UTC+09:30) Australian Central Standard Time (Darwin, Adelaide)" },
  { code: "UTC+10:00", name: "(UTC+10:00) Australian Eastern Standard Time (Sydney, Melbourne, Brisbane)" },
  { code: "UTC+10:30", name: "(UTC+10:30) Lord Howe Island" },
  { code: "UTC+11:00", name: "(UTC+11:00) Solomon Islands, New Caledonia, Vladivostok" },
  { code: "UTC+12:00", name: "(UTC+12:00) New Zealand Standard Time (Auckland, Fiji, Kamchatka)" },
  { code: "UTC+12:45", name: "(UTC+12:45) Chatham Islands" },
  { code: "UTC+13:00", name: "(UTC+13:00) Tonga, Tokelau, Phoenix Islands" },
  { code: "UTC+14:00", name: "(UTC+14:00) Line Islands (Kiribati)" },
];

export default function WorkspaceSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "integrations" | "team" | "delete_account">("general");

  // General Settings State
  const [orgName, setOrgName] = useState("Grand Regency Management LLC");
  const [companyType, setCompanyType] = useState("LLC (Limited Liability Company)");
  const [taxId, setTaxId] = useState("EIN 92-8491029 / GSTIN 27AAACR1234F1Z9");
  const [registeredAddress, setRegisteredAddress] = useState("1420 5th Ave, Suite 3000, Seattle, WA 98101");
  const [landlordName, setLandlordName] = useState("Alexander Wright");
  const [landlordRole, setLandlordRole] = useState("Managing Director & Asset Owner");
  const [currency, setCurrency] = useState("USD ($)");
  const [jurisdiction, setJurisdiction] = useState("Seattle, WA (USA)");
  const [pincode, setPincode] = useState("98101");
  const [companyEmail, setCompanyEmail] = useState("support@regencymanagement.com");
  const [companyPhone, setCompanyPhone] = useState("+1 (555) 019-2834");
  const [customSubdomain, setCustomSubdomain] = useState("regency.rentawas.com");
  const [tagline, setTagline] = useState("Premier Residential & Executive Asset Management");
  const [timezone, setTimezone] = useState("(UTC-08:00) Pacific Time (US & Canada)");
  const [fiscalYearStart, setFiscalYearStart] = useState("January (Standard Calendar Year)");

  // Edit Settings Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempOrgName, setTempOrgName] = useState(orgName);
  const [tempCompanyType, setTempCompanyType] = useState(companyType);
  const [tempTaxId, setTempTaxId] = useState(taxId);
  const [tempRegisteredAddress, setTempRegisteredAddress] = useState(registeredAddress);
  const [tempLandlordName, setTempLandlordName] = useState(landlordName);
  const [tempLandlordRole, setTempLandlordRole] = useState(landlordRole);
  const [tempCompanyEmail, setTempCompanyEmail] = useState(companyEmail);
  const [tempCompanyPhone, setTempCompanyPhone] = useState(companyPhone);
  const [tempCurrency, setTempCurrency] = useState(currency);
  const [tempJurisdiction, setTempJurisdiction] = useState(jurisdiction);
  const [tempPincode, setTempPincode] = useState(pincode);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [tempTimezone, setTempTimezone] = useState(timezone);
  const [tempFiscalYearStart, setTempFiscalYearStart] = useState(fiscalYearStart);

  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<Country>(
    ALL_COUNTRIES.find((c) => c.code === "US") || ALL_COUNTRIES[0]
  );

  const handleFetchAddressByPincode = async (code: string) => {
    const cleanCode = code.replace(/\s+/g, "").trim();
    if (!cleanCode || cleanCode.length < 5) return;

    setIsFetchingPincode(true);
    try {
      // 1. Try India Post API if 6 digits
      if (/^\d{6}$/.test(cleanCode)) {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`);
        const data = await res.json();
        if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const fetchedAddr = `${po.Name}, ${po.Block || po.Division || ""}, ${po.District}, ${po.State} - ${cleanCode}`;
          setTempRegisteredAddress(fetchedAddr);
          toast(`Fetched address for Pincode ${cleanCode}: ${po.District}, ${po.State}`, "success");
          setIsFetchingPincode(false);
          return;
        }
      }

      // 2. Try Zippopotam US / Global API for 5 digits
      if (/^\d{5}$/.test(cleanCode)) {
        const res = await fetch(`https://api.zippopotam.us/us/${cleanCode}`);
        if (res.ok) {
          const data = await res.json();
          const place = data.places[0];
          const fetchedAddr = `${place["place name"]}, ${place["state abbreviation"]}, USA - ${cleanCode}`;
          setTempRegisteredAddress(fetchedAddr);
          toast(`Fetched address for Postal Code ${cleanCode}: ${place["place name"]}, ${place["state abbreviation"]}`, "success");
          setIsFetchingPincode(false);
          return;
        }
      }

      // 3. Fallback: OpenStreetMap Nominatim API
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(cleanCode)}&format=json&addressdetails=1`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        const place = geoData[0];
        setTempRegisteredAddress(place.display_name);
        toast(`Address detected for Postal Code ${cleanCode}`, "success");
      } else {
        toast("Pincode detected. Please verify full registered address.", "info");
      }
    } catch (err) {
      console.error("Pincode fetch error:", err);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  const openEditModal = () => {
    setTempOrgName(orgName);
    setTempCompanyType(companyType);
    setTempTaxId(taxId);
    setTempRegisteredAddress(registeredAddress);
    setTempLandlordName(landlordName);
    setTempLandlordRole(landlordRole);
    setTempCompanyEmail(companyEmail);
    
    let rawDigits = companyPhone;
    const matchedCountry = ALL_COUNTRIES.find((c) => companyPhone.trim().startsWith(c.dialCode));
    if (matchedCountry) {
      setSelectedPhoneCountry(matchedCountry);
      rawDigits = companyPhone.replace(matchedCountry.dialCode, "").trim();
    }
    setTempCompanyPhone(rawDigits);

    setTempCurrency(currency);
    setTempJurisdiction(jurisdiction);
    setTempPincode(pincode);
    setTempTimezone(timezone);
    setTempFiscalYearStart(fiscalYearStart);
    setShowEditModal(true);
  };

  const handleSaveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    setOrgName(tempOrgName);
    setCompanyType(tempCompanyType);
    setTaxId(tempTaxId);
    setRegisteredAddress(tempRegisteredAddress);
    setLandlordName(tempLandlordName);
    setLandlordRole(tempLandlordRole);
    setCompanyEmail(tempCompanyEmail);
    
    const formattedPhone = tempCompanyPhone.trim() 
      ? `${selectedPhoneCountry.dialCode} ${tempCompanyPhone.trim()}`
      : companyPhone;
    setCompanyPhone(formattedPhone);

    setCurrency(tempCurrency);
    setJurisdiction(tempJurisdiction);
    setPincode(tempPincode);
    setTimezone(tempTimezone);
    setFiscalYearStart(tempFiscalYearStart);
    setShowEditModal(false);
    toast("Workspace settings updated successfully!", "success");
  };

  // Payout Settings State
  const [bankName, setBankName] = useState("JPMorgan Chase Bank");
  const [accountNumber, setAccountNumber] = useState("•••• •••• •••• 8942");
  const [payoutSchedule, setPayoutSchedule] = useState("instant");

  // Integrations State & Filters
  const [integrationSearch, setIntegrationSearch] = useState("");
  const [selectedIntegrationCategory, setSelectedIntegrationCategory] = useState("All");
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({
    stripe: false,
    razorpay: false,
    paypal: false,
  });

  // Razorpay Integration Modal & Credentials State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayEnvMode, setRazorpayEnvMode] = useState<"live" | "test">("live");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayMerchantVpa, setRazorpayMerchantVpa] = useState("");
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState("");
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [savingRazorpay, setSavingRazorpay] = useState(false);

  const toggleIntegration = (id: string, name: string) => {
    if (id === "razorpay") {
      setShowRazorpayModal(true);
      return;
    }
    if (id === "stripe") {
      setShowStripeModal(true);
      return;
    }
    if (id === "paypal") {
      setShowPaypalModal(true);
      return;
    }
    const isCurrentlyConnected = !!connectedMap[id];
    setConnectedMap((prev) => ({ ...prev, [id]: !isCurrentlyConnected }));
    toast(
      !isCurrentlyConnected
        ? `Integration connected: ${name}`
        : `Integration disconnected: ${name}`,
      !isCurrentlyConnected ? "success" : "info"
    );
  };

  // PayPal Integration Modal & Credentials State
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [paypalEnvMode, setPaypalEnvMode] = useState<"live" | "test">("live");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [paypalMerchantEmail, setPaypalMerchantEmail] = useState("");
  const [paypalWebhookId, setPaypalWebhookId] = useState("");
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [savingPaypal, setSavingPaypal] = useState(false);

  const handleSavePaypal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paypalClientId.trim() || !paypalClientSecret.trim()) {
      toast("Client ID and Client Secret are required for PayPal configuration!", "error");
      return;
    }

    try {
      setSavingPaypal(true);
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          paypalClientId,
          paypalClientSecret,
          paypalMerchantEmail,
          paypalWebhookId,
          paypalEnvMode,
          paypalConnected: true,
        }),
      });

      if (res.ok) {
        setConnectedMap((prev) => ({ ...prev, paypal: true }));
        setShowPaypalModal(false);
        toast("PayPal Client API credentials saved successfully! International wallet payment gateway activated.", "success");
      } else {
        toast("Failed to save PayPal configuration.", "error");
      }
    } catch (err) {
      toast("Error saving PayPal settings.", "error");
    } finally {
      setSavingPaypal(false);
    }
  };

  const handleDisconnectPaypal = async () => {
    try {
      setSavingPaypal(true);
      await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          paypalConnected: false,
        }),
      });
      setConnectedMap((prev) => ({ ...prev, paypal: false }));
      setShowPaypalModal(false);
      toast("PayPal integration disconnected.", "info");
    } catch (err) {
      toast("Error disconnecting PayPal.", "error");
    } finally {
      setSavingPaypal(false);
    }
  };

  // Stripe Integration Modal & Credentials State
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeEnvMode, setStripeEnvMode] = useState<"live" | "test">("live");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [stripeConnectAccountId, setStripeConnectAccountId] = useState("");
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [savingStripe, setSavingStripe] = useState(false);

  const handleSaveStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripePublishableKey.trim() || !stripeSecretKey.trim()) {
      toast("Publishable Key and Secret Key are required for Stripe configuration!", "error");
      return;
    }

    try {
      setSavingStripe(true);
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          stripePublishableKey,
          stripeSecretKey,
          stripeWebhookSecret,
          stripeConnectAccountId,
          stripeEnvMode,
          stripeConnected: true,
        }),
      });

      if (res.ok) {
        setConnectedMap((prev) => ({ ...prev, stripe: true }));
        setShowStripeModal(false);
        toast("Stripe API Keys & Connect credentials saved successfully! Global payment gateway activated.", "success");
      } else {
        toast("Failed to save Stripe configuration.", "error");
      }
    } catch (err) {
      toast("Error saving Stripe settings.", "error");
    } finally {
      setSavingStripe(false);
    }
  };

  const handleDisconnectStripe = async () => {
    try {
      setSavingStripe(true);
      await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          stripeConnected: false,
        }),
      });
      setConnectedMap((prev) => ({ ...prev, stripe: false }));
      setShowStripeModal(false);
      toast("Stripe integration disconnected.", "info");
    } catch (err) {
      toast("Error disconnecting Stripe.", "error");
    } finally {
      setSavingStripe(false);
    }
  };

  const handleSaveRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razorpayKeyId.trim() || !razorpayKeySecret.trim()) {
      toast("Key ID and Key Secret are required for Razorpay configuration!", "error");
      return;
    }

    try {
      setSavingRazorpay(true);
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          razorpayKeyId,
          razorpayKeySecret,
          razorpayMerchantVpa,
          razorpayWebhookSecret,
          razorpayEnvMode,
          razorpayConnected: true,
        }),
      });

      if (res.ok) {
        setConnectedMap((prev) => ({ ...prev, razorpay: true }));
        setShowRazorpayModal(false);
        toast("Razorpay API Keys & VPA saved and verified successfully! Tenant payment gateway activated.", "success");
      } else {
        toast("Failed to save Razorpay configuration.", "error");
      }
    } catch (err) {
      toast("Error saving Razorpay settings.", "error");
    } finally {
      setSavingRazorpay(false);
    }
  };

  const handleDisconnectRazorpay = async () => {
    try {
      setSavingRazorpay(true);
      await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wid: 1,
          razorpayConnected: false,
        }),
      });
      setConnectedMap((prev) => ({ ...prev, razorpay: false }));
      setShowRazorpayModal(false);
      toast("Razorpay integration disconnected.", "info");
    } catch (err) {
      toast("Error disconnecting Razorpay.", "error");
    } finally {
      setSavingRazorpay(false);
    }
  };

  // Saved Feedback
  const [isSaved, setIsSaved] = useState(false);

  // Team Members State & API Integration
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [team, setTeam] = useState<any[]>([]);

  const fetchWorkspaceSettings = async () => {
    try {
      const res = await fetch("/api/workspace?wid=1");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.razorpayKeyId) setRazorpayKeyId(json.data.razorpayKeyId);
          if (json.data.razorpayKeySecret) setRazorpayKeySecret(json.data.razorpayKeySecret);
          if (json.data.razorpayMerchantVpa) setRazorpayMerchantVpa(json.data.razorpayMerchantVpa);
          if (json.data.razorpayWebhookSecret) setRazorpayWebhookSecret(json.data.razorpayWebhookSecret);
          if (json.data.razorpayEnvMode) setRazorpayEnvMode(json.data.razorpayEnvMode as any);
          if (json.data.razorpayConnected !== undefined) {
            setConnectedMap((prev) => ({ ...prev, razorpay: json.data.razorpayConnected }));
          }

          if (json.data.stripePublishableKey) setStripePublishableKey(json.data.stripePublishableKey);
          if (json.data.stripeSecretKey) setStripeSecretKey(json.data.stripeSecretKey);
          if (json.data.stripeWebhookSecret) setStripeWebhookSecret(json.data.stripeWebhookSecret);
          if (json.data.stripeConnectAccountId) setStripeConnectAccountId(json.data.stripeConnectAccountId);
          if (json.data.stripeEnvMode) setStripeEnvMode(json.data.stripeEnvMode as any);
          if (json.data.stripeConnected !== undefined) {
            setConnectedMap((prev) => ({ ...prev, stripe: json.data.stripeConnected }));
          }

          if (json.data.paypalClientId) setPaypalClientId(json.data.paypalClientId);
          if (json.data.paypalClientSecret) setPaypalClientSecret(json.data.paypalClientSecret);
          if (json.data.paypalMerchantEmail) setPaypalMerchantEmail(json.data.paypalMerchantEmail);
          if (json.data.paypalWebhookId) setPaypalWebhookId(json.data.paypalWebhookId);
          if (json.data.paypalEnvMode) setPaypalEnvMode(json.data.paypalEnvMode as any);
          if (json.data.paypalConnected !== undefined) {
            setConnectedMap((prev) => ({ ...prev, paypal: json.data.paypalConnected }));
          }
        }
      }
    } catch (err) {
      console.warn("Could not load workspace settings:", err);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberCountryCode, setMemberCountryCode] = useState("+1");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRole, setMemberRole] = useState("Manager"); // "Owner", "Admin", "Manager", "Employee"
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchTeamMembers = async () => {
    try {
      setLoadingTeam(true);
      const res = await fetch("/api/workspace/team?wid=1");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setTeam(json.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone ? `${m.countryCode || "+1"} ${m.phone}` : "N/A",
            role: m.role || "Manager",
            status: m.status || "Active",
          })));
        }
      }
    } catch (err) {
      console.warn("Could not fetch team from API:", err);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceSettings();
    fetchTeamMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    if (password && password !== confirmPassword) {
      toast("Passwords do not match! Please check again.", "error");
      return;
    }

    try {
      const res = await fetch("/api/workspace/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: memberName,
          email: memberEmail,
          countryCode: memberCountryCode,
          phone: memberPhone,
          role: memberRole,
          password: password || undefined,
          wid: 1, // Workspace ID
        }),
      });

      if (res.ok) {
        const json = await res.json();
        toast(json.message || `Team member "${memberName}" added successfully!`, "success");
        fetchTeamMembers();
      } else {
        toast("Failed to add team member", "error");
      }
    } catch {
      toast("Failed to add team member", "error");
    }

    setMemberName("");
    setMemberEmail("");
    setMemberPhone("");
    setPassword("");
    setConfirmPassword("");
    setMemberRole("Manager");
    setShowAddModal(false);
  };

  const handleDeleteMember = async (member: any) => {
    if (member.role === "Owner") {
      toast("Cannot revoke access for Workspace Owner.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/workspace/team/${encodeURIComponent(member.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast(`Access revoked for "${member.name}".`, "info");
        fetchTeamMembers();
      } else {
        setTeam((prev) => prev.filter((t) => t.id !== member.id));
        toast(`Team member removed.`, "info");
      }
    } catch {
      setTeam((prev) => prev.filter((t) => t.id !== member.id));
      toast(`Team member removed.`, "info");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Workspace & Landlord Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure organization profile, bank payout accounts, and team access.
          </p>
        </div>

        <button
          onClick={openEditModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Workspace Settings</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar">
        {[
          { id: "general", label: "Organization & Profile", icon: Building2 },
          { id: "integrations", label: "Integrations", icon: Blocks, badge: "3 SUPPORTED" },
          { id: "team", label: "Team Members", icon: Users, count: team.length },
          { id: "delete_account", label: "Delete Account", icon: UserX },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase">
                  {tab.badge}
                </span>
              )}
              {tab.count && (
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Organization & Profile */}
      {activeTab === "general" && (
        <div className="space-y-6">
          
          {/* Card 1: Company Legal Identity & Tax Registration (Read-Only) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FF6B00]" />
                <span>Company Legal Identity & Registration</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Organization / Company Name
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {orgName}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Entity / Business Type
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {companyType}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Pincode / Postal Code
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {pincode}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Tax Identification Number (EIN / GSTIN / SSN)
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {taxId}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Registered Headquarters Address
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {registeredAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Primary Landlord & Representative Contact (Read-Only) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Primary Landlord & Representative Contact</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Primary Contact Full Name
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {landlordName}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Official Title / Role
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {landlordRole}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Official Notification Email
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {companyEmail}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Direct Contact Phone Number
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {companyPhone}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Regional Preferences & Fiscal Calendar (Read-Only) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Regional Preferences & Fiscal Calendar</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Default Operating Currency
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {currency}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Pincode / Postal Code
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {pincode}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Workspace Operating Timezone
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {timezone}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Fiscal Year Start Month
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900">
                  {fiscalYearStart}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Integrations Catalog Grid */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Header Banner & Stats */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Blocks className="w-5 h-5 text-[#FF6B00]" />
                  <span>Payment Gateway &amp; Banking Integrations</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect direct payment processors and settlement gateways for automated rent collection.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>3 Payment Integrations Supported</span>
                </span>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                {["All Integrations", "Payment Gateways", "Instant Settlement"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedIntegrationCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedIntegrationCategory === cat
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={integrationSearch}
                  onChange={(e) => setIntegrationSearch(e.target.value)}
                  placeholder="Search integrations..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Integration Cards Grid - strictly Stripe, Razorpay & PayPal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: "stripe",
                name: "Stripe Connect & ACH Direct",
                category: "Payment Gateway",
                logo: "/assests/stripe icon.jpeg",
                description: "Automated monthly rent collection via ACH Direct Debit, Credit/Debit Cards, Apple Pay, and Google Pay.",
                meta: "Fee: 0.5% ACH Cap ($5 max) • Global Payouts",
                popular: true,
              },
              {
                id: "razorpay",
                name: "Razorpay & UPI Instant Settlement",
                category: "Payment Gateway",
                logo: "/assests/razorpay icon.jpeg",
                description: "Instant UPI QR Code scan (PhonePe, GPay, Paytm) & NetBanking settlements for Indian & SE Asian properties.",
                meta: "0% Fee on UPI • Instant VPA Settlement",
                popular: true,
              },
              {
                id: "paypal",
                name: "PayPal & Venmo Commerce",
                category: "Payment Gateway",
                logo: "/assests/paypal icon.svg",
                description: "Accept international card payments, PayPal wallets, and Venmo transfers from global & expat residents.",
                meta: "Venmo QR Code • International Cards & Wallets",
                popular: false,
              },
            ]
              .filter((item) => {
                const matchesSearch =
                  item.name.toLowerCase().includes(integrationSearch.toLowerCase()) ||
                  item.description.toLowerCase().includes(integrationSearch.toLowerCase());
                return matchesSearch;
              })
              .map((item) => {
                const isConnected = !!connectedMap[item.id];
                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between relative ${
                      isConnected ? "border-slate-200/90" : "border-slate-200/60 opacity-90"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Bar: Logo, Name & Toggle */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                            <Image
                              src={item.logo}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="object-contain max-h-full w-auto"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{item.name}</h4>
                              {item.popular && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-800 uppercase">
                                  POPULAR
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {/* Connected Status Switch */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleIntegration(item.id, item.name)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isConnected ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isConnected ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                        {item.description}
                      </p>

                      {/* Meta Pill */}
                      <div className="text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-500 font-medium">
                        {item.meta}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`text-[11px] font-extrabold flex items-center gap-1.5 ${
                        isConnected ? "text-emerald-600" : "text-slate-400"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span>{isConnected ? "Connected & Active" : "Available"}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isConnected) {
                            toggleIntegration(item.id, item.name);
                          } else {
                            toast(`Opening ${item.name} API & Webhook Configuration...`, "info");
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isConnected
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                            : "bg-[#FF6B00] hover:bg-[#E56000] text-white shadow-xs"
                        }`}
                      >
                        {isConnected ? "Configure Keys" : "+ Connect"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 3: Team & Role Access */}
      {activeTab === "team" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF6B00]" />
              <span>Team Members & Property Manager Permissions</span>
            </h3>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 px-2">Member</th>
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Phone Number</th>
                  <th className="pb-3 px-2">Access Role</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {team.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                          <Users className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-slate-800 text-sm">No Team Members Added</span>
                        <p className="text-xs text-slate-400 max-w-sm">
                          No team members found for this workspace. Click &ldquo;Add Team Member&rdquo; above to grant access.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  team.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-900">{m.name}</td>
                      <td className="py-3 px-2 text-slate-600">{m.email}</td>
                      <td className="py-3 px-2 text-slate-600">{m.phone}</td>
                      <td className="py-3 px-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-800 uppercase">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {m.role !== "Owner" && (
                          <button
                            onClick={() => handleDeleteMember(m)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Delete Account */}
      {activeTab === "delete_account" && (
        <div className="space-y-6 font-sans">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 block mb-1">
              ACCOUNT SETTINGS
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Delete Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Request permanent deletion of your RentAwas account and associated data.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-8 max-w-4xl">
            {/* Card Danger Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                DELETE YOUR RENTAWAS ACCOUNT
              </h3>
            </div>

            {/* Instruction Body */}
            <div className="space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
              <p>
                If you would like to delete your RentAwas account and associated data, please send an email from your registered email address to:
              </p>

              <div className="pt-1">
                <a
                  href="mailto:support@anshapps.com?subject=Account%20Deletion%20Request"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold border border-teal-200 transition-all text-xs cursor-pointer shadow-2xs group"
                >
                  <Mail className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                  <span>support@anshapps.com</span>
                </a>
              </div>

              <div className="space-y-1 pt-2">
                <p className="font-bold text-slate-900">
                  Subject: <span className="font-semibold text-slate-700">Account Deletion Request</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Our team will verify your request and process account deletion within 7 business days.
                </p>
              </div>
            </div>

            <hr className="border-slate-100 my-6" />

            {/* List Upon Successful Deletion */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                UPON SUCCESSFUL DELETION:
              </h4>

              <ul className="space-y-2.5 text-xs text-slate-600 font-medium pl-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Your account will be permanently deleted.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Your profile information will be removed.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Your authentication credentials will be deleted.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Any active subscription will be cancelled and revoked.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Any personal data associated with your account will be removed from our systems.</span>
                </li>
              </ul>
            </div>

            <hr className="border-slate-100 my-6" />

            {/* Footer Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500 font-medium pt-2">
              <p>
                If you have any questions regarding account deletion, please contact us at{" "}
                <a href="mailto:support@anshapps.com" className="font-bold text-teal-600 hover:underline">
                  support@anshapps.com
                </a>.
              </p>
              <span className="uppercase text-[10px] font-bold text-slate-400 tracking-wider">
                LAST UPDATED: JUNE 2026
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <form onSubmit={handleAddMember} className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-extrabold text-slate-900 leading-none">Add Team Member</h3>
            <p className="text-xs text-slate-500">Enter team member details to grant access to workspace #1.</p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="sarah.j@regencymanagement.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={memberCountryCode}
                    onChange={(e) => setMemberCountryCode(e.target.value)}
                    className="px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer shrink-0"
                  >
                    <option value="+1">🇺🇸 +1 (US/CA)</option>
                    <option value="+91">🇮🇳 +91 (IN)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+61">🇦🇺 +61 (AU)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+65">🇸🇬 +65 (SG)</option>
                    <option value="+49">🇩🇪 +49 (DE)</option>
                    <option value="+33">🇫🇷 +33 (FR)</option>
                  </select>
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Access Role *</label>
                <div className="relative">
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer pr-9"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                Add Team Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Razorpay Integration Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans">
            
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowRazorpayModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/assests/razorpay icon.jpeg"
                  alt="Razorpay"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Razorpay Gateway API Setup</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 uppercase">
                    UPI &amp; CARDS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter your official Razorpay Key ID, Key Secret, and VPA to allow tenants to pay rent instantly via PhonePe, GPay, Paytm &amp; Cards.
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRazorpay} className="space-y-5 text-xs">
              
              {/* Environment Radio Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  API Environment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRazorpayEnvMode("live")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      razorpayEnvMode === "live"
                        ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Live Production</div>
                      <div className="text-[10px] text-slate-500 font-mono">rzp_live_...</div>
                    </div>
                    {razorpayEnvMode === "live" && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRazorpayEnvMode("test")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      razorpayEnvMode === "test"
                        ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Test Sandbox Mode</div>
                      <div className="text-[10px] text-slate-500 font-mono">rzp_test_...</div>
                    </div>
                    {razorpayEnvMode === "test" && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* Key ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Razorpay Key ID *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Found in Razorpay Dashboard &gt; API Keys</span>
                </label>
                <input
                  type="text"
                  required
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  placeholder={razorpayEnvMode === "live" ? "rzp_live_9a8B7c6D5e4F3g" : "rzp_test_9a8B7c6D5e4F3g"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Key Secret Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Razorpay Key Secret *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Private authentication key</span>
                </label>
                <div className="relative">
                  <input
                    type={showRazorpaySecret ? "text" : "password"}
                    required
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Merchant VPA / UPI ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Merchant VPA / UPI ID (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">Direct UPI QR settlement</span>
                </label>
                <input
                  type="text"
                  value={razorpayMerchantVpa}
                  onChange={(e) => setRazorpayMerchantVpa(e.target.value)}
                  placeholder="e.g. rentawas@razorpay or management@icici"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Webhook Secret Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Webhook Secret (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">Verifies payment events</span>
                </label>
                <input
                  type="text"
                  value={razorpayWebhookSecret}
                  onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                  placeholder="whsec_rzp_98765432"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Webhook Setup Instructions Note Box */}
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2 text-blue-950">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Razorpay Webhook Setup Guide</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://rentawas.com/api/webhooks/razorpay");
                      toast("Webhook URL copied to clipboard!", "success");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-blue-700 hover:text-blue-900 font-extrabold text-[10px] rounded-lg border border-blue-200 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>

                <div className="font-mono text-[10px] text-blue-800 bg-white/80 px-2.5 py-1.5 rounded-xl border border-blue-200/90 flex items-center justify-between">
                  <span>https://rentawas.com/api/webhooks/razorpay</span>
                </div>

                <div className="text-[11px] space-y-1 pt-1 text-slate-700 font-medium">
                  <p className="font-bold text-slate-900 text-[11px]">How to configure in Razorpay:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600">
                    <li>Copy <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono">https://rentawas.com/api/webhooks/razorpay</code></li>
                    <li>Open <strong>Razorpay Dashboard &gt; Settings &gt; Webhooks</strong></li>
                    <li>Paste the URL and select events: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">payment.captured</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">order.paid</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">payment.failed</code></li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                {connectedMap.razorpay ? (
                  <button
                    type="button"
                    onClick={handleDisconnectRazorpay}
                    disabled={savingRazorpay}
                    className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer transition-colors"
                  >
                    Disconnect Integration
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={savingRazorpay}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2"
                  >
                    {savingRazorpay ? (
                      <span>Saving &amp; Verifying...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Save &amp; Connect Razorpay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Stripe Integration Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans">
            
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowStripeModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/assests/stripe icon.jpeg"
                  alt="Stripe"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Stripe Connect &amp; ACH Setup</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 uppercase">
                    GLOBAL &amp; ACH
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Configure your Stripe API Publishable Key &amp; Secret Key to process global credit/debit cards, ACH Direct Debit, Apple Pay, and Google Pay.
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveStripe} className="space-y-5 text-xs">
              
              {/* Environment Radio Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  API Environment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStripeEnvMode("live")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      stripeEnvMode === "live"
                        ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Live Production</div>
                      <div className="text-[10px] text-slate-500 font-mono">pk_live_... / sk_live_...</div>
                    </div>
                    {stripeEnvMode === "live" && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStripeEnvMode("test")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      stripeEnvMode === "test"
                        ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Test Sandbox Mode</div>
                      <div className="text-[10px] text-slate-500 font-mono">pk_test_... / sk_test_...</div>
                    </div>
                    {stripeEnvMode === "test" && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* Publishable Key Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Stripe Publishable Key *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Found in Stripe Dashboard &gt; API Keys</span>
                </label>
                <input
                  type="text"
                  required
                  value={stripePublishableKey}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                  placeholder={stripeEnvMode === "live" ? "pk_live_51M..." : "pk_test_51M..."}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Secret Key Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Stripe Secret Key *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Private server authentication key</span>
                </label>
                <div className="relative">
                  <input
                    type={showStripeSecret ? "text" : "password"}
                    required
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStripeSecret(!showStripeSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showStripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Webhook Signing Secret Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Webhook Signing Secret (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">Verifies Stripe signature</span>
                </label>
                <input
                  type="text"
                  value={stripeWebhookSecret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                  placeholder="whsec_1234567890abcdef..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Stripe Connect Account ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Stripe Connect Account ID (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">Connected Merchant Account</span>
                </label>
                <input
                  type="text"
                  value={stripeConnectAccountId}
                  onChange={(e) => setStripeConnectAccountId(e.target.value)}
                  placeholder="e.g. acct_1M9x2kL0PqRst"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Webhook Setup Instructions Note Box */}
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2 text-indigo-950">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Stripe Webhook Setup Guide</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://rentawas.com/api/webhooks/stripe");
                      toast("Stripe Webhook URL copied to clipboard!", "success");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-indigo-700 hover:text-indigo-900 font-extrabold text-[10px] rounded-lg border border-indigo-200 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>

                <div className="font-mono text-[10px] text-indigo-800 bg-white/80 px-2.5 py-1.5 rounded-xl border border-indigo-200/90 flex items-center justify-between">
                  <span>https://rentawas.com/api/webhooks/stripe</span>
                </div>

                <div className="text-[11px] space-y-1 pt-1 text-slate-700 font-medium">
                  <p className="font-bold text-slate-900 text-[11px]">How to configure in Stripe:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600">
                    <li>Copy <code className="bg-indigo-100 text-indigo-900 px-1 py-0.5 rounded font-mono">https://rentawas.com/api/webhooks/stripe</code></li>
                    <li>Open <strong>Stripe Dashboard &gt; Developers &gt; Webhooks &gt; Add Endpoint</strong></li>
                    <li>Paste the URL and select events: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">payment_intent.succeeded</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">invoice.paid</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">charge.failed</code></li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                {connectedMap.stripe ? (
                  <button
                    type="button"
                    onClick={handleDisconnectStripe}
                    disabled={savingStripe}
                    className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer transition-colors"
                  >
                    Disconnect Integration
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={savingStripe}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2"
                  >
                    {savingStripe ? (
                      <span>Saving &amp; Verifying...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Save &amp; Connect Stripe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PayPal Integration Modal */}
      {showPaypalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans">
            
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowPaypalModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/assests/paypal icon.svg"
                  alt="PayPal"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">PayPal &amp; Venmo Commerce API Setup</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-100 text-sky-800 uppercase">
                    GLOBAL WALLETS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter your PayPal REST API Client ID, Client Secret, and Merchant Email to process international tenant payments and Venmo transfers.
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePaypal} className="space-y-5 text-xs">
              
              {/* Environment Radio Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-2">
                  API Environment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaypalEnvMode("live")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      paypalEnvMode === "live"
                        ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Live Production</div>
                      <div className="text-[10px] text-slate-500 font-mono">api-3t.paypal.com</div>
                    </div>
                    {paypalEnvMode === "live" && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaypalEnvMode("test")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      paypalEnvMode === "test"
                        ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="text-xs">Sandbox Mode</div>
                      <div className="text-[10px] text-slate-500 font-mono">api-m.sandbox.paypal.com</div>
                    </div>
                    {paypalEnvMode === "test" && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* Client ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>PayPal REST Client ID *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Found in PayPal Developer &gt; Apps</span>
                </label>
                <input
                  type="text"
                  required
                  value={paypalClientId}
                  onChange={(e) => setPaypalClientId(e.target.value)}
                  placeholder="e.g. A21AA...or Sandbox Client ID"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              {/* Client Secret Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>PayPal Client Secret *</span>
                  <span className="text-[10px] text-slate-400 lowercase">Private authentication key</span>
                </label>
                <div className="relative">
                  <input
                    type={showPaypalSecret ? "text" : "password"}
                    required
                    value={paypalClientSecret}
                    onChange={(e) => setPaypalClientSecret(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPaypalSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Merchant Business Email Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>PayPal Merchant Account Email (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">For payout routing</span>
                </label>
                <input
                  type="email"
                  value={paypalMerchantEmail}
                  onChange={(e) => setPaypalMerchantEmail(e.target.value)}
                  placeholder="e.g. billing@grandregency.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              {/* Webhook ID Field */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>PayPal Webhook ID (Optional)</span>
                  <span className="text-[10px] text-slate-400 lowercase">17-character Webhook ID</span>
                </label>
                <input
                  type="text"
                  value={paypalWebhookId}
                  onChange={(e) => setPaypalWebhookId(e.target.value)}
                  placeholder="e.g. 8AB1234567890CDEF"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              {/* Webhook Setup Instructions Note Box */}
              <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-2 text-sky-950">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-600" />
                    <span>PayPal Webhook Setup Guide</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://rentawas.com/api/webhooks/paypal");
                      toast("PayPal Webhook URL copied to clipboard!", "success");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-sky-700 hover:text-sky-900 font-extrabold text-[10px] rounded-lg border border-sky-200 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </button>
                </div>

                <div className="font-mono text-[10px] text-sky-800 bg-white/80 px-2.5 py-1.5 rounded-xl border border-sky-200/90 flex items-center justify-between">
                  <span>https://rentawas.com/api/webhooks/paypal</span>
                </div>

                <div className="text-[11px] space-y-1 pt-1 text-slate-700 font-medium">
                  <p className="font-bold text-slate-900 text-[11px]">How to configure in PayPal:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600">
                    <li>Copy <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded font-mono">https://rentawas.com/api/webhooks/paypal</code></li>
                    <li>Open <strong>PayPal Developer Portal &gt; My Apps &amp; Credentials &gt; Webhooks &gt; Add Webhook</strong></li>
                    <li>Paste the URL and select events: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">PAYMENT.CAPTURE.COMPLETED</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">CHECKOUT.ORDER.APPROVED</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">PAYMENT.CAPTURE.DENIED</code></li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                {connectedMap.paypal ? (
                  <button
                    type="button"
                    onClick={handleDisconnectPaypal}
                    disabled={savingPaypal}
                    className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer transition-colors"
                  >
                    Disconnect Integration
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={savingPaypal}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2"
                  >
                    {savingPaypal ? (
                      <span>Saving &amp; Verifying...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Save &amp; Connect PayPal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Workspace Settings Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
          <form
            onSubmit={handleSaveEditModal}
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-orange-50 text-[#FF6B00] rounded-xl border border-orange-100">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Workspace Settings</h3>
                  <p className="text-xs text-slate-500">Update company legal profile, landlord contact details, and regional preferences.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 text-xs custom-scrollbar">
              {/* Section 1: Company Legal Identity */}
              <div className="space-y-4 pt-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#FF6B00]" />
                  <span>Company Legal Identity</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={tempOrgName}
                      onChange={(e) => setTempOrgName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Entity / Business Type</label>
                    <div className="relative">
                      <select
                        value={tempCompanyType}
                        onChange={(e) => setTempCompanyType(e.target.value)}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="Individual Landlord / Homeowner (Individual)">Individual Landlord / Homeowner (Individual)</option>
                        <option value="Sole Proprietorship / Single Owner Business">Sole Proprietorship / Single Owner Business</option>
                        <option value="LLC (Limited Liability Company)">LLC (Limited Liability Company)</option>
                        <option value="LLP (Limited Liability Partnership)">LLP (Limited Liability Partnership)</option>
                        <option value="Partnership Firm / General Partnership">Partnership Firm / General Partnership</option>
                        <option value="Private Limited Corporation (Pvt Ltd / Inc)">Private Limited Corporation (Pvt Ltd / Inc)</option>
                        <option value="Public Limited Corporation (Ltd / PLC / Corp)">Public Limited Corporation (Ltd / PLC / Corp)</option>
                        <option value="REIT (Real Estate Investment Trust)">REIT (Real Estate Investment Trust)</option>
                        <option value="Property Management Agency (PMA / Brokerage)">Property Management Agency (PMA / Brokerage)</option>
                        <option value="Co-Living & PG / Student Housing Operator">Co-Living & PG / Student Housing Operator</option>
                        <option value="HUF (Hindu Undivided Family / Family Trust)">HUF (Hindu Undivided Family / Family Trust)</option>
                        <option value="Non-Profit / Trust / Cooperative Housing Society">Non-Profit / Trust / Cooperative Housing Society</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Pincode & Registered Address Next to Each Other */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                      <span>Pincode / Postal Code</span>
                      {isFetchingPincode && <span className="text-[10px] text-[#FF6B00] font-bold animate-pulse">Auto-fetching address...</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 122001, 98101"
                      value={tempPincode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTempPincode(val);
                        if (val.trim().length === 6 || val.trim().length === 5) {
                          handleFetchAddressByPincode(val);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Tax Identification Number</label>
                    <input
                      type="text"
                      value={tempTaxId}
                      onChange={(e) => setTempTaxId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  {/* Registered Headquarters Address - Full Width Row */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 uppercase mb-1">Registered Headquarters Address</label>
                    <input
                      type="text"
                      value={tempRegisteredAddress}
                      onChange={(e) => setTempRegisteredAddress(e.target.value)}
                      placeholder="Auto-filled from pincode or enter address"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Details */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Landlord Representative Contact</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Primary Contact Full Name</label>
                    <input
                      type="text"
                      required
                      value={tempLandlordName}
                      onChange={(e) => setTempLandlordName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Official Title / Role</label>
                    <input
                      type="text"
                      value={tempLandlordRole}
                      onChange={(e) => setTempLandlordRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Notification Email</label>
                    <input
                      type="email"
                      required
                      value={tempCompanyEmail}
                      onChange={(e) => setTempCompanyEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone Number</label>
                    <CountryPhoneInput
                      value={tempCompanyPhone}
                      onChange={(val) => setTempCompanyPhone(val)}
                      selectedCountry={selectedPhoneCountry}
                      onCountryChange={(country) => setSelectedPhoneCountry(country)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Currency & Regional Preferences */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Regional Preferences</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Operating Currency</label>
                    <div className="relative">
                      <select
                        value={tempCurrency}
                        onChange={(e) => setTempCurrency(e.target.value)}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {ALL_CURRENCIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>



                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Operating Timezone</label>
                    <div className="relative">
                      <select
                        value={tempTimezone}
                        onChange={(e) => setTempTimezone(e.target.value)}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        {ALL_TIMEZONES.map((tz) => (
                          <option key={tz.code} value={tz.name}>
                            {tz.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Fiscal Year Start</label>
                    <div className="relative">
                      <select
                        value={tempFiscalYearStart}
                        onChange={(e) => setTempFiscalYearStart(e.target.value)}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                      >
                        <option value="January (Standard Calendar Year)">January (Standard Calendar Year)</option>
                        <option value="April (India / UK Fiscal Year)">April (India / UK Fiscal Year)</option>
                        <option value="July (Q3 Fiscal Start)">July (Q3 Fiscal Start)</option>
                        <option value="October (Q4 Fiscal Start)">October (Q4 Fiscal Start)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-xl shadow-md uppercase tracking-wider cursor-pointer transition-all"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
