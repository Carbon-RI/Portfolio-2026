/**
 * Firebase Firestore client. Load only when Firestore is needed.
 */
import type { Firestore } from "firebase/firestore";
import { getFirebaseApp } from "./client-app";

let db: Firestore | undefined;

export async function getDb(): Promise<Firestore> {
  if (!db) {
    const { getFirestore } = await import("firebase/firestore");
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
