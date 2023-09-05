import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const url =
  "https://api.zotero.org/users/11205826/collections/BDRRTS9S/items/top";

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
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.ZOTERO_API_KEY}`,
    },
  });

  const papers: ResearchPaper[] = data.map((paper: RawPaper) => ({
    title: paper.data.title,
    authorSummary: paper.meta.creatorSummary,
    url: paper.data.url,
    year: dateStringToYear(paper.meta.parsedDate),
  }));

  res.status(200).json(papers);
}

function dateStringToYear(dateString: string): string {
  const date = new Date(dateString);
  return date.getFullYear().toString();
}
