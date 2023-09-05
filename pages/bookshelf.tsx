import axios from "axios";
import Bookshelf from "../src/components/Bookshelf";
import Layout from "../src/components/Layout";
import NavPill from "../src/components/NavPill";
import { Book } from "./api/books";
import Papers from "../src/components/Papers";
import { ResearchPaper } from "./api/papers";

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://gramliu.com";

const booksUrl = `${baseUrl}/api/books`;
const papersUrl = `${baseUrl}/api/papers`;

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
  const { data: books } = await axios.get<Book[]>(booksUrl);
  // const { data: papers } = await axios.get<ResearchPaper[]>(papersUrl);

  return {
    props: { books },
    revalidate: 60, // at most every minute
  };
}
