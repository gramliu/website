import { LinkIcon } from "lucide-react";
import { useState } from "react";
import blogs, { Blog } from "../config/blogs";

interface BlogEntryProps {
  blog: Blog;
}

function BlogEntry({ blog }: BlogEntryProps) {
  return (
    <div className="flex flex-col">
      <a
        href={blog.url}
        target="_blank"
        rel="noreferrer"
        className={
          "cursor-pointer text-lg md:text-2xl no-underline flex items-center text-text-primary hover:translate-y-[-3px] transition-all"
        }
      >
        {blog.title}
        <LinkIcon className="h-4 ml-1 opacity-80" />
      </a>
      <p className="text-sm text-text-faded">{blog.author}</p>
    </div>
  );
}

const PAGE_SIZE = 8;

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
  pages: Blog[][];
  setPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-row gap-2 ml-4 mb-10">
      {/* Previous button */}
      <button
        className="flex items-center justify-center text-2xl font-black text-text-primary h-8"
        onClick={() => setPage(Math.max(page - 1, 0))}
        disabled={page === 0}
        aria-label="Previous page"
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
        aria-label="Next page"
      >
        &gt;
      </button>
    </div>
  );
}

export default function Blogs({ className }: { className?: string }) {
  // Group essays into pages
  const pages = paginate(blogs, PAGE_SIZE);
  const [page, setPage] = useState(0);

  return (
    <div className={className}>
      <div
        id="essays"
        className="flex items-center justify-center text-center w-full font-bold text-3xl mb-8 mx-auto"
      >
        Essays
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        {pages.length > 1 ? (
          <PaginationControls page={page} pages={pages} setPage={setPage} />
        ) : null}
        <div className="flex flex-col gap-4 w-full md:w-8/12 h-128 items-start">
          {(pages[page] ?? []).map((blog) => (
            <BlogEntry blog={blog} key={blog.url} />
          ))}
        </div>
      </div>
    </div>
  );
}
