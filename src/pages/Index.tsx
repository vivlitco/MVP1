import { Suspense, lazy } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CinematicHero from "@/components/landing/CinematicHero";

const MemoryAnatomy     = lazy(() => import('@/components/landing/MemoryAnatomy'));
const EmotionalUseCases = lazy(() => import('@/components/landing/EmotionalUseCases'));
const SharedExperience  = lazy(() => import('@/components/landing/SharedExperience'));
const CalmCTA           = lazy(() => import('@/components/landing/CalmCTA'));

const Index = () => (
  <main className="min-h-screen">
    <Navbar />
    <CinematicHero />
    <Suspense fallback={null}>
      <MemoryAnatomy />
      <EmotionalUseCases />
      <SharedExperience />
      <CalmCTA />
    </Suspense>
    <Footer />
  </main>
);

export default Index;
