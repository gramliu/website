import Blogs from "../src/components/Blogs";
import Bookshelf from "../src/components/Bookshelf";
import Layout from "../src/components/Layout";
import NavPill from "../src/components/NavPill";
import Papers from "../src/components/Papers";
import getBooks, { type Book, getFallbackBooks } from "../src/server/getBooks";
import getPapers, { type ResearchPaper } from "../src/server/getPapers";

export default function BookshelfPage({
  books,
  papers,
}: {
  books: Book[];
  papers: ResearchPaper[];
}) {
  return (
    <Layout>
      <NavPill />
      <Bookshelf books={books} className="py-48" />
      <Blogs />
      <Papers papers={papers} />
    </Layout>
  );
}

async function resolveLibraryData<T>(
  label: string,
  loader: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    console.error(
      `Failed to load ${label}; rendering /library with fallback data.`,
      error
    );
    return fallback;
  }
}

export async function getStaticProps() {
  const start = Date.now();
  const [books, papers] = await Promise.all([
    resolveLibraryData("books", getBooks, getFallbackBooks()),
    resolveLibraryData("papers", getPapers, []),
  ]);
  const end = Date.now();
  console.log(`getStaticProps took ${end - start}ms`);

  return {
    props: { books, papers },
    revalidate: 60, // at most every minute
  };
}
