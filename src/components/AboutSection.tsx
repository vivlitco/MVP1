import { Heart, Sparkles } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-soft relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full shadow-glow animate-pulse-glow">
            <Heart className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-heading font-bold">
            Our <span className="gradient-text">story</span>
          </h2>

          {/* Mission statement */}
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-float border-2 border-primary/10">
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
              Vivlit was born from a simple yet powerful idea: capturing emotion in digital form. 
              We believe that in our fast-paced digital world, meaningful connections should be 
              celebrated, not forgotten.
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-primary font-heading font-semibold text-lg">
                Our Mission
              </p>
            </div>
            
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              To make digital gifting meaningful again. Every Jar of Notes, E-Card, and Custom Webpage 
              is designed to capture the essence of love, friendship, and celebration — transforming 
              ordinary moments into extraordinary memories that last forever.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <div className="text-3xl mb-2">💛</div>
              <h3 className="font-heading font-semibold mb-2">Heartfelt</h3>
              <p className="text-sm text-muted-foreground">
                Every feature designed with emotion and care
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-heading font-semibold mb-2">Joyful</h3>
              <p className="text-sm text-muted-foreground">
                Spreading happiness one gift at a time
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <div className="text-3xl mb-2">🌟</div>
              <h3 className="font-heading font-semibold mb-2">Memorable</h3>
              <p className="text-sm text-muted-foreground">
                Creating moments that matter forever
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-12 pt-8 border-t border-border/30">
            <blockquote className="text-xl md:text-2xl font-heading italic text-muted-foreground">
              "Love is not just felt, it's expressed. Vivlit helps you express it beautifully."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
