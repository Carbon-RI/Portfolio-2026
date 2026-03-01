import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/services/server/auth-service";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const result = await verifyAdminSession();
    return NextResponse.json({
      isAdmin: result.success,
    });
  } catch (error) {
    console.error("[api/auth/session] Error checking session:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
