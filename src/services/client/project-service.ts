import {
  getDb,
  getFirebaseStorage,
  getFirebaseApp,
} from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FullProjectData,
  ProjectCardData,
  Result,
  success,
  failure,
} from "@/types/index";
import { mapToFullData } from "@/services/utils/project-converter";
import { FB_COLLECTIONS } from "@/lib/constants";

export const uploadImageToStorage = async (
  projectId: string,
  file: File
): Promise<Result<string>> => {
  try {
    const storage = getFirebaseStorage();
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `projects/${projectId}/images/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return success(downloadUrl);
  } catch (error) {
    return failure(error instanceof Error ? error : "Failed to upload image");
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
  ProjectCardData[]
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
