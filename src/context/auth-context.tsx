"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User, Unsubscribe } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribe: Unsubscribe;
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth");
        const auth = getFirebaseAuth();

        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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

    initAuth();
    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
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
