import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // 1. Fetch Stats Counts safely
    let totalWorkspaces = 0;
    let totalSubscriptions = 0;
    let totalSupportTickets = 0;
    let openSupportTickets = 0;
    let totalContactInquiries = 0;
    let pendingContactInquiries = 0;
    let totalFeedback = 0;

    try { totalWorkspaces = await prisma.workspace.count(); } catch (e) {}
    try { totalSubscriptions = await prisma.subscription.count(); } catch (e) {}
    try { totalSupportTickets = await prisma.supportTicket.count(); } catch (e) {}
    try {
      openSupportTickets = await prisma.supportTicket.count({
        where: {
          status: {
            in: ["Open", "OPEN", "In Progress", "IN_PROGRESS", "Pending", "PENDING"],
          },
        },
      });
    } catch (e) {}
    try { totalContactInquiries = await prisma.contactInquiry.count(); } catch (e) {}
    try {
      pendingContactInquiries = await prisma.contactInquiry.count({
        where: { status: { in: ["PENDING", "Pending", "Open", "OPEN"] } },
      });
    } catch (e) {}
    try { totalFeedback = await prisma.feedback.count(); } catch (e) {}

    // 2. Fetch Workspaces & Subscriptions
    let workspaces: any[] = [];
    try {
      workspaces = await prisma.workspace.findMany({
        include: {
          owner: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
          subscriptions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { wid: "desc" },
      });
    } catch (err) {
      console.error("Error fetching workspaces:", err);
    }

    // 3. Fetch Support Tickets
    let supportTickets: any[] = [];
    try {
      supportTickets = await prisma.supportTicket.findMany({
        include: {
          workspace: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      console.error("Error fetching support tickets with relation, retrying simple query:", err);
      try {
        supportTickets = await prisma.supportTicket.findMany({
          orderBy: { createdAt: "desc" },
        });
      } catch (e) {
        console.error("Error fetching simple support tickets:", e);
      }
    }

    // 4. Fetch Contact Inquiries
    let contactInquiries: any[] = [];
    try {
      contactInquiries = await prisma.contactInquiry.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      console.error("Error fetching contact inquiries:", err);
    }

    // 5. Fetch Feedback
    let feedbacks: any[] = [];
    try {
      feedbacks = await prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }

    // 6. Calculate Plan Distribution for Charts
    const planCounts: Record<string, number> = {
      trial: 0,
      free: 0,
      starter: 0,
      pro: 0,
      pro_plus: 0,
    };

    workspaces.forEach((w) => {
      const planKey = (w.plan || "trial").toLowerCase();
      planCounts[planKey] = (planCounts[planKey] || 0) + 1;
    });

    // Return aggregated admin data
    return NextResponse.json({
      stats: {
        totalWorkspaces,
        totalSubscriptions,
        totalSupportTickets,
        openSupportTickets,
        totalContactInquiries,
        pendingContactInquiries,
        totalFeedback,
      },
      charts: {
        planDistribution: [
          { name: "Free Trial", count: planCounts.trial || 0, color: "#64748B" },
          { name: "Starter Plan", count: planCounts.starter || 0, color: "#3B82F6" },
          { name: "Pro Plan", count: planCounts.pro || 0, color: "#FF6B00" },
          { name: "Pro Plus", count: planCounts.pro_plus || 0, color: "#10B981" },
        ],
      },
      workspaces: workspaces.map((w) => ({
        wid: w.wid,
        name: w.name,
        currency: w.currency,
        plan: w.plan,
        isOnboarded: w.isOnboarded,
        trialStartedAt: w.trialStartedAt,
        aiCreditsUsed: w.aiCreditsUsed,
        ownerName: w.owner?.fullName || "Unassigned",
        ownerEmail: w.owner?.email || "No Email",
        ownerPhone: w.owner?.phone || "N/A",
        operatingCity: w.operatingCity || "N/A",
        companyType: w.companyType || "N/A",
        razorpayConnected: w.razorpayConnected,
        stripeConnected: w.stripeConnected,
      })),
      supportTickets: supportTickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        message: t.message,
        contactEmail: t.contactEmail,
        contactPhone: t.contactPhone,
        adminReply: t.adminReply || null,
        adminRepliedAt: t.adminRepliedAt || null,
        workspaceName: t.workspace?.name || "General User",
        isTenant: Boolean(t.isTenant),
        createdAt: t.createdAt,
      })),
      contactInquiries: contactInquiries.map((ci) => ({
        id: ci.id,
        fullName: ci.fullName,
        email: ci.email,
        phone: ci.phone,
        category: ci.category,
        subject: ci.subject,
        message: ci.message,
        status: ci.status,
        createdAt: ci.createdAt,
      })),
      feedbacks: feedbacks.map((f) => ({
        id: f.id,
        category: f.category,
        rating: f.rating,
        isAnonymous: Boolean(f.isAnonymous),
        name: f.name,
        email: f.email,
        subject: f.subject,
        message: f.message,
        createdAt: f.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Fatal error fetching admin data:", error);
    return NextResponse.json(
      { error: "Failed to load admin data: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
