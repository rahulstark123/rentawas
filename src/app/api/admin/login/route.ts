import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, passcode } = body;

    const ADMIN_EMAIL = "admin@anshapps.com";
    const ADMIN_PASSWORD = "RentAwas@123@HMS";
    const ADMIN_PASSCODE = "1012026";

    if (
      email?.trim() !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD ||
      passcode?.trim() !== ADMIN_PASSCODE
    ) {
      return NextResponse.json(
        { error: "Invalid admin credentials or passcode." },
        { status: 401 }
      );
    }

    // Return admin authentication token for session
    const adminToken = "admin_session_" + Date.now() + "_" + Math.random().toString(36).substring(2);

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      adminToken,
      admin: {
        email: ADMIN_EMAIL,
        role: "SUPER_ADMIN",
      },
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Admin authentication failed" },
      { status: 500 }
    );
  }
}
