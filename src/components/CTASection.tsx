import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(330, 50%, 95%) 0%, hsl(43, 60%, 94%) 50%, hsl(270, 40%, 95%) 100%)'
        }}
      />
      
      {/* Floating orbs */}
      <motion.div 
        className="absolute top-10 left-1/4 w-48 h-48 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(330, 80%, 85% / 0.4) 0%, transparent 70%)' }}
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 right-1/4 w-56 h-56 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(43, 80%, 85% / 0.4) 0%, transparent 70%)' }}
        animate={{ y: [0, 20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto relative z-10 text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-10 h-10 text-primary fill-primary/20 mx-auto" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight">
            Ready to share some{' '}
            <span className="gradient-text-gold font-script text-4xl md:text-6xl">love</span>?
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Create a jar of notes or send an animated e-card — it only takes a few minutes 
            to make something they'll treasure forever. No account needed.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button 
              size="lg"
              onClick={() => navigate('/create-jar')}
              className="group text-lg px-8 py-6 bg-gradient-to-r from-primary via-primary to-accent hover:opacity-95 text-primary-foreground shadow-dreamy hover:shadow-glow transition-all duration-300 btn-magic"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Create a Jar
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              onClick={() => navigate('/create-card')}
              className="group text-lg px-8 py-6 bg-gradient-to-r from-accent to-primary hover:opacity-95 text-primary-foreground shadow-dreamy hover:shadow-glow transition-all duration-300"
            >
              <Heart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Send an E-Card
            </Button>
          </motion.div>
          <Button 
            variant="outline"
            onClick={() => navigate('/gallery')}
            className="border-primary/30 hover:bg-primary/5"
          >
            Browse Gallery
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
