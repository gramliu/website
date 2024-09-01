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
    imageHeight: 1859,
    imageWidth: 3662,
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
    tags: ["GPT-4V", "GPT-4", "LangChain", "React", "Next.js"],
    image: "/projects/web-spinner.png",
    github: "https://github.com/Web-Spinner-core/web-spinner",
    video: "https://twitter.com/gramliu/status/1737273439608775088?s=20",
    imageHeight: 1920,
    imageWidth: 1035,
    year: 2023,
  },
  {
    title: "🧠 Synapse",
    subtitle: "AI Journaling App",
    image: "/projects/synapse.png",
    imageHeight: 1897,
    imageWidth: 1008,
    tags: ["GPT-4", "Claude", "Whisper", "Neo4J", "React Native"],
    description: (
      <div>
        Journaling app where you take short audio notes throughout the day. It
        integrates with papers you&apos;ve read and past notes to provide
        AI-generated daily and weekly reflections. It additionally generates
        a knowledge graph to determine connections between entities you frequently
        talk about.
      </div>
    ),
    year: 2022,
  },
];

export default projects;
