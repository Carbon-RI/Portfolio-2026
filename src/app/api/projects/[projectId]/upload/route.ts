import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { getDownloadURL } from "firebase-admin/storage";
import { verifyAdminSession } from "@/services/server/auth-service";
import { randomUUID } from "crypto";

const BUCKET_NAME =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authResult = await verifyAdminSession();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error.message ?? "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const type = (formData.get("type") as string) || "image";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const bucket = getAdminStorage().bucket(BUCKET_NAME);
    const ext = file.name.split(".").pop() || (type === "video" ? "mp4" : "jpg");
    const fileName =
      type === "video"
        ? `projects/${projectId}/videos/${Date.now()}_${randomUUID().slice(0, 8)}.${ext}`
        : `projects/${projectId}/images/${Date.now()}_${file.name}`;

    const fileRef = bucket.file(fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fileRef.save(buffer, {
      contentType: file.type || (type === "video" ? "video/mp4" : "image/jpeg"),
      metadata: {
        firebaseStorageDownloadTokens: randomUUID(),
      },
    });

    const downloadUrl = await getDownloadURL(fileRef);
    return NextResponse.json({ success: true, url: downloadUrl });
  } catch (error) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
