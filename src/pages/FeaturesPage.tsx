import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, Lock, Palette, Users, Mic, Image, Link2, Gift, 
  Smartphone, Globe, Heart, Sparkles, Calendar, Share2, ArrowLeft, Wand2, Stamp
} from 'lucide-react';

const jarFeatures = [
  { icon: Mail, title: 'Heartfelt Notes', description: 'Write text messages, love letters, and heartfelt words that get folded into colorful paper notes.' },
  { icon: Mic, title: 'Voice Messages', description: 'Record audio notes that capture the warmth of your voice.' },
  { icon: Image, title: 'Photo Memories', description: 'Upload photos and images alongside your messages.' },
  { icon: Link2, title: 'Link Sharing', description: 'Add YouTube videos, Spotify songs, or any link to enrich your notes.' },
  { icon: Palette, title: '10+ Beautiful Themes', description: 'Choose from Lavender Dreams, Rose Garden, Ocean Breeze, and more.' },
  { icon: Sparkles, title: 'Decorative Charms', description: 'Add hearts, stars, flowers, and gems that float around your jar.' },
  { icon: Calendar, title: 'Daily Note Opening', description: 'Set "one note per day" mode for a gamified emotional experience.' },
  { icon: Lock, title: 'Password Protection', description: 'Keep your jar private so only the intended recipient can access it.' },
  { icon: Users, title: 'Collaborative Jars', description: 'Invite friends and family to contribute notes via unique invite links.' },
  { icon: Share2, title: 'Easy Sharing', description: 'Share via a unique link or email directly to the recipient.' },
];

const cardFeatures = [
  { icon: Stamp, title: 'Wax Seal Envelope', description: 'A realistic 3D envelope animation with a breakable wax seal opening.' },
  { icon: Wand2, title: 'AI Writing Assistant', description: 'Generate 3 personalized messages based on relationship, occasion, and tone.' },
  { icon: Mic, title: 'Voice Notes', description: 'Record and attach a voice note to your e-card for a personal touch.' },
  { icon: Mail, title: 'Email Delivery', description: 'Send your card directly to the recipient\'s inbox.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          {/* Back button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-4">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Everything you need</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Features that make your<br />
              <span className="gradient-text">gift unforgettable</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From interactive jars to animated e-cards — every feature is crafted with love
            </p>
          </motion.div>

          {/* Jar Features */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-2xl font-heading font-semibold mb-6 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Jar of Notes
            </h2>
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {jarFeatures.map((feature) => (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="h-full border border-border/50 hover:border-primary/30 transition-all duration-300 group hover:shadow-float">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-heading text-base font-semibold mb-1.5 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* E-Card Features */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-2xl font-heading font-semibold mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Interactive E-Cards
            </h2>
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {cardFeatures.map((feature) => (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="h-full border border-border/50 hover:border-primary/30 transition-all duration-300 group hover:shadow-float">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 group-hover:bg-accent/25 flex items-center justify-center mb-3 transition-colors">
                        <feature.icon className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-heading text-base font-semibold mb-1.5 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Platform Features */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-heading font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Platform
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
              <Card className="border border-border/50 hover:shadow-float transition-all group">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold mb-1">Mobile Friendly</h3>
                    <p className="text-sm text-muted-foreground">Works beautifully on all devices</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-border/50 hover:shadow-float transition-all group">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold mb-1">No App Required</h3>
                    <p className="text-sm text-muted-foreground">Everything in your browser</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => navigate('/create-jar')} size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Gift className="w-4 h-4 mr-2" />
                Create a Jar
              </Button>
              <Button onClick={() => navigate('/create-card')} size="lg" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send an E-Card
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default FeaturesPage;
