import { getProjectData } from "@/services/server/project-service";
import { verifyAdminSession } from "@/services/server/auth-service";
import { mergeProjectAndDraft } from "@/services/utils/project-converter";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buttonClass } from "@/components/shared/Button";
import ProjectContentClient from "./_components/ProjectContentClient";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { Suspense } from "react";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProjectData(slug);
  if (!result.success) return {};
  const project = result.data;
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  const [projectResult, adminSession] = await Promise.all([
    getProjectData(slug),
    verifyAdminSession(),
  ]);

  if (!projectResult.success) {
    notFound();
  }

  const isAdmin = adminSession.success;
  const project = projectResult.data;

  if (!isAdmin && (!project.published || !project.showDetail)) {
    notFound();
  }

  const processedProject = isAdmin ? mergeProjectAndDraft(project) : project;

  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col justify-center items-center px-4 py-20 lg:py-24 text-center bg-base-bg transition-all duration-fast scroll-mt-(--header-height) lg:min-h-(--content-height-no-footer)">
          <p className="label-mono-small text-layer-medium mb-12">
            An error occurred while loading project details.
          </p>
          <Link href="/" className={buttonClass("primary")}>
            &larr; Return to Portfolio
          </Link>
        </div>
      }
    >
      <Suspense
        fallback={<div className="flex flex-col justify-center items-center px-4 py-20 lg:py-24 text-center bg-base-bg transition-all duration-fast scroll-mt-(--header-height) lg:min-h-(--content-height-no-footer)">Loading...</div>}
      >
        <ProjectContentClient project={processedProject} isAdmin={isAdmin} />
      </Suspense>
    </ErrorBoundary>
  );
}
