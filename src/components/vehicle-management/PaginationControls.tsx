import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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
    <div className="flex items-center justify-end gap-1 px-1 py-2">
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
        aria-label="First page"
      >
        <ChevronsLeft className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      {pageNumbers.map((page) => (
        <Button
          key={page}
          type="button"
          size="sm"
          variant={page === currentPage ? "default" : "outline"}
          className="h-8 min-w-[2rem] px-2 text-xs"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
        aria-label="Last page"
      >
        <ChevronsRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
