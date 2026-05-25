import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'You write',
    body: 'Take your time. Write ten notes or a hundred. Add a voice message, a photo. Fill it with everything you want them to feel.',
    visual: (
      <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
        {/* Jar outline */}
        <path d="M42 30C36 33 28 40 28 52V84A12 12 0 0 0 40 96H100A12 12 0 0 0 112 84V52C112 40 104 33 98 30" fill="rgba(255,252,248,0.7)" stroke="hsl(280,45%,60%)" strokeWidth="2" strokeLinecap="round" />
        {/* Lid */}
        <path d="M98 15H42C37 15 34 19 34 24V30H106V24C106 19 103 15 98 15Z" fill="hsl(280,45%,60%)" fillOpacity="0.85" />
        {/* Notes inside */}
        <rect x="42" y="60" width="24" height="16" rx="2" fill="hsl(38,65%,68%)" fillOpacity="0.7" transform="rotate(-8 54 68)" />
        <rect x="62" y="65" width="24" height="16" rx="2" fill="hsl(345,55%,72%)" fillOpacity="0.7" transform="rotate(5 74 73)" />
        <rect x="80" y="58" width="24" height="16" rx="2" fill="hsl(280,45%,60%)" fillOpacity="0.4" transform="rotate(-3 92 66)" />
        {/* Pen */}
        <line x1="118" y1="10" x2="128" y2="50" stroke="hsl(270,45%,20%)" strokeWidth="2" strokeLinecap="round" />
        <path d="M128 50 L132 58 L124 54 Z" fill="hsl(270,45%,20%)" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'You share',
    body: 'One link. No app download. They open it on any device. You choose when each note becomes available — daily, weekly, or all at once.',
    visual: (
      <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
        {/* Phone */}
        <rect x="50" y="8" width="40" height="70" rx="6" fill="white" stroke="hsl(270,45%,30%)" strokeWidth="1.5" />
        <rect x="55" y="18" width="30" height="48" rx="3" fill="hsl(280,30%,96%)" />
        {/* Link on screen */}
        <rect x="58" y="26" width="24" height="6" rx="3" fill="hsl(280,45%,60%)" fillOpacity="0.4" />
        <rect x="58" y="36" width="18" height="4" rx="2" fill="hsl(270,20%,55%)" fillOpacity="0.3" />
        {/* Share arrow */}
        <path d="M100 30 C115 20 125 35 118 50" stroke="hsl(345,55%,72%)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 3" fill="none" />
        <circle cx="118" cy="52" r="4" fill="hsl(345,55%,72%)" fillOpacity="0.7" />
        {/* Heart */}
        <path d="M20 50 C20 44 28 42 28 50 C28 42 36 44 36 50 C36 56 28 62 28 62 C28 62 20 56 20 50Z" fill="hsl(345,55%,72%)" fillOpacity="0.5" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'They open',
    body: 'Each day, a new note becomes available. They read it alone, in the quiet morning. Your words, exactly as you wrote them.',
    visual: (
      <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
        {/* Open jar with rising note */}
        <path d="M42 38C36 41 28 48 28 60V92A12 12 0 0 0 40 104H100A12 12 0 0 0 112 92V60C112 48 104 41 98 38" fill="rgba(255,252,248,0.7)" stroke="hsl(280,45%,60%)" strokeWidth="2" strokeLinecap="round" />
        {/* Open lid (tilted) */}
        <path d="M40 23H100C105 23 108 27 108 32V38H32V32C32 27 35 23 40 23Z" fill="hsl(280,45%,60%)" fillOpacity="0.85" transform="rotate(-35 70 30.5)" />
        {/* Rising note */}
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="55" y="8" width="30" height="22" rx="2" fill="hsl(38,65%,85%)" stroke="hsl(38,65%,65%)" strokeWidth="1" />
          <line x1="60" y1="14" x2="80" y2="14" stroke="hsl(38,45%,55%)" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="60" y1="18" x2="80" y2="18" stroke="hsl(38,45%,55%)" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="60" y1="22" x2="72" y2="22" stroke="hsl(38,45%,55%)" strokeWidth="0.8" strokeLinecap="round" />
        </motion.g>
        {/* Sparkles */}
        <circle cx="110" cy="12" r="2" fill="hsl(38,65%,68%)" fillOpacity="0.6" />
        <circle cx="118" cy="25" r="1.5" fill="hsl(345,55%,72%)" fillOpacity="0.5" />
        <circle cx="24" cy="20" r="1.5" fill="hsl(280,45%,60%)" fillOpacity="0.4" />
      </svg>
    ),
  },
];

const SharedExperience = () => (
  <section
    aria-label="How sharing works"
    style={{
      background: 'var(--bg-section)',
      padding: '120px 0',
    }}
  >
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 70, damping: 20 }}
        style={{ textAlign: 'center', marginBottom: 80 }}
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
          How it works
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(30px, 5vw, 52px)',
          fontWeight: 700,
          color: 'var(--ink-primary)',
          lineHeight: 1.2,
          margin: 0,
        }}>
          Simple to give. Impossible to{' '}
          <span style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(40px, 6.5vw, 68px)',
            color: 'var(--accent-plum)',
          }}>
            forget
          </span>
        </h2>
      </motion.div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
        {steps.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, x: i % 2 === 0 ? -32 : 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 60, damping: 20, delay: 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 56,
              flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
            }}
          >
            {/* Visual */}
            <div style={{
              flexShrink: 0,
              width: 180,
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-card)',
              borderRadius: 16,
              boxShadow: '0 2px 20px rgba(80,40,120,0.06)',
            }}>
              {s.visual}
            </div>

            {/* Text */}
            <div>
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: 'var(--accent-rose)',
                margin: '0 0 12px',
              }}>
                {s.step}
              </p>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 700,
                color: 'var(--ink-primary)',
                margin: '0 0 16px',
                lineHeight: 1.2,
              }}>
                {s.title}
              </h3>
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 'clamp(14px, 1.8vw, 17px)',
                color: 'var(--ink-secondary)',
                lineHeight: 1.75,
                margin: 0,
                maxWidth: 400,
              }}>
                {s.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SharedExperience;
