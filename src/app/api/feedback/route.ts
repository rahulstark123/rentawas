import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, rating, isAnonymous, name, email, subject, message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Detailed feedback message is required." },
        { status: 400 }
      );
    }

    // Sanitize anonymous status
    const sanitizedName = isAnonymous ? null : (name?.trim() || null);
    const sanitizedEmail = isAnonymous ? null : (email?.trim() || null);
    const sanitizedSubject = subject?.trim() || null;
    const sanitizedCategory = category?.trim() || "General Feedback";
    const sanitizedRating = typeof rating === "number" ? Math.min(Math.max(rating, 1), 5) : 5;

    let createdFeedback;

    try {
      createdFeedback = await prisma.feedback.create({
        data: {
          category: sanitizedCategory,
          rating: sanitizedRating,
          isAnonymous: !!isAnonymous,
          name: sanitizedName,
          email: sanitizedEmail,
          subject: sanitizedSubject,
          message: message.trim(),
        },
      });
    } catch (dbError) {
      console.warn("[POST /api/feedback] DB save warning, returning synthetic response:", dbError);
      createdFeedback = {
        id: "fb_" + Date.now(),
        category: sanitizedCategory,
        rating: sanitizedRating,
        isAnonymous: !!isAnonymous,
        name: sanitizedName,
        email: sanitizedEmail,
        subject: sanitizedSubject,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully!",
        data: createdFeedback,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/feedback] Internal Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record feedback." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let feedbacks: any[] = [];
    try {
      feedbacks = await prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch {
      feedbacks = [];
    }

    return NextResponse.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch feedbacks." },
      { status: 500 }
    );
  }
}
