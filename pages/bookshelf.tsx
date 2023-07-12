import axios from "axios";
import { useEffect, useState } from "react";
import Bookshelf from "../src/components/Bookshelf";
import Layout from "../src/components/Layout";
import NavPill from "../src/components/NavPill";
import { Book } from "./api/books";

const url = "http://localhost:3000/api/books";

export default function BookshelfPage() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    axios.get(url).then((response) => {
      setBooks(response.data);
    });
  }, []);

  return (
    <Layout>
      <NavPill />
      <Bookshelf books={books} className="py-48" />
    </Layout>
  );
}
