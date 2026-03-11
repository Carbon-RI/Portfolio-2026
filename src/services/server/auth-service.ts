import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { Result, success, failure } from "@/types/index";
import { DecodedIdToken } from "firebase-admin/auth";
import { FB_COLLECTIONS, FB_DOCS, AUTH_CONFIG } from "@/lib/constants";

export async function getRegisteredAdminUid(): Promise<Result<string>> {
  try {
    const doc = await getAdminDb()
      .collection(FB_COLLECTIONS.ADMIN_CONFIGS)
      .doc(FB_DOCS.ADMIN_GLOBAL)
      .get();

    if (!doc.exists) {
      return failure<string>(
        `Admin configuration document '${FB_COLLECTIONS.ADMIN_CONFIGS}/${FB_DOCS.ADMIN_GLOBAL}' not found.`
      );
    }

    const adminUid = doc.data()?.adminUid;
    if (!adminUid) {
      return failure<string>("Admin UID is missing in Firestore document.");
    }
    return success(adminUid);
  } catch (error) {
    console.error("Firestore Admin Read Error:", error);
    return failure<string>(
      error instanceof Error ? error : new Error("Unknown Firestore error")
    );
  }
}

export async function verifyAdminSession(): Promise<Result<DecodedIdToken>> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_CONFIG.SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      return failure<DecodedIdToken>("Session cookie not found.");
    }

    const decodedToken = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );

    const adminUidResult = await getRegisteredAdminUid();

    if (!adminUidResult.success) {
      return failure<DecodedIdToken>(adminUidResult.error);
    }

    if (adminUidResult.data !== decodedToken.uid) {
      return failure<DecodedIdToken>("UID mismatch: Unauthorized.");
    }

    return success(decodedToken);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    const isExpected =
      code === "auth/session-cookie-revoked" ||
      code === "auth/session-cookie-expired";
    if (!isExpected) {
      console.error("Admin Session Verification Failed:", error);
    }
    return failure<DecodedIdToken>(
      error instanceof Error ? error.message : "Invalid session."
    );
  }
}

export async function createSessionCookie(
  idToken: string,
  expiresIn: number
): Promise<Result<string>> {
  try {
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn,
    });
    return success(sessionCookie);
  } catch (error) {
    console.error("Create Session Cookie Error:", error);
    return failure<string>(
      error instanceof Error ? error : "Failed to create session"
    );
  }
}

export async function revokeSession(uid: string): Promise<Result<void>> {
  try {
    await getAdminAuth().revokeRefreshTokens(uid);
    return success(undefined);
  } catch (error) {
    console.error("Revoke Session Error:", error);
    return failure<void>(
      error instanceof Error ? error : "Failed to revoke session"
    );
  }
}

export async function verifySessionCookie(): Promise<DecodedIdToken | null> {
  const result = await verifyAdminSession();
  return result.success ? result.data : null;
}
