/**
 * Server Component: Split layout for Hero LCP optimization.
 * Uses id instead of ref so Hero (Server) can be a direct child without Client boundary.
 */
import React from "react";

const MAIN_SCROLL_ID = "main-scroll";

export { MAIN_SCROLL_ID };

interface SplitLayoutServerProps {
  left: React.ReactNode;
  right: React.ReactNode;
  hideLeftOnMobile?: boolean;
}

export function SplitLayoutServer({
  left,
  right,
  hideLeftOnMobile = true,
}: SplitLayoutServerProps) {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 bg-base-bg lg:h-full overflow-hidden">
      <aside
        className={`${
          hideLeftOnMobile ? "hidden lg:flex" : "flex"
        } flex-col bg-base-surface lg:h-full border-b lg:border-b-0 lg:border-r border-base-border overflow-hidden`}
      >
        {left}
      </aside>

      <main
        id={MAIN_SCROLL_ID}
        className="flex-1 bg-base-bg lg:h-full lg:overflow-y-auto no-scrollbar scroll-smooth"
      >
        {right}
      </main>
    </div>
  );
}
