import type { User } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client-app";
import {
  FullProjectData,
  Result,
  success,
  failure,
} from "@/types/index";
import { mapToFullData } from "@/services/utils/project-converter";
import { FB_COLLECTIONS } from "@/lib/constants";

/** Builds the same Storage paths as the legacy API route. */
function buildStoragePath(
  projectId: string,
  file: File,
  type: "image" | "video"
): string {
  const rawExt = file.name.includes(".")
    ? file.name.split(".").pop()!
    : "";
  const ext =
    rawExt.replace(/[^a-zA-Z0-9]/g, "") ||
    (type === "video" ? "mp4" : "jpg");
  const unique = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  return type === "video"
    ? `projects/${projectId}/videos/${unique}.${ext}`
    : `projects/${projectId}/images/${unique}.${ext}`;
}

/**
 * Uploads directly to Firebase Storage from the browser so large videos are not
 * limited by the hosting provider's serverless request body cap (e.g. ~4.5MB on Vercel).
 */
async function uploadProjectMediaClient(
  projectId: string,
  file: File,
  type: "image" | "video"
): Promise<Result<string>> {
  try {
    const { getFirebaseAuth } = await import("@/lib/firebase/client-auth");
    const { onAuthStateChanged } = await import("firebase/auth");
    const {
      ref,
      uploadBytesResumable,
      getDownloadURL,
    } = await import("firebase/storage");
    const { getFirebaseStorage } = await import("@/lib/firebase/client-storage");

    const auth = getFirebaseAuth();
    const user =
      auth.currentUser ??
      (await new Promise<User | null>((resolve) => {
        const unsub = onAuthStateChanged(auth, (u) => {
          unsub();
          resolve(u);
        });
      }));

    if (!user) {
      return failure(
        "Not signed in to Firebase. Open Admin Login and sign in again, then retry."
      );
    }

    const storagePath = buildStoragePath(projectId, file, type);
    const storageRef = ref(await getFirebaseStorage(), storagePath);
    const contentType =
      file.type || (type === "video" ? "video/mp4" : "image/jpeg");

    const task = uploadBytesResumable(storageRef, file, { contentType });
    await new Promise<void>((resolve, reject) => {
      task.on(
        "state_changed",
        () => {},
        (err) => reject(err),
        () => resolve()
      );
    });

    const url = await getDownloadURL(task.snapshot.ref);
    return success(url);
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code)
        : "";
    if (code === "storage/unauthorized") {
      return failure(
        "Storage permission denied. Deploy the rules in storage.rules (admin write to projects/…/images|videos)."
      );
    }
    return failure(
      error instanceof Error ? error.message : "Upload failed"
    );
  }
}

export const uploadImageToStorage = async (
  projectId: string,
  file: File
): Promise<Result<string>> => {
  return uploadProjectMediaClient(projectId, file, "image");
};

export const uploadVideoToStorage = async (
  projectId: string,
  file: File
): Promise<Result<string>> => {
  return uploadProjectMediaClient(projectId, file, "video");
};

export const getProjectDataClient = async (
  idOrSlug: string
): Promise<FullProjectData | null> => {
  if (!idOrSlug) return null;
  const {
    getFirestore,
    doc,
    getDoc,
    query,
    collection,
    where,
    limit,
    getDocs,
  } = await import("firebase/firestore");
  const db = getFirestore(getFirebaseApp());
  const directSnap = await getDoc(doc(db, FB_COLLECTIONS.PROJECTS, idOrSlug));
  if (directSnap.exists() && !directSnap.data().is_deleted)
    return mapToFullData(directSnap.id, directSnap.data());
  const q = query(
    collection(db, FB_COLLECTIONS.PROJECTS),
    where("slug", "==", idOrSlug),
    where("is_deleted", "==", false),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty
    ? null
    : mapToFullData(snap.docs[0].id, snap.docs[0].data());
};

export const getPublishedProjectsClient = async (): Promise<
  FullProjectData[]
> => {
  const { getFirestore, collection, query, where, getDocs } = await import(
    "firebase/firestore"
  );
  const db = getFirestore(getFirebaseApp());
  const q = query(
    collection(db, FB_COLLECTIONS.PROJECTS),
    where("published", "==", true),
    where("is_deleted", "==", false)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapToFullData(d.id, d.data()));
};

export const getAllProjectsClient = async (): Promise<FullProjectData[]> => {
  const { getFirestore, collection, query, where, getDocs } = await import(
    "firebase/firestore"
  );
  const db = getFirestore(getFirebaseApp());
  const q = query(
    collection(db, FB_COLLECTIONS.PROJECTS),
    where("is_deleted", "==", false)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapToFullData(d.id, d.data()));
};
