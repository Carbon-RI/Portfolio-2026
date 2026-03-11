import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/services/server/auth-service";
import { AUTH_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const result = await verifyAdminSession();

    if (!result.success) {
      const cookieStore = await cookies();
      if (cookieStore.get(AUTH_CONFIG.SESSION_COOKIE)) {
        cookieStore.delete(AUTH_CONFIG.SESSION_COOKIE);
      }
    }

    return NextResponse.json({
      isAdmin: result.success,
    });
  } catch (error) {
    console.error("[api/auth/session] Error checking session:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
