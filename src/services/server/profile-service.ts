"use server";

import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminSession } from "@/services/server/auth-service";
import {
  ProfileSettings,
  defaultSettings,
  Result,
  success,
  failure,
  unwrap,
} from "@/types/index";
import { FB_COLLECTIONS, FB_DOCS } from "@/lib/constants";
import { profileSettingsSchema } from "@/lib/validation/schemas";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

async function fetchProfileSettings(): Promise<Result<ProfileSettings>> {
  try {
    const docSnap = await getAdminDb()
      .collection(FB_COLLECTIONS.SETTINGS)
      .doc(FB_DOCS.PROFILE)
      .get();
    const data = docSnap.exists
      ? (docSnap.data() as Partial<ProfileSettings>)
      : {};
    return success({ ...defaultSettings, ...data });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return failure(error instanceof Error ? error : "Failed to fetch profile");
  }
}

export const getProfileSettings = unstable_cache(
  fetchProfileSettings,
  ["profile-settings"],
  { revalidate: 60, tags: ["profile-settings"] }
);

export async function saveProfileSettings(
  data: Partial<ProfileSettings>
): Promise<Result<void>> {
  try {
    await unwrap(await verifyAdminSession());
    const validated = profileSettingsSchema.partial().safeParse(data);
    if (!validated.success) {
      return failure(validated.error.issues[0]?.message ?? "Invalid data");
    }

    const docRef = getAdminDb()
      .collection(FB_COLLECTIONS.SETTINGS)
      .doc(FB_DOCS.PROFILE);
    await docRef.set(data, { merge: true });

    revalidatePath("/");
    revalidatePath("/admin/profile");
    revalidateTag("profile-settings", "max");
    return success(undefined);
  } catch (error) {
    console.error("Profile Save Error:", error);
    return failure(error instanceof Error ? error : "Failed to update profile");
  }
}
