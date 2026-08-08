import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFirebaseMessagingStatus } from "@/lib/firebase-messaging";

/**
 * GET /api/push/health — quick diagnostics (no auth).
 * Use after deploy to verify Firebase env + device token storage.
 */
export async function GET() {
  try {
    const deviceCount = await prisma.pushDevice.count();
    const firebase = getFirebaseMessagingStatus();

    const sample = await prisma.pushDevice.findMany({
      take: 3,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        profileId: true,
        platform: true,
        token: true,
        updatedAt: true,
      },
    });

    const maskedSample = sample.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      platform: row.platform,
      tokenPreview: row.token ? `${row.token.slice(0, 12)}…` : null,
      updatedAt: row.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      firebaseConfigured: firebase.configured,
      firebaseSource: firebase.source,
      firebaseError: firebase.error,
      pushDeviceCount: deviceCount,
      hint: firebase.configured
        ? deviceCount > 0
          ? "Firebase OK and tokens exist — triggers should send pushes."
          : "Firebase OK but no tokens — log into the mobile app and allow notifications."
        : firebase.error ||
          "Set FIREBASE_SERVICE_ACCOUNT_JSON on Vercel (paste the downloaded JSON file as-is).",
      recentDevices: maskedSample,
    });
  } catch (error: any) {
    console.error("GET /api/push/health error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Health check failed",
      },
      { status: 500 }
    );
  }
}
