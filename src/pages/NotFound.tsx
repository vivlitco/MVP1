import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.08, 1] }}
        style={{ textAlign: 'center', maxWidth: 480 }}
      >
        <p
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 128,
            fontWeight: 700,
            color: 'var(--accent-plum)',
            opacity: 0.12,
            lineHeight: 1,
            margin: 0,
            userSelect: 'none',
          }}
        >
          404
        </p>

        <div style={{ marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: 34,
                fontWeight: 700,
                color: 'var(--ink-primary)',
              }}
            >
              Vivlit
            </span>
          </Link>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(26px, 4vw, 40px)',
            fontWeight: 700,
            color: 'var(--ink-primary)',
            margin: '0 0 16px',
            lineHeight: 1.25,
          }}
        >
          This page doesn't exist
        </h1>

        <p
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 15,
            color: 'var(--ink-muted)',
            lineHeight: 1.75,
            margin: '0 0 40px',
          }}
        >
          The jar you're looking for may have been moved, shared privately,
          or never filled.
        </p>

        <Link to="/" style={{ textDecoration: 'none' }}>
          <button
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              color: 'white',
              background: 'var(--accent-plum)',
              border: 'none',
              borderRadius: 8,
              padding: '12px 30px',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Back to home
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
