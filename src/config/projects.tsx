import React, { ReactNode } from "react";

export interface Project {
  title: string;
  subtitle: string;
  description: ReactNode;
  date: string;
  tags: string[];
  github: string;
  image: string;
  imageHeight: number;
  imageWidth: number;
  link?: string;
  video?: string;
}

const projects: Project[] = [
  {
    title: "🩺 Medisure.ai",
    subtitle: "Personalized assistant for medical insurance",
    date: "September 2020",
    tags: ["GPT-3", "Flask", "React", "Google Cloud"],
    github: "https://github.com/medisure-ai/medisure-ai",
    image: "/projects/medisure.png",
    imageHeight: 1080,
    imageWidth: 720,
    description: (
      <div>
        🏆 Top 3, Best Use of Google Cloud
        <a
          href="http://2020f.pennapps.com/"
          target="_blank"
          rel="noreferrer"
          className="hoverLink"
        >
          @Pennapps XXI.
        </a>
        A consolidated suite of deep-learning powered NLP tools powered by GPT-3
        to help demystify medical insurance and generate insurance claim denial
        appeals.
      </div>
    ),
  },
  {
    title: "📃 Course API",
    subtitle: "REST API and Website for CMU Course Data",
    description:
      "A RESTful API and website for accessing CMU faculty and course evaulation data. Search your upcoming courses to see the difficulty of the content and the amount of time you can expect to work on each course each week.",
    date: "March 2020",
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
        at CMU. This was used during Illuminate 2021 to enable students to
        create lighting designs that were then displayed on the bridge.
      </div>
    ),
    date: "April 2021",
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
