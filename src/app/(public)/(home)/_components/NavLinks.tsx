"use client";

import React from "react";

const navItems = [
  { id: "welcome", label: "Home" },
  { id: "profile", label: "Profile" },
  { id: "works", label: "Works" },
] as const;

export function NavLinks({ activeSectionId }: { activeSectionId: string }) {
  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
