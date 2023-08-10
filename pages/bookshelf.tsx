import axios from "axios";
import Bookshelf from "../src/components/Bookshelf";
import Layout from "../src/components/Layout";
import NavPill from "../src/components/NavPill";
import { Book } from "./api/books";

const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/books"
    : "https://gramliu.com/api/books";

export default function BookshelfPage({ books }: { books: Book[] }) {
  return (
    <Layout>
      <NavPill />
      <Bookshelf books={books} className="py-48" />
    </Layout>
  );
}

export async function getStaticProps() {
  const { data: books } = await axios.get<Book[]>(url);

  return {
    props: { books },
    revalidate: 60, // at most every minute
  };
}
