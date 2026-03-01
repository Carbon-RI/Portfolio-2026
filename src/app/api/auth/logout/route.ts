import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAdminSession,
  revokeSession,
} from "@/services/server/auth-service";
import { AUTH_CONFIG } from "@/lib/constants";

export async function POST() {
  const authResult = await verifyAdminSession();

  if (authResult.success) {
    await revokeSession(authResult.data.uid);
  }

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_CONFIG.SESSION_COOKIE);

  return NextResponse.json({ success: true });
}
