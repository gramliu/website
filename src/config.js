import React from "react"
import { GithubIcon } from "./icons/github"
import { LinkedInIcon } from "./icons/linkedin"
import { MailIcon } from "./icons/mail"

export const social = [
  {
    name: "github",
    image: <GithubIcon />,
    url: "https://github.com/gramliu",
  },
  {
    name: "linkedin",
    image: <LinkedInIcon />,
    url: "https://www.linkedin.com/in/gramliu/",
  },
  {
    name: "mail",
    image: <MailIcon />,
    url: "mailto:gram@gramliu.com",
  },
]

export const activities = [
  {
    title: "Dashlabs.ai",
    url: "https://dashlabs.ai/",
    dates: "May - Aug 2021",
    role: "Software Engineering Intern",
    description: [
      "Built a client and membership management platform for the Philippine Red Cross (PRC) using React and Next.js",
      "Developed a GraphQL schema backend using TypeScript and Apollo Server to facilitate queries and mutations with our MongoDB database",
      "Leveraged MongoDB aggregation pipelines to optimize calls to the database",
      "Created backend integrations to automatically generate vaccination cards upon appointment bookings with QR codes for verification",
    ],
  },
  {
    title: "CMU HCII",
    altTitle: "CMU Human-Computer Interaction Institute",
    url: "https://hcii.cmu.edu/research",
    dates: "May 2020 - Present",
    role: "Research Assistant",
    description: [
      "Created a smart home app development framework that enables reusable native privacy features using Node-RED and Node.JS",
      "Developed machine learning microservices with openpose and openface using Docker and Flask",
      "Created smart applications using the framework, including a smart irrigation hub and indoor triangulation using accelerometers",
      "Developing a decentralized and privacy-focused app ecosystem that supports building city-scale smart applications using AWS and NoFlo JS",
    ],
  },
  {
    title: "ScottyLabs",
    url: "http://scottylabs.org/",
    dates: "Aug 2019 - Present",
    role: "TartanHacks Software Lead",
    roleAlt: "Former Director of Technology",
    description: [
      "Designed and developed a TypeScript backend that unified our TartanHacks software suite, which powered TartanHacks 2022 with over 400 participants",
      "Coordinated the active development of 13 different software project teams over the 2020-2021 school year",
      "Led the development and deployment of the website, registration system, judging platform, and participant dashboard for TartanHacks 2021 with over 300 participants from 18 countries",
      "Developed a REST API and website using a MERN stack for looking up course information at CMU, attracting over 700 users to the platform",
    ],
  },
  {
    title: "Dashboard Philippines",
    url: "https://www.dashboardphilippines.com/",
    dates: "May - Aug 2020",
    role: "Full Stack Engineer",
    description: [
      "Developed a dashboard to centralize information about hospitals, transportation routes, and relief distribution in the Philippines at the height of the COVID-19 pandemic",
      "Designed a database schema and RESTful backend to track patient/supply capacities of over 2,000 hospitals using MongoDB, Express, and React/Redux in TypeScript",
      "Performed data migration for the Philippine Red Cross from a legacy database to a more robust schema, bringing down COVID-19 testing time from 2 weeks to 3 days",
    ],
  },
]

export const highlighted = [
  {
    title: "🩺 Medisure.ai",
    subtitle: "Personalized assistant for medical insurance",
    description: (
      <div>
        🏆 Top 3, Best Use of Google Cloud
        <a href="http://2020f.pennapps.com/" target="_blank" rel="noreferrer" className="hoverLink">
          @Pennapps XXI.
        </a>
        A consolidated suite of deep-learning powered NLP tools powered by GPT-3
        to help demystify medical insurance and generate insurance claim denial
        appeals.
      </div>
    ),
    date: "September 2020",
    tags: ["GPT-3", "Flask", "React", "Google Cloud"],
    github: "https://github.com/medisure-ai/medisure-ai",
    image: "/projects/medisure.png",
  },
  {
    title: "📃 Course API",
    subtitle: "REST API for CMU Course Data",
    description:
      "A RESTful API for accessing CMU faculty and course evaulation data. Search your upcoming courses to see the difficulty of the content and the amount of time you can expect to work on each course each week.",
    date: "March 2020",
    tags: ["MongoDB", "Express", "React", "Node.js"],
    github: "https://github.com/ScottyLabs/course-api-v2",
    link: "https://course.scottylabs.org/",
    image: "/projects/course-api.png",
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
  },
]
