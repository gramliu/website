import Link from "next/link";
import Layout from "../../src/components/Layout";
import NavPill from "../../src/components/NavPill";
import { getAllBlogMeta, type BlogPostMeta } from "../../src/lib/blogs";

export default function BlogIndexPage({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <Layout>
      <NavPill />
      <main className="mx-auto w-full max-w-3xl px-4 pt-32 pb-24">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">
          Blog
        </h1>
        <p className="text-lg text-text-faded mb-10">Writing and notes.</p>

        {posts.length === 0 ? (
          <div className="border border-gray-500 rounded-xl p-10 bg-bgcolor-primary text-center text-text-faded">
            Coming soon
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="border border-gray-500 rounded-xl p-5 bg-bgcolor-primary"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="no-underline text-text-primary hover:text-text-highlight transition-colors"
                >
                  <div className="text-2xl font-bold">
                    {post.frontmatter.title}
                  </div>
                </Link>
                {post.frontmatter.date && (
                  <div className="text-sm text-text-faded mt-1">
                    {post.frontmatter.date}
                  </div>
                )}
                {post.frontmatter.description && (
                  <div className="text-base text-text-primary mt-3">
                    {post.frontmatter.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}

export async function getStaticProps() {
  const posts = await getAllBlogMeta();
  return {
    props: { posts },
  };
}

