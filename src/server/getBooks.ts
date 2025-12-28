import axios from "axios";
import * as cheerio from "cheerio";
import { getColor } from "colorthief";
import rgbHex from "rgb-hex";
import { redisClient } from "../lib/redis";

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

interface BookWithoutColors {
  title: string;
  author: string;
  url: string;
  imageUrl: string;
}

/**
 * Fetch and parse books from a Goodreads shelf URL
 */
async function fetchBooksFromShelf(url: string): Promise<BookWithoutColors[]> {
  const html = await axios.get(url);
  const $ = cheerio.load(html.data);

  const booksBody = $("#booksBody tr");

  // Construct books array
  const books = booksBody
    .map((_, tr) => {
      const imageUrl =
        $(tr)
          .find(".cover > .value a > img")
          .attr("src")
          // Remove suffixes of the form ._SX75_, ._SY50_, or ._SX50_SY75_
          ?.replace(/\.((_SX[0-9]{2})?(_SY[0-9]{2})|(_SX[0-9]{2}))_/, "") ?? "";

      return {
        title: $(tr).find(".title > .value > a").attr("title")?.trim() ?? "",
        author: $(tr).find(".author > .value > a").text().trim(),
        url: `https://www.goodreads.com${
          $(tr).find(".title > .value > a").attr("href") ?? ""
        }`,
        imageUrl,
      };
    })
    .toArray();

  return books;
}

/**
 * Get GoodReads books (currently reading + read)
 */
export default async function getBooks(): Promise<Book[]> {
  // if (env.NODE_ENV === "development") {
  //   return booksCached;
  // }

  // Fetch both currently reading and read books in parallel
  const [currentlyReadingBooks, readBooks] = await Promise.all([
    fetchBooksFromShelf(currentlyReadingUrl),
    fetchBooksFromShelf(readUrl),
  ]);

  // Combine with currently reading books first
  const allBooks = [...currentlyReadingBooks, ...readBooks];

  // Get image colors
  const booksWithColors = await Promise.all(
    allBooks.map(async (book) => {
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

  return booksWithColors;
}

interface BookColor {
  fgColor: string;
  bgColor: string;
  hasValidImage: boolean;
}

interface HashBookColor extends BookColor, Record<string, unknown> {}

/**
 * Get the foreground and background colors of a remote image
 */
async function getImageColors(imageUrl: string): Promise<BookColor> {
  // Check cache if Redis is available
  if (redisClient) {
    const cachedResponse = await redisClient.hgetall<HashBookColor>(imageUrl);
    if (cachedResponse) {
      const { fgColor, bgColor, hasValidImage } = cachedResponse;
      return {
        fgColor,
        bgColor,
        hasValidImage: hasValidImage ?? false,
      };
    }
  }

  try {
    const { data } = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // Convert image to base64
    const imageData = `data:image/jpeg;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    // Extract color from image
    const rgb = await getColor(imageData);

    const fgColor = getForegroundColor(rgb);
    const bgColor = `#${rgbHex(rgb[0], rgb[1], rgb[2])}`;

    // Cache response if Redis is available
    if (redisClient) {
      await redisClient.hset(imageUrl, { fgColor, bgColor, hasValidImage: true });
    }

    return {
      fgColor,
      bgColor,
      hasValidImage: true,
    };
  } catch (e) {
    console.error(`Failed to download image for ${imageUrl}`);

    // Cache error response if Redis is available
    if (redisClient) {
      await redisClient.hset(imageUrl, {
        fgColor: "#000",
        bgColor: "#fff",
        hasValidImage: false,
      });
    }
    return {
      fgColor: "#000",
      bgColor: "#fff",
      hasValidImage: false,
    };
  }
}

/**
 * Get the accessible foreground color given a background color
 */
function getForegroundColor(rgb: [number, number, number]) {
  const [r, g, b] = rgb;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}
