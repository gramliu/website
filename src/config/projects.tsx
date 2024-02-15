import React, { ReactNode } from "react";

export interface Project {
  title: string;
  subtitle: string;
  description: ReactNode;
  tags: string[];
  github?: string;
  image: string;
  imageHeight: number;
  imageWidth: number;
  link?: string;
  video?: string;
  year?: number | string;
}

const projects: Project[] = [
  {
    title: "🏫 t-ai",
    subtitle: "AI Personal Teaching Assistant",
    description: (
      <div>
        <div>
          A Chrome extension that embeds an AI personal teaching assistant next
          to educational YouTube videos. You can ask questions about the video
          in real-time, just like in a classroom. The AI assistant immediately
          has context about what has been discussed so far and provides answers
          with references to relevant timestamps in the video.
        </div>
        <br />
        <div>
          We launched with the largest educational foundation in Sri Lanka. We
          created a DSL and runtime for rapidly prototyping and deploying LLM +
          retrieval pipelines and built around refining the ESL learning
          experience, which was the educational foundation&apos;s largest group
          of students. We addressed model hallucination for ESL through intent
          classification and augmentation with the Google Translate API.
        </div>
      </div>
    ),
    tags: ["OpenAI", "LangChain", "Pinecone", "React"],
    image: "/projects/t-ai.png",
    link: "https://t-ai.app/",
    imageHeight: 1080,
    imageWidth: 720,
    year: 2023,
  },
  {
    title: "🕸️ Web Spinner",
    subtitle: "Web Mockups to React",
    description: (
      <div>
        A tool that enables you to create low-fidelity mockups through a
        browser-based canvas and convert it into modular React components. It
        renders interactive previews that you can iterate on until you are
        satisfied before generating a PR with RSC-compatible components into
        your own linked GitHub repository.
      </div>
    ),
    tags: ["OpenAI", "GPT-4-Vision", "LangChain", "React", "Next.js"],
    image: "/projects/web-spinner.png",
    github: "https://github.com/Web-Spinner-core/web-spinner",
    video: "https://twitter.com/gramliu/status/1737273439608775088?s=20",
    imageHeight: 1080,
    imageWidth: 720,
    year: 2023,
  },
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
          className="hoverLink mx-1"
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
];

export default projects;
