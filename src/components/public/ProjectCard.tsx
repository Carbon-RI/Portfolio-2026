import React from "react";
import Link from "next/link";
import Image from "next/image";
import { TechIconResolver } from "@/components/shared/TechIconResolver";
import { TechIconKey, ProjectStatus } from "@/types";
import { FaExternalLinkAlt, FaFileAlt, FaGithub } from "react-icons/fa";
import { EditProjectButton } from "./EditProjectButton";

interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  slug: string;
  category: string | string[];
  industry: string;
  summary: string;
  techStack: TechIconKey[];
  imageSrc?: string;
  githubUrl?: string;
  demoUrl?: string;
  isAdmin: boolean;
  onEditProject: (slug: string) => void;
  status?: ProjectStatus;
  showDetail: boolean;
  index?: number;
  priority?: boolean;
}

export const ProjectCard = ({
  title,
  slug,
  category,
  industry,
  summary,
  techStack,
  imageSrc,
  githubUrl,
  demoUrl,
  className = "",
  style,
  isAdmin,
  onEditProject,
  status,
  showDetail,
  index = 0,
  priority = false,
}: ProjectCardProps) => {
  const processNotesPath = `/projects/${slug}`;
  const isValidImageSrc = imageSrc && imageSrc !== "TBD";
  const shouldShowDetailLink = isAdmin ? !!slug : showDetail;
  const isLCP = priority || index === 0;

  let borderColorClass = "border-base-border";
  let statusBadge = null;

  if (isAdmin && status) {
    const badgeBaseClass =
      "absolute top-4 left-4 z-20 text-xs-mono font-bold px-2 py-0.5 tracking-widest border border-white/10 shadow-lg";
    const statusMap: Record<
      ProjectStatus,
      { label: string; bg: string; border: string }
    > = {
      DraftModified: {
        label: "Modified",
        bg: "bg-accent-1 text-base-bg",
        border: "border-accent-1",
      },
      NewDraft: {
        label: "Draft",
        bg: "bg-accent-2 text-base-bg",
        border: "border-accent-2",
      },
      Unpublished: {
        label: "Private",
        bg: "bg-layer-muted text-base-bg",
        border: "border-base-border",
      },
      Deleted: {
        label: "Deleted",
        bg: "bg-red-600 text-white",
        border: "border-red-600",
      },
      Published: {
        label: "Published",
        bg: "bg-content-primary text-base-bg",
        border: "border-base-border",
      },
    };
    const currentStatus = statusMap[status] || statusMap.Published;
    statusBadge = (
      <span className={`${badgeBaseClass} ${currentStatus.bg}`}>
        {currentStatus.label}
      </span>
    );
    borderColorClass = currentStatus.border;
  }

  const categoriesList = Array.isArray(category) ? category : [category];

  return (
    <div
      className={`bg-base-bg transition-all duration-normal overflow-hidden border ${borderColorClass} flex flex-col [@media(max-width:1023px)_and_(max-height:499px)]:flex-row h-full relative group ${className}`}
      style={style}
    >
      {statusBadge}

      <div className="flex flex-col w-full shrink-0 header-border overflow-hidden bg-base-surface/20 [@media(max-width:1023px)_and_(max-height:499px)]:w-[42%] [@media(max-width:1023px)_and_(max-height:499px)]:border-b-0 [@media(max-width:1023px)_and_(max-height:499px)]:border-r border-base-border">
        <div className="aspect-video lg:aspect-auto lg:h-(--project-card-image-height) w-full relative overflow-hidden shrink-0 header-border">
          {isValidImageSrc ? (
            <Image
              src={imageSrc as string}
              alt={title}
              fill
              priority={isLCP}
              className="scale-100 grayscale transition-all duration-slow ease-out group-hover:scale-105 group-hover:grayscale-0 object-cover object-[center_40%]"
              sizes="(max-width: 1023px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-base-surface">
              <p className="text-layer-medium font-heading text-xs-mono">
                Visual TBD
              </p>
            </div>
          )}
        </div>

        <div className="p-4 lg:px-6 flex flex-col justify-start lg:flex-initial shrink-0">
          <div className="flex items-center gap-x-2 mb-2">
            <span className="shrink-0 text-meta font-mono text-content-primary bg-base-surface px-1.5 py-0.5 uppercase tracking-nav border border-base-border">
              {industry || "\u00A0"}
            </span>
            <div className="flex gap-x-1.5 overflow-hidden text-meta font-mono text-layer-medium uppercase tracking-nav min-w-0">
              {categoriesList.length > 0 ? (
                categoriesList.map((cat) => <span key={cat}>/ {cat}</span>)
              ) : (
                <span className="text-transparent">/</span>
              )}
            </div>
          </div>
          <h3 className="text-lg lg:text-xl leading-tight font-heading font-bold text-content-primary uppercase tracking-heading line-clamp-2">
            {title || "\u00A0"}
          </h3>
        </div>
      </div>

      <div className="p-4 lg:py-2 flex flex-col flex-1 bg-base-bg overflow-hidden">
        <div className="shrink-0 mb-(--project-card-gap,1.5rem)">
          <p className="text-start text-layer-medium text-sm lg:text-card-body leading-relaxed font-light line-clamp-3 [@media(min-height:600px)]:line-clamp-5 whitespace-pre-wrap">
            {summary || "\u00A0"}
          </p>
        </div>

        <div className="mb-(--project-card-gap,1.5rem) shrink-0 pt-(--project-card-gap,1.5rem) footer-border min-h-8 mt-auto">
          <div className="flex flex-wrap gap-2 lg:gap-3">
            {techStack.map((iconKey) => (
              <TechIconResolver
                key={iconKey}
                iconKey={iconKey}
                className="text-lg lg:text-xl text-layer-medium grayscale group-hover:grayscale-0 transition-all duration-normal"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 py-3 footer-border min-h-8">
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link flex items-center"
            >
              <FaExternalLinkAlt className="w-3 h-3 mr-1.5" /> Site
            </a>
          )}
          {shouldShowDetailLink && (
            <Link
              href={processNotesPath}
              className="nav-link flex items-center text-content-primary font-bold"
            >
              <FaFileAlt className="w-3 h-3 mr-1.5" /> Notes
            </Link>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link flex items-center"
            >
              <FaGithub className="w-3 h-3 mr-1.5" /> Code
            </a>
          )}
        </div>
      </div>

      {isAdmin && <EditProjectButton slug={slug} onEdit={onEditProject} />}
    </div>
  );
};
