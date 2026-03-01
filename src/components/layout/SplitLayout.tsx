import React from "react";

interface SplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  hideLeftOnMobile?: boolean;
  scrollRef?: React.RefObject<HTMLElement | null>;
}

export const SplitLayout = ({
  left,
  right,
  hideLeftOnMobile = true,
  scrollRef,
}: SplitLayoutProps) => {
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
        ref={scrollRef}
        className="flex-1 bg-base-bg lg:h-full lg:overflow-y-auto no-scrollbar scroll-smooth"
      >
        {right}
      </main>
    </div>
  );
};
