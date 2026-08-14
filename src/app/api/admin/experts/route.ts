import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Seed fallback experts if database is empty or connecting
const SEED_EXPERTS = [
  {
    id: "EXP-HR-01",
    name: "Anil Kumar",
    trade: "Plumbing & Water Systems",
    specialization: "Pipeline Leak Detection & Sanitary Fittings",
    experience: "14+ Yrs Exp",
    email: "anil.kumar@rentawas.com",
    phone: "+91 98765 43210",
    govtIdType: "Aadhaar Card (12-Digit UIDAI)",
    govtId: "4912 8890 1234",
    currency: "INR (₹)",
    fee: 599,
    hourlyRate: 49,
    city: "Gurugram / NCR",
    address: "Workshop 14, Main Market, Sector 62, Gurgaon",
    pincode: "122011",
    workStartTime: "08:00 AM",
    workEndTime: "08:00 PM",
    workDays: "Mon-Sat",
    languages: JSON.stringify(["Hindi (हिंदी)", "English"]),
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    qrCodeUrl: "",
    bankHolder: "Anil Kumar",
    bankName: "HDFC Bank Ltd",
    customBankName: "",
    accountNo: "501002348912",
    ifsc: "HDFC0001234",
    upiId: "anil.kumar@okaxis",
    emergencyContactName: "Sunita Kumar (Wife)",
    emergencyContactPhone: "+91 98111 22334",
    bloodGroup: "O+ Positive",
    status: "Active & Verified",
    completedJobs: 142,
    totalGross: 85058,
    platformCut: 8505,
    rating: 4.9,
    createdAt: new Date().toISOString(),
  },
  {
    id: "EXP-DL-01",
    name: "Rajesh Sharma",
    trade: "Electrical & Appliance Repair",
    specialization: "Short Circuit & Main DB Panel Repair",
    experience: "11+ Yrs Exp",
    email: "rajesh.sharma@rentawas.com",
    phone: "+91 98123 45678",
    govtIdType: "PAN Card (Permanent Account Number)",
    govtId: "ABCPS9812K",
    currency: "INR (₹)",
    fee: 499,
    hourlyRate: 39,
    city: "South Delhi",
    address: "Shop 4, Lajpat Nagar Market, Delhi",
    pincode: "110024",
    workStartTime: "09:00 AM",
    workEndTime: "07:00 PM",
    workDays: "Mon-Sat",
    languages: JSON.stringify(["Hindi (हिंदी)", "Punjabi (ਪੰਜਾਬੀ)"]),
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    qrCodeUrl: "",
    bankHolder: "Rajesh Sharma",
    bankName: "ICICI Bank Ltd",
    customBankName: "",
    accountNo: "001102983412",
    ifsc: "ICIC0000011",
    upiId: "rajesh.sharma@icici",
    emergencyContactName: "Rekha Sharma (Wife)",
    emergencyContactPhone: "+91 98123 00011",
    bloodGroup: "B+ Positive",
    status: "Active & Verified",
    completedJobs: 98,
    totalGross: 48902,
    platformCut: 4890,
    rating: 4.8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "EXP-UP-01",
    name: "Sunita Devi",
    trade: "Househelp & Home Cleaning",
    specialization: "Deep Kitchen & Washroom Sanitization",
    experience: "9+ Yrs Exp",
    email: "sunita.devi@rentawas.com",
    phone: "+91 98999 11223",
    govtIdType: "Aadhaar Card (12-Digit UIDAI)",
    govtId: "8891 0012 3344",
    currency: "INR (₹)",
    fee: 399,
    hourlyRate: 29,
    city: "Noida / Greater Noida",
    address: "Block C, Sector 18, Noida",
    pincode: "201301",
    workStartTime: "07:00 AM",
    workEndTime: "06:00 PM",
    workDays: "Mon-Sun",
    languages: JSON.stringify(["Hindi (हिंदी)"]),
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    qrCodeUrl: "",
    bankHolder: "Sunita Devi",
    bankName: "State Bank of India (SBI)",
    customBankName: "",
    accountNo: "30891234901",
    ifsc: "SBIN0001890",
    upiId: "sunita.devi@oksbi",
    emergencyContactName: "Ramesh Devi (Brother)",
    emergencyContactPhone: "+91 98999 99887",
    bloodGroup: "A+ Positive",
    status: "Active & Verified",
    completedJobs: 115,
    totalGross: 45885,
    platformCut: 4588,
    rating: 4.9,
    createdAt: new Date().toISOString(),
  },
  {
    id: "EXP-DL-02",
    name: "Ramesh Chand",
    trade: "AC & HVAC Technician",
    specialization: "Inverter AC PCB Repair & Gas Refill",
    experience: "12+ Yrs Exp",
    email: "ramesh.chand@rentawas.com",
    phone: "+91 97111 88990",
    govtIdType: "Driving License (Transport Dept)",
    govtId: "DL0420110098123",
    currency: "INR (₹)",
    fee: 699,
    hourlyRate: 59,
    city: "West Delhi / Dwarka",
    address: "Plot 12, Sector 7, Dwarka, New Delhi",
    pincode: "110075",
    workStartTime: "08:00 AM",
    workEndTime: "09:00 PM",
    workDays: "Mon-Sat",
    languages: JSON.stringify(["Hindi (हिंदी)", "English"]),
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    qrCodeUrl: "",
    bankHolder: "Ramesh Chand",
    bankName: "Axis Bank Ltd",
    customBankName: "",
    accountNo: "918020038912",
    ifsc: "UTIB0000492",
    upiId: "ramesh.ac@axisbank",
    emergencyContactName: "Kavita Chand (Wife)",
    emergencyContactPhone: "+91 97111 00112",
    bloodGroup: "AB+ Positive",
    status: "Active & Verified",
    completedJobs: 86,
    totalGross: 60114,
    platformCut: 6011,
    rating: 4.7,
    createdAt: new Date().toISOString(),
  },
];

