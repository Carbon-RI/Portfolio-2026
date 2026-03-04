"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { HomeLeftPanel } from "./HomeLeftPanel";
import { SECTIONS, SectionId } from "@/types/index";
import { ProfileSettings } from "@/types/index";
import { MAIN_SCROLL_ID } from "@/components/layout/SplitLayoutServer";

const ROOT_MARGIN_HOME_SECTION_ACTIVE = "-40% 0px -40% 0px";

interface HomeLeftPanelWithObserverProps {
  profileSettings: ProfileSettings;
}

export function HomeLeftPanelWithObserver({
  profileSettings,
}: HomeLeftPanelWithObserverProps) {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("welcome");

  useEffect(() => {
    const scrollEl = document.getElementById(MAIN_SCROLL_ID);
    if (!scrollEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      {
        root: scrollEl,
        rootMargin: ROOT_MARGIN_HOME_SECTION_ACTIVE,
        threshold: 0,
      }
    );

    const sections = scrollEl.querySelectorAll("section[id]");
    sections.forEach((section) => {
      if (SECTIONS.includes(section.id as SectionId)) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <HomeLeftPanel
      profileSettings={profileSettings}
      isAdmin={isAdmin}
      activeSectionId={activeSection}
    />
  );
}
