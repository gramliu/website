import type { Project } from "./projects";

const archive: Project[] = [
  {
    title: "Parking Finder",
    subtitle: "Computer Vision Powered Parking Spot Finder",
    github: "https://github.com/dark-red-green",
    image: "/projects/parking-finder.jpg",
    imageHeight: 1270,
    imageWidth: 749,
    tags: ["React", "Flask", "OpenCV"],
    description:
      "Web app where hackers sign up to enter TartanHacks, CMU's largest hackathon",
  },
  {
    title: "TartanHacks Registration System",
    subtitle: "Hackathon Application Portal",
    github: "https://github.com/ScottyLabs/tartanhacks-registration",
    image: "/projects/tartanhacks-registration.jpg",
    imageHeight: 1440,
    imageWidth: 900,
    tags: ["TypeScript", "React", "Next.JS"],
    description:
      "Web app where hackers sign up to enter TartanHacks, CMU's largest hackathon",
  },
  {
    title: "TartanHacks Backend",
    subtitle: "Backend for the TartanHacks Software Suite",
    github: "https://github.com/ScottyLabs/tartanhacks-backend",
    image: "/projects/tartanhacks-backend.jpg",
    imageHeight: 345,
    imageWidth: 247,
    tags: ["TypeScript", "Express", "MongoDB"],
    description:
      "Spearheaded development of the backend for the TartanHacks Software Suite, encompassing registration, scheduling, project submission, and live event logistics",
  },
];

export default archive;
