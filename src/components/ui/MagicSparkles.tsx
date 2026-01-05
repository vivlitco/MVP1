import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

interface MagicSparklesProps {
  count?: number;
  colors?: string[];
  className?: string;
}

const defaultColors = ['#f9a8d4', '#c4b5fd', '#fbcfe8', '#ddd6fe', '#f0abfc'];

const MagicSparkles = ({ 
  count = 20, 
  colors = defaultColors,
  className = ''
}: MagicSparklesProps) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  
  const stableColors = useMemo(() => colors, [colors.join(',')]);

  useEffect(() => {
    const generateSparkles = () => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 4,
        duration: Math.random() * 2 + 2,
        color: stableColors[Math.floor(Math.random() * stableColors.length)],
      }));
    };

    setSparkles(generateSparkles());
    
    const interval = setInterval(() => {
      setSparkles(generateSparkles());
    }, 6000);

    return () => clearInterval(interval);
  }, [count, stableColors]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
            }}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: sparkle.duration,
              delay: sparkle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              width={sparkle.size}
              height={sparkle.size}
              viewBox="0 0 24 24"
              fill={sparkle.color}
            >
              <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MagicSparkles;
