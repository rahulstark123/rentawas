/**
 * Utility to map Indian states / cities to 2-letter state acronyms.
 * Example: Delhi -> DL, Haryana -> HR, Uttar Pradesh -> UP, Maharashtra -> MH, Karnataka -> KA
 */
export function getStateAcronym(location: string = ""): string {
  if (!location) return "DL";
  const str = location.toUpperCase().trim();

  if (str.includes("DELHI") || str.includes("NCR") || str.includes("DL")) return "DL";
  if (str.includes("HARYANA") || str.includes("GURGAON") || str.includes("GURUGRAM") || str.includes("FARIDABAD") || str.includes("HR")) return "HR";
  if (str.includes("UTTAR PRADESH") || str.includes("NOIDA") || str.includes("GHAZIABAD") || str.includes("LUCKNOW") || str.includes("KANPUR") || str.includes("UP")) return "UP";
  if (str.includes("MAHARASHTRA") || str.includes("MUMBAI") || str.includes("PUNE") || str.includes("MH")) return "MH";
  if (str.includes("KARNATAKA") || str.includes("BANGALORE") || str.includes("BENGALURU") || str.includes("KA")) return "KA";
  if (str.includes("TAMIL NADU") || str.includes("CHENNAI") || str.includes("TN")) return "TN";
  if (str.includes("TELANGANA") || str.includes("HYDERABAD") || str.includes("TS") || str.includes("TG")) return "TG";
  if (str.includes("WEST BENGAL") || str.includes("KOLKATA") || str.includes("WB")) return "WB";
  if (str.includes("GUJARAT") || str.includes("AHMEDABAD") || str.includes("GJ")) return "GJ";
  if (str.includes("RAJASTHAN") || str.includes("JAIPUR") || str.includes("RJ")) return "RJ";
  if (str.includes("PUNJAB") || str.includes("PB")) return "PB";
  if (str.includes("BIHAR") || str.includes("PATNA") || str.includes("BR")) return "BR";
  if (str.includes("KERALA") || str.includes("KOCHI") || str.includes("KL")) return "KL";
  if (str.includes("MADHYA PRADESH") || str.includes("BHOPAL") || str.includes("MP")) return "MP";

  const letters = str.replace(/[^A-Z]/g, "");
  if (letters.length >= 2) return letters.slice(0, 2);
  return "DL";
}

/**
 * Generates custom State-wise Expert ID format: EXP-{STATE}-{SEQ}
 * Example: EXP-DL-01, EXP-DL-02, EXP-HR-01, EXP-UP-01
 */
export function generateExpertId(stateCode: string, sequenceNumber: number): string {
  const seqStr = String(sequenceNumber).padStart(2, "0");
  return `EXP-${stateCode.toUpperCase()}-${seqStr}`;
}
