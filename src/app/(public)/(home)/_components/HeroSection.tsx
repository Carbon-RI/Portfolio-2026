/**
 * Server Component: Hero (Welcome) section for initial LCP.
 * Rendered in initial HTML to avoid JS-dependent LCP delay.
 */
interface HeroSectionProps {
  welcomeMessageHeading: string;
  welcomeMessageText: string;
}

export function HeroSection({
  welcomeMessageHeading,
  welcomeMessageText,
}: HeroSectionProps) {
  return (
    <section
      id="welcome"
      aria-label="Welcome Section"
      className="section-view-no-py flex items-center shrink-0 min-h-section lg:min-h-0 lg:h-full scroll-mt-(--header-height) lg:scroll-mt-0"
      style={
        {
          contentVisibility: "visible",
          contain: "content",
        } as React.CSSProperties
      }
    >
      <div className="max-w-2xl mx-auto px-4 lg:px-6 w-full py-8 lg:py-12">
        <h2 className="text-2xl md:text-3xl mb-6 text-content-primary">
          {welcomeMessageHeading}
        </h2>
        <p className="text-base md:text-lg font-light text-content-secondary whitespace-pre-wrap leading-relaxed">
          {welcomeMessageText}
        </p>
      </div>
    </section>
  );
}
