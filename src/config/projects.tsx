import React, { ReactNode } from "react";

export interface Project {
  title: string;
  subtitle: string;
  description: ReactNode;
  tags: string[];
  github: string;
  image: string;
  imageHeight: number;
  imageWidth: number;
  link?: string;
  video?: string;
  year?: number | string;
}

const projects: Project[] = [
  {
    title: "🧑‍⚖️ Pol.Lit",
    subtitle: "Political Literacy and Transparency Platform",
    github: "https://github.com/gramliu/pollit",
    image: "/projects/pollit.jpg",
    imageHeight: 1897,
    imageWidth: 1008,
    tags: ["Next.JS", "MongoDB", "Express", "BERT", "Pegasus", "GCP"],
    description: (
      <div>
        🏆 Best NLP Hack
        <a
          href="https://hackmit.org/"
          target="_blank"
          rel="noreferrer"
          className="hoverLink"
        >
          @HackMIT 2022.
        </a>
        <br />
        We built a platform to improve political literacy and accountability in
        the Philippines. We used the Google Cloud Vision SDK, Pegasus, and BERT
        to scan and summarize PDF bills from the Philippine Congress. We also
        scraped members of legislation and built profiles based on activity and
        semantic tags of authored bills.
      </div>
    ),
    year: 2022,
  },
  {
    title: "📃 Course API",
    subtitle: "REST API and Website for CMU Course Data",
    description:
      "A RESTful API and website for accessing CMU faculty and course evaulation data. Search your upcoming courses to see the difficulty of the content and the amount of time you can expect to work on each course each week.",
    tags: ["MongoDB", "Express", "React", "Node.js"],
    github: "https://github.com/ScottyLabs/course-api-v2",
    link: "https://course.scottylabs.org/",
    image: "/projects/course-api.png",
    imageHeight: 1080,
    imageWidth: 720,
  },
  {
    title: "🌈 Illuminate Designer",
    subtitle: "Lighting Sequence Designer",
    description: (
      <div>
        A lighting sequence designer for the
        <a
          href="https://upload.wikimedia.org/wikipedia/commons/3/33/Carnegie_Mellon_University_Pausch_Bridge_rainbow.jpg"
          target="_blank"
          rel="noreferrer"
          className="hoverLink"
        >
          Randy Pausch Bridge
        </a>
        at CMU. In Spring 2021, I helped organize an event in collaboration with
        ScottyLabs and CMU SCS to create a space where students used this tool
        to design lighting sequences which were displayed on the bridge.
      </div>
    ),
    tags: ["React", "Redux", "Express", "Jimp"],
    github: "https://github.com/ScottyLabs/pausch-ui",
    video: "https://youtu.be/5LwwyFJoPSw",
    image: "/projects/illuminate.png",
    link: "https://illuminate.scottylabs.org/",
    imageHeight: 1080,
    imageWidth: 720,
  },
];

export default projects;
