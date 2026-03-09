import React, { Suspense, lazy } from "react";
import { ProfileSettings, SectionId } from "@/types/index";
import { NavLinks } from "@/app/(public)/(home)/_components/NavLinks";

const EditableText = lazy(() =>
  import("@/components/admin/EditableText").then((mod) => ({
    default: mod.EditableText,
  }))
);

interface HomeLeftPanelProps {
  profileSettings: ProfileSettings;
  isAdmin: boolean;
  activeSectionId: SectionId;
}

export const HomeLeftPanel = ({
  profileSettings,
  isAdmin,
  activeSectionId,
}: HomeLeftPanelProps) => {
  return (
    <aside className="w-full flex flex-col items-center bg-base-bg p-8 border-b border-base-border lg:fixed lg:w-1/2 lg:h-svh lg:justify-center lg:p-12 lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-4 items-center group">
        {isAdmin ? (
          <Suspense
            fallback={
              <div className="h-12 w-48 animate-pulse bg-layer-faint" />
            }
          >
            <EditableText
              as="h1"
              field="name"
              initialValue={profileSettings.name}
              onSave={async (field, newValue) => {
                const { saveProfileSettings } = await import(
                  "@/services/server/profile-service"
                );
                await saveProfileSettings({ [field]: newValue });
              }}
              isAdmin={true}
              className="text-4xl sm:text-5xl text-content-primary transition-all duration-fast hover:scale-105"
            />
          </Suspense>
        ) : (
          <h1 className="text-4xl sm:text-5xl text-content-primary transition-all duration-fast hover:scale-105">
            {profileSettings.name}
          </h1>
        )}
        <div className="w-12 h-1 bg-content-primary transition-all duration-fast group-hover:w-24" />
      </div>

      <nav className="hidden lg:block mt-16">
        <NavLinks activeSectionId={activeSectionId} />
      </nav>
    </aside>
  );
};
