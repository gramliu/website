import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export type BlogFrontmatter = {
  title: string;
  description?: string;
  date?: string; // ISO8601 recommended (YYYY-MM-DD)
  tags?: string[];
  published?: boolean;
};

export type BlogPostMeta = {
  slug: string;
  frontmatter: BlogFrontmatter;
};

export type BlogPost = BlogPostMeta & {
  source: string;
};

const BLOGS_DIR = path.join(process.cwd(), "blogs");

function isMarkdocFile(filename: string) {
  return filename.endsWith(".md") || filename.endsWith(".mdoc");
}

function slugFromFilename(filename: string) {
  return filename.replace(/\.(md|mdoc)$/, "");
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const entries = await fs.readdir(BLOGS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && isMarkdocFile(e.name))
    .map((e) => slugFromFilename(e.name))
    .sort();
}

export async function getAllBlogMeta(): Promise<BlogPostMeta[]> {
  const entries = await fs.readdir(BLOGS_DIR, { withFileTypes: true });

  const metas = await Promise.all(
    entries
      .filter((e) => e.isFile() && isMarkdocFile(e.name))
      .map(async (e) => {
        const slug = slugFromFilename(e.name);
        const filePath = path.join(BLOGS_DIR, e.name);
        const raw = await fs.readFile(filePath, "utf8");
        const { data } = matter(raw);

        const frontmatter: BlogFrontmatter = {
          title: String(data.title ?? slug),
          description:
            typeof data.description === "string" ? data.description : undefined,
          date: typeof data.date === "string" ? data.date : undefined,
          tags: Array.isArray(data.tags)
            ? data.tags.map((t) => String(t))
            : undefined,
          published: typeof data.published === "boolean" ? data.published : true,
        };

        return { slug, frontmatter };
      })
  );

  // Newest first (if date is present); otherwise alphabetical.
  return metas
    .filter((m) => m.frontmatter.published !== false)
    .sort((a, b) => {
      const ad = a.frontmatter.date ? Date.parse(a.frontmatter.date) : NaN;
      const bd = b.frontmatter.date ? Date.parse(b.frontmatter.date) : NaN;
      if (!Number.isNaN(ad) && !Number.isNaN(bd)) return bd - ad;
      if (!Number.isNaN(ad) && Number.isNaN(bd)) return -1;
      if (Number.isNaN(ad) && !Number.isNaN(bd)) return 1;
      return a.slug.localeCompare(b.slug);
    });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  const mdPath = path.join(BLOGS_DIR, `${slug}.md`);
  const mdocPath = path.join(BLOGS_DIR, `${slug}.mdoc`);

  let filePath = mdPath;
  try {
    await fs.access(mdPath);
  } catch {
    filePath = mdocPath;
  }

  const raw = await fs.readFile(filePath, "utf8");
  const { content, data } = matter(raw);

  const frontmatter: BlogFrontmatter = {
    title: String(data.title ?? slug),
    description: typeof data.description === "string" ? data.description : undefined,
    date: typeof data.date === "string" ? data.date : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map((t) => String(t)) : undefined,
    published: typeof data.published === "boolean" ? data.published : true,
  };

  return {
    slug,
    frontmatter,
    source: content,
  };
}

