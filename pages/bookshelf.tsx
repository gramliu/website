import Bookshelf from "../src/components/Bookshelf";
import Layout from "../src/components/Layout";
import NavPill from "../src/components/NavPill";
import Papers from "../src/components/Papers";
import getBooks, { Book } from "../src/server/getBooks";
import getPapers, { ResearchPaper } from "../src/server/getPapers";

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://gramliu.com";

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
      <Papers papers={papers} />
    </Layout>
  );
}

export async function getStaticProps() {
  const books = await getBooks();
  const papers = await getPapers();

  return {
    props: { books, papers },
    revalidate: 60, // at most every minute
  };
}
