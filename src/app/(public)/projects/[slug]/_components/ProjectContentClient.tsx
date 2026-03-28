"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown, { Components } from "react-markdown";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { ImageSlider } from "@/components/shared/ImageSlider";
import {
  FullProjectData,
  ProjectSection as ProjectSectionType,
} from "@/types/index";
import { useProjectEditor } from "@/hooks/admin/useProjectEditor";
import { ProjectDetailEditor } from "@/components/admin/ProjectDetailEditor";
import { Button } from "@/components/shared/Button";
import { toast } from "sonner";

interface ProjectContentClientProps {
  project: FullProjectData;
  isAdmin: boolean;
}

/** Section is active when in central 10% of viewport (45% inset top/bottom). */
const ROOT_MARGIN_PROJECT_SECTION_ACTIVE = "-45% 0px -45% 0px";

/** True while any element is in fullscreen (video/iframe). Updating active section then remounts the left ImageSlider and exits fullscreen. */
function isDocumentFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
  };
  return !!(
    document.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement
  );
}

const ProjectSection = ({
  section,
  index,
  isActive,
  project,
  sectionRef,
}: {
  section: ProjectSectionType;
  index: number;
  isActive: boolean;
  project: FullProjectData;
  sectionRef: (el: HTMLDivElement | null) => void;
}) => {
  const markdownComponents: Components = {
    p: ({ children }) => (
      <p
        className={`font-light leading-relaxed mb-8 text-lg lg:text-xl whitespace-pre-wrap ${
          isActive ? "text-content-secondary" : "text-layer-muted"
        }`}
      >
        {children}
      </p>
    ),
    ul: ({ children }) => <ul className="mb-8 space-y-4">{children}</ul>,
    ol: ({ children }) => (
      <ol className="mb-8 space-y-4 list-decimal list-inside">{children}</ol>
    ),
    li: ({ children }) => (
      <li
        className={`font-light leading-relaxed text-base lg:text-lg mb-2 whitespace-pre-wrap ${
          isActive ? "text-content-secondary" : "text-layer-muted"
        }`}
      >
        {children}
      </li>
    ),
  };

  return (
    <div
      ref={sectionRef}
      data-index={index}
      className={`transition-all duration-slow min-h-auto lg:min-h-(--vh-90) flex flex-col justify-center py-12 lg:py-24 border-b border-base-border last:border-0 ${
        isActive ? "text-content-primary" : "text-layer-muted"
      }`}
    >
      {index === 0 && (
        <div className="flex flex-wrap gap-4 mb-10">
          {project.category.map((cat) => (
            <span
              key={cat}
              className="tag-label text-layer-medium border-base-border"
            >
              {cat}
            </span>
          ))}
          <span className="tag-label text-content-primary border-layer-muted bg-layer-faint">
            {project.industry}
          </span>
        </div>
      )}

      <h2
        className={`text-4xl lg:text-4xl font-bold mb-8 lg:mb-12 leading-[1.1] max-w-full wrap-break-word ${
          isActive ? "text-content-primary" : "text-layer-muted"
        }`}
      >
        {section.heading}
      </h2>

      <div className="block lg:hidden mb-12">
        {section.media && section.media.length > 0 ? (
          <div className="w-full aspect-video">
            <ImageSlider media={section.media} title={section.heading} />
          </div>
        ) : (
          <div className="w-full aspect-video bg-layer-faint border border-base-border flex items-center justify-center text-sm-mono text-layer-medium">
            No Visual
          </div>
        )}
      </div>

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown components={markdownComponents}>
          {section.content ?? ""}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export const ProjectContentClient = ({
  project: initialProject,
  isAdmin,
}: ProjectContentClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromBasicInfo = searchParams.get("edit") === "true";
  const [project, setProject] = useState<FullProjectData>(initialProject);

  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);
  const [isEditMode, setIsEditMode] = useState(isAdmin && isFromBasicInfo);

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const {
    draftData,
    isUploading,
    addSection,
    removeSection,
    updateSectionField,
    updateMedia,
    addMedia,
    removeMedia,
    handleSectionImageUpload,
    handleSectionVideoUpload,
    save,
  } = useProjectEditor(project);

  useEffect(() => {
    if (isEditMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isDocumentFullscreen()) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute("data-index");
            if (index !== null) {
              setActiveSectionIndex(Number(index));
            }
          }
        });
      },
      { rootMargin: ROOT_MARGIN_PROJECT_SECTION_ACTIVE }
    );

    const currentRefs = sectionRefs.current;
    currentRefs.forEach((ref) => ref && observer.observe(ref));

    return () => observer.disconnect();
  }, [isEditMode, project.sections]);

  const setSectionRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      sectionRefs.current[index] = el;
    },
    []
  );

  const currentSection = isEditMode
    ? draftData.sections?.[activeSectionIndex]
    : project.sections?.[activeSectionIndex];

  const backConfig =
    isAdmin && isFromBasicInfo
      ? { href: `/?edit=${encodeURIComponent(project.slug)}`, label: "Back to Basic Info" }
      : { href: "/", label: "Back to Portfolio" };

  /** After Notes edit (Save or Cancel), return to Project Detail = Basic Info modal on home. */
  const navigateToProjectBasicInfo = useCallback(() => {
    if (!project.slug) {
      setIsEditMode(false);
      return;
    }
    router.push(`/?edit=${encodeURIComponent(project.slug)}`);
    router.refresh();
  }, [project.slug, router]);

  const handleSaveSuccess = () => {
    navigateToProjectBasicInfo();
  };

  const handleSave = async () => {
    const result = await save("draft", handleSaveSuccess);

    if (result.success) {
      toast.success("Project content updated successfully");
    } else {
      toast.error(`Save failed: ${result.error}`);
    }
  };

  const leftPane = (
    <div className="hidden lg:flex sticky-top h-(--content-height-no-footer) flex-col items-center justify-center bg-base-bg p-12 pb-32 border-r border-base-border">
      <div className="w-full h-full max-w-4xl max-h-(--vh-70)">
        <ImageSlider
          media={currentSection?.media || []}
          title={project.title}
          priority={true}
        />
      </div>
    </div>
  );

  const rightPane = (
    <div className="px-6 lg:px-12 pt-0 pb-(--vh-10)">
      <header className="flex justify-between items-center py-8 gap-2 header-border mb-8 bg-base-bg sticky-top">
        <Link
          href={backConfig.href}
          className="nav-link whitespace-nowrap text-sm-mono tracking-widest flex items-center group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            &larr;
          </span>
          <span className="ml-2">{backConfig.label}</span>
        </Link>

        {isAdmin && (
          <div className="flex gap-2 items-center">
            {isEditMode ? (
              <>
                <Button
                  variant="secondary"
                  onClick={navigateToProjectBasicInfo}
                  className="tracking-tight"
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSave}
                  disabled={isUploading}
                  className="font-bold tracking-tight px-6 py-2 bg-content-primary text-base-bg hover:bg-content-secondary disabled:opacity-50"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditMode(true)}
                className="text-accent-1"
              >
                Edit Content
              </Button>
            )}
          </div>
        )}
      </header>

      {isEditMode ? (
        <div className="space-y-12 py-12">
          <div className="flex justify-between items-center">
            <h2 className="app-label">Detailed Content Editor</h2>
            <button
              onClick={addSection}
              className="text-sm-mono px-4 py-2 bg-layer-faint border border-base-border hover:border-content-primary transition-all duration-normal"
            >
              + Add New Section
            </button>
          </div>
          <ProjectDetailEditor
            sections={draftData.sections}
            isUploading={isUploading}
            addSection={addSection}
            removeSection={removeSection}
            updateSectionField={updateSectionField}
            updateMedia={updateMedia}
            addMedia={addMedia}
            removeMedia={removeMedia}
            handleSectionImageUpload={handleSectionImageUpload}
            handleSectionVideoUpload={handleSectionVideoUpload}
          />
        </div>
      ) : (
        <div className="flex flex-col relative">
          {project.sections?.map((section, index) => (
            <ProjectSection
              key={`${project.id}-${index}`}
              section={section}
              index={index}
              isActive={index === activeSectionIndex}
              project={project}
              sectionRef={setSectionRef(index)}
            />
          ))}
        </div>
      )}
    </div>
  );

  return <SplitLayout left={leftPane} right={rightPane} hideLeftOnMobile />;
};

export default ProjectContentClient;
