import { NextResponse } from "next/server";
import { resolveRequestProfile } from "@/lib/api-auth";
import {
  registerPushDevice,
  unregisterPushDevice,
} from "@/lib/push-notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = await resolveRequestProfile(request, body);

    if (!profile) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const token = typeof body.token === "string" ? body.token.trim() : "";
    const platform = typeof body.platform === "string" ? body.platform.trim() : "";
    const deviceId =
      typeof body.deviceId === "string" && body.deviceId.trim()
        ? body.deviceId.trim()
        : null;

    if (!token) {
      return NextResponse.json({ error: "Push token is required." }, { status: 400 });
    }

    if (!platform) {
      return NextResponse.json({ error: "Platform is required." }, { status: 400 });
    }

    const device = await registerPushDevice({
      profileId: profile.id,
      token,
      platform,
      deviceId,
    });

    return NextResponse.json({
      success: true,
      message: "Push device registered.",
      data: { id: device.id, platform: device.platform },
    });
  } catch (error: any) {
    console.error("POST /api/push/register error:", error);
    return NextResponse.json(
      { error: "Failed to register push device.", details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const profile = await resolveRequestProfile(request, body);

    if (!profile) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!token) {
      return NextResponse.json({ error: "Push token is required." }, { status: 400 });
    }

    await unregisterPushDevice(profile.id, token);

    return NextResponse.json({
      success: true,
      message: "Push device unregistered.",
    });
  } catch (error: any) {
    console.error("DELETE /api/push/register error:", error);
    return NextResponse.json(
      { error: "Failed to unregister push device.", details: error?.message },
      { status: 500 }
    );
  }
}
