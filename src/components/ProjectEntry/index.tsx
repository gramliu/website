import clsx from "clsx";
import Image from "next/future/image";
import { Project } from "../../config/projects";
import GitHubIcon from "../../icons/github";
import RedirectIcon from "../../icons/redirect";
import YouTubeIcon from "../../icons/youtube";
import styles from "./index.module.scss";

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
    <div className={clsx(styles.imageContainer, styles.projectImage)}>
      <Image
        src={image}
        alt={title}
        className={styles.image}
        height={imageHeight}
        width={imageWidth}
        loading="lazy"
      />
    </div>
  );
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
  const contentContainer = (
    <div className={clsx(styles.content, styles.projectContent)}>
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
      <div className={styles.description}>{description}</div>
      <div className={styles.tags}>
        {tags.map((tag, index) => (
          <div className={styles.tag} key={index}>
            {tag}
          </div>
        ))}
      </div>
      <div className={styles.links}>{links}</div>
    </div>
  );

  return (
    <div className={styles.container}>
      {imageContainer}
      {contentContainer}
    </div>
  );
}
