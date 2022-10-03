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
    description: (
      <div>
        🏆 Best IoT Hack
        <a
          href="https://hackmit.org/"
          target="_blank"
          rel="noreferrer"
          className="hoverLink"
        >
          @HackMIT 2021.
        </a>
        Web app that identifies parking spots from CCTV footage using OpenCV
      </div>
    ),
    year: 2021,
  },
  {
    title: "CMUEats",
    subtitle: "Dining Location Status @ CMU",
    link: "https://cmueats.com",
    github: "https://github.com/ScottyLabs/cmueats",
    image: "/projects/cmueats.jpg",
    imageHeight: 1280,
    imageWidth: 720,
    tags: ["React"],
    description:
      "One-stop-shop for finding out on-campus dining availabilities with 1,000 weekly unique users.",
    year: 2022,
  },
  {
    title: "ScottyLabs Website",
    subtitle: "Club Website",
    link: "https://scottylabs.org",
    github: "https://github.com/ScottyLabs/scottylabs.org",
    image: "/projects/scottylabs-website.jpg",
    imageHeight: 1280,
    imageWidth: 720,
    tags: ["TypeScript", "React", "Next.js"],
    description: "Club website for ScottyLabs, the largest tech club at CMU",
    year: 2022,
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
    year: 2021,
  },
  {
    title: "TartanHacks Helix",
    subtitle: "Backend for the TartanHacks Software Suite",
    github: "https://github.com/ScottyLabs/tartanhacks-backend",
    image: "/projects/tartanhacks-backend.png",
    imageHeight: 345,
    imageWidth: 247,
    tags: ["TypeScript", "Express", "MongoDB"],
    description:
      "Spearheaded development of the backend for the TartanHacks Software Suite, encompassing registration, scheduling, project submission, and live event logistics",
    year: 2021,
  },
  {
    title: "TartanHacks Website",
    subtitle: "Promotional Website for TartanHacks",
    github: "https://github.com/ScottyLabs/tartanhacks",
    image: "/projects/tartanhacks.png",
    imageHeight: 1904,
    imageWidth: 1010,
    tags: ["TypeScript", "React", "Next.JS"],
    description: "Built the promotional website for TartanHacks",
    year: 2021,
  },
  {
    title: "Craft112",
    subtitle: "Python Adventure Game",
    github: "https://github.com/gramliu/Craft112",
    video: "https://youtu.be/eYl7qmSxnho",
    image: "/projects/craft112.png",
    imageHeight: 512,
    imageWidth: 512,
    tags: ["Python", "PyGame"],
    description:
      "A Terraria-inspired adventure game. Fight and mine to survive against enemies in a randomly generated world. Created using Pygame.",
    year: 2019,
  },
  {
    title: "Unawa",
    subtitle: "Communication Assistance App",
    github: "https://github.com/gramliu/unawa",
    image: "/projects/unawa.png",
    imageHeight: 512,
    imageWidth: 512,
    tags: ["Android", "Java", "OpenCV", "TensorFlow"],
    description:
      'Unawa (Filipino word for "understanding") is an Android app designed to help people with communication disabilities through OCR, Sign Language Recognition, and Speech-to-Text Recognition.',
    year: 2018,
  },
  {
    title: "Suroy",
    subtitle: "Public Transportation Tracker App",
    github: "https://github.com/gramliu/suroy",
    image: "/projects/suroy.jpg",
    imageHeight: 512,
    imageWidth: 512,
    tags: ["Android", "Java", "Firebase", "Google Maps SDK"],
    description: (
      <div>
        🏆 2nd Place, Hack4PH Hack to Play, and Best Use of Technology. Suroy
        (Cebuano word for &quot;explore&quot;) is an Android app that helps
        commuters track public utility vehicles in the Philippines while
        promoting visibility of small businesses along their commute.
      </div>
    ),
    year: 2018,
  },
  {
    title: "Daloy",
    subtitle: "Drone and Submarine Field Research Tool",
    github: "https://github.com/gramliu/daloy",
    image: "/projects/daloy.jpg",
    imageHeight: 512,
    imageWidth: 512,
    tags: ["Android", "Arduino", "Raspberry Pi", "Zigbee Radio"],
    description: (
      <div>
        🏆 1st Place, InnoBox Project Philippines. Daloy (Filipino word for
        &quot;flow&quot; 🌊) is a drone and submarine-based research tool that
        remotely demonstrates real-time changes in environmental parameters like
        air and water pressure for educational or research purposes.
      </div>
    ),
    year: 2018,
  },
  {
    title: "GripAid",
    subtitle: "Grip Exoskeleton and Biometrics Tracker",
    github: "https://github.com/gramliu/gripaid",
    image: "/projects/gripaid.jpg",
    imageHeight: 512,
    imageWidth: 512,
    tags: ["Arduino", "3D Printing"],
    description: (
      <div>
        GripAid is a wearable grip exoskeleton that assists people with
        neurodegenerative diseases. It also displays heart pulse biometrics,
        since this demographic is often at high risk of cardiovascular diseases.
        Frame was 3D printed, mechanism powered by Arduino.
      </div>
    ),
    year: 2018,
  },
];

export default archive;
