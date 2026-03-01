import { TechIconMap, TechIconKey } from "@/services/utils/tech-icons";

interface TechIconResolverProps {
  iconKey: TechIconKey;
  className?: string;
}

export const TechIconResolver = ({
  iconKey,
  className = "",
}: TechIconResolverProps) => {
  const IconComponent = TechIconMap[iconKey];
  const baseClasses = "text-4xl inline-block transition-all duration-fast";

  if (!IconComponent) {
    return (
      <div
        className={`${baseClasses} ${className} icon-xs bg-layer-faint border border-dashed border-layer-muted flex items-center justify-center`}
        title={`Missing icon: ${iconKey}`}
      >
        <span className="text-micro text-layer-medium uppercase">?</span>
      </div>
    );
  }

  return (
    <IconComponent
      className={`${baseClasses} ${className}`}
      aria-label={iconKey}
    />
  );
};
