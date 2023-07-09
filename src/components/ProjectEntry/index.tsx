import clsx from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";
import { Project } from "../../config/projects";
import GitHubIcon from "../../icons/github";
import RedirectIcon from "../../icons/redirect";
import YouTubeIcon from "../../icons/youtube";

function getLinks(github?: string, link?: string, video?: string): ReactNode[] {
  const links = [];
  if (github) {
    links.push(
      <a
        href={github}
        target="_blank"
        rel="noreferrer"
        className="m-4"
        key="github"
      >
        <GitHubIcon className="fill-text-primary stroke-text-primary h-8 w-auto transition-all hover:fill-text-highlight hover:stroke-text-highlight" />
      </a>
    );
  }
  if (link) {
    links.push(
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="m-4"
        key="link"
      >
        <RedirectIcon className="fill-text-primary stroke-text-primary h-8 w-auto transition-all hover:fill-text-highlight hover:stroke-text-highlight" />
      </a>
    );
  }
  if (video) {
    links.push(
      <a
        href={video}
        target="_blank"
        rel="noreferrer"
        className="m-4"
        key="youtube"
      >
        <YouTubeIcon className="fill-text-primary stroke-text-primary h-8 w-auto transition-all hover:fill-text-highlight hover:stroke-text-highlight" />
      </a>
    );
  }

  return links;
}

export default function ProjectEntry({
  title,
  subtitle,
  description,
  tags,
  github,
  link,
  video,
  image,
  imageHeight,
  imageWidth,
}: Project) {
  const imageContainer = (
    <div
      className={clsx(
        "lg:group-odd:col-[1/1] lg:group-even:col-[2/2]",
        "sm:grid-cols-1 sm:grid-rows-[4fr_3fr] sm:text-center",
        "sm:row-[1/1] sm:col-[1/1]",
        "grid-cols-1 grid-rows-1 justify-center hidden sm:block"
      )}
    >
      <Image
        src={image}
        alt={title}
        className="w-full shadow-2xl rounded-sm"
        height={imageHeight}
        width={imageWidth}
        loading="lazy"
      />
    </div>
  );
  const links = getLinks(github, link, video);
  const contentContainer = (
    <div
      className={clsx(
        "flex flex-col justify-center",
        "lg:group-odd:col-[2/2] lg:group-odd:items-start",
        "lg:group-even:col-[1/1] lg:group-even:items-end",
        "lg:mt-0 lg:row-[1/1]",
        "sm:grid-cols-1 sm:grid-rows-[4fr_3fr] sm:text-center",
        "sm:row-[2/2] sm:col-[1/1] sm:mx-0 sm:mt-8"
      )}
    >
      <div className="text-4xl">{title}</div>
      <div className="text-text-faded text-xl">{subtitle}</div>
      <div className="mt-4 p-4 shadow-2xl bg-background-light rounded-sm text-center lg:group-odd:text-start lg:group-even:text-end">
        {description}
      </div>
      <div className="mt-4 flex justify-evenly flex-wrap gap-3">
        {tags.map((tag, index) => (
          <div className="text-text-highlight font-bold px-4" key={index}>
            {tag}
          </div>
        ))}
      </div>
      <div className="flex flex-row justify-evenly mt-4">{links}</div>
    </div>
  );

  return (
    <div
      className={clsx(
        "grid grid-flow-dense w-full mt-8 group lg:gap-4",
        "lg:odd:grid-cols-[4fr_3fr] lg:odd:text-start",
        "lg:even:grid-cols-[3fr_4fr] lg:even:text-end"
      )}
    >
      {imageContainer}
      {contentContainer}
    </div>
  );
}
