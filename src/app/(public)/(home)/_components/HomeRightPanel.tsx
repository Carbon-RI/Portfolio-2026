"use client";

import React, { useCallback, useMemo, useState, Suspense, lazy } from "react";
import dynamic from "next/dynamic";
import { FullProjectData, ProfileSettings } from "@/types/index";
import { getAdminCardData } from "@/services/utils/project-converter";
import {
  LinkedInIcon,
  GitHubIcon,
  EmailIcon,
} from "@/components/shared/SocialIcons";
import { ContactModal } from "@/components/shared/ContactModal";
import type { EditableText as EditableTextType } from "@/components/admin/EditableText";
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

interface HomeRightPanelProps {
  /** When true, renders editable Welcome section. When false, Hero is rendered by Server as sibling. */
  includeWelcomeSection?: boolean;
  projects: FullProjectData[];
  profileSettings: ProfileSettings;
  isAdmin: boolean;
  onProjectDataChange: () => void;
  onProfileUpdate: (updatedFields: Partial<ProfileSettings>) => void;
  onSelectProject: (project: FullProjectData) => void;
}

export const HomeRightPanel = ({
  includeWelcomeSection = false,
  projects,
  profileSettings,
  isAdmin,
  onProjectDataChange,
  onProfileUpdate,
  onSelectProject,
}: HomeRightPanelProps) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const displayProjects = useMemo(
    () =>
      isAdmin ? projects.map((p) => getAdminCardData(p, true)) : projects,
    [projects, isAdmin]
  );

  const handleSave = useCallback(
    async (field: keyof ProfileSettings, newValue: string) => {
      const updateData = { [field]: newValue };
      try {
        const { saveProfileSettings } = await import(
          "@/services/server/profile-service"
        );
        const result = await saveProfileSettings(updateData);
        if (result.success) {
          onProfileUpdate(updateData);
          toast.success("Profile updated");
        } else {
          toast.error("Failed to update profile");
        }
      } catch (error) {
        console.error("Failed to save profile settings:", error);
        toast.error("An unexpected error occurred");
      }
    },
    [onProfileUpdate]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Welcome Section - only when isAdmin (editable). For !isAdmin, Hero is Server sibling. */}
      {includeWelcomeSection && (
        <section
          id="welcome"
          aria-label="Welcome Section"
          className="section-view-no-py flex items-center shrink-0 min-h-section lg:min-h-0 lg:h-full scroll-mt-(--header-height) lg:scroll-mt-0"
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
        </section>
      )}

      {/* Profile Section */}
      <section
        id="profile"
        aria-label="About Me Section"
        className="section-view-no-py flex items-center shrink-0 min-h-section lg:min-h-0 lg:h-full footer-border scroll-mt-(--header-height) lg:scroll-mt-0"
        style={
          {
            contentVisibility: "auto",
            containIntrinsicSize: "0 400px",
          } as React.CSSProperties
        }
      >
        <div className="max-w-2xl mx-auto px-4 lg:px-6 w-full py-8 lg:py-12">
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
                className="text-3xl md:text-4xl lg:text-5xl mb-6 md:mb-10 text-content-primary"
              />
              <EditableText
                as="p"
                field="aboutMeText"
                initialValue={profileSettings.aboutMeText}
                onSave={handleSave}
                isAdmin={isAdmin}
                className="text-content-secondary mb-8 md:mb-12 text-base md:text-lg font-light leading-relaxed"
              />
            </Suspense>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6 md:mb-10 text-content-primary">
                {profileSettings.aboutMeHeading}
              </h2>
              <p className="text-content-secondary mb-8 md:mb-12 text-base md:text-lg font-light leading-relaxed">
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
                <GitHubIcon className="w-6 h-6 fill-current" title="GitHub" />
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
      </section>

      {/* Works Section */}
      <section
        id="works"
        aria-label="Projects and Works"
        className="section-view-no-py footer-border overflow-hidden flex items-center shrink-0 min-h-(--content-height) lg:h-full lg:max-h-(--vh-85) scroll-mt-(--header-height) lg:scroll-mt-0"
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
          <div className="flex w-fit h-full px-6 md:px-0 md:pl-(--layout-side-margin) md:pr-(--layout-side-margin) lg:px-0 lg:w-full py-2 lg:py-4 items-stretch">
            <ProjectListSection
              projects={displayProjects}
              isAdmin={isAdmin}
              onProjectDataChange={onProjectDataChange}
              onSelectProject={onSelectProject}
            />
          </div>
        </div>
      </section>

      {isEmailModalOpen && (
        <ContactModal onClose={() => setIsEmailModalOpen(false)} />
      )}
    </div>
  );
};
