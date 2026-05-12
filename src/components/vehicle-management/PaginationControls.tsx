import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="inline-flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/20 p-1"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 transition-all hover:bg-background hover:text-foreground hover:shadow-sm disabled:pointer-events-none disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {pageNumbers.map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="flex h-7 w-5 items-center justify-center text-[11px] text-muted-foreground/50 select-none"
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              "inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1.5 text-xs font-medium transition-all",
              page === currentPage
                ? "bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 transition-all hover:bg-background hover:text-foreground hover:shadow-sm disabled:pointer-events-none disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
