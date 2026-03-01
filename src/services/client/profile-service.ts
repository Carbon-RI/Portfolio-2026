import { getDb } from "@/lib/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import { ProfileSettings, defaultSettings } from "@/types/index";
import { FB_COLLECTIONS, FB_DOCS } from "@/lib/constants";

export function subscribeProfileSettings(
  onUpdate: (data: ProfileSettings) => void,
  onError: (error: Error) => void
) {
  const db = getDb();
  const docRef = doc(db, FB_COLLECTIONS.SETTINGS, FB_DOCS.PROFILE);

  return onSnapshot(
    docRef,
    (docSnap) => {
      const data = docSnap.exists()
        ? (docSnap.data() as ProfileSettings)
        : defaultSettings;
      onUpdate({ ...defaultSettings, ...data });
    },
    (error) => {
      console.error("Profile Subscription Error:", error);
      onError(error);
    }
  );
}
