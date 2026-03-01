import { AuthProvider } from "@/context/auth-context";
import { ReactNode } from "react";

interface ProviderWrapperProps {
  children: ReactNode;
  isAdmin: boolean;
}

export function ProviderWrapper({ children, isAdmin }: ProviderWrapperProps) {
  if (!isAdmin) {
    return <>{children}</>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}
