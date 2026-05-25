import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import birthdayImg from '@/assets/gallery/birthday-jar.jpg';
import farewellImg from '@/assets/gallery/farewell-jar.jpg';
import anniversaryImg from '@/assets/gallery/anniversary-jar.jpg';
import graduationImg from '@/assets/gallery/graduation-jar.jpg';
import gratitudeImg from '@/assets/gallery/gratitude-jar.jpg';
import weddingImg from '@/assets/gallery/wedding-jar.jpg';
import holidayImg from '@/assets/gallery/holiday-jar.jpg';
import babyshowerImg from '@/assets/gallery/babyshower-jar.jpg';
import friendshipImg from '@/assets/gallery/friendship-jar.jpg';

const galleryItems = [
  { id: 1, title: 'Birthday Wishes Jar', category: 'Birthday', image: birthdayImg, height: 'h-72' },
  { id: 2, title: 'Farewell Notes', category: 'Farewell', image: farewellImg, height: 'h-96' },
  { id: 3, title: 'Anniversary Love Letters', category: 'Anniversary', image: anniversaryImg, height: 'h-64' },
  { id: 4, title: 'Graduation Congratulations', category: 'Graduation', image: graduationImg, height: 'h-80' },
  { id: 5, title: 'Thank You Jar', category: 'Gratitude', image: gratitudeImg, height: 'h-72' },
  { id: 6, title: 'Wedding Blessings', category: 'Wedding', image: weddingImg, height: 'h-96' },
  { id: 7, title: 'Holiday Greetings', category: 'Holiday', image: holidayImg, height: 'h-64' },
  { id: 8, title: 'Baby Shower Messages', category: 'Baby Shower', image: babyshowerImg, height: 'h-80' },
  { id: 9, title: 'Friendship Jar', category: 'Friendship', image: friendshipImg, height: 'h-72' },
];

const categories = ['All', 'Birthday', 'Farewell', 'Anniversary', 'Graduation', 'Gratitude', 'Wedding', 'Holiday', 'Baby Shower', 'Friendship'];

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const filtered = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter(i => i.category === activeCategory);

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
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Jar <span className="gradient-text">Gallery</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get inspired by beautiful jar creations from our community
            </p>
          </motion.div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12" role="tablist" aria-label="Filter gallery by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filtered.map((item, index) => (
              <motion.div
                key={item.id}
                className="break-inside-avoid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link to="/create-jar">
                  <div className={`relative ${item.height} rounded-2xl overflow-hidden group cursor-pointer border border-border/50 shadow-soft hover:shadow-float transition-all duration-300`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="font-heading text-lg font-semibold text-white mb-1">{item.title}</h3>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white/90">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default GalleryPage;
