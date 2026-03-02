import { getProjectData } from "@/services/server/project-service";
import { verifyAdminSession } from "@/services/server/auth-service";
import { mergeProjectAndDraft } from "@/services/utils/project-converter";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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

  // 未公開・詳細非表示のプロジェクトは管理者以外 404
  if (!isAdmin && (!project.published || !project.showDetail)) {
    notFound();
  }

  // 管理者はドラフトをマージした最新データを表示
  const processedProject = isAdmin ? mergeProjectAndDraft(project) : project;

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
