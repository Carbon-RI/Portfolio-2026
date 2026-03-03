"use client";

import React, { useCallback, useEffect, useState, Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { FullProjectData, ProfileSettings } from "@/types/index";
import { HomeRightPanel } from "./HomeRightPanel";

const ProjectEditModal = lazy(() =>
  import("@/components/admin/ProjectEditModal").then((mod) => ({
    default: mod.ProjectEditModal,
  }))
);

interface HomeRightPanelWithModalProps {
  /** When true (isAdmin), includes editable Welcome section */
  includeWelcomeSection: boolean;
  projects: FullProjectData[];
  profileSettings: ProfileSettings;
}

export function HomeRightPanelWithModal({
  includeWelcomeSection,
  projects: initialProjects,
  profileSettings: initialProfileSettings,
}: HomeRightPanelWithModalProps) {
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<FullProjectData[]>(initialProjects);
  const [profileSettings, setProfileSettings] =
    useState<ProfileSettings>(initialProfileSettings);
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] =
    useState<FullProjectData | null>(() => {
      if (!isAdmin) return null;
      const editSlug = searchParams.get("edit");
      if (!editSlug) return null;
      const found = initialProjects.find((p) => p.slug === editSlug);
      return found ?? null;
    });

  const refetchProjects = useCallback(async (): Promise<FullProjectData[]> => {
    if (!isAdmin) return [];
    setLoading(true);
    try {
      const { getAllProjectsClient } = await import(
        "@/services/client/project-service"
      );
      const data = await getAllProjectsClient();
      setProjects(data);
      return data;
    } catch (error) {
      console.error("[Data] Unexpected error during refetch:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const refetchAndSyncEditingProject = useCallback(async () => {
    const latest = await refetchProjects();
    setEditingProject((prev) => {
      if (!prev) return null;
      const updated = latest.find((p) => p.id === prev.id);
      return updated ?? prev;
    });
  }, [refetchProjects]);

  const handleProfileUpdate = useCallback(
    (updatedFields: Partial<ProfileSettings>) => {
      setProfileSettings((prev) => ({ ...prev, ...updatedFields }));
    },
    []
  );

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAll = async () => {
      try {
        const { getAllProjectsClient } = await import(
          "@/services/client/project-service"
        );
        const data = await getAllProjectsClient();
        setProjects(data);
      } catch (e) {
        console.error("[Admin] Failed to fetch all projects:", e);
      }
    };
    fetchAll();
  }, [isAdmin]);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (!isAdmin) return;
    const editSlug = searchParams.get("edit");
    if (editSlug) {
      const syncFullData = async () => {
        try {
          const [{ getAllProjectsClient }, { mergeProjectAndDraft }] =
            await Promise.all([
              import("@/services/client/project-service"),
              import("@/services/utils/project-converter"),
            ]);
          const data = await getAllProjectsClient();
          const target = data.find((p) => p.slug === editSlug);
          if (target) {
            setEditingProject(mergeProjectAndDraft(target));
            window.history.replaceState(null, "", window.location.pathname);
          }
        } catch (e) {
          console.error("Failed to sync full project data:", e);
        }
      };
      syncFullData();
    }
  }, [isAdmin, searchParams]);

  return (
    <>
      <div
        className={`w-full h-full relative transition-all duration-fast ${
          loading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        <HomeRightPanel
          includeWelcomeSection={includeWelcomeSection}
          projects={projects}
          profileSettings={profileSettings}
          isAdmin={isAdmin}
          onProjectDataChange={refetchProjects}
          onProfileUpdate={handleProfileUpdate}
          onSelectProject={setEditingProject}
        />
      </div>

      {isAdmin && editingProject && (
        <Suspense fallback={null}>
          <ProjectEditModal
            initialProject={editingProject}
            onClose={() => setEditingProject(null)}
            onProjectDataChange={refetchAndSyncEditingProject}
            onCancelNew={async (id) => {
              const { hardDeleteProject } = await import(
                "@/services/server/project-service"
              );
              const result = await hardDeleteProject(id);
              if (!result.success) {
                console.error("Failed to delete new project:", result.error);
              }
            }}
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
}
