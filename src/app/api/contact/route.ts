import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phone, category, subject, message } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { error: "Full Name is required." },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid Email address is required." },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        category: category ? category.trim() : "General Inquiry",
        subject: subject ? subject.trim() : null,
        message: message.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Your inquiry has been received.",
      inquiry,
    });
  } catch (error: any) {
    console.error("Error creating contact inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try again later." },
      { status: 500 }
    );
  }
}
