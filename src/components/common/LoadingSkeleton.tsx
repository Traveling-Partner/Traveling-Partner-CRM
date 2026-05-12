import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  lines?: number;
}

export function LoadingSkeleton({ lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4 w-full rounded-md bg-muted/80 last:w-2/3"
        />
      ))}
    </div>
  );
}

