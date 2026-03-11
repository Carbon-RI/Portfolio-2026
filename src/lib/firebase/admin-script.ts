/**
 * Firebase Admin for CLI/script use (no server-only).
 * Same logic as admin.ts but runnable via ts-node.
 */
import {
  cert,
  initializeApp,
  getApp,
  getApps,
  type App,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  const activeApps = getApps();
  if (activeApps.length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin SDK environment variables (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY)"
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
