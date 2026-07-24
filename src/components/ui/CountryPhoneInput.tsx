"use client";

import { useState, useRef, useEffect } from "react";
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
  { code: "GL", name: "Greenland", dialCode: "+299", flag: "🇬🇱", minDigits: 6, maxDigits: 6, placeholder: "52 12 34" },
  { code: "GD", name: "Grenada", dialCode: "+1-473", flag: "🇬🇩", minDigits: 7, maxDigits: 7, placeholder: "403 1234" },
  { code: "GU", name: "Guam", dialCode: "+1-671", flag: "🇬🇺", minDigits: 7, maxDigits: 7, placeholder: "688 1234" },
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: "🇬🇹", minDigits: 8, maxDigits: 8, placeholder: "5123 4567" },
  { code: "GN", name: "Guinea", dialCode: "+224", flag: "🇬🇳", minDigits: 9, maxDigits: 9, placeholder: "621 12 34 56" },
  { code: "GW", name: "Guinea-Bissau", dialCode: "+245", flag: "🇬🇼", minDigits: 7, maxDigits: 7, placeholder: "955 123 456" },
  { code: "GY", name: "Guyana", dialCode: "+592", flag: "🇬🇾", minDigits: 7, maxDigits: 7, placeholder: "609 1234" },
  { code: "HT", name: "Haiti", dialCode: "+509", flag: "🇭🇹", minDigits: 8, maxDigits: 8, placeholder: "34 12 3456" },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: "🇭🇳", minDigits: 8, maxDigits: 8, placeholder: "9123-4567" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", flag: "🇭🇰", minDigits: 8, maxDigits: 8, placeholder: "9123 4567" },
  { code: "HU", name: "Hungary", dialCode: "+36", flag: "🇭🇺", minDigits: 9, maxDigits: 9, placeholder: "20 123 4567" },
  { code: "IS", name: "Iceland", dialCode: "+354", flag: "🇮🇸", minDigits: 7, maxDigits: 7, placeholder: "612 3456" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", minDigits: 10, maxDigits: 10, placeholder: "98765 43210" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩", minDigits: 10, maxDigits: 12, placeholder: "812-3456-7890" },
  { code: "IR", name: "Iran", dialCode: "+98", flag: "🇮🇷", minDigits: 10, maxDigits: 10, placeholder: "912 345 6789" },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: "🇮🇶", minDigits: 10, maxDigits: 10, placeholder: "790 123 4567" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪", minDigits: 9, maxDigits: 9, placeholder: "83 123 4567" },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱", minDigits: 9, maxDigits: 9, placeholder: "50-123-4567" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹", minDigits: 10, maxDigits: 10, placeholder: "312 345 6789" },
  { code: "JM", name: "Jamaica", dialCode: "+1-876", flag: "🇯🇲", minDigits: 7, maxDigits: 7, placeholder: "555 1234" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", minDigits: 10, maxDigits: 10, placeholder: "90 1234 5678" },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴", minDigits: 9, maxDigits: 9, placeholder: "7 9012 3456" },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7", flag: "🇰🇿", minDigits: 10, maxDigits: 10, placeholder: "701 123 4567" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪", minDigits: 9, maxDigits: 9, placeholder: "712 345678" },
  { code: "KI", name: "Kiribati", dialCode: "+686", flag: "🇰🇮", minDigits: 8, maxDigits: 8, placeholder: "7201 2345" },
  { code: "KR", name: "Korea (South)", dialCode: "+82", flag: "🇰🇷", minDigits: 9, maxDigits: 10, placeholder: "10-1234-5678" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼", minDigits: 8, maxDigits: 8, placeholder: "9123 4567" },
  { code: "KG", name: "Kyrgyzstan", dialCode: "+996", flag: "🇰🇬", minDigits: 9, maxDigits: 9, placeholder: "700 123 456" },
  { code: "LA", name: "Laos", dialCode: "+856", flag: "🇱🇦", minDigits: 9, maxDigits: 10, placeholder: "20 23 456 789" },
  { code: "LV", name: "Latvia", dialCode: "+371", flag: "🇱🇻", minDigits: 8, maxDigits: 8, placeholder: "21 234 567" },
  { code: "LB", name: "Lebanon", dialCode: "+961", flag: "🇱🇧", minDigits: 7, maxDigits: 8, placeholder: "71 123 456" },
  { code: "LS", name: "Lesotho", dialCode: "+266", flag: "🇱🇸", minDigits: 8, maxDigits: 8, placeholder: "5812 3456" },
  { code: "LR", name: "Liberia", dialCode: "+231", flag: "🇱🇷", minDigits: 8, maxDigits: 8, placeholder: "77 012 3456" },
  { code: "LY", name: "Libya", dialCode: "+218", flag: "🇱🇾", minDigits: 9, maxDigits: 9, placeholder: "91 123 4567" },
  { code: "LI", name: "Liechtenstein", dialCode: "+423", flag: "🇱🇮", minDigits: 7, maxDigits: 7, placeholder: "663 12 34" },
  { code: "LT", name: "Lithuania", dialCode: "+370", flag: "🇱🇹", minDigits: 8, maxDigits: 8, placeholder: "612 34567" },
  { code: "LU", name: "Luxembourg", dialCode: "+352", flag: "🇱🇺", minDigits: 9, maxDigits: 9, placeholder: "621 123 456" },
  { code: "MO", name: "Macao", dialCode: "+853", flag: "🇲🇴", minDigits: 8, maxDigits: 8, placeholder: "6612 3456" },
  { code: "MG", name: "Madagascar", dialCode: "+261", flag: "🇲🇬", minDigits: 9, maxDigits: 9, placeholder: "32 12 345 67" },
  { code: "MW", name: "Malawi", dialCode: "+265", flag: "🇲🇼", minDigits: 9, maxDigits: 9, placeholder: "991 23 45 67" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", minDigits: 9, maxDigits: 10, placeholder: "12-345 6789" },
  { code: "MV", name: "Maldives", dialCode: "+960", flag: "🇲🇻", minDigits: 7, maxDigits: 7, placeholder: "712-3456" },
  { code: "ML", name: "Mali", dialCode: "+223", flag: "🇲🇱", minDigits: 8, maxDigits: 8, placeholder: "65 12 34 56" },
  { code: "MT", name: "Malta", dialCode: "+356", flag: "🇲🇹", minDigits: 8, maxDigits: 8, placeholder: "9912 3456" },
  { code: "MH", name: "Marshall Islands", dialCode: "+692", flag: "🇲🇭", minDigits: 7, maxDigits: 7, placeholder: "247 1234" },
  { code: "MQ", name: "Martinique", dialCode: "+596", flag: "🇲🇶", minDigits: 9, maxDigits: 9, placeholder: "696 12 34 56" },
  { code: "MR", name: "Mauritania", dialCode: "+222", flag: "🇲🇷", minDigits: 8, maxDigits: 8, placeholder: "22 12 34 56" },
  { code: "MU", name: "Mauritius", dialCode: "+230", flag: "🇲🇺", minDigits: 8, maxDigits: 8, placeholder: "5123 4567" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽", minDigits: 10, maxDigits: 10, placeholder: "55 1234 5678" },
  { code: "FM", name: "Micronesia", dialCode: "+691", flag: "🇫🇲", minDigits: 7, maxDigits: 7, placeholder: "920 1234" },
  { code: "MD", name: "Moldova", dialCode: "+373", flag: "🇲🇩", minDigits: 8, maxDigits: 8, placeholder: "691 23 456" },
  { code: "MC", name: "Monaco", dialCode: "+377", flag: "🇲🇨", minDigits: 8, maxDigits: 8, placeholder: "6 12 34 56 78" },
  { code: "MN", name: "Mongolia", dialCode: "+976", flag: "🇲🇳", minDigits: 8, maxDigits: 8, placeholder: "8812 3456" },
  { code: "ME", name: "Montenegro", dialCode: "+382", flag: "🇲🇪", minDigits: 8, maxDigits: 8, placeholder: "67 123 456" },
  { code: "MS", name: "Montserrat", dialCode: "+1-664", flag: "🇲🇸", minDigits: 7, maxDigits: 7, placeholder: "491 1234" },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: "🇲🇦", minDigits: 9, maxDigits: 9, placeholder: "612-345678" },
  { code: "MZ", name: "Mozambique", dialCode: "+258", flag: "🇲🇿", minDigits: 9, maxDigits: 9, placeholder: "82 123 4567" },
  { code: "MM", name: "Myanmar", dialCode: "+95", flag: "🇲🇲", minDigits: 8, maxDigits: 9, placeholder: "9 123 456 78" },
  { code: "NA", name: "Namibia", dialCode: "+264", flag: "🇳🇦", minDigits: 9, maxDigits: 9, placeholder: "81 123 4567" },
  { code: "NR", name: "Nauru", dialCode: "+674", flag: "🇳🇷", minDigits: 7, maxDigits: 7, placeholder: "555 1234" },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵", minDigits: 10, maxDigits: 10, placeholder: "980 1234567" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱", minDigits: 9, maxDigits: 9, placeholder: "6 12345678" },
  { code: "NC", name: "New Caledonia", dialCode: "+687", flag: "🇳🇨", minDigits: 6, maxDigits: 6, placeholder: "75.12.34" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿", minDigits: 8, maxDigits: 9, placeholder: "21 123 4567" },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: "🇳🇮", minDigits: 8, maxDigits: 8, placeholder: "8123 4567" },
  { code: "NE", name: "Niger", dialCode: "+227", flag: "🇳🇪", minDigits: 8, maxDigits: 8, placeholder: "93 12 34 56" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬", minDigits: 10, maxDigits: 10, placeholder: "802 123 4567" },
  { code: "MK", name: "North Macedonia", dialCode: "+389", flag: "🇲🇰", minDigits: 8, maxDigits: 8, placeholder: "70 123 456" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴", minDigits: 8, maxDigits: 8, placeholder: "412 34 567" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲", minDigits: 8, maxDigits: 8, placeholder: "9123 4567" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰", minDigits: 10, maxDigits: 10, placeholder: "301 1234567" },
  { code: "PW", name: "Palau", dialCode: "+680", flag: "🇵🇼", minDigits: 7, maxDigits: 7, placeholder: "775 1234" },
  { code: "PS", name: "Palestine", dialCode: "+970", flag: "🇵🇸", minDigits: 9, maxDigits: 9, placeholder: "599 123 456" },
  { code: "PA", name: "Panama", dialCode: "+507", flag: "🇵🇦", minDigits: 8, maxDigits: 8, placeholder: "6123-4567" },
  { code: "PG", name: "Papua New Guinea", dialCode: "+675", flag: "🇵🇬", minDigits: 8, maxDigits: 8, placeholder: "7012 3456" },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾", minDigits: 9, maxDigits: 9, placeholder: "981 123456" },
  { code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭", minDigits: 10, maxDigits: 10, placeholder: "917 123 4567" },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱", minDigits: 9, maxDigits: 9, placeholder: "512 345 678" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { code: "PR", name: "Puerto Rico", dialCode: "+1-787", flag: "🇵🇷", minDigits: 7, maxDigits: 7, placeholder: "787 1234" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦", minDigits: 8, maxDigits: 8, placeholder: "3312 3456" },
  { code: "RO", name: "Romania", dialCode: "+40", flag: "🇷🇴", minDigits: 9, maxDigits: 9, placeholder: "712 345 678" },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺", minDigits: 10, maxDigits: 10, placeholder: "912 345-67-89" },
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼", minDigits: 9, maxDigits: 9, placeholder: "788 123 456" },
  { code: "WS", name: "Samoa", dialCode: "+685", flag: "🇼🇸", minDigits: 7, maxDigits: 7, placeholder: "72 12345" },
  { code: "SM", name: "San Marino", dialCode: "+378", flag: "🇸🇲", minDigits: 10, maxDigits: 10, placeholder: "66 66 12 12" },
  { code: "ST", name: "Sao Tome & Principe", dialCode: "+239", flag: "🇸🇹", minDigits: 7, maxDigits: 7, placeholder: "981 2345" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { code: "SN", name: "Senegal", dialCode: "+221", flag: "🇸🇳", minDigits: 9, maxDigits: 9, placeholder: "77 123 45 67" },
  { code: "RS", name: "Serbia", dialCode: "+381", flag: "🇷🇸", minDigits: 9, maxDigits: 9, placeholder: "60 1234567" },
  { code: "SC", name: "Seychelles", dialCode: "+248", flag: "🇸🇨", minDigits: 7, maxDigits: 7, placeholder: "2 51 23 45" },
  { code: "SL", name: "Sierra Leone", dialCode: "+232", flag: "🇸🇱", minDigits: 8, maxDigits: 8, placeholder: "76 123456" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", minDigits: 8, maxDigits: 8, placeholder: "8123 4567" },
  { code: "SK", name: "Slovakia", dialCode: "+421", flag: "🇸🇰", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { code: "SI", name: "Slovenia", dialCode: "+386", flag: "🇸🇮", minDigits: 8, maxDigits: 8, placeholder: "41 234 567" },
  { code: "SB", name: "Solomon Islands", dialCode: "+677", flag: "🇸🇧", minDigits: 7, maxDigits: 7, placeholder: "74 12345" },
  { code: "SO", name: "Somalia", dialCode: "+252", flag: "🇸🇴", minDigits: 8, maxDigits: 9, placeholder: "61 2345678" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦", minDigits: 9, maxDigits: 9, placeholder: "82 123 4567" },
  { code: "SS", name: "South Sudan", dialCode: "+211", flag: "🇸🇸", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸", minDigits: 9, maxDigits: 9, placeholder: "612 34 56 78" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰", minDigits: 9, maxDigits: 9, placeholder: "71 234 5678" },
  { code: "SD", name: "Sudan", dialCode: "+249", flag: "🇸🇩", minDigits: 9, maxDigits: 9, placeholder: "91 234 5678" },
  { code: "SR", name: "Suriname", dialCode: "+597", flag: "🇸🇷", minDigits: 7, maxDigits: 7, placeholder: "812-3456" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪", minDigits: 9, maxDigits: 9, placeholder: "70 123 45 67" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭", minDigits: 9, maxDigits: 9, placeholder: "79 123 45 67" },
  { code: "SY", name: "Syria", dialCode: "+963", flag: "🇸🇾", minDigits: 9, maxDigits: 9, placeholder: "933 123 456" },
  { code: "TW", name: "Taiwan", dialCode: "+886", flag: "🇹🇼", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { code: "TJ", name: "Tajikistan", dialCode: "+992", flag: "🇹🇯", minDigits: 9, maxDigits: 9, placeholder: "91 812 3456" },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿", minDigits: 9, maxDigits: 9, placeholder: "712 345 678" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭", minDigits: 9, maxDigits: 9, placeholder: "81 234 5678" },
  { code: "TL", name: "Timor-Leste", dialCode: "+670", flag: "🇹🇱", minDigits: 8, maxDigits: 8, placeholder: "7712 3456" },
  { code: "TG", name: "Togo", dialCode: "+228", flag: "🇹🇬", minDigits: 8, maxDigits: 8, placeholder: "90 12 34 56" },
  { code: "TO", name: "Tonga", dialCode: "+676", flag: "🇹🇴", minDigits: 5, maxDigits: 7, placeholder: "771 2345" },
  { code: "TT", name: "Trinidad & Tobago", dialCode: "+1-868", flag: "🇹🇹", minDigits: 7, maxDigits: 7, placeholder: "620 1234" },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: "🇹🇳", minDigits: 8, maxDigits: 8, placeholder: "20 123 456" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷", minDigits: 10, maxDigits: 10, placeholder: "501 123 45 67" },
  { code: "TM", name: "Turkmenistan", dialCode: "+993", flag: "🇹🇲", minDigits: 8, maxDigits: 8, placeholder: "65 123456" },
  { code: "TC", name: "Turks & Caicos", dialCode: "+1-649", flag: "🇹🇨", minDigits: 7, maxDigits: 7, placeholder: "231 1234" },
  { code: "TV", name: "Tuvalu", dialCode: "+688", flag: "🇹🇻", minDigits: 5, maxDigits: 5, placeholder: "90123" },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬", minDigits: 9, maxDigits: 9, placeholder: "772 123456" },
  { code: "UA", name: "Ukraine", dialCode: "+380", flag: "🇺🇦", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", minDigits: 10, maxDigits: 10, placeholder: "7911 123456" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", minDigits: 10, maxDigits: 10, placeholder: "(555) 000-0000" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾", minDigits: 8, maxDigits: 8, placeholder: "99 123 456" },
  { code: "UZ", name: "Uzbekistan", dialCode: "+998", flag: "🇺🇿", minDigits: 9, maxDigits: 9, placeholder: "90 123 45 67" },
  { code: "VU", name: "Vanuatu", dialCode: "+678", flag: "🇻🇺", minDigits: 7, maxDigits: 7, placeholder: "591 2345" },
  { code: "VA", name: "Vatican City", dialCode: "+39", flag: "🇻🇦", minDigits: 10, maxDigits: 10, placeholder: "312 345 6789" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪", minDigits: 10, maxDigits: 10, placeholder: "412-1234567" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳", minDigits: 9, maxDigits: 10, placeholder: "91 234 56 78" },
  { code: "VG", name: "Virgin Islands (UK)", dialCode: "+1-284", flag: "🇻🇬", minDigits: 7, maxDigits: 7, placeholder: "496 1234" },
  { code: "VI", name: "Virgin Islands (US)", dialCode: "+1-340", flag: "🇻🇮", minDigits: 7, maxDigits: 7, placeholder: "690 1234" },
  { code: "YE", name: "Yemen", dialCode: "+967", flag: "🇾🇪", minDigits: 9, maxDigits: 9, placeholder: "771 234 567" },
  { code: "ZM", name: "Zambia", dialCode: "+260", flag: "🇿🇲", minDigits: 9, maxDigits: 9, placeholder: "97 1234567" },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", flag: "🇿🇼", minDigits: 9, maxDigits: 9, placeholder: "71 234 5678" },
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex gap-2 relative z-30">
        {/* Country Selector Dropdown Trigger */}
        <div className="relative z-50">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span>{selectedCountry.dialCode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Searchable Country Picker Dropdown Overlay */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-72">
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
            </div>
          )}
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
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          )}
        </div>
      </div>

      {/* Validation Helper Message */}
      {hasValue && (
        <div className="text-[11px] font-medium transition-all">
          {isValid ? (
            <span className="text-emerald-600 flex items-center gap-1">
              Valid phone number for {selectedCountry.name} ({digitsOnly.length} digits)
            </span>
          ) : isShort ? (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Expected {selectedCountry.minDigits === selectedCountry.maxDigits ? selectedCountry.minDigits : `${selectedCountry.minDigits}-${selectedCountry.maxDigits}`} digits for {selectedCountry.name} ({digitsOnly.length} entered)
            </span>
          ) : isLong ? (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Maximum {selectedCountry.maxDigits} digits for {selectedCountry.name}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
