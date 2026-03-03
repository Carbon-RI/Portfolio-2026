"use client";

import React, { Suspense } from "react";
import { useAuth } from "@/context/auth-context";
import { HomeRightPanelWithModal } from "./HomeRightPanelWithModal";
import type { FullProjectData, ProfileSettings } from "@/types/index";

interface HomeRightContentProps {
  profileSettings: ProfileSettings;
  projects: FullProjectData[];
}

/**
 * Client wrapper that passes data to HomeRightPanelWithModal.
 * Hero is rendered as sibling by page.tsx for LCP.
 */
export function HomeRightContent({
  profileSettings,
  projects,
}: HomeRightContentProps) {
  const { isAdmin } = useAuth();

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center min-h-[200px]">
          <div className="h-8 w-32 animate-pulse bg-layer-faint rounded" />
        </div>
      }
    >
      <HomeRightPanelWithModal
        includeWelcomeSection={isAdmin}
        projects={projects}
        profileSettings={profileSettings}
      />
    </Suspense>
  );
}
