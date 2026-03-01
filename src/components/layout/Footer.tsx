import React from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="lg:fixed lg:bottom-0 z-20 w-full h-(--footer-height) bg-base-bg footer-border flex items-center justify-center px-4 shrink-0">
      <div className="text-xs-mono text-layer-medium tracking-widest text-center">
        <p suppressHydrationWarning>
          &copy; {currentYear} Ray (Ryo) Ito. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
