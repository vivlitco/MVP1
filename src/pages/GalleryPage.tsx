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
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />

      <section style={{ padding: '96px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 48 }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Header */}
          <motion.div
            style={{ textAlign: 'center', marginBottom: 48 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.08, 1] }}
          >
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16 }}>
              Inspiration
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 16px', lineHeight: 1.2 }}>
              Jar{' '}
              <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>
                Gallery
              </span>
            </h1>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, color: 'var(--ink-secondary)', margin: 0, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
              Get inspired by beautiful jar creations from our community
            </p>
          </motion.div>

          {/* Category filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 48 }} role="tablist" aria-label="Filter gallery by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                role="tab"
                aria-selected={activeCategory === cat}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13,
                  fontWeight: activeCategory === cat ? 500 : 400,
                  padding: '7px 16px',
                  borderRadius: 24,
                  border: activeCategory === cat ? '1px solid transparent' : '1px solid rgba(180,155,130,0.26)',
                  background: activeCategory === cat ? 'var(--accent-plum)' : 'transparent',
                  color: activeCategory === cat ? 'white' : 'var(--ink-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
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
      </section>

      <Footer />
    </div>
  );
};

export default GalleryPage;
