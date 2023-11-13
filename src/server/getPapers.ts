import axios from "axios";
import { env } from "../env";

const url =
  "https://api.zotero.org/users/11205826/collections/BDRRTS9S/items/top?limit=100";

export interface ResearchPaper {
  title: string;
  authorSummary: string;
  url: string;
  year: string;
}

interface RawPaper {
  meta: {
    creatorSummary: string;
    parsedDate: string;
  };
  data: {
    title: string;
    url: string;
  };
}

/**
 * Get research papers under the "Interesting Reads" Zotero collection
 */
export default async function getPapers() {
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${env.ZOTERO_API_KEY}`,
    },
  });

  const papers: ResearchPaper[] = data.map((paper: RawPaper) => ({
    title: paper.data.title,
    authorSummary: paper.meta.creatorSummary,
    url: paper.data.url,
    year: dateStringToYear(paper.meta.parsedDate),
  }));

  return papers;
}

function dateStringToYear(dateString: string): string {
  const date = new Date(dateString);
  return date.getFullYear().toString();
}
