import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/constants";
import { getPublishedProjects } from "@/services/server/project-service";
import { getProfileSettings } from "@/services/server/profile-service";
import { defaultSettings } from "@/types/index";

export const revalidate = 60;

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
  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get(AUTH_CONFIG.SESSION_COOKIE);

  const [projectsResult, profileResult] = await Promise.all([
    getPublishedProjects(),
    getProfileSettings(),
  ]);

  const projects = projectsResult.success ? projectsResult.data : [];
  const profileSettings = profileResult.success
    ? profileResult.data
    : defaultSettings;

  if (!projectsResult.success || !profileResult.success) {
    console.error("[Home Page] Data fetching failed:", {
      projectsError: !projectsResult.success ? projectsResult.error : null,
      profileError: !profileResult.success ? profileResult.error : null,
    });
  }

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
