import { AuthProvider } from "@/context/auth-context";
import { ReactNode } from "react";

interface ProviderWrapperProps {
  children: ReactNode;
}

/** Always wraps with AuthProvider so isAdmin is resolved client-side. Enables static rendering. */
export function ProviderWrapper({ children }: ProviderWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
