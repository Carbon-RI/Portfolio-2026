import { ProviderWrapper } from "@/context/provider-wrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProviderWrapper>
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
