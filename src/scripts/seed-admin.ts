/**
 * Admin Registration & Update Script
 *
 * Fetches admin_configs/global from Firestore, displays current data, and updates
 * only when ADMIN_UID differs or the document does not exist.
 *
 * Usage: npm run db:seed-admin
 * Requires ADMIN_UID in .env.local
 *
 * Uses admin-script (mirrors admin.ts) because admin.ts imports "server-only",
 * which throws when run outside Next.js server context (e.g. ts-node).
 */
import path from "path";
import { config } from "dotenv";
import { getAdminDb } from "../lib/firebase/admin-script";
import { FB_COLLECTIONS, FB_DOCS } from "../lib/constants";
import { Result, success, failure } from "../types/index";

config({ path: path.resolve(process.cwd(), ".env.local") });

type DocData = Record<string, unknown> | null;

async function fetchAdminConfig(): Promise<Result<DocData>> {
  try {
    const doc = await getAdminDb()
      .collection(FB_COLLECTIONS.ADMIN_CONFIGS)
      .doc(FB_DOCS.ADMIN_GLOBAL)
      .get();

    const data = doc.exists ? (doc.data() ?? null) : null;
    return success(data);
  } catch (error) {
    console.error("Firestore read error:", error);
    return failure(
      error instanceof Error ? error : new Error("Unknown Firestore error")
    );
  }
}

async function updateAdminConfig(payload: {
  adminUid: string;
  updatedAt: string;
  description: string;
}): Promise<Result<void>> {
  try {
    await getAdminDb()
      .collection(FB_COLLECTIONS.ADMIN_CONFIGS)
      .doc(FB_DOCS.ADMIN_GLOBAL)
      .set(payload, { merge: true });
    return success(undefined);
  } catch (error) {
    console.error("Firestore write error:", error);
    return failure(
      error instanceof Error ? error : new Error("Unknown Firestore write error")
    );
  }
}

async function run(): Promise<Result<"updated" | "no_change">> {
  const envAdminUid = process.env.ADMIN_UID?.trim() ?? "";
  if (!envAdminUid) {
    return failure("ADMIN_UID is not set in .env.local");
  }

  const fetchResult = await fetchAdminConfig();
  if (!fetchResult.success) {
    return failure(fetchResult.error);
  }

  const docData = fetchResult.data;
  const dbAdminUid =
    typeof docData?.adminUid === "string" ? docData.adminUid.trim() : null;

  // --- Read & Display ---
  console.log("--- Current Firestore data (admin_configs/global) ---");
  if (docData === null) {
    console.log("(document does not exist)");
  } else {
    console.log(JSON.stringify(docData, null, 2));
  }
  console.log("---");

  // --- Idempotency: already in sync ---
  if (docData !== null && dbAdminUid === envAdminUid) {
    return success("no_change");
  }

  // --- Conditional Update ---
  const payload = {
    adminUid: envAdminUid,
    updatedAt: new Date().toISOString(),
    description: "Managed by Seed Script",
  };

  const updateResult = await updateAdminConfig(payload);
  if (!updateResult.success) {
    return failure(updateResult.error);
  }

  return success("updated");
}

run()
  .then((result) => {
    if (!result.success) {
      console.error("❌ Failed:", result.error.message);
      process.exit(1);
    }

    if (result.data === "no_change") {
      console.log("✅ Already up to date. No changes needed.");
      process.exit(0);
    }

    console.log("✅ Admin configuration has been updated successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
