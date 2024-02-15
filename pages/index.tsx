import { MDXProvider, MergeComponents } from "@mdx-js/react/lib";
import { MDXComponents } from "mdx/types";
import Link from "next/link";
import { ReactNode } from "react";
import AboutSection from "../src/components/AboutSection";
import ActivitiesList from "../src/components/ActivitiesList";
import Footer from "../src/components/Footer";
import Hero from "../src/components/Hero";
import Layout from "../src/components/Layout";
import NavPill from "../src/components/NavPill";
import Portfolio from "../src/components/Portfolio";
import ProjectArchive from "../src/components/ProjectArchive";

const mdxComponents = {
  a: ({ children, href }: { children: ReactNode; href: string }) => (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="hoverLink text-highlight no-underline"
    >
      <span>{children}</span>
    </Link>
  ),
} as MDXComponents | MergeComponents;

export default function HomePage() {
  return (
    <MDXProvider components={mdxComponents}>
      <Layout>
        <NavPill />
        <Hero />
        <AboutSection />
        <ActivitiesList />
        <Portfolio />
        <ProjectArchive />
        <Footer />
      </Layout>
    </MDXProvider>
  );
}
