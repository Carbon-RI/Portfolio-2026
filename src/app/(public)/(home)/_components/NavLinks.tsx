"use client";

import React from "react";
import { MAIN_SCROLL_ID } from "@/components/layout/SplitLayoutServer";

const navItems = [
  { id: "welcome", label: "Home" },
  { id: "profile", label: "Profile" },
  { id: "works", label: "Works" },
] as const;

export function NavLinks({ activeSectionId }: { activeSectionId: string }) {
  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    const scrollEl = document.getElementById(MAIN_SCROLL_ID);
    if (element && scrollEl) {
      const elementTop = element.getBoundingClientRect().top;
      const containerTop = scrollEl.getBoundingClientRect().top;
      const scrollOffset =
        scrollEl.scrollTop + elementTop - containerTop;
      scrollEl.scrollTo({ top: scrollOffset, behavior: "smooth" });
    } else if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ul className="flex flex-col gap-6 items-start">
      {navItems.map((item) => {
        const isActive = activeSectionId === item.id;
        return (
          <li key={item.id} className="relative flex items-center pl-8">
            {isActive && <span className="active-indicator" />}
            <a
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={`nav-link ${
                isActive ? "text-content-primary" : "text-layer-medium"
              }`}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
