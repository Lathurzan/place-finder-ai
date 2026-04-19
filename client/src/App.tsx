// src/App.tsx
import Navbar from "./components/Navbar";
import HeroSection from "./components/Hero";
import MarqueeBanner from "./components/MarqueeBanner";
import FeaturesSection from "./components/Features";
import HowItWorksSection from "./components/HowItWorks";
import PricingSection from "./components/Pricing";
import AboutSection from "./components/About";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="bg-[#060c18] text-slate-100 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <MarqueeBanner />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <AboutSection />
      <Footer />
    </div>
  );
}