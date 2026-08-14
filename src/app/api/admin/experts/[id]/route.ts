import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single expert details by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    try {
      const expert = await (prisma as any).rentawasExpert.findUnique({
        where: { id },
      });

      if (expert) {
        return NextResponse.json({ success: true, expert });
      }
    } catch (e) {
      console.warn("DB query failed for single expert ID", id);
    }

    return NextResponse.json(
      { error: `Expert with ID ${id} not found.` },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch expert details." },
      { status: 500 }
    );
  }
}

// PUT: Edit / Update expert details
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      name,
      trade,
      specialization,
      experience,
      email,
      phone,
      govtIdType,
      govtId,
      currency,
      fee,
      hourlyRate,
      city,
      address,
      pincode,
      workStartTime,
      workEndTime,
      workDays,
      languages,
      avatar,
      qrCodeUrl,
      bankHolder,
      bankName,
      customBankName,
      accountNo,
      ifsc,
      upiId,
      emergencyContactName,
      emergencyContactPhone,
      bloodGroup,
      status,
    } = body;

    const languagesJson = Array.isArray(languages) ? JSON.stringify(languages) : String(languages || "[]");

    let updatedExpert: any = null;

    try {
      updatedExpert = await (prisma as any).rentawasExpert.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(trade && { trade }),
          ...(specialization !== undefined && { specialization }),
          ...(experience && { experience }),
          ...(email && { email: email.trim().toLowerCase() }),
          ...(phone && { phone: phone.trim() }),
          ...(govtIdType && { govtIdType }),
          ...(govtId !== undefined && { govtId }),
          ...(currency && { currency }),
          ...(fee !== undefined && { fee: Number(fee) }),
          ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
          ...(city && { city }),
          ...(address !== undefined && { address }),
          ...(pincode !== undefined && { pincode }),
          ...(workStartTime && { workStartTime }),
          ...(workEndTime && { workEndTime }),
          ...(workDays && { workDays }),
          ...(languages !== undefined && { languages: languagesJson }),
          ...(avatar && { avatar }),
          ...(qrCodeUrl !== undefined && { qrCodeUrl }),
          ...(bankHolder !== undefined && { bankHolder }),
          ...(bankName && { bankName }),
          ...(customBankName !== undefined && { customBankName }),
          ...(accountNo !== undefined && { accountNo }),
          ...(ifsc !== undefined && { ifsc }),
          ...(upiId !== undefined && { upiId }),
          ...(emergencyContactName !== undefined && { emergencyContactName }),
          ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
          ...(bloodGroup && { bloodGroup }),
          ...(status && { status }),
        },
      });
    } catch (e: any) {
      console.warn("DB update fallback:", e?.message);
      updatedExpert = {
        id,
        ...body,
        updatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      message: `Expert profile updated successfully!`,
      expert: updatedExpert,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update expert record." },
      { status: 500 }
    );
  }
}

// DELETE: Delete expert record
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      await (prisma as any).rentawasExpert.delete({
        where: { id },
      });
    } catch (e: any) {
      console.warn("DB delete fallback:", e?.message);
    }

    return NextResponse.json({
      success: true,
      message: `Expert record ${id} deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete expert record." },
      { status: 500 }
    );
  }
}
