import Markdoc from "@markdoc/markdoc";
import fs from "fs";
import path from "path";

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  published: boolean;
  slug: string;
}

export interface BlogPost {
  frontmatter: BlogFrontmatter;
  content: string;
  slug: string;
}

const BLOGS_DIR = path.join(process.cwd(), "blogs");

/**
 * Parse frontmatter from markdoc content
 */
function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  content: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content };
  }

  const frontmatterStr = match[1];
  const markdownContent = match[2];

  const frontmatter: Record<string, unknown> = {};
  const lines = frontmatterStr.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: string | boolean = line.slice(colonIndex + 1).trim();

    // Handle boolean values
    if (value === "true") value = true;
    else if (value === "false") value = false;
    // Remove quotes if present
    else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return { frontmatter, content: markdownContent };
}

/**
 * Get all blog posts
 * @param includeUnpublished - Whether to include unpublished posts
 */
export function getAllBlogs(includeUnpublished = false): BlogPost[] {
  if (!fs.existsSync(BLOGS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOGS_DIR);
  const markdocFiles = files.filter((file) => file.endsWith(".md"));

  const blogs: BlogPost[] = [];

  for (const file of markdocFiles) {
    const filePath = path.join(BLOGS_DIR, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { frontmatter, content } = parseFrontmatter(fileContent);

    const slug = file.replace(/\.md$/, "");

    const blogPost: BlogPost = {
      frontmatter: {
        title: (frontmatter.title as string) || "Untitled",
        description: (frontmatter.description as string) || "",
        date: (frontmatter.date as string) || "",
        published: frontmatter.published === true,
        slug,
      },
      content,
      slug,
    };

    // Filter out unpublished posts unless explicitly requested
    if (includeUnpublished || blogPost.frontmatter.published) {
      blogs.push(blogPost);
    }
  }

  // Sort by date, newest first
  blogs.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date);
    const dateB = new Date(b.frontmatter.date);
    return dateB.getTime() - dateA.getTime();
  });

  return blogs;
}

/**
 * Get a single blog post by slug
 */
export function getBlogBySlug(
  slug: string,
  includeUnpublished = false
): BlogPost | null {
  const filePath = path.join(BLOGS_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, content } = parseFrontmatter(fileContent);

  const blogPost: BlogPost = {
    frontmatter: {
      title: (frontmatter.title as string) || "Untitled",
      description: (frontmatter.description as string) || "",
      date: (frontmatter.date as string) || "",
      published: frontmatter.published === true,
      slug,
    },
    content,
    slug,
  };

  // Don't return unpublished posts unless explicitly requested
  if (!includeUnpublished && !blogPost.frontmatter.published) {
    return null;
  }

  return blogPost;
}

/**
 * Parse and render markdoc content to React
 */
export function parseMarkdocContent(content: string) {
  const ast = Markdoc.parse(content);
  const transformedContent = Markdoc.transform(ast);
  return transformedContent;
}
