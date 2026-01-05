import { motion } from 'framer-motion';

interface FloatingElementsProps {
  variant?: 'hearts' | 'stars' | 'mixed';
  count?: number;
}

const FloatingElements = ({ variant = 'mixed', count = 8 }: FloatingElementsProps) => {
  const elements = {
    hearts: ['💕', '💗', '💖', '🩷', '♡'],
    stars: ['✨', '⭐', '🌟', '💫', '✦'],
    mixed: ['💕', '✨', '🌸', '💫', '🦋', '✦', '🌷', '💖'],
  };

  const items = elements[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 5;
        const randomDuration = 4 + Math.random() * 4;
        const randomSize = 0.8 + Math.random() * 0.6;
        const item = items[Math.floor(Math.random() * items.length)];

        return (
          <motion.div
            key={i}
            className="absolute text-xl"
            style={{
              left: `${randomX}%`,
              top: `${90 + Math.random() * 20}%`,
              fontSize: `${randomSize}rem`,
            }}
            animate={{
              y: [0, -window.innerHeight * 1.2],
              x: [0, Math.sin(i) * 50],
              rotate: [0, 360],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {item}
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingElements;
