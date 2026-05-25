import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Mail, Lock, Palette, Users, Mic, Image, Link2, Gift,
  Smartphone, Globe, Sparkles, Calendar, Share2, Wand2, Stamp
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
  { icon: Mail, title: 'Email Delivery', description: "Send your card directly to the recipient's inbox." },
];

const featureCard = (isAccent = false) => ({
  background: 'white',
  border: '1px solid rgba(180,155,130,0.16)',
  borderRadius: 14,
  padding: 22,
  boxShadow: '0 2px 14px rgba(120,80,100,0.05)',
  height: '100%',
  boxSizing: 'border-box' as const,
});

const iconBox = (accent = false) => ({
  width: 40,
  height: 40,
  borderRadius: 11,
  background: accent ? 'rgba(200,100,150,0.09)' : 'rgba(140,90,180,0.09)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
});

const FeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px 80px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.25, 0.1, 0.08, 1] }}
          style={{ marginBottom: 72 }}
        >
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16 }}>
            Everything you need
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 18px', lineHeight: 1.2 }}>
            Features that make your gift{' '}
            <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>
              unforgettable
            </span>
          </h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, color: 'var(--ink-secondary)', lineHeight: 1.75, margin: 0, maxWidth: 540 }}>
            From interactive jars to animated e-cards — every feature is crafted with love.
          </p>
        </motion.div>

        {/* Jar Features */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <Gift size={18} style={{ color: 'var(--accent-plum)' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>
              Jar of{' '}
              <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>Notes</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {jarFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: [0.25, 0.1, 0.08, 1], duration: 0.6 }}
                style={featureCard()}
              >
                <div style={iconBox()}>
                  <feature.icon size={18} style={{ color: 'var(--accent-plum)' }} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--ink-primary)', margin: '0 0 8px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* E-Card Features */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <Mail size={18} style={{ color: 'var(--accent-rose)' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>
              Interactive{' '}
              <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-rose)' }}>E-Cards</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {cardFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.06, ease: [0.25, 0.1, 0.08, 1], duration: 0.6 }}
                style={featureCard(true)}
              >
                <div style={iconBox(true)}>
                  <feature.icon size={18} style={{ color: 'var(--accent-rose)' }} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--ink-primary)', margin: '0 0 8px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <Globe size={18} style={{ color: 'var(--ink-muted)' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>
              Platform
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, maxWidth: 560 }}>
            {[
              { icon: Smartphone, title: 'Mobile Friendly', desc: 'Works beautifully on all devices' },
              { icon: Globe, title: 'No App Required', desc: 'Everything runs in your browser' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ ...featureCard(), display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20 }}>
                <div style={{ ...iconBox(), margin: 0, flexShrink: 0 }}>
                  <Icon size={17} style={{ color: 'var(--ink-muted)' }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: 'var(--ink-primary)', margin: '0 0 4px' }}>{title}</h3>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 70, damping: 20 }}
          style={{ textAlign: 'center', paddingTop: 48, borderTop: '1px solid rgba(180,155,130,0.14)' }}
        >
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/create-jar')}
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 500, color: 'white', background: 'var(--accent-plum)', border: 'none', borderRadius: 8, padding: '12px 26px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Gift size={15} /> Create a Jar
            </button>
            <button
              onClick={() => navigate('/create-card')}
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--ink-secondary)', background: 'transparent', border: '1px solid rgba(180,155,130,0.3)', borderRadius: 8, padding: '11px 24px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Mail size={15} /> Send an E-Card
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
