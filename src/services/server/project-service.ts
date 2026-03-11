"use server";

import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminSession } from "@/services/server/auth-service";
import {
  FullProjectData,
  Result,
  success,
  failure,
  unwrap,
} from "@/types/index";
import { mapToFullData } from "@/services/utils/project-converter";
import { cleanFields } from "@/services/utils/object-utils";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { FB_COLLECTIONS } from "@/lib/constants";
import { projectSchema } from "@/lib/validation/schemas";

type ProjectSaveData = Partial<Omit<FullProjectData, "draft">>;

function refreshProjectCache(slug?: string) {
  revalidatePath("/");
  revalidateTag("published-projects", "max");
  if (slug) revalidatePath(`/projects/${slug}`);
}

// --- Queries (Server Only) ---
export const getProjectData = async (
  idOrSlug: string
): Promise<Result<FullProjectData>> => {
  if (!idOrSlug) return failure(new Error("ID or Slug is required"));
  try {
    const db = getAdminDb();
    const docSnap = await db
      .collection(FB_COLLECTIONS.PROJECTS)
      .doc(idOrSlug)
      .get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data && !data.is_deleted)
        return success(mapToFullData(docSnap.id, data));
    }
    const querySnap = await db
      .collection(FB_COLLECTIONS.PROJECTS)
      .where("slug", "==", idOrSlug)
      .where("is_deleted", "==", false)
      .limit(1)
      .get();
    if (querySnap.empty)
      return failure(new Error(`Project not found: ${idOrSlug}`));
    const doc = querySnap.docs[0];
    return success(mapToFullData(doc.id, doc.data()));
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Failed to fetch project")
    );
  }
};

async function fetchPublishedProjects(): Promise<
  Result<FullProjectData[]>
> {
  try {
    const snap = await getAdminDb()
      .collection(FB_COLLECTIONS.PROJECTS)
      .where("published", "==", true)
      .where("is_deleted", "==", false)
      .get();
    return success(snap.docs.map((d) => mapToFullData(d.id, d.data())));
  } catch (error) {
    return failure(
      error instanceof Error
        ? error
        : new Error("Failed to fetch published projects")
    );
  }
}

export const getPublishedProjects = unstable_cache(
  fetchPublishedProjects,
  ["published-projects"],
  { revalidate: 60, tags: ["published-projects"] }
);

export const getAllProjects = async (): Promise<Result<FullProjectData[]>> => {
  try {
    await unwrap(await verifyAdminSession());
    const snap = await getAdminDb()
      .collection(FB_COLLECTIONS.PROJECTS)
      .where("is_deleted", "==", false)
      .get();
    return success(snap.docs.map((d) => mapToFullData(d.id, d.data())));
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Failed to fetch all projects")
    );
  }
};

export async function generateNewProjectId(): Promise<Result<string>> {
  try {
    await unwrap(await verifyAdminSession());
    return success(crypto.randomUUID());
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Failed to generate project ID")
    );
  }
}

// --- Actions (Server Actions) ---
export async function saveProjectDraft(
  projectId: string,
  fields: Partial<FullProjectData>
): Promise<Result<void>> {
  try {
    await unwrap(await verifyAdminSession());
    const validated = projectSchema.partial().safeParse(fields);
    if (!validated.success)
      return failure(
        validated.error.issues[0]?.message ?? "Invalid draft data"
      );

    const { draft, slug, title, published, showDetail, ...draftOnlyFields } =
      fields;
    void draft;

    await getAdminDb()
      .collection(FB_COLLECTIONS.PROJECTS)
      .doc(projectId)
      .set(
        {
          slug: slug ?? "",
          title: title ?? "",
          published: published ?? false,
          is_deleted: false,
          showDetail: showDetail ?? false,
          draft: cleanFields(draftOnlyFields as ProjectSaveData),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    refreshProjectCache(slug);
    return success(undefined);
  } catch (error) {
    return failure(error instanceof Error ? error : "Failed to save draft");
  }
}

export async function publishProject(
  projectId: string,
  fields: Partial<FullProjectData>
): Promise<Result<void>> {
  try {
    await unwrap(await verifyAdminSession());
    const validated = projectSchema.partial().safeParse(fields);
    if (!validated.success)
      return failure(validated.error.issues[0]?.message ?? "Invalid data");

    const { draft, ...rootFields } = fields;
    void draft;
    if (!rootFields.slug) return failure("Slug is required for publishing.");

    await getAdminDb()
      .collection(FB_COLLECTIONS.PROJECTS)
      .doc(projectId)
      .set(
        {
          ...cleanFields(rootFields as ProjectSaveData),
          published: true,
          is_deleted: false,
          showDetail: rootFields.showDetail ?? false,
          draft: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    refreshProjectCache(rootFields.slug);
    return success(undefined);
  } catch (error) {
    console.error("Publish Error:", error);
    return failure(
      error instanceof Error ? error : new Error("Failed to publish")
    );
  }
}

export async function unpublishProject(
  projectId: string,
  fields: Partial<FullProjectData>
): Promise<Result<void>> {
  try {
    await unwrap(await verifyAdminSession());
    const validated = projectSchema.partial().safeParse(fields);
    if (!validated.success)
      return failure(
        validated.error.issues[0]?.message ?? "Invalid data"
      );

    const { draft, ...rootFields } = fields;
    void draft;
    if (!rootFields.slug) return failure("Slug is required.");

    await getAdminDb()
      .collection(FB_COLLECTIONS.PROJECTS)
      .doc(projectId)
      .set(
        {
          ...cleanFields(rootFields as ProjectSaveData),
          published: false,
          is_deleted: false,
          showDetail: rootFields.showDetail ?? false,
          draft: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    refreshProjectCache(rootFields.slug);
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Failed to unpublish")
    );
  }
}

export async function softDeleteProject(
  projectId: string,
  slug?: string
): Promise<Result<void>> {
  try {
    await unwrap(await verifyAdminSession());
    await getAdminDb().collection(FB_COLLECTIONS.PROJECTS).doc(projectId).set(
      {
        is_deleted: true,
        published: false,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    refreshProjectCache(slug);
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error : "Failed to soft delete project"
    );
  }
}

export async function hardDeleteProject(
  projectId: string
): Promise<Result<void>> {
  try {
    await unwrap(await verifyAdminSession());
    await getAdminDb()
      .collection(FB_COLLECTIONS.PROJECTS)
      .doc(projectId)
      .delete();
    revalidatePath("/");
    revalidateTag("published-projects", "max");
    return success(undefined);
  } catch (error) {
    return failure(
      error instanceof Error ? error : "Failed to delete project"
    );
  }
}