// GET: Fetch experts from database (Supports ?id=..., ?email=..., ?search=...)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterId = searchParams.get("id") || searchParams.get("expertId");
    const filterEmail = searchParams.get("email");
    const filterSearch = searchParams.get("search");

    let whereClause: any = {};
    if (filterId) {
      whereClause.id = filterId;
    } else if (filterEmail) {
      whereClause.email = filterEmail.trim().toLowerCase();
    } else if (filterSearch) {
      whereClause.OR = [
        { id: filterSearch },
        { email: filterSearch.trim().toLowerCase() },
        { name: { contains: filterSearch, mode: "insensitive" } },
      ];
    }

    let dbExperts: any[] = [];
    try {
      dbExperts = await (prisma as any).rentawasExpert.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        orderBy: { createdAt: "desc" },
      });
    } catch (e: any) {
      console.warn("DB query warning:", e?.message);
    }

    let rawList = dbExperts.length > 0 ? dbExperts : SEED_EXPERTS;

    if (filterId || filterEmail) {
      rawList = rawList.filter(
        (exp) =>
          (filterId && (exp.id === filterId || exp.id?.toLowerCase() === filterId.toLowerCase())) ||
          (filterEmail && exp.email?.toLowerCase() === filterEmail.toLowerCase())
      );
    }

    // Aggregate real ratings and review counts from DB bookings
    let statsMap: Record<string, { totalRating: number; ratingCount: number; completedCount: number }> = {};
    try {
      const allBookings = await (prisma as any).rentawasExpertBooking.findMany({});
      allBookings.forEach((b: any) => {
        const idKey = b.expertId;
        const nameKey = b.expertName;

        [idKey, nameKey].forEach((k) => {
          if (!k) return;
          if (!statsMap[k]) {
            statsMap[k] = { totalRating: 0, ratingCount: 0, completedCount: 0 };
          }
          if (b.status === "Completed") {
            statsMap[k].completedCount += 1;
          }
          if (b.isRated || b.userRating) {
            statsMap[k].totalRating += Number(b.userRating) || 5;
            statsMap[k].ratingCount += 1;
          }
        });
      });
    } catch (e) {
      console.warn("Booking aggregation warning:", e);
    }

    // Fetch latest availability override from DB if using SEED_EXPERTS fallback
    let globalAvail: any = null;
    if (dbExperts.length === 0) {
      try {
        globalAvail = await (prisma as any).rentawasExpert.findFirst({
          orderBy: { updatedAt: "desc" },
        });
      } catch (e) {}
    }

    const enrichedExperts = rawList.map((exp: any) => {
      const stats = statsMap[exp.id] || statsMap[exp.name] || { totalRating: 0, ratingCount: 0, completedCount: 0 };
      const avgRating = stats.ratingCount > 0
        ? (stats.totalRating / stats.ratingCount).toFixed(1)
        : (exp.rating != null ? Number(exp.rating).toFixed(1) : "5.0");
      const revCount = stats.ratingCount > 0 ? stats.ratingCount : (exp.completedJobs ?? 0);

      const isAvail = exp.isAvailable ?? (globalAvail ? globalAvail.isAvailable : true);
      const availStatus = isAvail === false ? "Offline / Busy" : (exp.status || "Active & Verified");

      return {
        ...exp,
        isAvailable: isAvail,
        status: availStatus,
        rating: Number(avgRating),
        reviewsCount: revCount,
        completedJobs: stats.completedCount > 0 ? stats.completedCount : (exp.completedJobs ?? 0),
      };
    });

    const sortedExperts = [...enrichedExperts].sort((a: any, b: any) => {
      const jobsDiff = (b.completedJobs || 0) - (a.completedJobs || 0);
      if (jobsDiff !== 0) return jobsDiff;
      const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (Number(b.reviewsCount) || 0) - (Number(a.reviewsCount) || 0);
    });

    return NextResponse.json({
      success: true,
      count: sortedExperts.length,
      experts: sortedExperts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch experts list." },
      { status: 500 }
    );
  }
}

// PATCH: Update expert profile details
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, email, ...updateData } = body;

    const where = id ? { id } : email ? { email: email.trim().toLowerCase() } : {};

    const updated = await (prisma as any).rentawasExpert.updateMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Expert profile updated successfully!",
      updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/experts error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update expert profile." },
      { status: 500 }
    );
  }
}
