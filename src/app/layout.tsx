import type { Metadata, Viewport } from "next";
import { Oswald, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { defaultSettings } from "@/types/index";
import { Toaster } from "sonner";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oswald",
  display: "swap",
  preload: true,
  fallback: ["sans-serif"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: true,
  fallback: ["monospace"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { getProfileSettings } = await import(
      "@/services/server/profile-service"
    );
    const result = await getProfileSettings();

    const settings = result.success ? result.data : defaultSettings;

    const title = settings.siteTitle || "My Portfolio";
    const description =
      settings.siteDescription || "Welcome to my creative portfolio.";

    return {
      title: {
        default: title,
        template: `%s | ${title}`,
      },
      description: description,
    };
  } catch (error) {
    console.error("[Layout Metadata Error]:", error);
    return {
      title: "My Portfolio",
      description:
        "A professional portfolio showcasing my projects and skills.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${oswald.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="font-body bg-base-bg antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
