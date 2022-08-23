import Image from "next/future/image";
import { ReactNode } from "react";
import { Project } from "../../config/projects";
import GitHubIcon from "../../icons/github";
import RedirectIcon from "../../icons/redirect";
import YouTubeIcon from "../../icons/youtube";
import styles from "./index.module.scss";

function getLinks(github?: string, link?: string, video?: string): ReactNode[] {
  const links = [];
  if (github) {
    links.push(
      <a
        href={github}
        target="_blank"
        rel="noreferrer"
        className={styles.link}
        key="github"
      >
        <GitHubIcon />
      </a>
    );
  }
  if (link) {
    links.push(
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className={styles.link}
        key="link"
      >
        <RedirectIcon />
      </a>
    );
  }
  if (video) {
    links.push(
      <a
        href={video}
        target="_blank"
        rel="noreferrer"
        className={styles.link}
        key="youtube"
      >
        <YouTubeIcon />
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
  link,
  video,
  image,
  imageHeight,
  imageWidth,
}: Project) {
  const scaleFactor = 256 / imageHeight;
  const links = getLinks(github, link, video);

  return (
    <div className={styles.card}>
      <Image
        src={image}
        alt={title}
        height={256}
        width={imageWidth * scaleFactor}
        className={styles.projectImage}
      />
      <span className={styles.cardTitle}>{title}</span>
      <span className={styles.cardSubtitle}>{subtitle}</span>
      <span className={styles.cardDescription}>{description}</span>
      <div className={styles.cardLinks}>{links}</div>
    </div>
  );
}
