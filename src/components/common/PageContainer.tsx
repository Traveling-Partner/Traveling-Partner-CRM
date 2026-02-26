import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <section
      className={cn(
        "flex flex-1 flex-col gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm sm:p-6",
        "backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className
      )}
    >
      {children}
    </section>
  );
}

