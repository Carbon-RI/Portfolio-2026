"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";

/**
 * Minimal Client wrapper: hides Hero when admin (avoids duplicate Welcome section).
 * Uses display:none to avoid CLS. Hero is Server-rendered for LCP.
 */
export function HeroVisibilityController({
  children,
}: {
  children: ReactNode;
}) {
  const { isAdmin } = useAuth();
  return (
    <div style={{ display: isAdmin ? "none" : "block" }}>{children}</div>
  );
}
