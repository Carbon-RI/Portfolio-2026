import { twMerge } from "tailwind-merge";

const BASE =
  "flex flex-col justify-center items-center px-4 text-center bg-base-bg transition-all duration-fast scroll-mt-(--header-height) lg:scroll-mt-0";

interface SectionViewProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function SectionView({
  className = "",
  children,
  ...props
}: SectionViewProps) {
  return (
    <section className={twMerge(BASE, className)} {...props}>
      {children}
    </section>
  );
}
