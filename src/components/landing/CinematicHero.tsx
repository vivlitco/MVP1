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
 * Film sequence over 320vh. Lenis handles scroll smoothness.
 * Springs only add extra physical weight where needed (lid, note, jar).
 *
 * Composition per state:
 *   STATE 1 — headline above the jar, jar at center-left tilt
 *   STATE 2 — jar front-and-center, sub-headline *below* jar
 *   STATE 3 — jar front-and-center, CTA *below* jar
 *   STATE 4 — lid opens, note rises above jar
 *
 * Scroll phases (0 → 1 over 320vh):
 *   0.00 – 0.18  STILLNESS       nothing moves after mount
 *   0.18 – 0.30  headline exits  only headline (opacity + y)
 *   0.30 – 0.42  jar rotates     only jar (rotateY + scale)
 *   0.42 – 0.55  FOCUS hold      sub-headline fades in below jar
 *   0.55 – 0.64  sub exits       crossfade
 *   0.64 – 0.74  INVITE hold     CTA visible below jar
 *   0.74 – 0.80  CTA exits
 *   0.80 – 0.93  lid lifts       only lid rotates
 *   0.93 – 1.00  note rises      only note moves
 */
const CinematicHero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // ── HEADLINE ── above the jar; exits cleanly before jar moves
  // No spring here — Lenis already smooths the input; crisp response is better
  const headlineOpacity = useTransform(scrollYProgress, [0.0, 0.18, 0.30], [1, 1, 0]);
  const headlineY       = useTransform(scrollYProgress, [0.18, 0.30],       [0, -32]);

  // ── JAR ── starts tilted, rotates to face-forward after headline gone
  // Light spring for physical weight without excessive lag (Lenis already smoothing)
  const jarRotateYRaw = useTransform(scrollYProgress, [0.30, 0.42], [-22, 0]);
  const jarScaleRaw   = useTransform(scrollYProgress, [0.30, 0.42], [0.88, 1.0]);
  const jarRotateY    = useSpring(jarRotateYRaw, { stiffness: 50, damping: 24, mass: 1.6 });
  const jarScale      = useSpring(jarScaleRaw,   { stiffness: 50, damping: 24, mass: 1.6 });

  // ── SUB-HEADLINE ── appears BELOW the jar during the FOCUS hold
  const subOpacity = useTransform(scrollYProgress, [0.44, 0.52, 0.57, 0.62], [0, 1, 1, 0]);

  // ── CTA ── appears BELOW the jar during the INVITE hold
  const ctaOpacity = useTransform(scrollYProgress, [0.62, 0.68, 0.74, 0.79], [0, 1, 1, 0]);

  // ── LID ── heavy spring — the one place we want felt physical weight
  const lidRotateXRaw = useTransform(scrollYProgress, [0.80, 0.93], [0, -65]);
  const lidRotateX    = useSpring(lidRotateXRaw, { stiffness: 28, damping: 30, mass: 3.2 });

  // ── NOTE ── medium spring — slow float upward
  const noteYRaw       = useTransform(scrollYProgress, [0.93, 1.0],  [80, -20]);
  const noteOpacityRaw = useTransform(scrollYProgress, [0.93, 0.98], [0, 1]);
  const noteY          = useSpring(noteYRaw,       { stiffness: 32, damping: 22, mass: 2.0 });
  const noteOpacity    = useSpring(noteOpacityRaw, { stiffness: 50, damping: 22 });

  // ── SCROLL HINT ──
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08, 0.16], [1, 1, 0]);

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
        {/* Static ambient gradient — never animates */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 42%, hsl(38,52%,94%) 0%, var(--bg-page) 70%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        {/* ── HEADLINE ── above the jar, STATE 1 only */}
        <motion.div
          style={{
            opacity: headlineOpacity,
            y: headlineY,
            willChange: 'opacity, transform',
            position: 'absolute',
            top: '13%',
            left: '50%',
            x: '-50%',
            width: 'min(620px, 90vw)',
            textAlign: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
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
            initial={{ opacity: 0, y: 18 }}
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

        {/* ── JAR SCENE ── always centered, the protagonist */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            willChange: 'transform',
          }}
          aria-hidden="true"
        >
          <HeroJar rotateY={jarRotateY} scale={jarScale} lidRotateX={lidRotateX} />

          <div style={{ position: 'absolute', top: -60, left: 0, right: 0 }}>
            <HeroNote y={noteY} opacity={noteOpacity} />
          </div>
        </div>

        {/* ── SUB-HEADLINE ── BELOW the jar, STATE 2 (FOCUS hold) */}
        <motion.div
          style={{
            opacity: subOpacity,
            willChange: 'opacity',
            position: 'absolute',
            bottom: '12%',
            left: '50%',
            x: '-50%',
            width: 'min(480px, 88vw)',
            textAlign: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <p style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(15px, 1.8vw, 19px)',
            color: 'var(--ink-secondary)',
            lineHeight: 1.75,
            margin: 0,
          }}>
            Write heartfelt notes, add photos and voice.<br />
            Share with someone you love.<br />
            Let them open one each day.
          </p>
        </motion.div>

        {/* ── CTA ── BELOW the jar, STATE 3 (INVITE hold) */}
        <motion.div
          style={{
            opacity: ctaOpacity,
            willChange: 'opacity',
            position: 'absolute',
            bottom: '12%',
            left: '50%',
            x: '-50%',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', gap: 14 }}>
            <Link to="/create-jar">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'var(--accent-plum)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '13px 34px',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(120,60,180,0.25)',
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
                  border: '1.5px solid rgba(120,80,160,0.3)',
                  borderRadius: 8,
                  padding: '13px 26px',
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                }}
              >
                See examples
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* ── SCROLL HINT ── */}
        <motion.div
          style={{
            opacity: hintOpacity,
            position: 'absolute',
            bottom: 36,
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
