import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// POST /api/expert/id-card-pdf: Generate high-resolution official Corporate Digital ID Card PDF
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name = "Rahul",
      trade = "PLUMBING & WATER SYSTEMS",
      specialization = "Pipeline Leak Detection & Sanitary Fittings",
      idCode = "EXPERT-RA-2026-9812",
      phone = "+91 96931 98018",
      email = "expert1@gmail.com",
      govtId = "Aadhaar Card (552145632541)",
    } = body;

    const pdfDoc = await PDFDocument.create();
    
    // Create standard badge page 400 x 600 pt
    const page = pdfDoc.addPage([400, 600]);
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Dark Card Background #0B132B
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.04, 0.07, 0.17),
    });

    // Outer Border Accent #FF6B00
    page.drawRectangle({
      x: 12,
      y: 12,
      width: width - 24,
      height: height - 24,
      borderColor: rgb(1, 0.42, 0),
      borderWidth: 2,
    });

    // Lanyard Clip Slot Top
    page.drawRectangle({
      x: width / 2 - 25,
      y: height - 25,
      width: 50,
      height: 10,
      color: rgb(0.02, 0.04, 0.07),
      borderColor: rgb(0.2, 0.25, 0.3),
      borderWidth: 1,
    });

    // Top Header - RentAwas EXPERT
    page.drawText("RentAwas", {
      x: 30,
      y: height - 58,
      size: 22,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText("EXPERT", {
      x: 145,
      y: height - 58,
      size: 14,
      font: fontBold,
      color: rgb(1, 0.42, 0),
    });

    // ID CODE Top Right
    page.drawText("ID CODE:", {
      x: width - 150,
      y: height - 48,
      size: 8,
      font: fontBold,
      color: rgb(0.6, 0.6, 0.6),
    });
    page.drawText(String(idCode), {
      x: width - 150,
      y: height - 60,
      size: 11,
      font: fontBold,
      color: rgb(1, 0.75, 0),
    });

    // Horizontal Separator Line
    page.drawLine({
      start: { x: 30, y: height - 72 },
      end: { x: width - 30, y: height - 72 },
      thickness: 1,
      color: rgb(0.2, 0.25, 0.35),
    });

    // Expert Name
    page.drawText(String(name), {
      x: 30,
      y: height - 110,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Trade Category Pill
    page.drawRectangle({
      x: 30,
      y: height - 145,
      width: width - 60,
      height: 24,
      color: rgb(0.12, 0.16, 0.24),
      borderColor: rgb(1, 0.42, 0),
      borderWidth: 1,
    });

    page.drawText(String(trade).toUpperCase(), {
      x: 40,
      y: height - 138,
      size: 10,
      font: fontBold,
      color: rgb(1, 0.42, 0),
    });

    // Specialization Subtitle
    page.drawText(String(specialization), {
      x: 30,
      y: height - 165,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.8, 0.85, 0.9),
    });

    // Details Table Card Box
    page.drawRectangle({
      x: 30,
      y: height - 340,
      width: width - 60,
      height: 155,
      color: rgb(0.08, 0.12, 0.22),
      borderColor: rgb(0.2, 0.25, 0.35),
      borderWidth: 1,
    });

    // Field 1: GOVT ID / LICENSE
    page.drawText("GOVT ID / LICENSE:", {
      x: 42,
      y: height - 210,
      size: 8.5,
      font: fontBold,
      color: rgb(0.6, 0.65, 0.75),
    });
    page.drawText(String(govtId), {
      x: 160,
      y: height - 210,
      size: 8.5,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Field 2: PHONE
    page.drawText("PHONE NUMBER:", {
      x: 42,
      y: height - 240,
      size: 8.5,
      font: fontBold,
      color: rgb(0.6, 0.65, 0.75),
    });
    page.drawText(String(phone), {
      x: 160,
      y: height - 240,
      size: 8.5,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Field 3: OFFICIAL EMAIL
    page.drawText("OFFICIAL EMAIL:", {
      x: 42,
      y: height - 270,
      size: 8.5,
      font: fontBold,
      color: rgb(0.6, 0.65, 0.75),
    });
    page.drawText(String(email), {
      x: 160,
      y: height - 270,
      size: 8.5,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Field 4: VERIFICATION STATUS
    page.drawText("STATUS:", {
      x: 42,
      y: height - 300,
      size: 8.5,
      font: fontBold,
      color: rgb(0.6, 0.65, 0.75),
    });
    page.drawText("ACTIVE & VERIFIED EXPERT", {
      x: 160,
      y: height - 300,
      size: 8.5,
      font: fontBold,
      color: rgb(0.1, 0.85, 0.45),
    });

    // Verification Seal Box
    page.drawRectangle({
      x: 30,
      y: 75,
      width: width - 60,
      height: 160,
      color: rgb(0.04, 0.06, 0.12),
      borderColor: rgb(0.2, 0.25, 0.35),
      borderWidth: 1,
    });

    page.drawText("OFFICIAL RENTAWAS VERIFICATION SEAL", {
      x: 45,
      y: 210,
      size: 9.5,
      font: fontBold,
      color: rgb(1, 0.42, 0),
    });

    page.drawText("Scan or visit URL to verify background compliance & identity:", {
      x: 45,
      y: 192,
      size: 8,
      font: fontRegular,
      color: rgb(0.7, 0.75, 0.8),
    });

    page.drawText(`Verification Link:`, {
      x: 45,
      y: 155,
      size: 8.5,
      font: fontBold,
      color: rgb(0.6, 0.65, 0.75),
    });
    page.drawText(`https://rentawas.in/expert/verify?email=${encodeURIComponent(email)}`, {
      x: 45,
      y: 140,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.4, 0.7, 1),
    });

    page.drawText("RentAwas Safety Guarantee — Background & Police Verified", {
      x: 45,
      y: 95,
      size: 7.5,
      font: fontBold,
      color: rgb(0.1, 0.85, 0.45),
    });

    // Footer Stamped Validity Line
    page.drawText("STATUS: ACTIVE & STAMPED  •  VALID THRU DEC 2028", {
      x: 42,
      y: 35,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.85, 0.45),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="RentAwas_Expert_${name.replace(/\s+/g, "_")}_ID_Card.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate ID Card PDF document." },
      { status: 500 }
    );
  }
}
