import { motion } from "framer-motion";
import { ArrowRight, Palette, UserPlus, Send, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Palette,
    title: "Choose a theme",
    description: "Select from our beautiful templates or start from scratch",
  },
  {
    number: "02",
    icon: UserPlus,
    title: "Add messages",
    description: "Write heartfelt notes, upload photos, or record voice messages",
  },
  {
    number: "03",
    icon: Send,
    title: "Invite friends",
    description: "Collaborate with others to make the gift even more special",
  },
  {
    number: "04",
    icon: Gift,
    title: "Send the gift",
    description: "Share the magic and watch their face light up",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-soft relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-40 h-40 bg-mint/10 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Creating meaningful digital gifts is simple and fun
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div 
          className="max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative"
                variants={itemVariants}
              >
                {/* Connector arrow (hidden on last item and mobile) */}
                {index < steps.length - 1 && (
                  <motion.div 
                    className="hidden lg:block absolute top-16 -right-4 z-0"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                  >
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </motion.div>
                )}

                {/* Step card */}
                <motion.div 
                  className="relative bg-card rounded-3xl p-6 shadow-soft hover:shadow-float transition-all duration-300 group cursor-pointer h-full"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step number */}
                  <motion.div 
                    className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-float"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <span className="text-white font-heading font-bold text-lg">
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Icon */}
                  <div className="mt-6 mb-4">
                    <motion.div 
                      className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <step.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-heading font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-muted-foreground mb-4">
            Ready to create something magical?
          </p>
          <motion.button 
            onClick={() => navigate('/create-jar')}
            className="inline-flex items-center gap-2 bg-gradient-primary text-white px-8 py-4 rounded-full font-semibold shadow-float hover:shadow-glow transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started Now
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;