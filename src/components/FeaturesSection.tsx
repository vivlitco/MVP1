import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Sparkles, Globe, Users } from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Jar of Notes",
    description: "A virtual jar filled with heartfelt messages from friends and loved ones. The recipient can pop one note a day — a gamified, emotional experience.",
    color: "primary",
    gradient: "from-primary/20 to-accent/10",
  },
  {
    icon: Sparkles,
    title: "E-Cards",
    description: "Beautifully designed, animated, and customizable digital cards for birthdays, farewells, anniversaries, and every special moment.",
    color: "accent",
    gradient: "from-accent/20 to-pink-200/10",
  },
  {
    icon: Globe,
    title: "Custom Webpages",
    description: "A shareable, aesthetic webpage created for someone special — can include photos, letters, voice notes, and videos.",
    color: "mint",
    gradient: "from-mint/20 to-green-200/10",
  },
  {
    icon: Users,
    title: "Gift Collaboration",
    description: "Multiple people can contribute messages or cards to one digital gift, making it truly collaborative and meaningful.",
    color: "secondary",
    gradient: "from-secondary/20 to-orange-200/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 bg-card relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-20 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.2, 0.4],
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
          <motion.div 
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              What we offer
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Express emotions,
            <br />
            <span className="gradient-text">celebrate memories</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our thoughtfully crafted gifting experiences designed to make every moment unforgettable
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
            >
              <Card
                className="border-2 border-border/50 hover:border-primary/30 transition-all duration-300 group cursor-pointer h-full overflow-hidden"
              >
                <CardContent className="p-8 relative">
                  {/* Hover gradient background */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  
                  <div className="flex items-start gap-4 relative z-10">
                    {/* Icon */}
                    <motion.div 
                      className={`p-4 rounded-2xl bg-${feature.color}/10 group-hover:bg-${feature.color}/20 transition-colors duration-300`}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-heading font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom decoration */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground italic">
            "Every gift tells a story. What's yours?"
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;