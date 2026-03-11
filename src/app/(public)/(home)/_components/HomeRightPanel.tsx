"use client";

import React, { useCallback, useEffect, useState, Suspense, lazy } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { FullProjectData, ProfileSettings } from "@/types/index";
import {
  LinkedInIcon,
  GitHubIcon,
  EmailIcon,
} from "@/components/shared/SocialIcons";
import type { EditableText as EditableTextType } from "@/components/admin/EditableText";
import { SectionView } from "@/components/layout/SectionView";
import { toast } from "sonner";

const EditableText = lazy(() =>
  import("@/components/admin/EditableText").then((mod) => ({
    default: mod.EditableText,
  }))
) as unknown as typeof EditableTextType;

const ProjectListSection = dynamic(
  () =>
    import("@/components/public/ProjectListSection").then((mod) => ({
      default: mod.ProjectListSection,
    })),
  { ssr: true }
);

const ContactModal = lazy(() =>
  import("@/components/shared/ContactModal").then((mod) => ({
    default: mod.ContactModal,
  }))
);

const ProjectEditModal = lazy(() =>
  import("@/components/admin/ProjectEditModal").then((mod) => ({
    default: mod.ProjectEditModal,
  }))
);

interface HomeRightPanelProps {
  profileSettings: ProfileSettings;
  projects: FullProjectData[];
}

