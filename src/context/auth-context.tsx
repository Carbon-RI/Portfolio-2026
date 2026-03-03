"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import type { User, Unsubscribe } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Defer Firebase init until after first paint (requestIdleCallback).
 * Firebase auth/iframe.js was blocking the critical path (412ms, 90KB).
 * @returns cleanup function
 */
function deferAfterLCP(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  let id: number | ReturnType<typeof setTimeout>;
  if ("requestIdleCallback" in window) {
    id = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(fn, { timeout: 800 });
  } else {
    id = setTimeout(fn, 100);
  }
  return () => {
    if ("cancelIdleCallback" in window) {
      (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id as number);
    } else {
      clearTimeout(id as ReturnType<typeof setTimeout>);
    }
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const unsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    let isMounted = true;
    let loadCleanup: (() => void) | undefined;

    const initAuth = async () => {
      try {
        const [{ getFirebaseAuth }, { onAuthStateChanged }] = await Promise.all([
          import("@/lib/firebase/client").then((m) => ({ getFirebaseAuth: m.getFirebaseAuth })),
          import("firebase/auth"),
        ]);
        const auth = getFirebaseAuth();

        unsubRef.current = onAuthStateChanged(auth, async (currentUser) => {
          if (!isMounted) return;
          setUser(currentUser);

          if (currentUser) {
            const res = await fetch("/api/auth/session");
            const data = await res.json();
            if (isMounted) setIsAdmin(!!data.isAdmin);
          } else {
            if (isMounted) setIsAdmin(false);
          }
          if (isMounted) setLoading(false);
        });
      } catch (error) {
        console.error("Auth init error:", error);
        if (isMounted) setLoading(false);
      }
    };

    loadCleanup = deferAfterLCP(initAuth);

    return () => {
      isMounted = false;
      loadCleanup?.();
      unsubRef.current?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
