import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/services/server/project-service";

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url && process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production");
  }
  return (url || "http://localhost:3000").replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const projectsResult = await getPublishedProjects();
  if (projectsResult.success) {
    const projects = projectsResult.data.filter(
      (p) => p.published && p.showDetail
    );
    for (const project of projects) {
      if (project.slug) {
        entries.push({
          url: `${baseUrl}/projects/${project.slug}`,
          lastModified:
            typeof project.updatedAt === "number"
              ? new Date(project.updatedAt)
              : new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
