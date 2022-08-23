import styles from "./index.module.scss";
import projects from "../../config/projects";
import ProjectCard from "../ProjectCard";

export default function ProjectArchive() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>Other Past Projects</div>
      <div className={styles.content}>
        {projects.map((project, index) => (
          <>
            <ProjectCard {...project} key={index} />
            <ProjectCard {...project} key={index} />
          </>
        ))}
      </div>
    </div>
  );
}
