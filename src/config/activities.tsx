import { ReactNode } from "react";

export interface Activity {
  title: string;
  altTitle?: string;
  url: string;
  dates: string;
  role: string;
  roleAlt?: string;
  description: ReactNode[];
}

const activities: Activity[] = [
  {
    title: "Stripe",
    url: "https://stripe.com/",
    dates: "July 2023 - Oct 2024",
    role: "Software Engineer I, II",
    description: [
      "Lead engineer for Tap to Pay on iPhone, enabling merchants to accept card payments using just their phones",
      "Grew Tap to Pay on iPhone domestically and into 5 new international markets, including adding support for the Interac network in Canada",
      "Built first-of-its-kind anomaly detection and on-device testing infrastructure for Stripe Terminal, automatically improving reliability across all our product surfaces",
      "Developed new features across our Android and iOS SDKs, improving performance in high-latency environments",
      "Supported networks, partners, and strategic users in identifying various integration and launch-blocking issues. Independently scoped and rolled out fixes generalized to the rest of our users",
      "Increased Tap to Pay on Android connection speed by 60% by identifying and resolving key concurrency issues",
    ],
  },
  {
    title: "Stripe (intern)",
    url: "https://stripe.com/",
    dates: "May - Aug 2022",
    role: "Software Engineering Intern",
    description: [
      "Built a first-of-a-kind CI testing framework for the Stripe Terminal Readers, emulating the physical readers with Android on CI for automated testing",
      "Fixed flakiness on CI that two engineers tried to solve unsuccessfully over the past 12 months, improving reliability of a core test suite from 80% to 100%",
      "Drove collaboration across 5 teams to scope out a key problem in the development of future emulator tests, identified potential solutions, and determined concrete steps for the fix",
      "Created various developer productivity improvements such as emulator crash detection, concurrent log streaming, and faster failure detection, bringing down the time required for failure detection from 1 hour to 20 minutes",
    ],
  },
  {
    title: "Dashlabs.ai",
    url: "https://dashlabs.ai/",
    dates: "May - Aug 2021",
    role: "Software Engineering Intern",
    description: [
      "Built a client and membership management platform for the Philippine Red Cross (PRC) using React and Next.js",
      "Developed a GraphQL schema backend using TypeScript and Apollo Server to facilitate queries and mutations with our MongoDB database",
      "Leveraged MongoDB aggregation pipelines to optimize calls to the database",
      "Created a microservice to automatically generate vaccination cards upon appointment bookings with QR codes for verification",
    ],
  },
  {
    title: "CMU HCII",
    altTitle: "CMU Human-Computer Interaction Institute",
    url: "https://hcii.cmu.edu/research",
    dates: "May 2020 - May 2023",
    role: "Research Assistant",
    description: [
      <p key="publication" className="block block-start">
        <span className="font-bold">
          Peekaboo: A Hub-Based Approach to Enable Transparency in Data
          Processing within Smart Homes
        </span>{" "}
        (
        <a
          href="https://www.computer.org/csdl/proceedings-article/sp/2022/131600b571/1CIO8pmx6jm"
          target="_blank"
          rel="noreferrer"
          className="hoverLink"
        >
          10.1109/SP46214.2022.9833629
        </a>
        )
      </p>,
      "Created a smart home app development framework that enables the reuse of native privacy features using Node-RED and Node.js",
      "Designed a domain-specific language (DSL), interpreter, and runtime for building privacy-centric city-scale smart applications",
    ],
  },
  {
    title: "ScottyLabs",
    url: "http://scottylabs.org/",
    dates: "Aug 2019 - May 2023",
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
];

export default activities;
