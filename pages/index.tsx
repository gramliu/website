import AboutSection from "../src/components/AboutSection";
import ActivitiesList from "../src/components/ActivitiesList";
import Footer from "../src/components/Footer";
import Hero from "../src/components/Hero";
import Layout from "../src/components/Layout";
import Navbar from "../src/components/Navbar";
import Portfolio from "../src/components/Portfolio";
import ProjectArchive from "../src/components/ProjectArchive";

export default function HomePage() {
  return (
    <Layout>
      <Navbar />
      <Hero />
      <AboutSection />
      <ActivitiesList />
      <Portfolio />
      <ProjectArchive />
      <Footer />
    </Layout>
  );
}
