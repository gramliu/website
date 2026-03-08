import * as cheerio from "cheerio";

export interface GoodreadsBookSnapshot {
  title: string;
  author: string;
  url: string;
  imageUrl: string;
}

const goodreadsImageSuffixPattern =
  /\.((_SX[0-9]{2})?(_SY[0-9]{2})|(_SX[0-9]{2}))_/;

export function normalizeGoodreadsImageUrl(imageUrl: string): string {
  return imageUrl.replace(goodreadsImageSuffixPattern, "");
}

export function isGoodreadsSignInPageHtml(html: string): boolean {
  const $ = cheerio.load(html);
  return $("title").text().trim() === "Sign in";
}

export function parseBooksFromGoodreadsHtml(
  html: string
): GoodreadsBookSnapshot[] {
  const $ = cheerio.load(html);

  return $("#booksBody tr")
    .map((_, tr) => {
      const titleLink = $(tr).find(".title > .value > a");
      const href = titleLink.attr("href") ?? "";
      const title =
        titleLink.attr("title")?.trim() ??
        titleLink.text().replace(/\s+/g, " ").trim();

      return {
        title,
        author: $(tr).find(".author > .value > a").text().trim(),
        url: href ? `https://www.goodreads.com${href}` : "",
        imageUrl: normalizeGoodreadsImageUrl(
          $(tr).find(".cover > .value a > img").attr("src") ?? ""
        ),
      };
    })
    .toArray()
    .filter((book) => book.title && book.url);
}
