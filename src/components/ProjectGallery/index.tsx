import archive from "../../config/archive";
import ProjectCard from "../ProjectCard";
import styles from "./index.module.scss";

export default function ProjectArchive() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>Other Past Projects</div>
      <div className={styles.content}>
        {archive.map((project, index) => (
          <>
            <ProjectCard {...project} key={index} />
          </>
        ))}
      </div>
    </div>
  );
}
