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

export const formatAmenityTag = (tag: string): string => {
  if (!tag) return "";
  const lower = tag.toLowerCase().trim();
  return AMENITY_LABELS[lower] || (tag.charAt(0).toUpperCase() + tag.slice(1));
};

export interface MarketplacePropertyItem {
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
  rating: number | string;
  reviewsCount: number;
  image: string;
  tags: string[];
  ownerName: string;
  ownerPhone: string;
  badge: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapListingToPropertyItem(item: any): MarketplacePropertyItem {
  return {
    id: item.id,
    title: item.title,
    location: item.locality || item.city || item.location || "Prime Location",
    city: item.city || item.stateName || "Metropolis",
    price:
      typeof item.rent === "number"
        ? `₹${item.rent.toLocaleString("en-IN")}`
        : item.rent || "₹0",
    type: item.propertyType || "Apartment",
    bhk: item.propertyType || "Apartment",
    sqft: item.sqft ?? null,
    deposit: item.deposit ?? null,
    size: item.sqft
      ? `${Number(item.sqft).toLocaleString("en-IN")} sq. ft.`
      : item.availableFrom || "Ready to Move",
    rating: item.avgRating ? Number(item.avgRating).toFixed(1) : 4.8,
    reviewsCount: item.reviewCount !== undefined ? item.reviewCount : 0,
    image:
      item.mainImage ||
      item.image ||
      item.coverImage ||
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    tags:
      Array.isArray(item.amenities) && item.amenities.length > 0
        ? item.amenities.slice(0, 3).map(formatAmenityTag)
        : ["Zero Fee", "Direct Owner", "Verified"],
    ownerName: item.contactPersonName
      ? `${item.contactPersonName} (Owner)`
      : "Property Landlord",
    ownerPhone: item.contactNumber || item.ownerPhone || "+91 Contact via RentAwas",
    badge: item.whatsappEnabled
      ? "Verified Owner • Direct WhatsApp"
      : "Verified Owner • Zero Fee",
  };
}
