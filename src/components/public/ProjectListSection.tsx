"use client";

import React, { useCallback } from "react";
import { ProjectCard } from "@/components/public/ProjectCard";
import { ProjectCardData, FullProjectData } from "@/types";

interface ProjectListSectionProps {
  projects: ProjectCardData[];
  isAdmin: boolean;
  onProjectDataChange: () => void; // 互換性のために維持
  onSelectProject: (project: FullProjectData) => void;
}

// テンプレート作成ロジックの分離（isAdmin時のみ動的に使う）
const createNewProjectTemplate = (newId: string): FullProjectData => ({
  id: newId,
  slug: "",
  title: "",
  summary: "",
  category: [],
  industry: "",
  techStack: [],
  imageSrc: "",
  githubUrl: "",
  demoUrl: "",
  published: false,
  is_deleted: false,
  updatedAt: undefined,
  sections: [],
  showDetail: false,
});

export const ProjectListSection = ({
  projects,
  isAdmin,
  onSelectProject,
}: ProjectListSectionProps) => {
  const onEditProject = useCallback(
    async (id: string, currentSlug: string) => {
      if (!isAdmin) return;
      if (!currentSlug) {
        onSelectProject(createNewProjectTemplate(id));
        return;
      }

      try {
        // 実行時のみサーバーアクションをインポートすることでバンドルサイズを削減
        const { getProjectData } = await import(
          "@/services/server/project-service"
        );
        const result = await getProjectData(id);
        if (result.success) {
          onSelectProject(result.data);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    },
    [isAdmin, onSelectProject]
  );

  const handleNewProject = useCallback(async () => {
    if (!isAdmin) return;
    try {
      // FirebaseクライアントSDKも実行時のみインポート
      const { doc, collection } = await import("firebase/firestore");
      const { getDb } = await import("@/lib/firebase/client");
      const db = getDb();
      const newDocRef = doc(collection(db, "projects"));
      onSelectProject(createNewProjectTemplate(newDocRef.id));
    } catch (error) {
      console.error("Failed to initialize new project:", error);
    }
  }, [isAdmin, onSelectProject]);

  const cardContainerClass =
    "shrink-0 snap-center h-full w-(--card-width,var(--card-width-mobile))";

  return (
    <div id="projects-list-wrapper" className="h-full w-full">
      <div className="flex flex-row w-max h-full items-stretch flex-nowrap px-4 lg:px-6 md:px-8">
        {projects.map((project, index) => {
          // Admin用の変換ロジックも、一般ユーザーには不要なら中で分岐
          const isLast = index === projects.length - 1 && !isAdmin;

          return (
            <ProjectCard
              key={project.id}
              {...project}
              index={index}
              isAdmin={isAdmin}
              onEditProject={() => onEditProject(project.id, project.slug)}
              showDetail={project.showDetail}
              // LCPをWelcomeセクションに譲るため、priorityをfalseに（または1つだけに制限）
              priority={false}
              className={`${cardContainerClass} ${isLast ? "" : "mr-8"}`}
            />
          );
        })}

        {isAdmin && (
          <div className={cardContainerClass}>
            <button
              onClick={handleNewProject}
              className="group w-full h-full border border-dashed border-base-border flex flex-col gap-4 items-center justify-center bg-layer-faint hover:text-content-primary hover:border-content-primary hover:bg-base-surface transition-all duration-normal p-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="w-8 h-8 text-layer-medium group-hover:text-content-primary transition-all duration-normal"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span className="text-xs-mono text-layer-medium">
                Add New Project
              </span>
            </button>
          </div>
        )}
        <div className="shrink-0 w-6 h-full" />
      </div>
    </div>
  );
};
