import React from "react"
import { highlighted } from "../../config"
import Project from "./Project"
import * as styles from "./index.module.scss"

const Portfolio = () => {
  return (
    <>
      <div className={styles.container} id="portfolio">
        <div className={styles.header}>Things I've Built</div>
        <div className={styles.content}>
          {highlighted.map((project, index) => (
            <Project
              project={project}
              key={index}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default Portfolio
