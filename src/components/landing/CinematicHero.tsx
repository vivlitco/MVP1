import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroJar from './HeroJar';
import HeroNote from './HeroNote';
import ScrollHint from './ScrollHint';

const usePrefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Cinematic hero — composed as a film sequence, not a scroll-driven slider.
 *
 * Sequence over 320vh (scrollYProgress 0 → 1):
 *
 *   0.00 – 0.18  STATE 1: STILLNESS         everything at rest
 *   0.18 – 0.30  TRANSITION: headline exits  only the headline moves
 *   0.30 – 0.40  TRANSITION: jar rotates     only the jar moves
 *   0.40 – 0.55  STATE 2: FOCUS (hold)       sub-headline fades in mid-hold
 *   0.55 – 0.65  TRANSITION: sub → CTA       crossfade only
 *   0.65 – 0.75  STATE 3: INVITE (hold)      CTA visible, everything still
 *   0.75 – 0.82  TRANSITION: CTA exits       only opacity moves
 *   0.82 – 0.93  TRANSITION: lid lifts       only the lid moves
 *   0.93 – 1.00  STATE 4: REVEAL             only the note moves
 *
 * Principles:
 *   - One primary motion at a time
 *   - Real holds between beats (40-55, 65-75) — the screen rests
 *   - Heavy springs (high mass, low stiffness) so motion lags scroll → physicality
 *   - Headline does not move during jar rotation, jar does not move during lid lift, etc.
 */
