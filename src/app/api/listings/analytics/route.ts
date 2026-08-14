import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRequestProfile } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const widParam = searchParams.get("wid");

    let workspaceId: number | null = widParam ? parseInt(widParam, 10) : null;

    if (!workspaceId) {
      const profile = await resolveRequestProfile(request);
      if (profile) {
        const workspace = await prisma.workspace.findFirst({
          where: { ownerId: profile.id },
        });
        if (workspace) workspaceId = workspace.wid;
      }
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    // Fetch all listings for this workspace
    const listings = await prisma.propertyListing.findMany({
      where: { workspaceId },
      include: {
        inquiries: { select: { id: true, createdAt: true } },
        viewLogs: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalViews = 0;
    let totalInquiries = 0;
    const deviceCounts: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const areaCounts: Record<string, number> = {};
    const channelCounts: Record<string, number> = {};
    const allLogs: any[] = [];

    const propertySummaries = listings.map((item) => {
      const views = item.viewsCount || item.viewLogs.length;
      const inquiries = item.inquiriesCount || item.inquiries.length;
      totalViews += views;
      totalInquiries += inquiries;

      const pDeviceCounts: Record<string, number> = {};
      const pAreaCounts: Record<string, number> = {};
      const pChannelCounts: Record<string, number> = {};

      item.viewLogs.forEach((log) => {
        const d = log.device || "Desktop";
        const a = log.area && log.city ? `${log.area}, ${log.city}` : log.area || log.city || "Unknown Area";
        const c = log.channel || "Direct Search";

        deviceCounts[d] = (deviceCounts[d] || 0) + 1;
        areaCounts[a] = (areaCounts[a] || 0) + 1;
        channelCounts[c] = (channelCounts[c] || 0) + 1;

        pDeviceCounts[d] = (pDeviceCounts[d] || 0) + 1;
        pAreaCounts[a] = (pAreaCounts[a] || 0) + 1;
        pChannelCounts[c] = (pChannelCounts[c] || 0) + 1;

        allLogs.push({
          id: log.id,
          listingId: item.id,
          listingTitle: item.title,
          device: d,
          area: a,
          channel: c,
          createdAt: log.createdAt,
        });
      });

      // Find top device & top area for this property
      const topDevice = Object.entries(pDeviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Mobile";
      const topArea = Object.entries(pAreaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || (item.locality ? `${item.locality}, ${item.city}` : "Delhi NCR");
      const topChannel = Object.entries(pChannelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Marketplace Search";

      return {
        id: item.id,
        title: item.title,
        locality: item.locality || item.city || "Prime Area",
        city: item.city || item.stateName,
        propertyType: item.propertyType,
        rent: item.rent,
        status: item.status,
        viewsCount: views,
        inquiriesCount: inquiries,
        topDevice,
        topArea,
        topChannel,
        conversionRate: views > 0 ? `${((inquiries / views) * 100).toFixed(1)}%` : "0.0%",
        createdAt: item.createdAt,
      };
    });

    const totalDeviceSum = (deviceCounts["Mobile"] || 0) + (deviceCounts["Desktop"] || 0) + (deviceCounts["Tablet"] || 0) || (totalViews || 1);
    const deviceBreakdown = [
      { 
        name: "Mobile", 
        count: deviceCounts["Mobile"] || 0, 
        percent: totalDeviceSum > 0 ? Math.round(((deviceCounts["Mobile"] || 0) / totalDeviceSum) * 100) : 0 
      },
      { 
        name: "Desktop", 
        count: deviceCounts["Desktop"] || 0, 
        percent: totalDeviceSum > 0 ? Math.round(((deviceCounts["Desktop"] || 0) / totalDeviceSum) * 100) : 0 
      },
      { 
        name: "Tablet", 
        count: deviceCounts["Tablet"] || 0, 
        percent: totalDeviceSum > 0 ? Math.round(((deviceCounts["Tablet"] || 0) / totalDeviceSum) * 100) : 0 
      },
    ];

    const sortedAreas = Object.entries(areaCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([area, count]) => ({ area, count }));

    if (sortedAreas.length === 0) {
      listings.forEach((item) => {
        const areaLabel = item.locality ? `${item.locality}, ${item.city || "Delhi NCR"}` : item.city || "Delhi NCR";
        sortedAreas.push({ area: areaLabel, count: item.viewsCount || 0 });
      });
    }

    const totalChannelSum = Object.values(channelCounts).reduce((a, b) => a + b, 0) || (totalViews || 1);
    const channelBreakdown = Object.entries(channelCounts).map(([channel, count]) => ({
      channel,
      count,
      percent: Math.round((count / totalChannelSum) * 100),
    }));

    if (channelBreakdown.length === 0) {
      channelBreakdown.push(
        { channel: "Marketplace Search", count: totalViews, percent: totalViews > 0 ? 100 : 0 }
      );
    }

    allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalListings: listings.length,
          totalViews: totalViews,
          totalInquiries: totalInquiries,
          avgConversionRate: totalViews > 0 ? `${((totalInquiries / totalViews) * 100).toFixed(1)}%` : "0.0%",
        },
        deviceBreakdown,
        areaBreakdown: sortedAreas,
        channelBreakdown,
        propertySummaries,
        recentViewLogs: allLogs.slice(0, 30),
      },
    });
  } catch (error) {
    console.error("GET /api/listings/analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch listing analytics" }, { status: 500 });
  }
}
