import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/Pricing";
import Pricing from "../components/Pricing";
import About from "../components/About";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <About />
      <Footer />
    </>
  );
}
