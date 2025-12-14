import Link from "next/link";
import type { GetStaticPropsContext } from "next";
import Layout from "../../src/components/Layout";
import NavPill from "../../src/components/NavPill";
import MarkdocRenderer from "../../src/components/markdoc/MarkdocRenderer";
import { parseMarkdoc } from "../../src/lib/markdoc";
import {
  getAllBlogSlugs,
  getBlogPostBySlug,
  type BlogPost,
} from "../../src/lib/blogs";

export default function BlogPostPage({ post }: { post: BlogPost }) {
  const content = parseMarkdoc(post.source);

  return (
    <Layout>
      <NavPill />
      <main className="mx-auto w-full max-w-3xl px-4 pt-32 pb-24">
        <div className="mb-10">
          <Link
            href="/blog"
            className="hoverLink text-highlight no-underline text-sm"
          >
            ← All posts
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mt-4">
            {post.frontmatter.title}
          </h1>
          {post.frontmatter.date && (
            <div className="text-sm text-text-faded mt-3">
              {post.frontmatter.date}
            </div>
          )}
          {post.frontmatter.description && (
            <div className="text-lg text-text-faded mt-4">
              {post.frontmatter.description}
            </div>
          )}
        </div>

        <article>
          <MarkdocRenderer content={content} />
        </article>
      </main>
    </Layout>
  );
}

export async function getStaticPaths() {
  const slugs = await getAllBlogSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps(ctx: GetStaticPropsContext) {
  const slug = String(ctx.params?.slug ?? "");
  const post = await getBlogPostBySlug(slug);
  return {
    props: { post },
  };
}

