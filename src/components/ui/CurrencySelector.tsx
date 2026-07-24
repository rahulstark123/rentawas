"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, DollarSign } from "lucide-react";

export interface CurrencyItem {
  code: string;       // "USD"
  symbol: string;     // "$"
  name: string;       // "United States Dollar"
  country: string;    // "United States"
  flag: string;       // "🇺🇸"
  value: string;      // "USD ($)"
}

export const ALL_WORLD_CURRENCIES: CurrencyItem[] = [
  { code: "USD", symbol: "$", name: "US Dollar", country: "United States", flag: "🇺🇸", value: "USD ($)" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India", flag: "🇮🇳", value: "INR (₹)" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Eurozone", flag: "🇪🇺", value: "EUR (€)" },
  { code: "GBP", symbol: "£", name: "British Pound", country: "United Kingdom", flag: "🇬🇧", value: "GBP (£)" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", country: "United Arab Emirates", flag: "🇦🇪", value: "AED (د.إ)" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar", country: "Canada", flag: "🇨🇦", value: "CAD ($)" },
  { code: "AUD", symbol: "$", name: "Australian Dollar", country: "Australia", flag: "🇦🇺", value: "AUD ($)" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", country: "Japan", flag: "🇯🇵", value: "JPY (¥)" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", country: "Saudi Arabia", flag: "🇸🇦", value: "SAR (﷼)" },
  { code: "SGD", symbol: "$", name: "Singapore Dollar", country: "Singapore", flag: "🇸🇬", value: "SGD ($)" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", country: "Switzerland", flag: "🇨🇭", value: "CHF (CHF)" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", country: "China", flag: "🇨🇳", value: "CNY (¥)" },
  { code: "NZD", symbol: "$", name: "New Zealand Dollar", country: "New Zealand", flag: "🇳🇿", value: "NZD ($)" },
  { code: "MXN", symbol: "$", name: "Mexican Peso", country: "Mexico", flag: "🇲🇽", value: "MXN ($)" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", country: "Brazil", flag: "🇧🇷", value: "BRL (R$)" },
  { code: "ZAR", symbol: "R", name: "South African Rand", country: "South Africa", flag: "🇿🇦", value: "ZAR (R)" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", country: "Malaysia", flag: "🇲🇾", value: "MYR (RM)" },
  { code: "THB", symbol: "฿", name: "Thai Baht", country: "Thailand", flag: "🇹🇭", value: "THB (฿)" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", country: "Indonesia", flag: "🇮🇩", value: "IDR (Rp)" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", country: "Turkey", flag: "🇹🇷", value: "TRY (₺)" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", country: "Sweden", flag: "🇸🇪", value: "SEK (kr)" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", country: "Norway", flag: "🇳🇴", value: "NOK (kr)" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", country: "Denmark", flag: "🇩🇰", value: "DKK (kr)" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", country: "Poland", flag: "🇵🇱", value: "PLN (zł)" },
  { code: "HKD", symbol: "$", name: "Hong Kong Dollar", country: "Hong Kong", flag: "🇭🇰", value: "HKD ($)" },
  { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar", country: "Taiwan", flag: "🇹🇼", value: "TWD (NT$)" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", country: "Philippines", flag: "🇵🇭", value: "PHP (₱)" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", country: "South Korea", flag: "🇰🇷", value: "KRW (₩)" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", country: "Vietnam", flag: "🇻🇳", value: "VND (₫)" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", country: "Egypt", flag: "🇪🇬", value: "EGP (E£)" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", country: "Nigeria", flag: "🇳🇬", value: "NGN (₦)" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", country: "Kenya", flag: "🇰🇪", value: "KES (KSh)" },
  { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", country: "Pakistan", flag: "🇵🇰", value: "PKR (Rs)" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", country: "Bangladesh", flag: "🇧🇩", value: "BDT (৳)" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal", country: "Qatar", flag: "🇶🇦", value: "QAR (﷼)" },
  { code: "KWD", symbol: "KD", name: "Kuwaiti Dinar", country: "Kuwait", flag: "🇰🇼", value: "KWD (KD)" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial", country: "Oman", flag: "🇴🇲", value: "OMR (﷼)" },
  { code: "BHD", symbol: "BD", name: "Bahraini Dinar", country: "Bahrain", flag: "🇧🇭", value: "BHD (BD)" },
  { code: "CLP", symbol: "$", name: "Chilean Peso", country: "Chile", flag: "🇨🇱", value: "CLP ($)" },
  { code: "COP", symbol: "$", name: "Colombian Peso", country: "Colombia", flag: "🇨🇴", value: "COP ($)" },
  { code: "PEN", symbol: "S/.", name: "Peruvian Sol", country: "Peru", flag: "🇵🇪", value: "PEN (S/.)" },
  { code: "ARS", symbol: "$", name: "Argentine Peso", country: "Argentina", flag: "🇦🇷", value: "ARS ($)" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", country: "Czech Republic", flag: "🇨🇿", value: "CZK (Kč)" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", country: "Hungary", flag: "🇭🇺", value: "HUF (Ft)" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", country: "Romania", flag: "🇷🇴", value: "RON (lei)" },
  { code: "ILS", symbol: "₪", name: "Israeli New Shekel", country: "Israel", flag: "🇮🇱", value: "ILS (₪)" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", country: "Sri Lanka", flag: "🇱🇰", value: "LKR (Rs)" },
  { code: "DZD", symbol: "DA", name: "Algerian Dinar", country: "Algeria", flag: "🇩🇿", value: "DZD (DA)" },
  { code: "MAD", symbol: "DH", name: "Moroccan Dirham", country: "Morocco", flag: "🇲🇦", value: "MAD (DH)" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", country: "Ghana", flag: "🇬🇭", value: "GHS (GH₵)" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", country: "Tanzania", flag: "🇹🇿", value: "TZS (TSh)" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", country: "Uganda", flag: "🇺🇬", value: "UGX (USh)" },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar", country: "Jamaica", flag: "🇯🇲", value: "JMD (J$)" },
  { code: "TTD", symbol: "TT$", name: "Trinidad & Tobago Dollar", country: "Trinidad & Tobago", flag: "🇹🇹", value: "TTD (TT$)" },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colón", country: "Costa Rica", flag: "🇨🇷", value: "CRC (₡)" },
  { code: "DOP", symbol: "RD$", name: "Dominican Peso", country: "Dominican Republic", flag: "🇩🇴", value: "DOP (RD$)" },
  { code: "UYU", symbol: "$U", name: "Uruguayan Peso", country: "Uruguay", flag: "🇺🇾", value: "UYU ($U)" },
  { code: "ISK", symbol: "kr", name: "Icelandic Króna", country: "Iceland", flag: "🇮🇸", value: "ISK (kr)" },
  { code: "BGN", symbol: "lv", name: "Bulgarian Lev", country: "Bulgaria", flag: "🇧🇬", value: "BGN (lv)" },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna", country: "Croatia", flag: "🇭🇷", value: "HRK (kn)" },
  { code: "RSD", symbol: "din", name: "Serbian Dinar", country: "Serbia", flag: "🇷🇸", value: "RSD (din)" },
  { code: "JOD", symbol: "JD", name: "Jordanian Dinar", country: "Jordan", flag: "🇯🇴", value: "JOD (JD)" },
  { code: "LBP", symbol: "L£", name: "Lebanese Pound", country: "Lebanon", flag: "🇱🇧", value: "LBP (L£)" },
  { code: "AMD", symbol: "֏", name: "Armenian Dram", country: "Armenia", flag: "🇦🇲", value: "AMD (֏)" },
  { code: "GEL", symbol: "₾", name: "Georgian Lari", country: "Georgia", flag: "🇬🇪", value: "GEL (₾)" },
  { code: "AZN", symbol: "₼", name: "Azerbaijani Manat", country: "Azerbaijan", flag: "🇦🇿", value: "AZN (₼)" },
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge", country: "Kazakhstan", flag: "🇰🇿", value: "KZT (₸)" },
  { code: "UZS", symbol: "so'm", name: "Uzbekistani Som", country: "Uzbekistan", flag: "🇺🇿", value: "UZS (so'm)" },
];

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CurrencySelector({
  value,
  onChange,
  className = "",
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedItem =
    ALL_WORLD_CURRENCIES.find((c) => c.value === value || c.code === value) ||
    ALL_WORLD_CURRENCIES[0];

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      const portal = document.getElementById("currency-selector-portal-menu");
      if (portal && portal.contains(target)) return;
      setIsOpen(false);
    };

    const handleScrollResize = () => {
      updateCoords();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollResize, true);
    window.addEventListener("resize", handleScrollResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [isOpen]);

  const filteredCurrencies = ALL_WORLD_CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.includes(search)
  );

  return (
    <div className="relative font-sans">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full py-3 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:border-slate-700 ${className}`}
      >
        <span className="flex items-center gap-2 truncate">
          <span className="text-base leading-none">{selectedItem.flag}</span>
          <span className="font-extrabold text-white">{selectedItem.value}</span>
          <span className="text-slate-400 font-medium truncate">— {selectedItem.name}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
      </button>

      {/* Portal Dropdown Menu attached to document.body */}
      {isOpen && isMounted && coords && createPortal(
        <div
          id="currency-selector-portal-menu"
          style={{ top: `${coords.top}px`, left: `${coords.left}px`, width: `${coords.width}px` }}
          className="fixed bg-[#141A26] border border-slate-800 rounded-2xl shadow-2xl z-[999999] overflow-hidden flex flex-col max-h-72 font-sans text-white animate-in fade-in duration-100"
        >
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-900/90">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 150+ world currencies (e.g. USD, Rupee, Euro)..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                autoFocus
              />
            </div>
          </div>

          {/* Currencies List */}
          <div className="overflow-y-auto flex-1 p-1 divide-y divide-slate-800/40">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((c) => (
                <button
                  key={`${c.code}-${c.name}`}
                  type="button"
                  onClick={() => {
                    onChange(c.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                    selectedItem.code === c.code
                      ? "bg-[#FF6B00]/20 font-bold text-[#FF6B00]"
                      : "hover:bg-slate-900 text-slate-300 font-medium"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-base">{c.flag}</span>
                    <span className="font-extrabold text-white">{c.value}</span>
                    <span className="text-slate-400 truncate">— {c.name}</span>
                  </span>
                  <span className="text-slate-500 font-semibold text-[10px] uppercase ml-2 shrink-0">
                    {c.country}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching currency found
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
