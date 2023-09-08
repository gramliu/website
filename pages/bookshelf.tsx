import Bookshelf from "../src/components/Bookshelf";
import Layout from "../src/components/Layout";
import NavPill from "../src/components/NavPill";
import Papers from "../src/components/Papers";
import getBooks, { Book } from "../src/server/getBooks";
import getPapers, { ResearchPaper } from "../src/server/getPapers";

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
  const [books, papers] = await Promise.all([getBooks(), getPapers()]);

  return {
    props: { books, papers },
    revalidate: 60, // at most every minute
  };
}
