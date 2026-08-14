import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();
    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json({ error: "Identifier required" }, { status: 400 });
    }

    const cleanInput = identifier.trim();
    const rawDigits = cleanInput.replace(/\D/g, "");

    if (!rawDigits || rawDigits.length < 5) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // 1. Search Profile table
    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { phone: { contains: rawDigits } },
          { phone: { contains: cleanInput } },
        ],
      },
      select: { email: true, phone: true },
    });

    if (profile?.email) {
      return NextResponse.json({ success: true, email: profile.email, phone: profile.phone });
    }

    // 2. Search RentawasExpert table
    const expert = await (prisma as any).rentawasExpert.findFirst({
      where: {
        OR: [
          { phone: { contains: rawDigits } },
          { phone: { contains: cleanInput } },
        ],
      },
      select: { email: true, phone: true },
    });

    if (expert?.email) {
      return NextResponse.json({ success: true, email: expert.email, phone: expert.phone });
    }

    // 3. Search Tenant table
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { phone: { contains: rawDigits } },
          { phone: { contains: cleanInput } },
        ],
      },
      select: { email: true, phone: true },
    });

    if (tenant?.email) {
      return NextResponse.json({ success: true, email: tenant.email, phone: tenant.phone });
    }

    return NextResponse.json({ success: false, message: "User not found by phone" }, { status: 44 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Lookup failed" }, { status: 500 });
  }
}
