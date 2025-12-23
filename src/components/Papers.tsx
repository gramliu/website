import { memo, useMemo, useState } from "react";
import { ResearchPaper } from "../server/getPapers";
import { LinkIcon } from "lucide-react";
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
  // Group papers into pages
  const pages = useMemo(() => paginate(papers, PAGE_SIZE), [papers]);
  const [page, setPage] = useState(0);
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
          onPageChange={setPage}
          className="mb-8"
        />
        <PaperList papers={currentPapers} />
      </div>
    </div>
  );
}
