import Link from "next/link";
import { cookies } from "next/headers";
import { HeaderClient } from "./HeaderClient";
import { SECTIONS } from "@/types";
import { AUTH_CONFIG } from "@/lib/constants";

export async function Header() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_CONFIG.SESSION_COOKIE);
  const isAdmin = !!session;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-(--header-height) bg-base-bg/90 backdrop-blur-sm header-border flex items-center shadow-sm">
      <div className="container-responsive px-4 lg:px-6 flex items-center justify-between h-full">
        <div className="flex-1 flex justify-start">
          <Link href="/" className="group flex items-center" aria-label="Home">
            <span className="text-lg font-heading font-bold tracking-tighter uppercase leading-none transition-all duration-fast text-content-primary group-hover:opacity-70">
              Ray
              <span className="inline-block text-current transition-all duration-fast group-hover:text-accent-1 group-hover:-translate-y-px">
                .
              </span>
            </span>
          </Link>
        </div>
        <HeaderClient isAdmin={isAdmin} sections={SECTIONS} />
      </div>
    </header>
  );
}