const CinematicHero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // ── HEAD­LINE ── exits cleanly before jar moves
  const headlineOpacityRaw = useTransform(scrollYProgress, [0.0, 0.18, 0.30], [1, 1, 0]);
  const headlineYRaw       = useTransform(scrollYProgress, [0.18, 0.30],       [0, -36]);
  const headlineOpacity    = useSpring(headlineOpacityRaw, { stiffness: 60, damping: 24 });
  const headlineY          = useSpring(headlineYRaw,       { stiffness: 45, damping: 26, mass: 1.6 });

  // ── JAR ── moves only after headline is gone. Heavy, deliberate.
  const jarRotateYRaw = useTransform(scrollYProgress, [0.30, 0.42], [-22, 0]);
  const jarScaleRaw   = useTransform(scrollYProgress, [0.30, 0.42], [0.88, 1.0]);
  const jarRotateY    = useSpring(jarRotateYRaw, { stiffness: 32, damping: 26, mass: 2.4 });
  const jarScale      = useSpring(jarScaleRaw,   { stiffness: 32, damping: 26, mass: 2.4 });

  // ── SUB­HEAD­LINE ── appears inside the FOCUS hold (after jar settles)
  const subOpacity = useTransform(scrollYProgress, [0.44, 0.52, 0.58, 0.62], [0, 1, 1, 0]);

  // ── CTA ── enters cleanly after sub-headline leaves; holds; then exits before lid moves
  const ctaOpacity = useTransform(scrollYProgress, [0.62, 0.68, 0.75, 0.80], [0, 1, 1, 0]);

  // ── LID ── only thing moving from 0.82 → 0.93. Very weighted (mass 3.5).
  const lidRotateXRaw = useTransform(scrollYProgress, [0.82, 0.93], [0, -65]);
  const lidRotateX    = useSpring(lidRotateXRaw, { stiffness: 26, damping: 32, mass: 3.5 });

  // ── NOTE ── only thing moving from 0.93 → 1.0. Slow float.
  const noteYRaw       = useTransform(scrollYProgress, [0.93, 1.0],  [80, -20]);
  const noteOpacityRaw = useTransform(scrollYProgress, [0.93, 0.98], [0, 1]);
  const noteY          = useSpring(noteYRaw,       { stiffness: 22, damping: 22, mass: 2.6 });
  const noteOpacity    = useSpring(noteOpacityRaw, { stiffness: 40, damping: 22 });

  // ── SCROLL HINT ── fades fast at start
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08, 0.16], [1, 1, 0]);

  // Reduced-motion fallback
  if (reduced) {
    return (
      <section
        style={{
          minHeight: '100vh',
          background: 'var(--bg-page)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 80,
          gap: 40,
        }}
      >
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px,6vw,72px)', textAlign: 'center', color: 'var(--ink-primary)', maxWidth: 640, lineHeight: 1.2, margin: 0 }}>
          Fill a jar with{' '}
          <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>love</span>
        </h1>
        <p style={{ color: 'var(--ink-secondary)', fontSize: 18, textAlign: 'center', maxWidth: 480, lineHeight: 1.7 }}>
          Write heartfelt notes. Share with someone you love. Let them open one each day.
        </p>
        <Link to="/create-jar">
          <button style={{ background: 'var(--accent-plum)', color: 'white', border: 'none', borderRadius: 8, padding: '14px 36px', fontSize: 16, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Create your jar
          </button>
        </Link>
      </section>
    );
  }

  return (
    <div
      ref={sectionRef}
      style={{ height: '320vh', position: 'relative' }}
      aria-label="Hero — scroll to reveal"
    >
      {/* Sticky viewport */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-page)',
        }}
      >
        {/* Soft ambient warm background — static, no motion */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 42%, hsl(38,52%,94%) 0%, var(--bg-page) 70%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        {/* ── HEADLINE LAYER ── exits before jar moves */}
        <motion.div
          style={{
            opacity: headlineOpacity,
            y: headlineY,
            position: 'absolute',
            top: '16%',
            left: '50%',
            x: '-50%',
            width: 'min(620px, 90vw)',
            textAlign: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.25, 0.1, 0.08, 1] }}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent-rose)',
              marginBottom: 20,
            }}
          >
            A digital keepsake
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1.4, ease: [0.25, 0.1, 0.08, 1] }}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 6vw, 74px)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--ink-primary)',
              margin: 0,
            }}
          >
            Fill a jar with{' '}
            <span
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: 'clamp(52px, 8vw, 92px)',
                color: 'var(--accent-plum)',
                display: 'inline-block',
              }}
            >
              love
            </span>
          </motion.h1>
        </motion.div>

        {/* ── SUB-HEADLINE ── lives entirely inside the FOCUS hold */}
        <motion.div
          style={{
            opacity: subOpacity,
            position: 'absolute',
            top: '14%',
            left: '50%',
            x: '-50%',
            width: 'min(520px, 88vw)',
            textAlign: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <p style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--ink-secondary)',
            lineHeight: 1.75,
            margin: 0,
          }}>
            Write heartfelt notes, add photos and voice.<br />
            Share with someone you love.<br />
            Let them open one each day.
          </p>
        </motion.div>

        {/* ── CTA ── enters inside the INVITE hold; exits before lid lifts */}
        <motion.div
          style={{
            opacity: ctaOpacity,
            position: 'absolute',
            top: '20%',
            left: '50%',
            x: '-50%',
            zIndex: 10,
            display: 'flex',
            gap: 16,
            pointerEvents: 'auto',
          }}
        >
          <Link to="/create-jar">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'var(--accent-plum)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '14px 36px',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(120,60,180,0.25)',
                transition: 'box-shadow 0.2s',
              }}
            >
              Create your jar
            </motion.button>
          </Link>
          <Link to="/gallery">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'transparent',
                color: 'var(--ink-secondary)',
                border: '1.5px solid rgba(120,80,160,0.25)',
                borderRadius: 8,
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 500,
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              See examples
            </motion.button>
          </Link>
        </motion.div>

        {/* ── JAR SCENE ── the protagonist. Centered, stable.  */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
          }}
          aria-hidden="true"
        >
          <HeroJar
            rotateY={jarRotateY}
            scale={jarScale}
            lidRotateX={lidRotateX}
          />

          {/* Rising note — appears in the final state only */}
          <div style={{ position: 'absolute', top: -60, left: 0, right: 0 }}>
            <HeroNote y={noteY} opacity={noteOpacity} />
          </div>
        </div>

        {/* ── SCROLL HINT ── */}
        <motion.div
          style={{
            opacity: hintOpacity,
            position: 'absolute',
            bottom: 40,
            left: '50%',
            x: '-50%',
            zIndex: 10,
          }}
        >
          <ScrollHint />
        </motion.div>
      </div>
    </div>
  );
};

export default CinematicHero;
