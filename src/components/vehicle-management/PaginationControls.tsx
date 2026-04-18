import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  const maxVisible = 8;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Always show first + last, and a sliding window for the rest
  const middleCount = maxVisible - 2; // numbers between first/last

  const pages: (number | "...")[] = [1];

  let start = Math.max(2, current - Math.floor(middleCount / 2));
  let end = start + middleCount - 1;

  if (end > total - 1) {
    end = total - 1;
    start = end - middleCount + 1;
  }

  if (start > 2) pages.push("...");

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total - 1) pages.push("...");

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
    <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-muted-foreground">...</span>
          ) : (
            <Button
              key={page}
              type="button"
              size="sm"
              variant={page === currentPage ? "default" : "outline"}
              className="min-w-[2rem] px-2"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
