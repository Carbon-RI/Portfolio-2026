"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Session-first auth: Uses /api/auth/session (cookie) only. Does NOT load Firebase Auth
 * on initial page load. This avoids apis.google.com and third-party cookies until the
 * user explicitly clicks Login. Keeps Best Practice score at 100 for normal browsers.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkSession = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setIsAdmin(!!data.isAdmin);
    } catch (error) {
      console.error("Session check error:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const refreshSession = React.useCallback(async () => {
    setLoading(true);
    await checkSession();
  }, [checkSession]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
