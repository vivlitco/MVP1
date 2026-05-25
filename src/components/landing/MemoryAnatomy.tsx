import { motion } from 'framer-motion';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { type: 'spring', stiffness: 70, damping: 20, delay },
});

const artifacts = [
  {
    label: 'A written note',
    description: 'Words that last longer than a text message.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="32" height="38" rx="3" fill="hsl(38,65%,68%)" fillOpacity="0.18" stroke="hsl(38,65%,58%)" strokeWidth="1.5" />
        <line x1="14" y1="18" x2="34" y2="18" stroke="hsl(270,20%,55%)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="14" y1="24" x2="34" y2="24" stroke="hsl(270,20%,55%)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="14" y1="30" x2="26" y2="30" stroke="hsl(270,20%,55%)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M30 33 Q33 30 36 33 Q33 36 30 33Z" fill="hsl(345,55%,72%)" fillOpacity="0.7" />
      </svg>
    ),
    offset: { top: 0, left: 0 },
    accent: 'hsl(38,65%,68%)',
  },
  {
    label: 'A photo',
    description: 'A moment worth more than the moment itself.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="36" height="28" rx="3" fill="hsl(280,45%,60%)" fillOpacity="0.12" stroke="hsl(280,45%,50%)" strokeWidth="1.5" />
        <circle cx="24" cy="22" r="7" fill="hsl(280,45%,60%)" fillOpacity="0.2" stroke="hsl(280,45%,50%)" strokeWidth="1.2" />
        <path d="M6 32 L14 22 L22 30 L30 20 L42 32" stroke="hsl(280,45%,50%)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    offset: { top: 60, left: 'auto', right: 0 },
    accent: 'hsl(280,45%,60%)',
  },
  {
    label: 'A voice message',
    description: 'Your voice, exactly as it sounds to them.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="20" width="4" height="8" rx="2" fill="hsl(345,55%,72%)" fillOpacity="0.6" />
        <rect x="10" y="16" width="4" height="16" rx="2" fill="hsl(345,55%,72%)" fillOpacity="0.8" />
        <rect x="16" y="12" width="4" height="24" rx="2" fill="hsl(345,55%,72%)" />
        <rect x="22" y="8" width="4" height="32" rx="2" fill="hsl(345,55%,72%)" />
        <rect x="28" y="14" width="4" height="20" rx="2" fill="hsl(345,55%,72%)" fillOpacity="0.9" />
        <rect x="34" y="18" width="4" height="12" rx="2" fill="hsl(345,55%,72%)" fillOpacity="0.7" />
        <rect x="40" y="21" width="4" height="6" rx="2" fill="hsl(345,55%,72%)" fillOpacity="0.5" />
      </svg>
    ),
    offset: { top: 20, left: 40 },
    accent: 'hsl(345,55%,72%)',
  },
  {
    label: 'A small charm',
    description: 'A sticker, an emoji, a tiny gesture of you.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 8 L27 18 L38 18 L29 25 L32 36 L24 29 L16 36 L19 25 L10 18 L21 18 Z" fill="hsl(38,65%,68%)" fillOpacity="0.7" stroke="hsl(38,55%,55%)" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
    offset: { top: 80, left: 'auto', right: 60 },
    accent: 'hsl(38,65%,68%)',
  },
];

const MemoryAnatomy = () => (
  <section
    aria-label="What goes inside a jar"
    style={{
      background: 'var(--bg-section)',
      padding: '120px 0',
      overflow: 'hidden',
    }}
  >
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>
      {/* Title */}
      <motion.div {...reveal(0)} style={{ textAlign: 'center', marginBottom: 80 }}>
        <p style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--accent-rose)',
          marginBottom: 16,
        }}>
          What goes inside
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          color: 'var(--ink-primary)',
          lineHeight: 1.2,
          margin: 0,
        }}>
          Every jar holds{' '}
          <span style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(42px, 6.5vw, 72px)',
            color: 'var(--accent-plum)',
          }}>
            something
          </span>
        </h2>
        <p style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: 'var(--ink-secondary)',
          lineHeight: 1.7,
          marginTop: 20,
          maxWidth: 460,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Mix and match what you put in. There are no rules — only intentions.
        </p>
      </motion.div>

      {/* Artifact grid — asymmetric placement */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '28px 24px',
        alignItems: 'start',
      }}>
        {artifacts.map((a, i) => (
          <motion.div
            key={a.label}
            {...reveal(i * 0.12)}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 12,
              padding: '32px 28px',
              boxShadow: '0 2px 16px rgba(80,40,120,0.07)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              marginTop: i % 2 === 1 ? 32 : 0,
              borderTop: `3px solid ${a.accent}`,
            }}
          >
            <div>{a.icon}</div>
            <div>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--ink-primary)',
                margin: '0 0 8px',
              }}>{a.label}</p>
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                color: 'var(--ink-secondary)',
                lineHeight: 1.65,
                margin: 0,
              }}>{a.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default MemoryAnatomy;
