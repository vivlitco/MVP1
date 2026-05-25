import { motion, MotionValue } from 'framer-motion';

interface HeroNoteProps {
  y: MotionValue<number>;
  opacity: MotionValue<number>;
}

const HeroNote = ({ y, opacity }: HeroNoteProps) => (
  <motion.div
    style={{ y, opacity, position: 'absolute', left: '50%', x: '-50%', zIndex: 20 }}
    aria-hidden="true"
  >
    {/* Paper note with gentle float */}
    <motion.div
      animate={{ rotate: [0, 2.5, -1.5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="hero-note rounded-sm"
      style={{ width: 200, padding: '20px 22px 24px' }}
    >
      {/* Ruled lines decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 2, pointerEvents: 'none' }}>
        {[44, 64, 84, 104].map((top) => (
          <div
            key={top}
            style={{
              position: 'absolute',
              left: 22,
              right: 22,
              top,
              height: 1,
              background: 'rgba(100, 80, 60, 0.08)',
            }}
          />
        ))}
        {/* Left margin line */}
        <div style={{
          position: 'absolute',
          left: 38,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'rgba(180, 140, 120, 0.15)',
        }} />
      </div>

      {/* Content */}
      <p style={{
        fontFamily: "'Dancing Script', cursive",
        fontSize: 15,
        color: 'var(--ink-secondary)',
        marginBottom: 10,
        lineHeight: 1.4,
      }}>
        Dear friend,
      </p>
      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: 12,
        color: 'var(--ink-primary)',
        lineHeight: 1.85,
        opacity: 0.8,
      }}>
        Some words are too important<br />
        for a text message.
      </p>
      <p style={{
        fontFamily: "'Dancing Script', cursive",
        fontSize: 13,
        color: 'var(--accent-rose)',
        marginTop: 14,
        textAlign: 'right',
      }}>
        — with love ✦
      </p>
    </motion.div>
  </motion.div>
);

export default HeroNote;
