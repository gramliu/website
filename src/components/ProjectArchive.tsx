import archive from "../config/archive";
import ProjectCard from "./ProjectCard";

export default function ProjectArchive() {
  return (
    <div className="flex flex-col items-center py-40 w-10/12 mx-auto">
      <div className="text-4xl font-bold flex justify-center w-full text-center">
        Other Past Projects
      </div>
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-20 mt-8">
        {archive.map((project, index) => (
          <ProjectCard {...project} key={index} />
        ))}
      </div>
    </div>
  );
}
