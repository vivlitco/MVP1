import { motion } from 'framer-motion';

const ScrollHint = () => (
  <motion.div
    className="flex flex-col items-center gap-2 select-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.6, duration: 1 }}
  >
    <span
      className="text-xs tracking-widest uppercase"
      style={{ color: 'var(--ink-muted)', letterSpacing: '0.18em' }}
    >
      scroll to open
    </span>
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
        <line x1="9" y1="0" x2="9" y2="16" stroke="var(--ink-muted)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 11L9 18L15 11" stroke="var(--ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  </motion.div>
);

export default ScrollHint;
