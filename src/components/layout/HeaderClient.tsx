"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LG_QUERY, SCROLL_CONFIG, type SectionId } from "@/types";

interface HeaderClientProps {
  sections: readonly SectionId[];
}

export function HeaderClient({ sections }: HeaderClientProps) {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState<SectionId>("welcome");
  const router = useRouter();

  const headerHeightRef = useRef<number>(56);
  const matchMediaRef = useRef<MediaQueryList | null>(null);

  const updateHeaderHeight = useCallback(() => {
    if (typeof window === "undefined") return;
    const height = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height"
      )
    );
    if (!isNaN(height)) headerHeightRef.current = height;
  }, []);

  const handleScroll = useCallback(() => {
    if (matchMediaRef.current?.matches) return;
    const scrollPosition =
      window.scrollY +
      headerHeightRef.current +
      SCROLL_CONFIG.SECTION_ACTIVE_OFFSET_PX;

    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const height = rect.height;
        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveNav(id);
          break;
        }
      }
    }
  }, [sections]);

  const handleResize = useCallback(() => {
    updateHeaderHeight();
    handleScroll();
  }, [updateHeaderHeight, handleScroll]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    matchMediaRef.current = window.matchMedia(LG_QUERY);
    updateHeaderHeight();

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleScroll, handleResize, updateHeaderHeight]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: SectionId
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offsetPosition =
        element.getBoundingClientRect().top +
        window.scrollY -
        headerHeightRef.current;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { logout } = await import("@/services/client/auth-service");
      await logout();
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav
        className="flex lg:hidden justify-center px-2 h-full"
        aria-label="Mobile navigation"
      >
        <ul className="flex items-center gap-4 min-[375px]:gap-6 h-full">
          {sections.map((id) => (
            <li key={id} className="relative h-full flex items-center">
              <a
                href={`#${id}`}
                onClick={(e) => handleNavClick(e, id)}
                className={`text-xs-mono tracking-nav transition-all duration-fast ${
                  activeNav === id
                    ? "text-content-primary font-bold"
                    : "text-layer-medium hover:text-content-secondary"
                }`}
              >
                {id}
              </a>
              {activeNav === id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-content-primary animate-in fade-in duration-fast" />
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1 flex justify-end">
        {isAdmin ? (
          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn-secondary h-8 px-4"
          >
            {loading ? "..." : "Logout"}
          </button>
        ) : (
          <Link
            href="/admin-login"
            className="inline-flex items-center justify-center h-7 px-3 text-xs-mono text-layer-muted opacity-0 hover:opacity-100 hover:text-content-secondary transition-all duration-slow whitespace-nowrap"
          >
            <span className="relative top-[0.5px]">Login</span>
          </Link>
        )}
      </div>
    </>
  );
}
