import { motion } from "framer-motion";
import AboutSection from "../src/components/AboutSection";
import ActivitiesList from "../src/components/ActivitiesList";
import Footer from "../src/components/Footer";
import Hero from "../src/components/Hero";
import Layout from "../src/components/Layout";
import NavPill from "../src/components/NavPill";
import Portfolio from "../src/components/Portfolio";
import ProjectArchive from "../src/components/ProjectArchive";

export default function HomePage() {
  return (
    <Layout>
      <motion.div
        initial={{ scale: 0, translateY: -100 }}
        animate={{ scale: 1, translateY: 0 }}
        transition={{
          duration: 0.5,
          delay: 1.5,
        }}
      >
        <NavPill />
      </motion.div>
      <Hero />
      <AboutSection />
      <ActivitiesList />
      <Portfolio />
      <ProjectArchive />
      <Footer />
    </Layout>
  );
}
