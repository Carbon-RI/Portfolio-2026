"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";

export function HeroVisibilityController({
  children,
}: {
  children: ReactNode;
}) {
  const { isAdmin } = useAuth();
  if (isAdmin) return null;
  return <>{children}</>;
}
