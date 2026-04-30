import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): number[] {
  const maxVisible = 5;
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = current;
  let end = start + maxVisible - 1;

  if (end > total) {
    end = total;
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        {pageNumbers.map((page) => (
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
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </Button>
      </div>
    </div>
  );
}
