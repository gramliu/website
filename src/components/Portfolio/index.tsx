import projects from "../../config/projects";
import ProjectEntry from "../ProjectEntry";

export default function Portfolio() {
  return (
    <div
      className="flex flex-col items-center pt-40 w-10/12 mx-auto"
      id="portfolio"
    >
      <div className="text-4xl font-bold">Things I&apos;ve Built</div>
      <div className="mt-4 flex flex-col items-center">
        {projects.map((project, index) => (
          <ProjectEntry {...project} key={index} />
        ))}
      </div>
    </div>
  );
}
