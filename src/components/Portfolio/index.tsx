import projects from "../../config/projects";
import ProjectEntry from "../ProjectEntry";
import styles from "./index.module.scss";

export default function Portfolio() {
  return (
    <>
      <div className={styles.container} id="portfolio">
        <div className={styles.header}>Things I&apos;ve Built</div>
        <div className={styles.content}>
          {projects.map((project, index) => (
            <ProjectEntry {...project} key={index} />
          ))}
        </div>
      </div>
    </>
  );
}
