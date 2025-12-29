import { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Gift, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import AnimatedSparkles from './landing/AnimatedSparkles';

// Lazy load the 3D component
const Interactive3DJar = lazy(() => import('./landing/Interactive3DJar'));

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isJarInteracting, setIsJarInteracting] = useState(false);

  const handleGetStarted = () => {
    navigate('/create-jar');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-accent/5" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/3 w-64 h-64 bg-mint/15 rounded-full blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Sparkles overlay */}
      <AnimatedSparkles />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left: Content */}
          <motion.div 
            className="space-y-6 text-center lg:text-left order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-foreground">
                A jar of feelings, memories, words
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Fill a jar with
              <br />
              <motion.span 
                className="gradient-text inline-block"
                animate={isJarInteracting ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                your heart
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Write heartfelt notes, add photos and voice messages, then share your jar with 
              someone special. Each note opens with a little moment of <span className="text-primary font-medium">magic</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="group text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-float hover:shadow-glow transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground flex items-center justify-center lg:justify-start gap-2">
                <Heart className="w-4 h-4 text-accent" />
                No account needed to start
              </p>
            </motion.div>

            {/* Social proof */}
            <motion.div 
              className="flex items-center justify-center lg:justify-start gap-6 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-heading font-bold text-primary"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  10K+
                </motion.p>
                <p className="text-xs text-muted-foreground">Jars created</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-heading font-bold text-accent"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  50K+
                </motion.p>
                <p className="text-xs text-muted-foreground">Notes shared</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-heading font-bold"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  💝
                </motion.p>
                <p className="text-xs text-muted-foreground">Made with love</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: 3D Jar */}
          <motion.div 
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {/* Glow effect behind jar */}
            <motion.div 
              className="absolute inset-0 bg-gradient-radial from-primary/30 via-accent/20 to-transparent blur-3xl scale-150"
              animate={isJarInteracting ? { 
                scale: [1.5, 1.6, 1.5],
                opacity: [0.5, 0.7, 0.5],
              } : {}}
              transition={{ duration: 0.5 }}
            />
            
            <Suspense fallback={
              <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-12 h-12 text-primary" />
                </motion.div>
              </div>
            }>
              <Interactive3DJar onInteraction={setIsJarInteracting} />
            </Suspense>
            
            {/* Instruction hint */}
            <motion.p 
              className="text-center text-sm text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              ✨ Hover to peek • Click to tease a note
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <motion.path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(var(--card))"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;