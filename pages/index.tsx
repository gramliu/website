import About from "../src/components/About";
import ActivitiesList from "../src/components/ActivitiesList";
import Footer from "../src/components/Footer";
import Hero from "../src/components/Hero";
import Layout from "../src/components/Layout";
import Navbar from "../src/components/Navbar";
import Portfolio from "../src/components/Portfolio";

export default function HomePage() {
  return (
    <Layout>
      <Navbar />
      <Hero />
      <About />
      <ActivitiesList />
      <Portfolio />
      <Footer />
    </Layout>
  );
}
