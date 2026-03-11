"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";

/**
 * Minimal Client wrapper: omits Hero when admin to avoid duplicate id="welcome".
 * Non-admin: Hero (Server-rendered for LCP) is the only welcome section.
 * Admin: HomeRightPanel's SectionView id="welcome" is the sole welcome section.
 */
export function HeroVisibilityController({
  children,
}: {
  children: ReactNode;
}) {
  const { isAdmin } = useAuth();
  if (isAdmin) return null;
  return <>{children}</>;
}
