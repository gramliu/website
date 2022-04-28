import React from "react"
import { GithubIcon } from "../../../icons/github"
import { RedirectIcon } from "../../../icons/redirect"
import { YouTubeIcon } from "../../../icons/youtube"
import * as styles from "./index.module.scss"

const Project = ({ project }) => {
  const { title, subtitle, description, tags, github, link, video, image } =
    project

  const imageContainer = (
    <div className={`${styles.imageContainer} ${styles.projectImage}`}>
      <img src={image} alt={title} className={styles.image} />
    </div>
  )
  const links = []
  if (github) {
    links.push(
      <a
        href={github}
        target="_blank"
        rel="noreferrer"
        className={styles.link}
        key="github"
      >
        <GithubIcon />
      </a>
    )
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
    )
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
    )
  }
  const contentContainer = (
    <div className={`${styles.content} ${styles.projectContent}`}>
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
  )

  return (
    <div className={styles.container}>
      {imageContainer}
      {contentContainer}
    </div>
  )
}

export default Project
