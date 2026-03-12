import { getFirebaseApp } from "@/lib/firebase/client-app";
import {
  FullProjectData,
  Result,
  success,
  failure,
} from "@/types/index";
import { mapToFullData } from "@/services/utils/project-converter";
import { FB_COLLECTIONS } from "@/lib/constants";

async function uploadViaApi(
  projectId: string,
  file: File,
  type: "image" | "video"
): Promise<Result<string>> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) return failure(data.error ?? "Upload failed");
  if (!data.success || !data.url) return failure("Invalid response from server");
  return success(data.url);
}

export const uploadImageToStorage = async (
  projectId: string,
  file: File
): Promise<Result<string>> => {
  try {
    return uploadViaApi(projectId, file, "image");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Failed to upload image");
  }
};

export const uploadVideoToStorage = async (
  projectId: string,
  file: File
): Promise<Result<string>> => {
  try {
    return uploadViaApi(projectId, file, "video");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Failed to upload video");
  }
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
