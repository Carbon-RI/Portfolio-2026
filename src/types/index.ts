import { z } from "zod";
import {
  profileSettingsSchema,
  projectSchema,
  projectMediaSchema,
  projectSectionSchema,
} from "@/lib/validation/schemas";
import { TechIconKey } from "@/services/utils/tech-icons";

// --- 1. UI & Config Constants ---
export const SECTIONS = ["welcome", "profile", "works"] as const;
export type SectionId = (typeof SECTIONS)[number];
export const BREAKPOINTS = { LG: 1024 } as const;
export const LG_QUERY = `(min-width: ${BREAKPOINTS.LG}px)` as const;
export const DEFAULT_HEADER_HEIGHT = 56;
export const SCROLL_CONFIG = { SECTION_ACTIVE_OFFSET_PX: 20 } as const;

// --- 2. Shared / Utility Types ---
export interface FirestoreTimestamp {
  toMillis: () => number;
  seconds: number;
  nanoseconds: number;
}

export type Result<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: Error };

export const success = <T>(data: T): Result<T> => ({ success: true, data });
export const failure = <T>(error: Error | string): Result<T> =>
  ({
    success: false,
    error: typeof error === "string" ? new Error(error) : error,
  } as Result<T>);

export function unwrap<T>(result: Result<T>): T {
  if (!result.success) throw result.error;
  return result.data;
}

// --- 3. Profile Types & Constants ---
export type ProfileSettings = z.infer<typeof profileSettingsSchema>;

export const defaultSettings: ProfileSettings = {
  siteTitle: "",
  siteDescription: "",
  name: "",
  tagline: "",
  aboutMeHeading: "",
  aboutMeText: "",
  linkedinUrl: "",
  githubUrl: "",
  emailAddress: "",
  welcomeMessageHeading: "",
  welcomeMessageText: "",
};

// --- 4. Project Types & Constants ---
export const PROJECT_CATEGORIES = [
  "Web App",
  "Mobile App",
  "PWA",
  "Desktop Tool",
  "SaaS",
  "AI Solution",
  "Browser Extension",
] as const;
export const PROJECT_INDUSTRIES = [
  "Med Tech",
  "Social Tech",
  "Fin Tech",
  "E-commerce",
  "Ed Tech",
  "SaaS",
] as const;

export type ProjectCategory =
  | (typeof PROJECT_CATEGORIES)[number]
  | (string & {});
export type ProjectIndustry =
  | (typeof PROJECT_INDUSTRIES)[number]
  | (string & {});
export type ProjectStatus =
  | "Published"
  | "DraftModified"
  | "NewDraft"
  | "Unpublished"
  | "Deleted";

export type ProjectMedia = z.infer<typeof projectMediaSchema>;
export type ProjectSection = z.infer<typeof projectSectionSchema>;

export interface ProjectData
  extends Omit<
    z.infer<typeof projectSchema>,
    "techStack" | "category" | "industry"
  > {
  category: ProjectCategory[];
  industry: ProjectIndustry;
  techStack: TechIconKey[];
  draft?: Partial<Omit<ProjectData, "id" | "draft">>;
}

export type ProjectCardData = Pick<
  ProjectData,
  | "id"
  | "slug"
  | "title"
  | "category"
  | "industry"
  | "summary"
  | "imageSrc"
  | "githubUrl"
  | "demoUrl"
  | "techStack"
  | "published"
  | "is_deleted"
  | "showDetail"
  | "draft"
  | "updatedAt"
>;
export type FullProjectData = ProjectData;
export type { TechIconKey };

export const getProjectStatus = (project: {
  is_deleted: boolean;
  published: boolean;
  draft?: unknown;
}): ProjectStatus => {
  if (project.is_deleted) return "Deleted";
  if (project.published) return project.draft ? "DraftModified" : "Published";
  return "Unpublished";
};
