import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import MapSection from "../components/landing/MapSection";
import VideoMemoriesSection from "../components/landing/VideoMemoriesSection";
import TrustSection from "../components/landing/TrustSection";
import CTASection from "../components/landing/CTASection";
import LandingFooter from "../components/landing/LandingFooter";
import "../index.css";

export default function LandingPage() {
  return (
    <main className="bg-stone-950 text-stone-100">
      <LandingNavbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <MapSection />
      <VideoMemoriesSection />
      <TrustSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
