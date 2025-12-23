import { cn } from "~/utils/cn";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Generates an array of page numbers to display in pagination.
 * Shows first page, last page, current page, and pages around current.
 * Uses -1 to represent ellipsis.
 */
function getPageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: number[] = [];
  
  // Always show first page
  pages.push(0);
  
  if (currentPage > 2) {
    pages.push(-1); // ellipsis
  }
  
  // Pages around current
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);
  
  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }
  
  if (currentPage < totalPages - 3) {
    pages.push(-1); // ellipsis
  }
  
  // Always show last page
  if (!pages.includes(totalPages - 1)) {
    pages.push(totalPages - 1);
  }
  
  return pages;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Pagination>
        <PaginationContent className="h-10">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
              disabled={currentPage === 0}
              className={cn(
                "text-text-primary hover:text-white hover:bg-white/10 border-none",
                currentPage === 0 && "opacity-50 cursor-not-allowed"
              )}
            />
          </PaginationItem>

          {pageNumbers.map((pageNum, index) => (
            <PaginationItem key={pageNum === -1 ? `ellipsis-${index}` : pageNum}>
              {pageNum === -1 ? (
                <PaginationEllipsis className="text-text-faded" />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(pageNum)}
                  isActive={currentPage === pageNum}
                  className={cn(
                    "text-text-primary hover:text-white hover:bg-white/10 border-none min-w-10",
                    currentPage === pageNum && 
                      "bg-white/10 text-white border border-white/20"
                  )}
                >
                  {pageNum + 1}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
              disabled={currentPage === totalPages - 1}
              className={cn(
                "text-text-primary hover:text-white hover:bg-white/10 border-none",
                currentPage === totalPages - 1 && "opacity-50 cursor-not-allowed"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <div className="text-sm text-text-faded tracking-wide">
        Page {currentPage + 1} of {totalPages}
      </div>
    </div>
  );
}