export function HomeRightPanel({
  profileSettings: initialProfileSettings,
  projects: initialProjects,
}: HomeRightPanelProps) {
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<FullProjectData[]>(initialProjects);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(
    initialProfileSettings
  );
  const [loading, setLoading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [adminDisplayProjects, setAdminDisplayProjects] = useState<
    FullProjectData[] | null
  >(null);
  const [editingProject, setEditingProject] = useState<FullProjectData | null>(
    () => {
      if (!isAdmin) return null;
      const editSlug = searchParams.get("edit");
      if (!editSlug) return null;
      const found = initialProjects.find((p) => p.slug === editSlug);
      return found ?? null;
    }
  );

  const refetchProjects = useCallback(async (): Promise<FullProjectData[]> => {
    if (!isAdmin) return [];
    setLoading(true);
    try {
      const { getAllProjects } = await import(
        "@/services/server/project-service"
      );
      const result = await getAllProjects();
      if (result.success) {
        setProjects(result.data);
        return result.data;
      }
      return [];
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
    import("@/services/utils/project-converter").then(
      ({ getAdminCardData }) => {
        setAdminDisplayProjects(projects.map((p) => getAdminCardData(p, true)));
      }
    );
  }, [projects, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAll = async () => {
      try {
        const { getAllProjects } = await import(
          "@/services/server/project-service"
        );
        const result = await getAllProjects();
        if (result.success) setProjects(result.data);
      } catch (e) {
        console.error("[Admin] Failed to fetch all projects:", e);
      }
    };
    fetchAll();
  }, [isAdmin]);

  // Profile: initial data from server props; updates via handleSave → handleProfileUpdate.
  // Removed client onSnapshot to avoid Firestore "Missing or insufficient permissions" (client SDK uses different auth).

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
          if (!result.success) return;
          const target = result.data.find((p) => p.slug === editSlug);
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

  const displayProjects = isAdmin ? adminDisplayProjects ?? projects : projects;

  const handleSave = useCallback(
    async (field: keyof ProfileSettings, newValue: string) => {
      const updateData = { [field]: newValue };
      try {
        const { saveProfileSettings } = await import(
          "@/services/server/profile-service"
        );
        const result = await saveProfileSettings(updateData);
        if (result.success) {
          handleProfileUpdate(updateData);
          toast.success("Profile updated");
        } else {
          toast.error("Failed to save profile");
        }
      } catch (error) {
        console.error("Failed to save profile settings:", error);
        toast.error("An unexpected error occurred");
      }
    },
    [handleProfileUpdate]
  );

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center min-h-50">
          <div className="h-8 w-32 animate-pulse bg-layer-faint rounded" />
        </div>
      }
    >
      <div
        className={`w-full h-full relative transition-all duration-fast ${
          loading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex flex-col h-full">
          {isAdmin && (
            <SectionView
              id="welcome"
              aria-label="Welcome Section"
              className="shrink-0 min-h-section lg:min-h-section-desktop lg:h-full"
              style={
                {
                  contentVisibility: "visible",
                  contain: "content",
                } as React.CSSProperties
              }
            >
              <div className="max-w-2xl mx-auto px-4 lg:px-6 w-full py-8 lg:py-12">
                <Suspense
                  fallback={
                    <div className="h-10 w-48 animate-pulse bg-layer-faint rounded mb-6" />
                  }
                >
                  <EditableText
                    as="h2"
                    field="welcomeMessageHeading"
                    initialValue={profileSettings.welcomeMessageHeading}
                    onSave={handleSave}
                    isAdmin={isAdmin}
                    className="text-2xl md:text-3xl mb-6 text-content-primary"
                  />
                  <EditableText
                    as="p"
                    field="welcomeMessageText"
                    initialValue={profileSettings.welcomeMessageText}
                    onSave={handleSave}
                    isAdmin={isAdmin}
                    className="text-base md:text-lg font-light text-content-secondary whitespace-pre-wrap leading-relaxed"
                  />
                </Suspense>
              </div>
            </SectionView>
          )}

          <SectionView
            id="profile"
            aria-label="About Me Section"
            className="overflow-hidden shrink-0 min-h-section lg:min-h-section-desktop lg:h-full lg:max-h-(--vh-85) footer-border"
            style={
              {
                contentVisibility: "auto",
                containIntrinsicSize: "0 400px",
              } as React.CSSProperties
            }
          >
            <div className="max-w-2xl mx-auto px-4 lg:px-6 w-full py-4 lg:py-6">
              {isAdmin ? (
                <Suspense
                  fallback={
                    <div className="h-20 w-full animate-pulse bg-layer-faint rounded" />
                  }
                >
                  <EditableText
                    as="h2"
                    field="aboutMeHeading"
                    initialValue={profileSettings.aboutMeHeading}
                    onSave={handleSave}
                    isAdmin={isAdmin}
                    className="text-3xl md:text-4xl lg:text-5xl mb-6 text-content-primary"
                  />
                  <EditableText
                    as="p"
                    field="aboutMeText"
                    initialValue={profileSettings.aboutMeText}
                    onSave={handleSave}
                    isAdmin={isAdmin}
                    className="text-content-secondary mb-8 md:mb-12 text-base md:text-lg font-light leading-relaxed profile-summary"
                  />
                </Suspense>
              ) : (
                <>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6 text-content-primary">
                    {profileSettings.aboutMeHeading}
                  </h2>
                  <p className="text-content-secondary mb-8 text-base md:text-lg font-light leading-relaxed">
                    {profileSettings.aboutMeText}
                  </p>
                </>
              )}

              <nav
                className="flex justify-center space-x-8"
                aria-label="Social media links"
              >
                {profileSettings.linkedinUrl && (
                  <a
                    href={profileSettings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link p-2 text-layer-medium hover:text-content-primary transition-colors"
                    aria-label="Visit my LinkedIn profile"
                  >
                    <LinkedInIcon
                      className="w-6 h-6 fill-current"
                      title="LinkedIn"
                    />
                  </a>
                )}
                {profileSettings.githubUrl && (
                  <a
                    href={profileSettings.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link p-2 text-layer-medium hover:text-content-primary transition-colors"
                    aria-label="Visit my GitHub repository"
                  >
                    <GitHubIcon
                      className="w-6 h-6 fill-current"
                      title="GitHub"
                    />
                  </a>
                )}
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="social-link p-2 text-layer-medium hover:text-content-primary transition-colors"
                  aria-label="Open contact form"
                >
                  <EmailIcon className="w-6 h-6 fill-current" title="Email" />
                </button>
              </nav>
            </div>
          </SectionView>

          <SectionView
            id="works"
            aria-label="Projects and Works"
            className="footer-border overflow-hidden shrink-0 min-h-(--content-height) lg:h-full lg:max-h-(--vh-85)"
            style={
              {
                contentVisibility: "auto",
                containIntrinsicSize: "0 600px",
              } as React.CSSProperties
            }
          >
            <div
              className="w-full h-(--content-height) lg:h-full overflow-x-scroll snap-x snap-mandatory no-scrollbar overscroll-x-contain"
              style={
                {
                  "--image-aspect": "21 / 9",
                  "--card-height": "100%",
                } as React.CSSProperties
              }
            >
              <div className="flex w-fit h-full px-6 py-4 md:px-0 md:pl-(--layout-side-margin) md:pr-(--layout-side-margin) lg:px-0 lg:w-full lg:py-4 items-stretch">
                <ProjectListSection
                  projects={displayProjects}
                  isAdmin={isAdmin}
                  onProjectDataChange={refetchProjects}
                  onSelectProject={setEditingProject}
                />
              </div>
            </div>
          </SectionView>

          {isEmailModalOpen && (
            <Suspense
              fallback={
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-bg/80 backdrop-blur-sm" />
              }
            >
              <ContactModal onClose={() => setIsEmailModalOpen(false)} />
            </Suspense>
          )}
        </div>
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
    </Suspense>
  );
}
