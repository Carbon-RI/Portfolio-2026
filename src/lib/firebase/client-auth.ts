/**
 * Firebase Auth client. Load only when Auth is needed (e.g. login).
 * Auth-service imports this dynamically on login - not on page load.
 */
import { getAuth, type Auth } from "firebase/auth";
import { getFirebaseApp } from "./client-app";

let auth: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error(
      "Firebase Auth is client-only. Do not call this on the server."
    );
  }
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}
