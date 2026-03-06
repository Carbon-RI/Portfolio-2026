"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { HomeLeftPanel } from "./HomeLeftPanel";
import { SECTIONS, SectionId } from "@/types/index";
import { ProfileSettings } from "@/types/index";
import { MAIN_SCROLL_ID } from "@/components/layout/SplitLayoutServer";
import { SCROLL_CONFIG } from "@/types";

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

    const handleScroll = () => {
      const scrollPosition =
        scrollEl.scrollTop + SCROLL_CONFIG.SECTION_ACTIVE_OFFSET_PX;
      const containerTop = scrollEl.getBoundingClientRect().top;

      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el) {
          const elTop =
            el.getBoundingClientRect().top - containerTop + scrollEl.scrollTop;
          const height = el.offsetHeight;
          if (scrollPosition >= elTop && scrollPosition < elTop + height) {
            setActiveSection(id);
            return;
          }
        }
      }
    };

    handleScroll();

    const mutationObserver = new MutationObserver(() => {
      handleScroll();
    });
    mutationObserver.observe(scrollEl, { childList: true, subtree: true });

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
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
