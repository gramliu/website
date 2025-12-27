import { memo, useEffect, useMemo, useState } from "react";
import { ResearchPaper } from "../server/getPapers";
import { LinkIcon } from "lucide-react";
import { useRouter } from "next/router";
import PaginationControls from "./PaginationControls";

function PaperEntry({ paper }: { paper: ResearchPaper }) {
  return (
    <div className="flex flex-col">
      <a
        href={paper.url}
        target="_blank"
        rel="noreferrer"
        className={
          "cursor-pointer text-lg md:text-2xl no-underline flex items-center text-text-primary hover:translate-y-[-3px] transition-all"
        }
      >
        {paper.title}
        <LinkIcon className="h-4 ml-1 opacity-80" />
      </a>
      <p className="text-sm text-text-faded">
        {(paper.authorSummary == null || paper.authorSummary.trim() === "")
          ? paper.year
          : `${paper.authorSummary}, ${paper.year}`}
      </p>
    </div>
  );
}

const PAGE_SIZE = 10;

/**
 * Paginates an array into an array of arrays of length `pageSize`.
 */
function paginate<T>(array: T[], pageSize: number): T[][] {
  const pages = [];
  for (let i = 0; i < array.length; i += pageSize) {
    pages.push(array.slice(i, i + pageSize));
  }
  return pages;
}

/**
 * Memoized component for rendering the list of papers.
 * Prevents parent rerenders from causing unnecessary list updates.
 */
const PaperList = memo(function PaperList({ papers }: { papers: ResearchPaper[] }) {
  return (
    <div className="flex flex-col gap-4 w-full md:w-8/12 items-start">
      {papers.map((paper) => (
        <PaperEntry paper={paper} key={paper.title} />
      ))}
    </div>
  );
});

export default function Papers({
  papers,
  className,
}: {
  papers: ResearchPaper[];
  className?: string;
}) {
  const router = useRouter();
  // Group papers into pages
  const pages = useMemo(() => paginate(papers, PAGE_SIZE), [papers]);
  
  // Calculate initial page from query param
  const initialPage = useMemo(() => {
    if (!router.isReady) return 0;
    const papersPage = router.query.papersPage;
    if (typeof papersPage === "string") {
      const pageNum = parseInt(papersPage, 10);
      if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pages.length) {
        return pageNum;
      }
    }
    return 0;
  }, [router.isReady, router.query.papersPage, pages.length]);
  
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
          papersPage: newPage > 0 ? newPage.toString() : undefined,
        },
      },
      undefined,
      { shallow: true }
    );
  };
  
  const currentPapers = pages[page] ?? [];

  return (
    <div className={className}>
      <div
        id="papers"
        className="flex items-center justify-center text-center w-full font-bold text-3xl mb-8 mx-auto"
      >
        Papers
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        <PaginationControls
          currentPage={page}
          totalPages={pages.length}
          onPageChange={handlePageChange}
          className="mb-8"
        />
        <PaperList papers={currentPapers} />
      </div>
    </div>
  );
}
