import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasActiveRentPaymentChannels } from "@/lib/paymentMethods";
import { resolveTenantWorkspaceId } from "@/lib/tenantWorkspace";

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
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userEmail = paramEmail || user?.email || "";

    if (!userEmail) {
      return NextResponse.json({
        success: true,
        data: {
          id: "guest-tenant-id",
          name: "Guest Resident",
          email: "",
          phone: "",
          healthScore: 100,
          monthlyRent: 0,
          securityDeposit: 0,
          hasAssignedLease: false,
          leaseStart: null,
          leaseEnd: null,
          unitNumber: "",
          propertyName: "",
          propertyAddress: "",
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

    const hasAssignedLease = !!(
      tenant &&
      (tenant.unitId || tenant.propertyId || tenant.unit?.unitNumber || tenant.property?.name || tenant.monthlyRent)
    );

    const tenantName =
      tenant?.name ||
      tenant?.profile?.fullName ||
      user?.user_metadata?.fullName ||
      user?.user_metadata?.name ||
      userEmail.split("@")[0] ||
      "Resident";

    const unitNumber = tenant?.unit?.unitNumber || "";
    const propertyName =
      tenant?.unit?.property?.name || tenant?.property?.name || "";
    const propertyAddress =
      tenant?.unit?.property?.address ||
      tenant?.property?.address ||
      "";
    const rentAmount = tenant?.monthlyRent || tenant?.unit?.rent || 0;

    const workspaceId = resolveTenantWorkspaceId(tenant);

    let paymentChannelsActive = false;

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

      paymentChannelsActive = hasActiveRentPaymentChannels(workspace);

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
        id: tenant?.id || user?.id || "tenant-id",
        name: tenantName,
        email: tenant?.email || userEmail,
        phone: tenant?.phone || user?.user_metadata?.phone || "",
        healthScore: tenant?.healthScore || 100,
        monthlyRent: rentAmount,
        securityDeposit: tenant?.securityDeposit || rentAmount,
        hasAssignedLease,
        leaseStart: tenant?.leaseStart
          ? new Date(tenant.leaseStart).toISOString().split("T")[0]
          : null,
        leaseEnd: tenant?.leaseEnd
          ? new Date(tenant.leaseEnd).toISOString().split("T")[0]
          : null,
        unitId: tenant?.unitId || null,
        propertyId: tenant?.propertyId || tenant?.unit?.propertyId || null,
        workspaceId,
        paymentChannelsActive,
        profileId: tenant?.profileId || tenant?.profile?.id || user?.id || null,
        unitNumber,
        propertyName,
        propertyAddress,
        currentStatus: tenant?.currentStatus || (hasAssignedLease ? "Current" : "Unassigned"),
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
