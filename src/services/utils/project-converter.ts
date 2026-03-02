import { TechIconKey } from "@/services/utils/tech-icons";
import {
  FullProjectData,
  ProjectStatus,
  ProjectSection,
  FirestoreTimestamp,
  getProjectStatus,
} from "@/types/index";

const isTimestamp = (val: unknown): val is FirestoreTimestamp => {
  return (
    typeof val === "object" &&
    val !== null &&
    "toMillis" in val &&
    typeof (val as FirestoreTimestamp).toMillis === "function"
  );
};

const convertTimestamp = (ts: unknown): number | undefined => {
  if (!ts) return undefined;
  if (isTimestamp(ts)) return ts.toMillis();
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  if (typeof ts === "string") {
    const parsed = Date.parse(ts);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

export const mapToFullData = (
  id: string,
  data: Record<string, unknown>
): FullProjectData => {
  const showDetailValue = (data.showDetail as boolean) ?? false;
  const ensureCategoryArray = (cat: unknown): string[] => {
    if (Array.isArray(cat)) return cat.map(String);
    if (typeof cat === "string" && cat.length > 0) return [cat];
    return [];
  };

  const baseData: FullProjectData = {
    id,
    slug: typeof data.slug === "string" ? data.slug : "",
    title: typeof data.title === "string" ? data.title : "",
    category: ensureCategoryArray(data.category),
    industry: typeof data.industry === "string" ? data.industry : "",
    summary: typeof data.summary === "string" ? data.summary : "",
    imageSrc: typeof data.imageSrc === "string" ? data.imageSrc : "",
    githubUrl: typeof data.githubUrl === "string" ? data.githubUrl : "",
    demoUrl: typeof data.demoUrl === "string" ? data.demoUrl : "",
    techStack: Array.isArray(data.techStack)
      ? (data.techStack as TechIconKey[])
      : [],
    published: !!data.published,
    is_deleted: !!data.is_deleted,
    sections: Array.isArray(data.sections)
      ? (data.sections as ProjectSection[])
      : [],
    showDetail: showDetailValue,
    updatedAt: convertTimestamp(data.updatedAt),
  };

  if (data.draft && typeof data.draft === "object") {
    const draft = data.draft as Partial<FullProjectData>;
    baseData.draft = {
      ...draft,
      category:
        draft.category !== undefined
          ? ensureCategoryArray(draft.category)
          : undefined,
      updatedAt: convertTimestamp(draft.updatedAt) || baseData.updatedAt,
      showDetail: draft.showDetail ?? showDetailValue,
    };
  }

  return baseData;
};

export const mergeProjectAndDraft = (
  project: FullProjectData
): FullProjectData => {
  if (!project.draft) {
    const { draft: _, ...rest } = project;
    return rest as FullProjectData;
  }
  const { draft, ...base } = project;
  return {
    ...base,
    ...draft,
    category: draft.category ?? base.category,
    techStack: draft.techStack ?? base.techStack,
    sections: draft.sections ?? base.sections,
  };
};

export const getAdminCardData = (
  project: FullProjectData,
  isAdmin: boolean
): FullProjectData & { status: ProjectStatus } => {
  if (!isAdmin) return { ...project, status: "Published" };
  const status = getProjectStatus(project);
  const base = project.draft ? { ...project, ...project.draft } : project;
  return { ...base, status };
};

export const getEditorStatus = (
  project: FullProjectData,
  isCreatingNew: boolean,
  hasSavedDuringSession: boolean
): ProjectStatus => {
  if (isCreatingNew && !hasSavedDuringSession) return "NewDraft";
  return getProjectStatus(project);
};
