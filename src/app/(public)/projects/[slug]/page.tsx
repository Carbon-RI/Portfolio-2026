import {
  getPublishedProjects,
  getProjectData,
} from "@/services/server/project-service";
import { mergeProjectAndDraft } from "@/services/utils/project-converter";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProjectContentClient from "./_components/ProjectContentClient";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { Suspense } from "react";

/**
 * Generates static params for all published projects.
 * Improved error logging for build-time debugging.
 */
export async function generateStaticParams() {
  const result = await getPublishedProjects();

  if (!result.success) {
    console.error(
      "[generateStaticParams] Failed to fetch projects:",
      result.error
    );
    return [];
  }

  return result.data.map((project) => ({
    slug: project.slug,
  }));
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProjectData(slug);

  if (!result.success || !result.data.published || !result.data.showDetail) {
    return {};
  }

  const project = result.data;
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  const isAdmin = false;

  const result = await getProjectData(slug);

  if (!result.success) {
    notFound();
  }

  const projectData = result.data;

  if (!projectData.published || !projectData.showDetail) {
    notFound();
  }

  const processedProject = projectData;

  return (
    <ErrorBoundary
      fallback={
        <div className="section-view bg-base-bg">
          <p className="label-mono-small text-layer-medium mb-12">
            An error occurred while loading project details.
          </p>
          <Link href="/" className="btn-primary">
            &larr; Return to Portfolio
          </Link>
        </div>
      }
    >
      <Suspense
        fallback={<div className="section-view bg-base-bg">Loading...</div>}
      >
        <ProjectContentClient project={processedProject} isAdmin={isAdmin} />
      </Suspense>
    </ErrorBoundary>
  );
}
