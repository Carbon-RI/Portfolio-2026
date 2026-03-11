import type { Metadata, Viewport } from "next";
import { Oswald, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { defaultSettings } from "@/types/index";
import { Toaster } from "sonner";

function getMetadataBase(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oswald",
  display: "swap",
  preload: true,
  fallback: ["sans-serif"],
  adjustFontFallback: true,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: true,
  fallback: ["monospace"],
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
      metadataBase: new URL(getMetadataBase()),
      title: {
        default: title,
        template: `%s | ${title}`,
      },
      description: description,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      openGraph: {
        type: "website",
      },
    };
  } catch (error) {
    console.error("[Layout Metadata Error]:", error);
    return {
      metadataBase: new URL(getMetadataBase()),
      title: "My Portfolio",
      description:
        "A professional portfolio showcasing my projects and skills.",
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        type: "website",
      },
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
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
