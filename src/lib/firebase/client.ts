import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

export const getFirebaseApp = (): FirebaseApp => {
  if (typeof window === "undefined") {
    throw new Error(
      "Firebase Client is client-only. Do not call this on the server."
    );
  }
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
};

export const getDb = (): Firestore => {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
};

export const getFirebaseStorage = (): FirebaseStorage => {
  if (!storage) storage = getStorage(getFirebaseApp());
  return storage;
};

export const initFirebase = async () => {
  const app = getFirebaseApp();
  const [{ getFirestore }, { getAuth }, { getStorage }] = await Promise.all([
    import("firebase/firestore"),
    import("firebase/auth"),
    import("firebase/storage"),
  ]);

  if (!db) db = getFirestore(app);
  if (!auth) auth = getAuth(app);
  if (!storage) storage = getStorage(app);

  return { db, auth, storage };
};
