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
    url: "mailto:gramliu@cmu.edu",
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
    title: "CMU Human-Computer Interaction Institute",
    url: "https://hcii.cmu.edu/research",
    dates: "May 2020 - Present",
    role: "Research Assistant",
    description: [
      "Created a smart home app development framework that enables reusable native privacy features using Node-RED and Node.JS",
      "Developed machine learning microservices with openpose and openface using Docker and Flask",
      "Created smart applications using the framework, including a smart irrigation hub and indoor triangulation using accelerometers",
      "Developing a decentralized economy and app ecosystem to enable the development of IoT applications on a city-wide scale without compromising privacy or security of individual users",
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
  {
    title: "ScottyLabs",
    url: "http://scottylabs.org/",
    dates: "Aug 2019 - Present",
    role: "Project Lead, Former Director of Technology",
    description: [
      "Coordinated the active development of 13 different software project teams over the 2020-2021 school year",
      "Led the development and deployment of the website, registration system, judging platform, and participant dashboard for TartanHacks 2021 with over 300 participants from 18 countries",
      "Developed a REST API and website using a MERN stack for looking up course information at CMU, attracting over 700 users to the platform",
    ],
  },
]
