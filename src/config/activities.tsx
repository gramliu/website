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
    dates: "July 2023 - Present",
    role: "Software Engineer I, II",
    description: [
      "Main engineer for Tap to Pay on iPhone, powering expansion into 5 new countries, adding support for Interac in Canada, and driving the work across 6 cross-functional teams",
      "Built infrastructure to deploy Tap to Pay instrumented tests to a fleet of physical devices, enabling us to catch incompatibilities across different device form factors and Android OS versions. " +
        "Figured out a way to replay contactless EMV transactions in a testing environment to enable deterministic testing.",
      "Built automatic Tap to Pay reader reconnection across the Android and iOS SDKs, improving performance in high-latency environments.",
      "Rolled out infrastructure to support dynamically configuring and serving EMV configurations for Tap to Pay on Android, enabling support for improved global authorization rates",
      "Ran extensive SQL data analysis of our global payment authorization rates, identifying and resolving launch-blocking issues in 3 major countries.",
      "Met with one of our major strategic users to understand their unique use case, designed and delivered a solution for them that drove down critical latency issues for them in the field",
      "Built a latency dashboard to measure and track performance metrics across all our readers, countries, payment networks, and other axes.",
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
