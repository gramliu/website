import { useMemo, useState } from "react";
import LinkIcon from "../icons/link";
import { ResearchPaper } from "../server/getPapers";

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
        <LinkIcon className="text-text-primary fill-text-primary h-4 ml-1 opacity-80" />
      </a>
      <p className="text-sm text-text-faded">
        {paper.authorSummary}, {paper.year}
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

function PaginationControls({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: ResearchPaper[][];
  setPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-row gap-2 ml-4 mb-10">
      {/* Previous button */}
      <button
        className="flex items-center justify-center text-2xl font-black text-text-primary h-8"
        onClick={() => setPage(Math.max(page - 1, 0))}
        disabled={page === 0}
      >
        &lt;
      </button>
      {/* Page number */}
      <div className="flex items-center tracking-widest justify-center text-2xl font-light text-white w-24 h-8">
        {page + 1}/{pages.length}
      </div>
      {/* Next button */}
      <button
        className="flex items-center justify-center text-2xl font-black text-white h-8"
        onClick={() => setPage(Math.min(page + 1, pages.length - 1))}
        disabled={page === pages.length - 1}
      >
        &gt;
      </button>
    </div>
  );
}

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

  return (
    <div className={className}>
      <div
        id="papers"
        className="flex items-center justify-center text-center w-full font-bold text-3xl mb-8 mx-auto"
      >
        Recently Read Papers
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        <PaginationControls
          page={page}
          pages={pages}
          setPage={setPage} />
        <div className="flex flex-col gap-4 w-full md:w-8/12 h-128 items-start">
          {pages[page].map((paper) => (
            <PaperEntry paper={paper} key={paper.title} />
          ))}
        </div>
      </div>
    </div>
  );
}
