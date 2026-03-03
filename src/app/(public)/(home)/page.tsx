import { Metadata } from "next";
import { getPublishedProjects } from "@/services/server/project-service";
import { getProfileSettings } from "@/services/server/profile-service";
import { defaultSettings } from "@/types/index";
import { SplitLayoutServer } from "@/components/layout/SplitLayoutServer";
import { HeroSection } from "./_components/HeroSection";
import { HeroVisibilityController } from "./_components/HeroVisibilityController";
import { HomeLeftPanelWithObserver } from "./_components/HomeLeftPanelWithObserver";
import { HomeRightContent } from "./_components/HomeRightContent";

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

export default async function Home() {
  const [profileResult, projectsResult] = await Promise.all([
    getProfileSettings(),
    getPublishedProjects(),
  ]);

  const profileSettings = profileResult.success
    ? profileResult.data
    : defaultSettings;
  const projects = projectsResult.success ? projectsResult.data : [];

  return (
    <SplitLayoutServer
      hideLeftOnMobile={true}
      left={
        <HomeLeftPanelWithObserver profileSettings={profileSettings} />
      }
      right={
        <>
          {/* Hero: Server-rendered, minimal Client wrapper only for admin hide */}
          <HeroVisibilityController>
            <HeroSection
              welcomeMessageHeading={profileSettings.welcomeMessageHeading ?? ""}
              welcomeMessageText={profileSettings.welcomeMessageText ?? ""}
            />
          </HeroVisibilityController>
          <HomeRightContent
            profileSettings={profileSettings}
            projects={projects}
          />
        </>
      }
    />
  );
}
