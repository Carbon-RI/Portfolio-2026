"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useSearchParams } from "next/navigation";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { HomeLeftPanel } from "./HomeLeftPanel";
import { HomeRightPanel } from "./HomeRightPanel";
import { SECTIONS, SectionId } from "@/types/index";
import { ProjectCardData, FullProjectData } from "@/types/index";
import { ProfileSettings } from "@/types/index";

const ProjectEditModal = lazy(() =>
  import("@/components/admin/ProjectEditModal").then((mod) => ({
    default: mod.ProjectEditModal,
  }))
);

interface HomeClientProps {
  projects: ProjectCardData[];
  profileSettings: ProfileSettings;
  isAdmin: boolean;
}

const OBSERVABLE_SECTIONS = SECTIONS;
const ROOT_MARGIN_HOME_SECTION_ACTIVE = "-40% 0px -40% 0px";

export const HomeClient = ({
  projects: initialProjects,
  profileSettings: initialProfileSettings,
  isAdmin,
}: HomeClientProps) => {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectCardData[]>(initialProjects);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(
    initialProfileSettings
  );
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("welcome");

  const refetchProjects = useCallback(async (): Promise<ProjectCardData[]> => {
    if (!isAdmin) return [];
    setLoading(true);
    try {
      const [{ getAllProjects }, { mergeProjectAndDraft }] = await Promise.all([
        import("@/services/server/project-service"),
        import("@/services/utils/project-converter"),
      ]);
      const result = await getAllProjects();

      if (result.success) {
        const merged = result.data.map(mergeProjectAndDraft);
        setProjects(merged);
        return merged;
      } else {
        console.error("[Data] Failed to refetch projects:", result.error);
        return [];
      }
    } catch (error) {
      console.error("[Data] Unexpected error during refetch:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const [editingProject, setEditingProject] = useState<FullProjectData | null>(
    () => {
      if (!isAdmin) return null;
      const editSlug = searchParams.get("edit");
      if (!editSlug) return null;
      const found = projects.find((p) => p.slug === editSlug);
      return found ? (found as unknown as FullProjectData) : null;
    }
  );

  const refetchAndSyncEditingProject = useCallback(async () => {
    const latest = await refetchProjects();
    setEditingProject((prev) => {
      if (!prev) return null;
      const updated = latest.find((p) => p.id === prev.id);
      return updated ? (updated as unknown as FullProjectData) : prev;
    });
  }, [refetchProjects]);

  const scrollContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const editSlug = searchParams.get("edit");
    if (editSlug) {
      const syncFullData = async () => {
        try {
          const [{ getAllProjects }, { mergeProjectAndDraft }] =
            await Promise.all([
              import("@/services/server/project-service"),
              import("@/services/utils/project-converter"),
            ]);
          const result = await getAllProjects();

          if (result.success) {
            const target = result.data.find(
              (p: ProjectCardData) => p.slug === editSlug
            );
            if (target) {
              setEditingProject(mergeProjectAndDraft(target));
              window.history.replaceState(null, "", window.location.pathname);
            }
          }
        } catch (e) {
          console.error("Failed to sync full project data:", e);
        }
      };
      syncFullData();
    }
  }, [isAdmin, searchParams]);

  useEffect(() => {
    if (!isAdmin) return;

    let unsub: (() => void) | undefined;

    const setup = async () => {
      try {
        const { subscribeProfileSettings } = await import(
          "@/services/client/profile-service"
        );
        unsub = subscribeProfileSettings(setProfileSettings, (error) =>
          console.error("[Admin] Subscription error:", error)
        );
      } catch (e) {
        console.error("Failed to load subscription service", e);
      }
    };

    setup();
    return () => unsub?.();
  }, [isAdmin]);

  const handleProfileUpdate = useCallback(
    (updatedFields: Partial<ProfileSettings>) => {
      setProfileSettings((prev) => ({ ...prev, ...updatedFields }));
    },
    []
  );

  useEffect(() => {
    const currentRef = scrollContainerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      {
        root: currentRef,
        rootMargin: ROOT_MARGIN_HOME_SECTION_ACTIVE,
        threshold: 0,
      }
    );

    const sections = currentRef.querySelectorAll("section[id]");
    sections.forEach((section) => {
      if (OBSERVABLE_SECTIONS.includes(section.id as SectionId)) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleOpenEditModal = useCallback(
    (project: ProjectCardData | FullProjectData) => {
      setEditingProject(project as FullProjectData);
    },
    []
  );

  const handleCloseEditModal = useCallback(() => {
    setEditingProject(null);
  }, []);

  return (
    <>
      <SplitLayout
        hideLeftOnMobile={true}
        scrollRef={scrollContainerRef}
        left={
          <HomeLeftPanel
            profileSettings={profileSettings}
            isAdmin={isAdmin}
            activeSectionId={activeSection}
          />
        }
        right={
          <div
            className={`w-full h-full relative transition-all duration-fast ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            <HomeRightPanel
              projects={projects}
              profileSettings={profileSettings}
              isAdmin={isAdmin}
              onProjectDataChange={refetchProjects}
              onProfileUpdate={handleProfileUpdate}
              onSelectProject={handleOpenEditModal}
            />
          </div>
        }
      />

      {isAdmin && editingProject && (
        <Suspense fallback={null}>
          <ProjectEditModal
            initialProject={editingProject}
            onClose={handleCloseEditModal}
            onProjectDataChange={refetchAndSyncEditingProject}
            onDelete={async (id) => {
              const { softDeleteProject } = await import(
                "@/services/server/project-service"
              );
              const result = await softDeleteProject(id);
              if (!result.success) {
                alert("Failed to delete project: " + result.error.message);
              }
              refetchProjects();
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default HomeClient;
