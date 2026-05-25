import { motion } from 'framer-motion';

const cases = [
  {
    theme: 'hsl(280,30%,96%)',
    accent: 'var(--accent-plum)',
    eyebrow: 'Long distance',
    quote: "For the friend moving across the world",
    body: "Fill a jar before they leave. One note for every day they're settling into their new life.",
    tag: '365 goodbyes, one jar',
  },
  {
    theme: 'hsl(38,50%,95%)',
    accent: 'var(--accent-gold)',
    eyebrow: 'Birthdays',
    quote: "For the birthday they'll never forget",
    body: 'Invite their friends to add a note. Let them open one each morning of their birth month.',
    tag: 'Crowdfunded love',
  },
  {
    theme: 'hsl(345,40%,96%)',
    accent: 'var(--accent-rose)',
    eyebrow: 'For the future',
    quote: 'For words that should outlast you',
    body: "A letter to your child when they turn 18. A note for your partner on a hard day you know is coming.",
    tag: 'Preserved forever',
  },
];

const EmotionalUseCases = () => (
  <section
    aria-label="Emotional use cases"
    style={{
      background: 'var(--bg-page)',
      padding: '120px 0',
    }}
  >
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 70, damping: 20 }}
        style={{ marginBottom: 64 }}
      >
        <p style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--accent-rose)',
          marginBottom: 16,
        }}>
          For the moments that matter
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(30px, 5vw, 52px)',
          fontWeight: 700,
          color: 'var(--ink-primary)',
          lineHeight: 1.2,
          margin: 0,
          maxWidth: 520,
        }}>
          A jar for every kind of{' '}
          <span style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(40px, 6.5vw, 68px)',
            color: 'var(--accent-plum)',
          }}>
            love
          </span>
        </h2>
      </motion.div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}>
        {cases.map((c, i) => (
          <motion.div
            key={c.eyebrow}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: 'spring', stiffness: 60, damping: 20, delay: i * 0.14 }}
            style={{
              background: c.theme,
              borderRadius: 16,
              padding: '44px 36px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              marginTop: i === 1 ? 40 : 0,
            }}
          >
            <p style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: c.accent,
              margin: 0,
            }}>
              {c.eyebrow}
            </p>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 700,
              color: 'var(--ink-primary)',
              lineHeight: 1.25,
              margin: 0,
              fontStyle: 'italic',
            }}>
              {c.quote}
            </h3>
            <p style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 14,
              color: 'var(--ink-secondary)',
              lineHeight: 1.75,
              margin: 0,
              flexGrow: 1,
            }}>
              {c.body}
            </p>
            <span style={{
              display: 'inline-block',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: c.accent,
              letterSpacing: '0.08em',
              padding: '4px 12px',
              border: `1px solid ${c.accent}`,
              borderRadius: 20,
              alignSelf: 'flex-start',
              opacity: 0.8,
            }}>
              {c.tag}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default EmotionalUseCases;
