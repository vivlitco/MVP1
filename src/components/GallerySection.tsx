import { Card } from "@/components/ui/card";
import ecardSample from "@/assets/ecard-sample.png";
import webpageSample from "@/assets/webpage-sample.png";
import { Heart, Star, Cake } from "lucide-react";

const samples = [
  {
    image: ecardSample,
    title: "Birthday Celebration",
    category: "E-Card",
    icon: Cake,
    gradient: "from-accent/20 to-secondary/20",
  },
  {
    image: webpageSample,
    title: "Anniversary Page",
    category: "Custom Webpage",
    icon: Heart,
    gradient: "from-primary/20 to-mint/20",
  },
  {
    image: ecardSample,
    title: "Farewell Wishes",
    category: "Jar of Notes",
    icon: Star,
    gradient: "from-mint/20 to-accent/20",
  },
];

const GallerySection = () => {
  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Moments worth
            <br />
            <span className="gradient-text">celebrating</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how others are lighting up special moments with Vivlit
          </p>
        </div>

        {/* Gallery grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {samples.map((sample, index) => (
            <Card
              key={sample.title}
              className="group cursor-pointer overflow-hidden border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-float animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image container */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <div className={`absolute inset-0 bg-gradient-to-br ${sample.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                <img
                  src={sample.image}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay icon */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
                  <sample.icon className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-3">
                  <span className="text-xs font-medium text-primary">
                    {sample.category}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-semibold group-hover:text-primary transition-colors duration-300">
                  {sample.title}
                </h3>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom text */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Join thousands creating unforgettable moments ✨
          </p>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
