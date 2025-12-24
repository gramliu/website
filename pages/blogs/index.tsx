import { motion } from "framer-motion";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Layout from "../../src/components/Layout";
import NavPill from "../../src/components/NavPill";
import { BlogPost, getAllBlogs } from "../../src/lib/markdoc/blogs";

interface BlogsPageProps {
  blogs: BlogPost[];
  showingDrafts: boolean;
}

function BlogCard({ blog }: { blog: BlogPost }) {
  const formattedDate = new Date(blog.frontmatter.date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Link href={`/blogs/${blog.slug}`} className="no-underline group">
      <div className="border border-gray-700 rounded-lg p-6 transition-all hover:border-gray-500 hover:bg-gray-900/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-semibold text-text-primary group-hover:text-text-highlight transition-colors">
              {blog.frontmatter.title}
              {!blog.frontmatter.published && (
                <span className="ml-2 text-xs bg-yellow-600/20 text-yellow-500 px-2 py-0.5 rounded">
                  Draft
                </span>
              )}
            </h2>
            <p className="text-text-faded mt-2">{blog.frontmatter.description}</p>
          </div>
          <time className="text-sm text-text-faded whitespace-nowrap">
            {formattedDate}
          </time>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-2xl md:text-3xl text-text-faded font-medium">
        Coming soon
      </p>
      <p className="text-text-faded mt-2">
        Check back later for new blog posts.
      </p>
    </div>
  );
}

export default function BlogsPage({ blogs, showingDrafts }: BlogsPageProps) {
  return (
    <Layout>
      <NavPill />
      <div className="min-h-screen pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Blog
            </h1>
            <p className="text-text-faded text-center mb-12">
              Thoughts, ideas, and reflections
            </p>
            {showingDrafts && (
              <div className="mb-8 p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg text-center">
                <p className="text-yellow-500 text-sm">
                  Showing drafts. <Link href="/blogs" className="underline">Hide drafts</Link>
                </p>
              </div>
            )}
          </motion.div>

          {blogs.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              {blogs.map((blog) => (
                <BlogCard key={blog.slug} blog={blog} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<BlogsPageProps> = async ({
  query,
}) => {
  const showDrafts = query.showDrafts === "true";
  const blogs = getAllBlogs(showDrafts);

  return {
    props: {
      blogs,
      showingDrafts: showDrafts,
    },
  };
};
