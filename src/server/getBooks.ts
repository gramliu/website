import axios from "axios";
import fallbackBooksData from "../../public/books.json";
import manualBooksData from "../config/manualBooks.json";
import { getForegroundColorFromHex, getImageColors } from "./bookColors";
import {
  isGoodreadsSignInPageHtml,
  parseBooksFromGoodreadsHtml,
} from "./goodreads";

const readUrl =
  "https://www.goodreads.com/review/list/153517339?shelf=read&sort=date_read";
const currentlyReadingUrl =
  "https://www.goodreads.com/review/list/153517339?shelf=currently-reading";

export interface Book {
  title: string;
  author: string;
  url: string;
  imageUrl: string;
  fgColor: string;
  bgColor: string;
  hasValidImage: boolean;
}

export interface ManualBook {
  title: string;
  imageUrl: string;
  url?: string;
  dateRead: string;
  bgColor?: string;
}

interface BookWithoutColors {
  title: string;
  author: string;
  url: string;
  imageUrl: string;
}

type SnapshotBook = Omit<Book, "hasValidImage"> & {
  hasValidImage?: boolean;
};

/**
 * Fetch and parse books from a Goodreads shelf URL
 */
async function fetchBooksFromShelf(url: string): Promise<BookWithoutColors[]> {
  try {
    const { data } = await axios.get<string>(url);

    if (isGoodreadsSignInPageHtml(data)) {
      console.warn(`Goodreads returned a sign-in page for ${url}`);
      return [];
    }

    return parseBooksFromGoodreadsHtml(data);
  } catch (error) {
    console.error(`Failed to fetch Goodreads shelf ${url}`, error);
    return [];
  }
}

function normalizeSnapshotBooks(snapshotBooks: SnapshotBook[]): Book[] {
  return snapshotBooks.map((book) => ({
    ...book,
    hasValidImage: book.hasValidImage ?? true,
  }));
}

/**
 * Convert manual book entries to full Book format with colors
 */
async function processManualBooks(manualBooks: ManualBook[]): Promise<Book[]> {
  // Sort manual books by dateRead (newest first)
  const sortedManualBooks = [...manualBooks].sort(
    (a, b) => new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime()
  );

  const booksWithColors = await Promise.all(
    sortedManualBooks.map(async (book) => {
      // If bgColor is provided, use it; otherwise extract from image
      if (book.bgColor) {
        const fgColor = getForegroundColorFromHex(book.bgColor);
        return {
          title: book.title,
          author: "",
          url: book.url ?? "",
          imageUrl: book.imageUrl,
          fgColor,
          bgColor: book.bgColor,
          hasValidImage: true,
        };
      }

      const { fgColor, bgColor, hasValidImage } = await getImageColors(
        book.imageUrl
      );
      return {
        title: book.title,
        author: "",
        url: book.url ?? "",
        imageUrl: book.imageUrl,
        fgColor,
        bgColor,
        hasValidImage,
      };
    })
  );

  return booksWithColors;
}

/**
 * Get GoodReads books (currently reading + read) plus manual books
 */
export default async function getBooks(): Promise<Book[]> {
  // if (env.NODE_ENV === "development") {
  //   return booksCached;
  // }

  // Fetch both currently reading and read books in parallel, plus process manual books
  const [currentlyReadingBooks, readBooks, manualBooks] = await Promise.all([
    fetchBooksFromShelf(currentlyReadingUrl),
    fetchBooksFromShelf(readUrl),
    processManualBooks(manualBooksData as ManualBook[]),
  ]);

  // Combine with currently reading books first
  const allGoodreadsBooks = [...currentlyReadingBooks, ...readBooks];

  if (allGoodreadsBooks.length === 0) {
    console.warn(
      "Goodreads shelves returned no books; falling back to public/books.json."
    );
    return [
      ...manualBooks,
      ...normalizeSnapshotBooks(fallbackBooksData as SnapshotBook[]),
    ];
  }

  // Get image colors for Goodreads books
  const goodreadsBooksWithColors = await Promise.all(
    allGoodreadsBooks.map(async (book) => {
      const { fgColor, bgColor, hasValidImage } = await getImageColors(
        book.imageUrl
      );
      return {
        ...book,
        fgColor,
        bgColor,
        hasValidImage,
      };
    })
  );

  // Manual books go first (most recently read), then Goodreads books
  return [...manualBooks, ...goodreadsBooksWithColors];
}
