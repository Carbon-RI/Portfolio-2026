/**
 * Firebase Storage client. Load only when Storage is needed (e.g. uploads).
 */
import type { FirebaseStorage } from "firebase/storage";
import { getFirebaseApp } from "./client-app";

let storage: FirebaseStorage | undefined;

export async function getFirebaseStorage(): Promise<FirebaseStorage> {
  if (!storage) {
    const { getStorage } = await import("firebase/storage");
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}
