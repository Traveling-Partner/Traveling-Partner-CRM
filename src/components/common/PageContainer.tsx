import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <section
      className={cn(
        "flex flex-1 flex-col gap-6 rounded-2xl border border-border/80 bg-card p-4 shadow-lg sm:p-6",
        "ring-1 ring-black/5 dark:ring-white/5 transition-shadow duration-200",
        className
      )}
    >
      {children}
    </section>
  );
}

