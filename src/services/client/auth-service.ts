import { getFirebaseAuth } from "@/lib/firebase/client";
import type { User } from "firebase/auth";
import { Result, success, failure } from "@/types";

export const handlePostLogin = async (user: User): Promise<Result<void>> => {
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

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<Result<void>> => {
  try {
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

export const loginWithGoogle = async (): Promise<Result<void>> => {
  try {
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

export const logout = async (): Promise<void> => {
  try {
    const { signOut } = await import("firebase/auth");
    const auth = getFirebaseAuth();
    await Promise.all([
      signOut(auth),
      fetch("/api/auth/logout", { method: "POST" }),
    ]);
  } catch (error) {
    console.error("Logout error:", error);
  }
};
