import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { verifyAdminSession } from "@/services/server/auth-service";
import {
  getPublishedProjects,
  getAllProjects,
} from "@/services/server/project-service";
import { getProfileSettings } from "@/services/server/profile-service";
import { defaultSettings } from "@/types/index";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getProfileSettings();
  const profile = result.success ? result.data : defaultSettings;

  return {
    title: profile.welcomeMessageHeading || "Debugging Life",
    description:
      profile.aboutMeText?.substring(0, 160) ||
      "Portfolio profile description.",
  };
}

const HomeClient = dynamic(
  () => import("./_components/HomeClient").then((mod) => mod.HomeClient),
  { ssr: true }
);

export default async function Home() {
  const [adminSession, profileResult] = await Promise.all([
    verifyAdminSession(),
    getProfileSettings(),
  ]);

  const isAdmin = adminSession.success;

  const projectsResult = isAdmin
    ? await getAllProjects()
    : await getPublishedProjects();

  const projects = projectsResult.success ? projectsResult.data : [];

  const profileSettings = profileResult.success
    ? profileResult.data
    : defaultSettings;

  return (
    <Suspense fallback={<div className="min-h-screen bg-base-bg" />}>
      <HomeClient
        projects={projects}
        profileSettings={profileSettings}
        isAdmin={isAdmin}
      />
    </Suspense>
  );
}
