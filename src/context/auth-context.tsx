"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface AuthContextType {
  user: null;
  loading: boolean;
  isAdmin: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Session-first auth: does NOT load Firebase on initial page load.
 * Firebase Auth (auth/iframe.js ~90KB) is only loaded when user clicks Login
 * and submits credentials. This keeps Firebase off the critical path for LCP.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setIsAdmin(!!data?.isAdmin);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    refreshSession().finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{ user: null, loading, isAdmin, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
