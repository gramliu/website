import Image from "next/image";
import { ReactNode } from "react";
import { Project } from "../config/projects";
import GitHubIcon from "../icons/github";
import RedirectIcon from "../icons/redirect";
import YouTubeIcon from "../icons/youtube";

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

export default function ProjectCard({
  title,
  subtitle,
  description,
  github,
  tags,
  link,
  video,
  image,
  imageHeight,
  imageWidth,
  year,
}: Project) {
  const scaleFactor = 256 / imageHeight;
  const links = getLinks(github, link, video);

  return (
    <div className="flex flex-col bg-bgcolor-light shadow-2xl pb-4">
      <Image
        src={image}
        alt={title}
        height={256}
        width={imageWidth * scaleFactor}
        className="object-cover aspect-[2/1] w-full h-auto"
        sizes="(min-height: 256) 256"
        loading="lazy"
      />
      <span className="text-center text-2xl mt-4 px-4">{title}</span>
      <span className="text-center text-text-faded px-4">{subtitle}</span>
      <span className="mt-4 px-4">{description}</span>
      <div className="mt-auto pt-4 flex justify-evenly flex-wrap gap-3">
        {tags.map((tag, index) => (
          <div
            className="text-text-highlight font-bold px-4 flex-1 text-center"
            key={index}
          >
            {tag}
          </div>
        ))}
      </div>
      <div className="w-full flex flex-row justify-center">{links}</div>
      <div className="text-text-highlight font-bold text-center text-xl">
        {year}
      </div>
    </div>
  );
}
