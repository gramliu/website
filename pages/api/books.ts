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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (env.NODE_ENV === "development") {
    res.json(booksCached);
    return;
  }

  const html = await axios.get(url);
  const $ = cheerio.load(html.data);

  const booksBody = $("#booksBody tr");

  // Construct books array
  const books = booksBody
    .map((i, tr) => {
      const imageUrl =
        $(tr)
          .find(".cover > .value a > img")
          .attr("src")
          // Remove suffixes of the form ._SX75_, ._SY50_, or ._SX50_SY75_
          ?.replace(/\.((_SX[0-9]{2})?(_SY[0-9]{2})|(_SX[0-9]{2}))_/, "") ?? "";
      console.log(imageUrl);

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

  // Download images into base64
  const images = await Promise.all(
    books.map((book) =>
      axios.get(book.imageUrl, { responseType: "arraybuffer" })
    )
  );
  const imageData = images.map(
    (image) =>
      `data:image/jpeg;base64,${Buffer.from(image.data, "binary").toString(
        "base64"
      )}`
  );

  // Extract colors from images
  const rgb = await Promise.all(imageData.map((image) => getColor(image)));
  const fgColors = rgb.map(getForegroundColor);
  const bgColors = rgb.map((rgb) => `#${rgbHex(rgb[0], rgb[1], rgb[2])}`);
  const booksWithColors: Book[] = books.map((book, i) => ({
    ...book,
    fgColor: fgColors[i],
    bgColor: bgColors[i],
  }));

  res.json(booksWithColors);
}

/**
 * Get the accessible foreground color given a background color
 */
function getForegroundColor(rgb: [number, number, number]) {
  const [r, g, b] = rgb;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}
