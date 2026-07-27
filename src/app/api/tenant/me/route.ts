import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paramEmail = searchParams.get("email");

    // 1. Check Supabase auth user
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = paramEmail || user?.email || "";

    if (!userEmail) {
      return NextResponse.json({
        success: true,
        data: {
          id: "demo-tenant-id",
          name: user?.user_metadata?.fullName || "Eleanor Vance",
          email: "resident@rentawas.com",
          phone: "+1 (555) 019-2834",
          healthScore: 85,
          monthlyRent: 3200,
          securityDeposit: 3200,
          leaseStart: "2026-01-01",
          leaseEnd: "2026-12-31",
          unitNumber: "Unit 302",
          propertyName: "The Regent",
          propertyAddress: "1420 5th Ave, Seattle WA",
          bills: [],
          maintenances: [],
          documents: [],
        },
      });
    }

    // 2. Locate Tenant in Prisma DB by email or profileId
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { email: { equals: userEmail, mode: "insensitive" } },
          { profile: { email: { equals: userEmail, mode: "insensitive" } } },
          ...(user?.id ? [{ profileId: user.id }] : []),
        ],
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        property: true,
        bills: {
          orderBy: { createdAt: "desc" },
        },
        maintenances: {
          orderBy: { createdAt: "desc" },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const tenantName = tenant?.name || user?.user_metadata?.fullName || userEmail.split("@")[0];
    const unitNumber = tenant?.unit?.unitNumber || "Unit 302";
    const propertyName = tenant?.unit?.property?.name || tenant?.property?.name || "The Regent";
    const propertyAddress = tenant?.unit?.property?.address || tenant?.property?.address || "1420 5th Ave, Seattle WA";
    const rentAmount = tenant?.monthlyRent || tenant?.unit?.rent || 3200;

    return NextResponse.json({
      success: true,
      data: {
        id: tenant?.id || "demo-tenant-id",
        name: tenantName,
        email: tenant?.email || userEmail,
        phone: tenant?.phone || "+1 (555) 019-2834",
        healthScore: tenant?.healthScore || 85,
        monthlyRent: rentAmount,
        securityDeposit: tenant?.securityDeposit || rentAmount,
        leaseStart: tenant?.leaseStart ? new Date(tenant.leaseStart).toISOString().split("T")[0] : "2026-01-01",
        leaseEnd: tenant?.leaseEnd ? new Date(tenant.leaseEnd).toISOString().split("T")[0] : "2026-12-31",
        unitId: tenant?.unitId || null,
        propertyId: tenant?.propertyId || tenant?.unit?.propertyId || null,
        workspaceId: tenant?.workspaceId || null,
        unitNumber,
        propertyName,
        propertyAddress,
        currentStatus: tenant?.currentStatus || "Current",
        bills: tenant?.bills || [],
        maintenances: tenant?.maintenances || [],
        documents: tenant?.documents || [],
      },
    });
  } catch (error: any) {
    console.error("GET /api/tenant/me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant profile", details: error?.message },
      { status: 500 }
    );
  }
}
