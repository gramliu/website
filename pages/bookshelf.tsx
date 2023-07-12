import axios from "axios";
import { useEffect, useState } from "react";
import Bookshelf from "../src/components/Bookshelf";
import Layout from "../src/components/Layout";
import NavPill from "../src/components/NavPill";
import { Book } from "./api/books";

export default function BookshelfPage({ books }: { books: Book[] }) {
  return (
    <Layout>
      <NavPill />
      <Bookshelf books={books} className="py-48" />
    </Layout>
  );
}

export async function getStaticProps() {
  const { data: books } = await axios.get<Book[]>(
    "https://gramliu.com/api/books"
  );

  return {
    props: { books },
  };
}
