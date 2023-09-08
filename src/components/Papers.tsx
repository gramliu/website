import { ResearchPaper } from "../server/getPapers";
import LinkIcon from "../icons/link";

function ResearchPaperComponent({ paper }: { paper: ResearchPaper }) {
  return (
    <div className="flex flex-col">
      <a
        href={paper.url}
        target="_blank"
        rel="noreferrer"
        className={
          "cursor-pointer text-lg md:text-2xl no-underline flex items-center text-text-primary hover:translate-y-[-3px] transition-all"
        }
      >
        {paper.title}
        <LinkIcon className="text-text-primary fill-text-primary h-4 ml-1 opacity-80" />
      </a>
      <p className="text-sm text-text-faded">
        {paper.authorSummary}, {paper.year}
      </p>
    </div>
  );
}

export default function Papers({ papers }: { papers: ResearchPaper[] }) {
  return (
    <>
      <div className="flex items-center justify-center text-center w-full font-bold text-3xl mb-8 mx-auto">
        Recently Read Papers
      </div>
      <div className="flex flex-row items-center justify-center p-4">
        <div className="flex flex-col gap-4 items-start">
          {papers.map((paper) => (
            <ResearchPaperComponent paper={paper} key={paper.title} />
          ))}
        </div>
      </div>
    </>
  );
}
