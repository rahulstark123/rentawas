"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Phone, ChevronDown, Check, Search, AlertCircle } from "lucide-react";

export interface Country {
  code: string;       // ISO 2-letter code e.g. "US"
  name: string;       // "United States"
  dialCode: string;   // "+1"
  flag: string;       // "🇺🇸"
  minDigits: number;  // 10
  maxDigits: number;  // 10
  placeholder: string; // "(555) 000-0000"
}

export const ALL_COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan", dialCode: "+93", flag: "🇦🇫", minDigits: 9, maxDigits: 9, placeholder: "70 123 4567" },
  { code: "AL", name: "Albania", dialCode: "+355", flag: "🇦🇱", minDigits: 9, maxDigits: 9, placeholder: "67 123 4567" },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: "🇩🇿", minDigits: 9, maxDigits: 9, placeholder: "551 23 45 67" },
  { code: "AS", name: "American Samoa", dialCode: "+1-684", flag: "🇦🇸", minDigits: 7, maxDigits: 7, placeholder: "633 1234" },
  { code: "AD", name: "Andorra", dialCode: "+376", flag: "🇦🇩", minDigits: 6, maxDigits: 6, placeholder: "312 345" },
  { code: "AO", name: "Angola", dialCode: "+244", flag: "🇦🇴", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { code: "AI", name: "Anguilla", dialCode: "+1-264", flag: "🇦🇮", minDigits: 7, maxDigits: 7, placeholder: "497 1234" },
  { code: "AG", name: "Antigua and Barbuda", dialCode: "+1-268", flag: "🇦🇬", minDigits: 7, maxDigits: 7, placeholder: "464 1234" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷", minDigits: 10, maxDigits: 10, placeholder: "9 11 1234-5678" },
  { code: "AM", name: "Armenia", dialCode: "+374", flag: "🇦🇲", minDigits: 8, maxDigits: 8, placeholder: "77 123456" },
  { code: "AW", name: "Aruba", dialCode: "+297", flag: "🇦🇼", minDigits: 7, maxDigits: 7, placeholder: "560 1234" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺", minDigits: 9, maxDigits: 9, placeholder: "412 345 678" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹", minDigits: 10, maxDigits: 11, placeholder: "664 1234567" },
  { code: "AZ", name: "Azerbaijan", dialCode: "+994", flag: "🇦🇿", minDigits: 9, maxDigits: 9, placeholder: "50 123 45 67" },
  { code: "BS", name: "Bahamas", dialCode: "+1-242", flag: "🇧🇸", minDigits: 7, maxDigits: 7, placeholder: "357 1234" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭", minDigits: 8, maxDigits: 8, placeholder: "3600 1234" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩", minDigits: 10, maxDigits: 10, placeholder: "1712-345678" },
  { code: "BB", name: "Barbados", dialCode: "+1-246", flag: "🇧🇧", minDigits: 7, maxDigits: 7, placeholder: "230 1234" },
  { code: "BY", name: "Belarus", dialCode: "+375", flag: "🇧🇾", minDigits: 9, maxDigits: 9, placeholder: "29 123-45-67" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪", minDigits: 9, maxDigits: 9, placeholder: "470 12 34 56" },
  { code: "BZ", name: "Belize", dialCode: "+501", flag: "🇧🇿", minDigits: 7, maxDigits: 7, placeholder: "610 1234" },
  { code: "BJ", name: "Benin", dialCode: "+229", flag: "🇧🇯", minDigits: 8, maxDigits: 8, placeholder: "90 01 23 45" },
  { code: "BM", name: "Bermuda", dialCode: "+1-441", flag: "🇧🇲", minDigits: 7, maxDigits: 7, placeholder: "295 1234" },
  { code: "BT", name: "Bhutan", dialCode: "+975", flag: "🇧🇹", minDigits: 8, maxDigits: 8, placeholder: "17 12 34 56" },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴", minDigits: 8, maxDigits: 8, placeholder: "71234567" },
  { code: "BA", name: "Bosnia & Herzegovina", dialCode: "+387", flag: "🇧🇦", minDigits: 8, maxDigits: 8, placeholder: "61 123 456" },
  { code: "BW", name: "Botswana", dialCode: "+267", flag: "🇧🇼", minDigits: 8, maxDigits: 8, placeholder: "71 234 567" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷", minDigits: 11, maxDigits: 11, placeholder: "11 91234-5678" },
  { code: "BN", name: "Brunei", dialCode: "+673", flag: "🇧🇳", minDigits: 7, maxDigits: 7, placeholder: "812 3456" },
  { code: "BG", name: "Bulgaria", dialCode: "+359", flag: "🇧🇬", minDigits: 9, maxDigits: 9, placeholder: "87 123 4567" },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", flag: "🇧🇫", minDigits: 8, maxDigits: 8, placeholder: "70 12 34 56" },
  { code: "BI", name: "Burundi", dialCode: "+257", flag: "🇧🇮", minDigits: 8, maxDigits: 8, placeholder: "79 00 00 00" },
  { code: "KH", name: "Cambodia", dialCode: "+855", flag: "🇰🇭", minDigits: 8, maxDigits: 9, placeholder: "12 345 678" },
  { code: "CM", name: "Cameroon", dialCode: "+237", flag: "🇨🇲", minDigits: 9, maxDigits: 9, placeholder: "6 71 23 45 67" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", minDigits: 10, maxDigits: 10, placeholder: "(555) 000-0000" },
  { code: "CV", name: "Cape Verde", dialCode: "+238", flag: "🇨🇻", minDigits: 7, maxDigits: 7, placeholder: "991 12 34" },
  { code: "KY", name: "Cayman Islands", dialCode: "+1-345", flag: "🇰🇾", minDigits: 7, maxDigits: 7, placeholder: "949 1234" },
  { code: "CF", name: "Central African Rep.", dialCode: "+236", flag: "🇨🇫", minDigits: 8, maxDigits: 8, placeholder: "75 01 23 45" },
  { code: "TD", name: "Chad", dialCode: "+235", flag: "🇹🇩", minDigits: 8, maxDigits: 8, placeholder: "66 12 34 56" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱", minDigits: 9, maxDigits: 9, placeholder: "9 1234 5678" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳", minDigits: 11, maxDigits: 11, placeholder: "138 1234 5678" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴", minDigits: 10, maxDigits: 10, placeholder: "300 123 4567" },
  { code: "KM", name: "Comoros", dialCode: "+269", flag: "🇰🇲", minDigits: 7, maxDigits: 7, placeholder: "321 12 34" },
  { code: "CG", name: "Congo (Brazzaville)", dialCode: "+242", flag: "🇨🇬", minDigits: 9, maxDigits: 9, placeholder: "06 123 4567" },
  { code: "CD", name: "Congo (Kinshasa)", dialCode: "+243", flag: "🇨🇩", minDigits: 9, maxDigits: 9, placeholder: "991 234 567" },
  { code: "CK", name: "Cook Islands", dialCode: "+682", flag: "🇨🇰", minDigits: 5, maxDigits: 5, placeholder: "21 234" },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷", minDigits: 8, maxDigits: 8, placeholder: "8312 3456" },
  { code: "HR", name: "Croatia", dialCode: "+385", flag: "🇭🇷", minDigits: 9, maxDigits: 9, placeholder: "91 234 5678" },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: "🇨🇺", minDigits: 8, maxDigits: 8, placeholder: "5 1234567" },
  { code: "CY", name: "Cyprus", dialCode: "+357", flag: "🇨🇾", minDigits: 8, maxDigits: 8, placeholder: "99 123456" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: "🇨🇿", minDigits: 9, maxDigits: 9, placeholder: "601 123 456" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰", minDigits: 8, maxDigits: 8, placeholder: "20 12 34 56" },
  { code: "DJ", name: "Djibouti", dialCode: "+253", flag: "🇩🇯", minDigits: 8, maxDigits: 8, placeholder: "77 12 34 56" },
  { code: "DM", name: "Dominica", dialCode: "+1-767", flag: "🇩🇲", minDigits: 7, maxDigits: 7, placeholder: "235 1234" },
  { code: "DO", name: "Dominican Republic", dialCode: "+1-809", flag: "🇩🇴", minDigits: 7, maxDigits: 7, placeholder: "220 1234" },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨", minDigits: 9, maxDigits: 9, placeholder: "99 123 4567" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬", minDigits: 10, maxDigits: 10, placeholder: "100 123 4567" },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: "🇸🇻", minDigits: 8, maxDigits: 8, placeholder: "7012 3456" },
  { code: "GQ", name: "Equatorial Guinea", dialCode: "+240", flag: "🇬🇶", minDigits: 9, maxDigits: 9, placeholder: "222 123 456" },
  { code: "ER", name: "Eritrea", dialCode: "+291", flag: "🇪🇷", minDigits: 7, maxDigits: 7, placeholder: "7 123 456" },
  { code: "EE", name: "Estonia", dialCode: "+372", flag: "🇪🇪", minDigits: 7, maxDigits: 8, placeholder: "5123 4567" },
  { code: "SZ", name: "Eswatini", dialCode: "+268", flag: "🇸🇿", minDigits: 8, maxDigits: 8, placeholder: "7612 3456" },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹", minDigits: 9, maxDigits: 9, placeholder: "91 123 4567" },
  { code: "FJ", name: "Fiji", dialCode: "+679", flag: "🇫🇯", minDigits: 7, maxDigits: 7, placeholder: "701 2345" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮", minDigits: 9, maxDigits: 10, placeholder: "40 1234567" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", minDigits: 9, maxDigits: 9, placeholder: "6 12 34 56 78" },
  { code: "GF", name: "French Guiana", dialCode: "+594", flag: "🇬🇫", minDigits: 9, maxDigits: 9, placeholder: "694 12 34 56" },
  { code: "PF", name: "French Polynesia", dialCode: "+689", flag: "🇵🇫", minDigits: 8, maxDigits: 8, placeholder: "87 12 34 56" },
  { code: "GA", name: "Gabon", dialCode: "+241", flag: "🇬🇦", minDigits: 7, maxDigits: 8, placeholder: "06 12 34 56" },
  { code: "GM", name: "Gambia", dialCode: "+220", flag: "🇬🇲", minDigits: 7, maxDigits: 7, placeholder: "701 2345" },
  { code: "GE", name: "Georgia", dialCode: "+995", flag: "🇬🇪", minDigits: 9, maxDigits: 9, placeholder: "599 12 34 56" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", minDigits: 10, maxDigits: 11, placeholder: "151 23456789" },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭", minDigits: 9, maxDigits: 9, placeholder: "24 123 4567" },
  { code: "GI", name: "Gibraltar", dialCode: "+350", flag: "🇬🇮", minDigits: 8, maxDigits: 8, placeholder: "57000000" },
  { code: "GR", name: "Greece", dialCode: "+30", flag: "🇬🇷", minDigits: 10, maxDigits: 10, placeholder: "691 234 5678" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", minDigits: 10, maxDigits: 10, placeholder: "98765 43210" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩", minDigits: 10, maxDigits: 11, placeholder: "812-3456-7890" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪", minDigits: 9, maxDigits: 9, placeholder: "87 123 4567" },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱", minDigits: 9, maxDigits: 9, placeholder: "50-123-4567" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹", minDigits: 10, maxDigits: 10, placeholder: "312 345 6789" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", minDigits: 10, maxDigits: 10, placeholder: "90-1234-5678" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽", minDigits: 10, maxDigits: 10, placeholder: "55 1234 5678" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿", minDigits: 9, maxDigits: 9, placeholder: "21 123 4567" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", minDigits: 8, maxDigits: 8, placeholder: "8123 4567" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦", minDigits: 9, maxDigits: 9, placeholder: "82 123 4567" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸", minDigits: 9, maxDigits: 9, placeholder: "612 34 56 78" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", minDigits: 10, maxDigits: 10, placeholder: "7911 123456" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", minDigits: 10, maxDigits: 10, placeholder: "(555) 000-0000" },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
}

export default function CountryPhoneInput({
  value,
  onChange,
  selectedCountry,
  onCountryChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown on outside click or scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      const portalDropdown = document.getElementById("country-phone-input-portal-menu");
      if (portalDropdown && portalDropdown.contains(target)) return;
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

  // Filter countries by name, code or dialCode
  const filteredCountries = ALL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  // Clean raw digit count for validation
  const digitsOnly = value.replace(/\D/g, "");
  const hasValue = digitsOnly.length > 0;
  const isValid =
    hasValue &&
    digitsOnly.length >= selectedCountry.minDigits &&
    digitsOnly.length <= selectedCountry.maxDigits;
  const isShort =
    hasValue && digitsOnly.length < selectedCountry.minDigits;
  const isLong =
    hasValue && digitsOnly.length > selectedCountry.maxDigits;

  return (
    <div className="space-y-1.5 font-sans">
      <div className="flex gap-2 relative">
        {/* Country Selector Dropdown Trigger */}
        <div>
          <button
            ref={triggerRef}
            type="button"
            onClick={handleToggle}
            className="h-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span>{selectedCountry.dialCode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Mobile Input Field */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={selectedCountry.placeholder}
            className={`w-full pl-10 pr-9 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              isValid
                ? "border-emerald-400 focus:ring-emerald-400/20 focus:border-emerald-500"
                : isShort || isLong
                ? "border-amber-400 focus:ring-amber-400/20 focus:border-amber-500"
                : "border-slate-200 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
            }`}
          />

          {/* Validation Status Indicator */}
          {isValid && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-500">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Validation Helper Message */}
      {hasValue && (
        <div className="text-[11px] font-medium transition-all">
          {isValid ? (
            <p className="text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Valid phone number format for {selectedCountry.name}
            </p>
          ) : isShort ? (
            <p className="text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Number too short (expected {selectedCountry.minDigits} digits)
            </p>
          ) : isLong ? (
            <p className="text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Number too long (expected max {selectedCountry.maxDigits} digits)
            </p>
          ) : null}
        </div>
      )}

      {/* Portal Dropdown Menu attached directly to document.body */}
      {isOpen && isMounted && coords && createPortal(
        <div
          id="country-phone-input-portal-menu"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          className="fixed w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[999999] overflow-hidden flex flex-col max-h-72 font-sans animate-in fade-in duration-100"
        >
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search from 200+ countries or codes..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                autoFocus
              />
            </div>
          </div>

          {/* Country Items List */}
          <div className="overflow-y-auto flex-1 p-1 divide-y divide-slate-50">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={`${country.code}-${country.dialCode}`}
                  type="button"
                  onClick={() => {
                    onCountryChange(country);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                    selectedCountry.code === country.code
                      ? "bg-orange-50 font-bold text-[#FF6B00]"
                      : "hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-base">{country.flag}</span>
                    <span className="truncate">{country.name}</span>
                  </span>
                  <span className="text-slate-400 font-semibold ml-2 shrink-0 font-mono">
                    {country.dialCode}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No country matches found
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
