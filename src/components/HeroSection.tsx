import { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Gift, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden dreamy-bg">
      {/* Light baby pink gradient background */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'linear-gradient(180deg, hsl(330, 50%, 97%) 0%, hsl(330, 45%, 95%) 40%, hsl(300, 40%, 96%) 70%, hsl(280, 35%, 96%) 100%)'
        }}
      />
      
      {/* Animated soft pink orbs */}
      <motion.div 
        className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(330, 80%, 90% / 0.4) 0%, transparent 70%)' }}
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(270, 70%, 85% / 0.35) 0%, transparent 70%)' }}
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(320, 70%, 88% / 0.4) 0%, transparent 70%)' }}
        animate={{
          x: [0, 30, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />


      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
          
          {/* Left: Content */}
          <motion.div 
            className="space-y-8 text-center lg:text-left order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 glass-warm px-5 py-2.5 rounded-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsl(43, 80%, 70% / 0.3)' }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Gift className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-foreground">
                A jar of feelings, memories, words
              </span>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨
              </motion.span>
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
                className="gradient-text-gold inline-block font-script text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                animate={isJarInteracting ? { 
                  scale: [1, 1.03, 1],
                  textShadow: ['0 0 20px transparent', '0 0 40px hsl(43, 80%, 70% / 0.5)', '0 0 20px transparent']
                } : {}}
                transition={{ duration: 0.4 }}
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
              someone special. Each note opens with a little moment of{' '}
              <motion.span 
                className="text-primary font-semibold inline-block"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                magic ✨
              </motion.span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="group text-lg px-8 py-6 bg-gradient-to-r from-primary via-primary to-accent hover:opacity-95 text-primary-foreground shadow-dreamy hover:shadow-glow transition-all duration-300 btn-magic animate-pulse-glow"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Create Your Jar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground flex items-center justify-center lg:justify-start gap-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 text-primary fill-primary/30" />
                </motion.span>
                No account needed to start
              </p>
            </motion.div>

            {/* Social proof */}
            <motion.div 
              className="flex items-center justify-center lg:justify-start gap-8 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-heading font-bold gradient-text-gold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  10K+
                </motion.p>
                <p className="text-xs text-muted-foreground">Jars created</p>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-heading font-bold gradient-text"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                >
                  50K+
                </motion.p>
                <p className="text-xs text-muted-foreground">Notes shared</p>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="text-center">
                <motion.p 
                  className="text-2xl"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.15, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
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
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
          >
            {/* Warm glow effect behind jar */}
            <motion.div 
              className="absolute inset-0 blur-3xl scale-125"
              style={{
                background: 'radial-gradient(circle, hsl(43, 80%, 80% / 0.4) 0%, hsl(340, 60%, 85% / 0.2) 50%, transparent 70%)'
              }}
              animate={isJarInteracting ? { 
                scale: [1.25, 1.4, 1.25],
                opacity: [0.6, 0.8, 0.6],
              } : {
                scale: [1.25, 1.3, 1.25],
                opacity: [0.5, 0.6, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <Suspense fallback={
              <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center">
                <motion.div
                  className="flex flex-col items-center gap-4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-12 h-12 text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground text-sm">Loading magic...</p>
                </motion.div>
              </div>
            }>
              <Interactive3DJar onInteraction={setIsJarInteracting} />
            </Suspense>
            
            {/* Instruction hint */}
            <motion.p 
              className="text-center text-sm text-muted-foreground mt-10 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨ Drag to rotate • Click to reveal a note ✨
              </motion.span>
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <motion.path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(var(--card))"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
