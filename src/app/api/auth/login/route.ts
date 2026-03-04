import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import {
  createSessionCookie,
  getRegisteredAdminUid,
} from "@/services/server/auth-service";
import { AUTH_CONFIG } from "@/lib/constants";

const FIVE_DAYS_IN_MS = 60 * 60 * 24 * 5 * 1000;
const ADMIN_EMAIL = process.env.EMAIL_USER;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = body.idToken;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "ID Token not provided" },
        { status: 400 }
      );
    }

    const decodedToken = await getAdminAuth().verifyIdToken(idToken);

    if (!ADMIN_EMAIL || decodedToken.email !== ADMIN_EMAIL) {
      console.error(`Unauthorized email: ${decodedToken.email}`);
      return NextResponse.json(
        { success: false, error: "Access denied: Unauthorized email address." },
        { status: 403 }
      );
    }

    const adminUidResult = await getRegisteredAdminUid();
    if (!adminUidResult.success || decodedToken.uid !== adminUidResult.data) {
      console.error(`UID mismatch. Decoded: ${decodedToken.uid}`);
      return NextResponse.json(
        { success: false, error: "Access denied: UID verification failed." },
        { status: 403 }
      );
    }

    const sessionResult = await createSessionCookie(idToken, FIVE_DAYS_IN_MS);
    if (!sessionResult.success) {
      return NextResponse.json(
        { success: false, error: "Failed to create session." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(AUTH_CONFIG.SESSION_COOKIE, sessionResult.data, {
      maxAge: FIVE_DAYS_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("[Auth API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Invalid token or server error." },
      { status: 401 }
    );
  }
}
