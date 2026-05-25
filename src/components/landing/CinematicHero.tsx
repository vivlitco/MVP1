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
 * Film sequence over 480vh. The rising note becomes the card — no separate component.
 *
 * Phases (scrollYProgress 0→1 over 480vh):
 *   0.000-0.120  STILLNESS
 *   0.120-0.200  headline exits
 *   0.200-0.280  jar rotates
 *   0.280-0.413  FOCUS hold (sub-headline below)
 *   0.413-0.527  INVITE hold (jar visible)
 *   0.527-0.533  CTA exits (no CTA in hero)
 *   0.533-0.620  lid lifts
 *   0.620-0.667  note rises (y: 80→-20, scale: 1.0)
 *   0.667-0.750  CARD APPROACH (note scales 1.0→1.8, jar fades)
 *   0.750-0.900  CARD HOLD (large note at 1.8x)
 *   0.900-0.970  card fades out
 */
const CinematicHero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // ── HEADLINE ──
  const headlineOpacity = useTransform(scrollYProgress, [0.000, 0.120, 0.200], [1, 1, 0]);
  const headlineY       = useTransform(scrollYProgress, [0.120, 0.200],         [0, -32]);

  // ── JAR ──
  const jarRotateYRaw = useTransform(scrollYProgress, [0.200, 0.280], [-22, 0]);
  const jarScaleRaw   = useTransform(scrollYProgress, [0.200, 0.280], [0.88, 1.0]);
  const jarRotateY    = useSpring(jarRotateYRaw, { stiffness: 50, damping: 24, mass: 1.6 });
  const jarScale      = useSpring(jarScaleRaw,   { stiffness: 50, damping: 24, mass: 1.6 });
  // jar fades as note scales up
  const jarOpacity    = useTransform(scrollYProgress, [0.650, 0.700], [1, 0]);

  // ── SUB-HEADLINE ── below jar
  const subOpacity = useTransform(scrollYProgress, [0.293, 0.347, 0.380, 0.413], [0, 1, 1, 0]);

  // ── LID ──
  const lidRotateXRaw = useTransform(scrollYProgress, [0.533, 0.620], [0, -65]);
  const lidRotateX    = useSpring(lidRotateXRaw, { stiffness: 28, damping: 30, mass: 3.2 });

  // ── NOTE ── rises then scales up (becomes the card)
  const noteYRaw       = useTransform(scrollYProgress, [0.620, 0.667],               [80, -20]);
  const noteOpacityRaw = useTransform(scrollYProgress, [0.620, 0.650, 0.900, 0.970], [0, 1, 1, 0]);
  const noteScaleRaw   = useTransform(scrollYProgress, [0.667, 0.750],               [1.0, 1.8]);

  const noteY          = useSpring(noteYRaw,       { stiffness: 32, damping: 22, mass: 2.0 });
  const noteOpacity    = useSpring(noteOpacityRaw, { stiffness: 50, damping: 22 });
  const noteScale      = useSpring(noteScaleRaw,   { stiffness: 38, damping: 22, mass: 2.0 });

  // ── SCROLL HINT ──
  const hintOpacity = useTransform(scrollYProgress, [0, 0.05, 0.11], [1, 1, 0]);

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
      style={{ height: '480vh', position: 'relative' }}
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
        {/* Static ambient gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 42%, hsl(38,52%,94%) 0%, var(--bg-page) 70%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        {/* ── HEADLINE ── */}
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

        {/* ── JAR SCENE ── fades as note scales up */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            x: '-50%',
            y: '-50%',
            zIndex: 5,
            opacity: jarOpacity,
            willChange: 'opacity, transform',
          }}
          aria-hidden="true"
        >
          <HeroJar rotateY={jarRotateY} scale={jarScale} lidRotateX={lidRotateX} />
        </motion.div>

        {/* ── RISING NOTE → ZOOMED CARD ── continuous scaling, same object */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            x: '-50%',
            y: '-50%',
            zIndex: 6,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <motion.div
            style={{
              position: 'absolute',
              top: -60,
              left: 0,
              right: 0,
              scale: noteScale,
              transformOrigin: 'center 0%',
              willChange: 'transform, opacity',
            }}
          >
            <HeroNote y={noteY} opacity={noteOpacity} />
          </motion.div>
        </motion.div>

        {/* ── SUB-HEADLINE ── below jar, moved lower */}
        <motion.div
          style={{
            opacity: subOpacity,
            willChange: 'opacity',
            position: 'absolute',
            bottom: '9%',
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
