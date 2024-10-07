import { LinkIcon } from "lucide-react";
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

export default function Blogs({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div
        id="papers"
        className="flex items-center justify-center text-center w-full font-bold text-3xl mb-8 mx-auto"
      >
        Blogs
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        <div className="flex flex-col gap-4 w-full md:w-8/12 h-128 items-start">
          {blogs.map((blog) => (
            <BlogEntry blog={blog} key={blog.url} />
          ))}
        </div>
      </div>
    </div>
  );
}
