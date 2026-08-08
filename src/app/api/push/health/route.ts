import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFirebaseMessagingConfigured } from "@/lib/firebase-messaging";

/**
 * GET /api/push/health — quick diagnostics (no auth).
 * Use after deploy to verify Firebase env + device token storage.
 */
export async function GET() {
  try {
    const deviceCount = await prisma.pushDevice.count();
    const firebaseOk = isFirebaseMessagingConfigured();

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
      firebaseConfigured: firebaseOk,
      pushDeviceCount: deviceCount,
      hint: firebaseOk
        ? deviceCount > 0
          ? "Firebase OK and tokens exist — triggers should send pushes."
          : "Firebase OK but no tokens — log into the mobile app and allow notifications."
        : "Set FIREBASE_SERVICE_ACCOUNT_JSON on Vercel (plain JSON, private_key with \\n).",
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
