import Masthead from "@/components/Masthead";
import TickerBar from "@/components/TickerBar";
import HeroSection from "@/components/HeroSection";
import SampleAnalysis from "@/components/SampleAnalysis";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Masthead />
      <TickerBar />
      <HeroSection />
      <SampleAnalysis />
      <HowItWorks />
      <PricingSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
