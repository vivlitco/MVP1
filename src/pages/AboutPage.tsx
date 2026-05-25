import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Mail, Gift, Wand2, Users, Target } from 'lucide-react';

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
    description:
      'Collect heartfelt messages, voice notes, photos, and links in a beautiful interactive jar. Set daily opening modes, add decorative charms, and share with a unique link.',
  },
  {
    icon: Mail,
    title: 'Interactive E-Cards',
    description:
      'Send animated digital greeting cards with a wax-seal envelope opening experience. Includes AI-powered message suggestions, voice notes, and email delivery.',
  },
  {
    icon: Users,
    title: 'Collaborative Gifting',
    description:
      'Invite friends and family to contribute notes to a shared jar via unique invite links. Perfect for group birthday gifts, farewells, and celebrations.',
  },
  {
    icon: Wand2,
    title: 'AI Writing Assistant',
    description:
      "Stuck on what to write? Our AI assistant generates 3 personalized message options based on your relationship, occasion, and tone preferences.",
  },
];

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 } as any,
  viewport: { once: true, amount: 0.25 },
  transition: { type: 'spring', stiffness: 70, damping: 20 },
};

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />

      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '96px 24px 0' }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 13,
            color: 'var(--ink-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: 48,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.25, 0.1, 0.08, 1] }}
          style={{ textAlign: 'center', marginBottom: 96 }}
        >
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 20 }}>
            Our story
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 24px', lineHeight: 1.2 }}>
            About{' '}
            <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>
              Vivlit
            </span>
          </h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 17, color: 'var(--ink-secondary)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto' }}>
            An emotional e-gifting platform that transforms heartfelt words, voice notes, and photos
            into beautiful interactive digital gifts — Jars of Notes and animated E-Cards that make
            every moment unforgettable.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div {...reveal} style={{ marginBottom: 96 }}>
          <div
            style={{
              background: 'white',
              border: '1px solid rgba(180,155,130,0.18)',
              borderRadius: 20,
              padding: '52px 40px',
              boxShadow: '0 2px 20px rgba(120,80,100,0.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
              <Target size={18} style={{ color: 'var(--accent-plum)' }} />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>
                Our{' '}
                <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>
                  Mission
                </span>
              </h2>
            </div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, color: 'var(--ink-secondary)', lineHeight: 1.8, maxWidth: 620, margin: '0 auto' }}>
              To make digital gifting meaningful again. Whether it's a Jar of Notes filled with
              love letters and voice messages, or an animated E-Card with a wax-sealed envelope,
              every creation captures the essence of love, friendship, and celebration — transforming
              ordinary moments into extraordinary memories.
            </p>
          </div>
        </motion.div>

        {/* What We Offer */}
        <div style={{ marginBottom: 96 }}>
          <motion.div {...reveal} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 14px' }}>
              What we{' '}
              <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>
                offer
              </span>
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--ink-muted)', margin: 0 }}>
              Two beautiful ways to express what matters most
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {products.map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: 'spring', stiffness: 70, damping: 20, delay: index * 0.08 }}
              >
                <div
                  style={{
                    background: 'white',
                    border: '1px solid rgba(180,155,130,0.16)',
                    borderRadius: 16,
                    padding: 28,
                    boxShadow: '0 2px 16px rgba(120,80,100,0.06)',
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(140,90,180,0.09)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                    }}
                  >
                    <product.icon size={20} style={{ color: 'var(--accent-plum)' }} />
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: 'var(--ink-primary)', margin: '0 0 10px' }}>
                    {product.title}
                  </h3>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.75, margin: 0 }}>
                    {product.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div style={{ marginBottom: 96 }}>
          <motion.div {...reveal} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
              Our{' '}
              <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>
                values
              </span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: 'spring', stiffness: 70, damping: 20, delay: index * 0.08 }}
              >
                <div
                  style={{
                    background: 'white',
                    border: '1px solid rgba(180,155,130,0.16)',
                    borderRadius: 16,
                    padding: '28px 20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 12px rgba(120,80,100,0.05)',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{value.emoji}</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: 'var(--ink-primary)', margin: '0 0 8px' }}>
                    {value.title}
                  </h3>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.65 }}>
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quote + CTA */}
        <motion.div
          {...reveal}
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            borderTop: '1px solid rgba(180,155,130,0.14)',
            marginBottom: 0,
          }}
        >
          <blockquote
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(18px,2.5vw,26px)',
              fontStyle: 'italic',
              color: 'var(--ink-secondary)',
              margin: '0 0 40px',
              lineHeight: 1.6,
            }}
          >
            "Love is not just felt, it's expressed.{' '}
            <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)', fontStyle: 'normal' }}>
              Vivlit
            </span>{' '}
            helps you express it beautifully."
          </blockquote>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/create-jar')}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                color: 'white',
                background: 'var(--accent-plum)',
                border: 'none',
                borderRadius: 8,
                padding: '12px 26px',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Gift size={15} /> Create a Jar
            </button>
            <button
              onClick={() => navigate('/create-card')}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--ink-secondary)',
                background: 'transparent',
                border: '1px solid rgba(180,155,130,0.3)',
                borderRadius: 8,
                padding: '11px 24px',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
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

export default AboutPage;
