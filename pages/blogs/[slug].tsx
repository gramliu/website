import Markdoc from "@markdoc/markdoc";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import React from "react";
import { Helmet } from "react-helmet";
import Layout from "../../src/components/Layout";
import NavPill from "../../src/components/NavPill";
import {
  BlogFrontmatter,
  getAllBlogs,
  getBlogBySlug,
} from "../../src/lib/markdoc/blogs";

interface BlogPostPageProps {
  frontmatter: BlogFrontmatter;
  content: string;
}

export default function BlogPostPage({
  frontmatter,
  content,
}: BlogPostPageProps) {
  const formattedDate = new Date(frontmatter.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Parse and render markdoc content
  const ast = Markdoc.parse(content);
  const transformedContent = Markdoc.transform(ast);
  const renderedContent = Markdoc.renderers.react(transformedContent, React);

  return (
    <>
      <Helmet>
        <title>{frontmatter.title} | Gram Liu</title>
        <meta name="description" content={frontmatter.description} />
      </Helmet>
      <Layout>
        <NavPill />
        <div className="min-h-screen pt-32 pb-16 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-text-faded hover:text-text-primary transition-colors mb-8 no-underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to blog
              </Link>

              <header className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {frontmatter.title}
                  {!frontmatter.published && (
                    <span className="ml-3 text-sm bg-yellow-600/20 text-yellow-500 px-2 py-1 rounded align-middle">
                      Draft
                    </span>
                  )}
                </h1>
                <p className="text-text-faded text-lg mb-4">
                  {frontmatter.description}
                </p>
                <time className="text-sm text-text-faded">{formattedDate}</time>
              </header>

              <article className="prose prose-invert prose-lg max-w-none">
                {renderedContent}
              </article>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate paths for ALL blogs including drafts
  const blogs = getAllBlogs(true);

  const paths = blogs.map((blog) => ({
    params: { slug: blog.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({
  params,
}) => {
  const slug = params?.slug as string;

  // Get blog including drafts - all pages are statically generated
  const blog = getBlogBySlug(slug, true);

  if (!blog) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      frontmatter: blog.frontmatter,
      content: blog.content,
    },
  };
};
