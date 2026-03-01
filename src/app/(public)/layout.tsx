import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/constants";
import { ProviderWrapper } from "@/context/provider-wrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get(AUTH_CONFIG.SESSION_COOKIE);

  return (
    <ProviderWrapper isAdmin={isAdmin}>
      <div className="flex flex-col min-h-svh lg:h-svh lg:overflow-hidden">
        <Header />
        <main className="w-full flex-1 bg-base-bg lg:overflow-hidden mt-(--header-height)">
          <div className="lg:h-(--content-height)">{children}</div>
        </main>
        <Footer />
      </div>
    </ProviderWrapper>
  );
}
