import { ComponentPropsWithoutRef } from "react";

type SocialIconProps = ComponentPropsWithoutRef<"svg"> & {
  title?: string;
};

const DEFAULT_CLASSES = "fill-current duration-fast";

const createIcon = (path: string, displayName: string) => {
  const Icon = ({ className, title, ...props }: SocialIconProps) => (
    <svg
      className={`${DEFAULT_CLASSES} ${className || "icon-sm"}`}
      viewBox="0 0 24 24"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title || displayName}</title>
      <path d={path} />
    </svg>
  );
  return Icon;
};

export const LinkedInIcon = createIcon(
  "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.535-4 0v5.604h-3v-11h3v1.765c1.395-2.536 7-2.35 7 2.09z",
  "LinkedIn"
);

export const GitHubIcon = createIcon(
  "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.805 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.085-.733.085-.716.085-.716 1.205.086 1.838 1.238 1.838 1.238 1.07 1.835 2.809 1.305 3.49.996.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.233.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.292-1.555 3.3-1.233 3.3-1.233.652 1.652.241 2.873.118 3.176.766.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.923.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.787.576 4.757-1.583 8.197-6.081 8.197-11.383 0-6.627-5.373-12-12-12z",
  "GitHub"
);

export const EmailIcon = createIcon(
  "M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z",
  "Email"
);
