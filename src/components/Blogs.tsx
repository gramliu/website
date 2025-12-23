import { LinkIcon } from "lucide-react";
import { memo, useMemo, useState } from "react";
import blogs, { Blog } from "../config/blogs";
import PaginationControls from "./PaginationControls";

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

/**
 * Memoized component for rendering the list of blogs.
 * Prevents parent rerenders from causing unnecessary list updates.
 */
const BlogList = memo(function BlogList({ blogs }: { blogs: Blog[] }) {
  return (
    <div className="flex flex-col gap-4 w-full md:w-8/12 items-start">
      {blogs.map((blog) => (
        <BlogEntry blog={blog} key={blog.url} />
      ))}
    </div>
  );
});

export default function Blogs({ className }: { className?: string }) {
  // Group essays into pages
  const pages = useMemo(() => paginate(blogs, PAGE_SIZE), []);
  const [page, setPage] = useState(0);
  const currentBlogs = pages[page] ?? [];

  return (
    <div className={className}>
      <div
        id="essays"
        className="flex items-center justify-center text-center w-full font-bold text-3xl mb-8 mx-auto"
      >
        Essays
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        <PaginationControls
          currentPage={page}
          totalPages={pages.length}
          onPageChange={setPage}
          className="mb-8"
        />
        <BlogList blogs={currentBlogs} />
      </div>
    </div>
  );
}
