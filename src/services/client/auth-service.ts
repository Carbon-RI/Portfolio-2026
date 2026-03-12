import type { User } from "firebase/auth";
import { Result, success, failure } from "@/types";

/** Only called after login - Firebase is already loaded at that point. */
const handlePostLogin = async (user: User): Promise<Result<void>> => {
  try {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return failure(body.error ?? "Failed to establish secure session.");
    }
    return success(undefined);
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Session error");
  }
};

/**
 * Loads Firebase Auth only when called (login page submit).
 * Does NOT load Firebase on import - keeps auth/iframe.js off critical path.
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<Result<void>> => {
  try {
    const { getFirebaseAuth } = await import("@/lib/firebase/client-auth");
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return handlePostLogin(userCredential.user);
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Login failed");
  }
};

/**
 * Loads Firebase Auth only when called (login page submit).
 * Does NOT load Firebase on import - keeps auth/iframe.js off critical path.
 */
export const loginWithGoogle = async (): Promise<Result<void>> => {
  try {
    const { getFirebaseAuth } = await import("@/lib/firebase/client-auth");
    const { GoogleAuthProvider, signInWithPopup } = await import(
      "firebase/auth"
    );
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const userCredential = await signInWithPopup(auth, provider);
    return handlePostLogin(userCredential.user);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Google login failed"
    );
  }
};

/**
 * Clears server session only. Does NOT load Firebase.
 * Firebase signOut is skipped to avoid loading auth/iframe.js for logout.
 */
export const logout = async (): Promise<void> => {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout error:", error);
  }
};
