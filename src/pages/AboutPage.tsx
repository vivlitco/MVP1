import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Sparkles, Target, Users, Star, ArrowLeft, Mail, Gift, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const values = [
  { emoji: '💛', title: 'Heartfelt', description: 'Every feature designed with emotion and care' },
  { emoji: '✨', title: 'Joyful', description: 'Spreading happiness one gift at a time' },
  { emoji: '🌟', title: 'Memorable', description: 'Creating moments that matter forever' },
  { emoji: '🤝', title: 'Collaborative', description: 'Building gifts together with loved ones' },
];

const products = [
  {
    icon: Gift,
    title: 'Jars of Notes',
    description: 'Collect heartfelt messages, voice notes, photos, and links in a beautiful interactive jar. Set daily opening modes, add decorative charms, and share with a unique link.',
  },
  {
    icon: Mail,
    title: 'Interactive E-Cards',
    description: 'Send animated digital greeting cards with a wax-seal envelope opening experience. Includes AI-powered message suggestions, voice notes, and email delivery.',
  },
  {
    icon: Users,
    title: 'Collaborative Gifting',
    description: 'Invite friends and family to contribute notes to a shared jar via unique invite links. Perfect for group birthday gifts, farewells, and celebrations.',
  },
  {
    icon: Wand2,
    title: 'AI Writing Assistant',
    description: 'Stuck on what to write? Our AI assistant generates 3 personalized message options based on your relationship, occasion, and tone preferences.',
  },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Back button */}
      <div className="container mx-auto px-4 pt-24">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Hero */}
      <section className="pb-16 px-4 bg-gradient-soft relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float-slow" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full shadow-glow">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold">
              About <span className="gradient-text">Vivlit</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Vivlit is an emotional e-gifting platform that transforms heartfelt words, 
              voice notes, and photos into beautiful interactive digital gifts — 
              Jars of Notes and animated E-Cards that make every moment unforgettable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="bg-card rounded-3xl p-8 md:p-12 shadow-float border-2 border-primary/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-heading font-bold gradient-text">Our Mission</h2>
            </div>
            <p className="text-center text-muted-foreground leading-relaxed max-w-2xl mx-auto text-lg">
              To make digital gifting meaningful again. Whether it's a Jar of Notes filled with 
              love letters and voice messages, or an animated E-Card with a wax-sealed envelope, 
              every Vivlit creation captures the essence of love, friendship, and celebration — 
              transforming ordinary moments into extraordinary memories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-4">
            What We <span className="gradient-text">Offer</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Two beautiful ways to express what matters most
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border border-border/50 hover:shadow-float transition-all group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                      <product.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Our <span className="gradient-text">Values</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center border border-border/50 hover:shadow-float transition-all">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">{value.emoji}</div>
                    <h3 className="font-heading font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-16 px-4 bg-gradient-soft">
        <div className="container mx-auto max-w-3xl text-center">
          <blockquote className="text-xl md:text-2xl font-heading italic text-muted-foreground">
            "Love is not just felt, it's expressed. Vivlit helps you express it beautifully."
          </blockquote>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button onClick={() => navigate('/create-jar')} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Gift className="w-4 h-4 mr-2" />
              Create a Jar
            </Button>
            <Button onClick={() => navigate('/create-card')} variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Send an E-Card
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AboutPage;
