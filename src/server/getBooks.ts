import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import * as cheerio from "cheerio";
import { getColor } from "colorthief";
import rgbHex from "rgb-hex";
import { env } from "process";
import booksCached from "../../public/books.json";

const url =
  "https://www.goodreads.com/review/list/153517339?shelf=read&sort=date_read";

export interface Book {
  title: string;
  author: string;
  url: string;
  imageUrl: string;
  fgColor: string;
  bgColor: string;
}

/**
 * Get GoodReads books
 */
export default async function getBooks() {
  // if (env.NODE_ENV === "development") {
  //   return booksCached;
  // }

  let start = Date.now();
  const html = await axios.get(url);
  let end = Date.now();
  console.log(`Fetch html: ${end - start}ms`);
  const $ = cheerio.load(html.data);

  const booksBody = $("#booksBody tr");

  // Construct books array
  start = Date.now();
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
  end = Date.now();
  console.log(`Construct books array: ${end - start}ms`);

  // Download images into base64
  start = Date.now();
  const images = await Promise.all(
    books.map((book) =>
      axios.get(book.imageUrl, { responseType: "arraybuffer" })
    )
  );
  end = Date.now();
  console.log(`Download images: ${end - start}ms`);

  // Convert images to base64
  start = Date.now();
  const imageData = images.map(
    (image) =>
      `data:image/jpeg;base64,${Buffer.from(image.data, "binary").toString(
        "base64"
      )}`
  );
  end = Date.now();
  console.log(`Convert images to base64: ${end - start}ms`);

  // Extract colors from images
  start = Date.now();
  const rgb = await Promise.all(imageData.map((image) => getColor(image)));
  const fgColors = rgb.map(getForegroundColor);
  const bgColors = rgb.map((rgb) => `#${rgbHex(rgb[0], rgb[1], rgb[2])}`);
  const booksWithColors: Book[] = books.map((book, i) => ({
    ...book,
    fgColor: fgColors[i],
    bgColor: bgColors[i],
  }));
  end = Date.now();
  console.log(`Extract colors from images: ${end - start}ms`);

  return booksWithColors;
}

/**
 * Get the accessible foreground color given a background color
 */
function getForegroundColor(rgb: [number, number, number]) {
  const [r, g, b] = rgb;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}
