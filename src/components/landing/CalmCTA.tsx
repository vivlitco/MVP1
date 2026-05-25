import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CalmCTA = () => (
  <section
    aria-label="Get started"
    style={{
      background: 'var(--bg-page)',
      padding: '140px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }}
  >
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: 'spring', stiffness: 60, damping: 20 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}
    >
      <p style={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--accent-rose)',
        margin: 0,
      }}>
        Begin
      </p>

      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(34px, 6vw, 68px)',
        fontWeight: 700,
        color: 'var(--ink-primary)',
        lineHeight: 1.15,
        margin: 0,
        maxWidth: 560,
      }}>
        Start your first{' '}
        <span style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: 'clamp(46px, 8vw, 88px)',
          color: 'var(--accent-plum)',
        }}>
          jar
        </span>
        .
      </h2>

      <Link to="/create-jar" style={{ textDecoration: 'none', marginTop: 8 }}>
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 6px 28px rgba(120,60,180,0.32)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'var(--accent-plum)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '16px 48px',
            fontSize: 16,
            fontWeight: 600,
            fontFamily: 'Poppins, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(120,60,180,0.22)',
            transition: 'box-shadow 0.2s',
          }}
        >
          Create a jar
        </motion.button>
      </Link>

      <p style={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: 13,
        color: 'var(--ink-muted)',
        margin: 0,
        lineHeight: 1.7,
      }}>
        No account needed. No algorithm. Just you and them.
      </p>
    </motion.div>
  </section>
);

export default CalmCTA;
