import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

interface UsePaginationOptions {
  /**
   * The name of the query parameter to use for the page number
   * @example "blogsPage" or "papersPage"
   */
  queryParamName: string;
  /**
   * Total number of pages available
   */
  totalPages: number;
}

interface UsePaginationReturn {
  /**
   * Current page number (0-indexed)
   */
  page: number;
  /**
   * Function to change the page
   */
  handlePageChange: (newPage: number) => void;
}

/**
 * Custom hook for managing pagination state with URL query parameters.
 * 
 * @param options - Configuration options for pagination
 * @returns Object containing current page and page change handler
 * 
 * @example
 * ```tsx
 * const { page, handlePageChange } = usePagination({
 *   queryParamName: "blogsPage",
 *   totalPages: 5
 * });
 * ```
 */
export function usePagination({
  queryParamName,
  totalPages,
}: UsePaginationOptions): UsePaginationReturn {
  const router = useRouter();

  // Calculate initial page from query param
  const initialPage = useMemo(() => {
    if (!router.isReady) return 0;
    const pageParam = router.query[queryParamName];
    if (typeof pageParam === "string") {
      const pageNum = parseInt(pageParam, 10);
      if (!isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
        return pageNum;
      }
    }
    return 0;
  }, [router.isReady, router.query[queryParamName], totalPages, queryParamName]);

  const [page, setPage] = useState(initialPage);

  // Sync page state with query params when they change
  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  // Update URL when page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          [queryParamName]: newPage > 0 ? newPage.toString() : undefined,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return {
    page,
    handlePageChange,
  };
}
