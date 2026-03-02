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

export async function generateStaticParams() {
  const result = await getPublishedProjects();
  if (!result.success) return [];
  return result.data.map((project) => ({
    slug: project.slug,
  }));
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string }>;
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

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { slug } = await params;
  const { edit } = await searchParams;

  const isAdmin = edit === "true";

  const result = await getProjectData(slug);
  if (!result.success) {
    notFound();
  }

  // 管理者の場合は下書きをマージしたデータを、一般ユーザーは確定データを使用
  const processedProject = isAdmin
    ? mergeProjectAndDraft(result.data)
    : result.data;

  // 管理者でない、かつ「非公開」または「詳細表示オフ」の場合は404
  if (
    !isAdmin &&
    (!processedProject.published || !processedProject.showDetail)
  ) {
    notFound();
  }

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
