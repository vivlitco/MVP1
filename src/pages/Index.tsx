import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import GallerySection from "@/components/GallerySection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GallerySection />
      <AboutSection />
      <Footer />
    </main>
  );
};

export default Index;
