import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  children,
  className,
  headerAction
}: SectionCardProps) {
  return (
    <Card className={cn("border-border/80 shadow-md", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <CardTitle className="text-sm font-heading sm:text-base">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1 text-xs sm:text-sm">
              {description}
            </CardDescription>
          )}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

