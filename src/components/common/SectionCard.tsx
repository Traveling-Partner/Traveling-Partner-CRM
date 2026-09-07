import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  icon?: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  children,
  className,
  headerAction,
  icon
}: SectionCardProps) {
  return (
    <div className={cn("glass-panel overflow-hidden rounded-[2rem]", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-0 bg-transparent px-6 pt-6 sm:px-7 sm:pt-7">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon ? <div className="shrink-0">{icon}</div> : null}
          <div className="min-w-0 flex-1">
            <CardTitle className="font-heading text-xl font-semibold tracking-tight">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1 text-sm">{description}</CardDescription>
            )}
          </div>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-4 sm:px-7 sm:pb-7">{children}</CardContent>
    </div>
  );
}
