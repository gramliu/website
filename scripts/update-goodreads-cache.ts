import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getImageColors } from "../src/server/bookColors";
import {
  type GoodreadsBookSnapshot,
  parseBooksFromGoodreadsHtml,
} from "../src/server/goodreads";

interface CachedBookSnapshot extends GoodreadsBookSnapshot {
  fgColor: string;
  bgColor: string;
  hasValidImage: boolean;
}

function getArgValue(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }

  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }

  return value;
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function resolvePath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function loadBooksFromArgs(args: string[]): Promise<GoodreadsBookSnapshot[]> {
  const books: GoodreadsBookSnapshot[] = [];

  const readHtmlPath = getArgValue(args, "--read-html");
  const currentlyReadingHtmlPath = getArgValue(args, "--currently-reading-html");
  const rawBooksJsonPath = getArgValue(args, "--raw-books-json");

  if (hasFlag(args, "--stdin-json")) {
    const rawJson = await readStdin();
    books.push(...(JSON.parse(rawJson) as GoodreadsBookSnapshot[]));
  }

  if (rawBooksJsonPath) {
    const rawJson = await readFile(resolvePath(rawBooksJsonPath), "utf8");
    books.push(...(JSON.parse(rawJson) as GoodreadsBookSnapshot[]));
  }

  for (const htmlPath of [currentlyReadingHtmlPath, readHtmlPath]) {
    if (!htmlPath) {
      continue;
    }

    const html = await readFile(resolvePath(htmlPath), "utf8");
    books.push(...parseBooksFromGoodreadsHtml(html));
  }

  if (books.length === 0) {
    throw new Error(
      "No input provided. Use --stdin-json, --raw-books-json, --read-html, or --currently-reading-html."
    );
  }

  return dedupeBooks(books);
}

function dedupeBooks(books: GoodreadsBookSnapshot[]): GoodreadsBookSnapshot[] {
  const seen = new Set<string>();

  return books.filter((book) => {
    const key = book.url || `${book.title}|${book.author}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function buildSnapshot(
  books: GoodreadsBookSnapshot[]
): Promise<CachedBookSnapshot[]> {
  return Promise.all(
    books.map(async (book) => ({
      ...book,
      ...(await getImageColors(book.imageUrl)),
    }))
  );
}

async function main() {
  const args = process.argv.slice(2);
  const outputPath = resolvePath(
    getArgValue(args, "--output") ?? "public/books.json"
  );

  const books = await loadBooksFromArgs(args);
  const snapshot = await buildSnapshot(books);

  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(`Wrote ${snapshot.length} books to ${outputPath}`);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
