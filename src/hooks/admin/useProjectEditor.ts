"use client";

import { useState, useCallback, useMemo, useEffect, useReducer } from "react";
import {
  FullProjectData,
  TechIconKey,
  ProjectSection,
  ProjectMedia,
  Result,
  success,
  failure,
} from "@/types/index";
import { projectSchema } from "@/lib/validation/schemas";
import { extractYouTubeId } from "@/services/utils/project-formatter";

// --- Types for Reducer ---
type ProjectAction =
  | { type: "SET_FIELD"; field: keyof FullProjectData; value: any }
  | { type: "TOGGLE_TECH"; techKey: TechIconKey }
  | { type: "ADD_SECTION" }
  | { type: "REMOVE_SECTION"; sIndex: number }
  | {
      type: "UPDATE_SECTION_FIELD";
      sIndex: number;
      field: keyof ProjectSection;
      value: any;
    }
  | { type: "ADD_MEDIA"; sIndex: number }
  | { type: "REMOVE_MEDIA"; sIndex: number; mIndex: number }
  | {
      type: "UPDATE_MEDIA";
      sIndex: number;
      mIndex: number;
      field: keyof ProjectMedia;
      value: string;
    };

// --- Reducer Function ---
function projectReducer(
  state: FullProjectData,
  action: ProjectAction
): FullProjectData {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_TECH": {
      const currentStack = state.techStack || [];
      const isSelected = currentStack.includes(action.techKey);
      return {
        ...state,
        techStack: isSelected
          ? currentStack.filter((k) => k !== action.techKey)
          : [...currentStack, action.techKey],
      };
    }
    case "ADD_SECTION":
      return {
        ...state,
        sections: [
          ...(state.sections || []),
          { heading: "", content: "", media: [] },
        ],
      };
    case "REMOVE_SECTION":
      return {
        ...state,
        sections: state.sections.filter((_, i) => i !== action.sIndex),
      };
    case "UPDATE_SECTION_FIELD":
      return {
        ...state,
        sections: state.sections.map((s, i) =>
          i === action.sIndex ? { ...s, [action.field]: action.value } : s
        ),
      };
    case "ADD_MEDIA":
      return {
        ...state,
        sections: state.sections.map((s, i) =>
          i === action.sIndex
            ? { ...s, media: [...(s.media || []), { type: "image", url: "" }] }
            : s
        ),
      };
    case "REMOVE_MEDIA":
      return {
        ...state,
        sections: state.sections.map((s, i) =>
          i === action.sIndex
            ? {
                ...s,
                media: (s.media || []).filter((_, j) => j !== action.mIndex),
              }
            : s
        ),
      };
    case "UPDATE_MEDIA":
      return {
        ...state,
        sections: state.sections.map((s, i) => {
          if (i !== action.sIndex) return s;
          return {
            ...s,
            media: (s.media || []).map((m, j) => {
              if (j !== action.mIndex) return m;
              const isVideoType =
                action.field === "url" &&
                (m.type === "video" || m.type === "youtube");
              return {
                ...m,
                [action.field]: isVideoType
                  ? extractYouTubeId(action.value)
                  : action.value,
              };
            }),
          };
        }),
      };
    default:
      return state;
  }
}

// --- Hook ---
export const useProjectEditor = (initialProject: FullProjectData) => {
  const [draftData, dispatch] = useReducer(
    projectReducer,
    initialProject,
    (p) => projectSchema.parse(p) as FullProjectData
  );
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialProject.imageSrc
  );

  useEffect(() => {
    setPreviewUrl(initialProject.imageSrc);
  }, [initialProject.id, initialProject.imageSrc]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const isSlugValid = useMemo(
    () => draftData.slug !== "" && draftData.slug !== "new-project-draft",
    [draftData.slug]
  );

  const handleFieldChange = useCallback(
    (field: keyof FullProjectData, value: any) =>
      dispatch({ type: "SET_FIELD", field, value }),
    []
  );
  const handleToggleTech = useCallback(
    (techKey: TechIconKey) => dispatch({ type: "TOGGLE_TECH", techKey }),
    []
  );
  const addSection = useCallback(() => dispatch({ type: "ADD_SECTION" }), []);
  const removeSection = useCallback(
    (sIndex: number) => dispatch({ type: "REMOVE_SECTION", sIndex }),
    []
  );
  const updateSectionField = useCallback(
    (sIndex: number, field: keyof ProjectSection, value: any) =>
      dispatch({ type: "UPDATE_SECTION_FIELD", sIndex, field, value }),
    []
  );
  const addMedia = useCallback(
    (sIndex: number) => dispatch({ type: "ADD_MEDIA", sIndex }),
    []
  );
  const removeMedia = useCallback(
    (sIndex: number, mIndex: number) =>
      dispatch({ type: "REMOVE_MEDIA", sIndex, mIndex }),
    []
  );
  const updateMedia = useCallback(
    (
      sIndex: number,
      mIndex: number,
      field: keyof ProjectMedia,
      value: string
    ) => dispatch({ type: "UPDATE_MEDIA", sIndex, mIndex, field, value }),
    []
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!draftData.id) return;
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setIsUploading(true);
      try {
        const { uploadImageToStorage } = await import(
          "@/services/client/project-service"
        );
        const result = await uploadImageToStorage(draftData.id, file);
        if (result.success) {
          handleFieldChange("imageSrc", result.data);
          setPreviewUrl(result.data);
        } else {
          setPreviewUrl(initialProject.imageSrc);
        }
      } catch (error) {
        setPreviewUrl(initialProject.imageSrc);
      } finally {
        setIsUploading(false);
      }
    },
    [draftData.id, initialProject.imageSrc, handleFieldChange]
  );

  const handleSectionImageUpload = useCallback(
    async (sIndex: number, mIndex: number, file: File) => {
      if (!draftData.id) return;
      setIsUploading(true);
      try {
        const { uploadImageToStorage } = await import(
          "@/services/client/project-service"
        );
        const result = await uploadImageToStorage(draftData.id, file);
        if (result.success) updateMedia(sIndex, mIndex, "url", result.data);
      } finally {
        setIsUploading(false);
      }
    },
    [draftData.id, updateMedia]
  );

  const save = useCallback(
    async (
      mode: "draft" | "publish",
      onSuccess?: (slug: string) => void
    ): Promise<Result<void>> => {
      if (isUploading) return failure("Uploading in progress...");
      const validation = projectSchema.safeParse(draftData);
      if (!validation.success)
        return failure(validation.error.issues[0]?.message || "Invalid data");

      const { id, ...contentFields } = validation.data;
      const { slug } = contentFields;

      if (!slug || slug === "new-project-draft")
        return failure("A valid URL link (Slug) is required.");

      setIsUploading(true);
      try {
        const { saveProjectDraft, publishProject } = await import(
          "@/services/server/project-service"
        );
        const result =
          mode === "draft"
            ? await saveProjectDraft(id, contentFields as any)
            : await publishProject(id, contentFields as any);

        if (result.success && onSuccess) onSuccess(slug);
        return result.success
          ? success(undefined)
          : failure(result.error.message);
      } finally {
        setIsUploading(false);
      }
    },
    [draftData, isUploading]
  );

  return {
    draftData,
    isUploading,
    previewUrl,
    isSlugValid,
    handleFieldChange,
    handleToggleTech,
    handleImageUpload,
    addSection,
    removeSection,
    updateSectionField,
    updateMedia,
    addMedia,
    removeMedia,
    handleSectionImageUpload,
    save,
  };
};
