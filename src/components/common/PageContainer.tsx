import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <section
      className={cn(
        "flex flex-1 flex-col gap-4",
        className
      )}
    >
      {children}
    </section>
  );
}
