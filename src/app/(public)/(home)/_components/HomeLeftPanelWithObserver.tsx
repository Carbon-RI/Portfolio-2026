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

    const observedElements = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const best = intersecting.reduce((a, b) =>
          (a.intersectionRatio ?? 0) >= (b.intersectionRatio ?? 0) ? a : b
        );
        setActiveSection(best.target.id as SectionId);
      },
      {
        root: scrollEl,
        rootMargin: ROOT_MARGIN_HOME_SECTION_ACTIVE,
        threshold: 0,
      }
    );

    const observeSections = () => {
      const sections = scrollEl.querySelectorAll("section[id]");
      sections.forEach((section) => {
        const isVisible =
          section instanceof HTMLElement &&
          section.offsetParent !== null &&
          (section as HTMLElement).getBoundingClientRect().height > 0;
        if (
          SECTIONS.includes(section.id as SectionId) &&
          !observedElements.has(section) &&
          isVisible
        ) {
          observedElements.add(section);
          observer.observe(section);
        }
      });
    };

    observeSections();

    const mutationObserver = new MutationObserver(observeSections);
    mutationObserver.observe(scrollEl, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <HomeLeftPanel
      profileSettings={profileSettings}
      isAdmin={isAdmin}
      activeSectionId={activeSection}
    />
  );
}
