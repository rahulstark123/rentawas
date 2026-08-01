import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (name.trim().substring(0, 2) || "PM").toUpperCase();
}

const TEAM_COLORS = [
  "bg-purple-600",
  "bg-emerald-600",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-rose-600",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paramEmail = searchParams.get("email");

    // 1. Check Supabase auth user
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
          owner: null,
          teamContacts: [],
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
        profile: true,
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

    const tenantName =
      tenant?.name || user?.user_metadata?.fullName || userEmail.split("@")[0];
    const unitNumber = tenant?.unit?.unitNumber || "Unit 302";
    const propertyName =
      tenant?.unit?.property?.name || tenant?.property?.name || "The Regent";
    const propertyAddress =
      tenant?.unit?.property?.address ||
      tenant?.property?.address ||
      "1420 5th Ave, Seattle WA";
    const rentAmount = tenant?.monthlyRent || tenant?.unit?.rent || 3200;

    // Resolve workspace from tenant, unit property, or property
    const workspaceId =
      tenant?.workspaceId ||
      tenant?.unit?.property?.workspaceId ||
      tenant?.property?.workspaceId ||
      null;

    let owner: {
      id: string;
      name: string;
      email: string;
      role: string;
      initials: string;
      color: string;
      online: boolean;
    } | null = null;
    let teamContacts: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      initials: string;
      color: string;
      online: boolean;
      isOwner: boolean;
    }> = [];

    if (workspaceId) {
      const workspace = await prisma.workspace.findUnique({
        where: { wid: workspaceId },
        include: { owner: true },
      });

      const teamMembers = await prisma.teamMember.findMany({
        where: { workspaceId, status: "Active" },
        orderBy: { createdAt: "asc" },
      });

      const ownerProfile = workspace?.owner;
      const ownerDisplayName =
        workspace?.landlordName?.trim() ||
        ownerProfile?.fullName?.trim() ||
        workspace?.name?.trim() ||
        "Property Owner";
      const ownerEmail = ownerProfile?.email || workspace?.companyEmail || "";
      const ownerRole =
        workspace?.landlordRole?.trim() || "Property Owner & Landlord";

      if (ownerProfile || ownerDisplayName) {
        owner = {
          id: ownerProfile?.id || `owner-${workspaceId}`,
          name: ownerDisplayName,
          email: ownerEmail,
          role: ownerRole,
          initials: getInitials(ownerDisplayName),
          color: "bg-[#FF6B00]",
          online: true,
        };
      }

      const ownerEmailLower = ownerEmail.toLowerCase();
      const contacts: typeof teamContacts = [];

      if (owner) {
        contacts.push({ ...owner, isOwner: true });
      }

      teamMembers.forEach((m, idx) => {
        const emailLower = (m.email || "").toLowerCase();
        // Skip duplicate if team member is the same person as workspace owner
        if (ownerEmailLower && emailLower && emailLower === ownerEmailLower) {
          return;
        }
        if (
          owner &&
          m.name.trim().toLowerCase() === owner.name.trim().toLowerCase() &&
          (m.role === "Owner" || m.role?.toLowerCase().includes("owner"))
        ) {
          return;
        }

        contacts.push({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role || "Team Member",
          initials: getInitials(m.name),
          color: TEAM_COLORS[idx % TEAM_COLORS.length],
          online: m.status === "Active",
          isOwner: m.role === "Owner",
        });
      });

      teamContacts = contacts;
    }

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
        leaseStart: tenant?.leaseStart
          ? new Date(tenant.leaseStart).toISOString().split("T")[0]
          : "2026-01-01",
        leaseEnd: tenant?.leaseEnd
          ? new Date(tenant.leaseEnd).toISOString().split("T")[0]
          : "2026-12-31",
        unitId: tenant?.unitId || null,
        propertyId: tenant?.propertyId || tenant?.unit?.propertyId || null,
        workspaceId,
        profileId: tenant?.profileId || tenant?.profile?.id || user?.id || null,
        unitNumber,
        propertyName,
        propertyAddress,
        currentStatus: tenant?.currentStatus || "Current",
        govIdUrl: tenant?.govIdUrl || null,
        govIdType: tenant?.govIdType || null,
        govIdNumber: tenant?.govIdNumber || null,
        leaseDocUrl: tenant?.leaseDocUrl || null,
        bills: tenant?.bills || [],
        maintenances: tenant?.maintenances || [],
        documents: tenant?.documents || [],
        owner,
        teamContacts,
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
