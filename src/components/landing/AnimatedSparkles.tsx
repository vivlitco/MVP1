import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const generateSparkles = (count: number): Sparkle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 1.5,
  }));
};

const SparkleIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

const AnimatedSparkles = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    setSparkles(generateSparkles(15));
    
    // Regenerate sparkles periodically for variety
    const interval = setInterval(() => {
      setSparkles(generateSparkles(15));
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute text-yellow-400/60"
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
            repeatDelay: Math.random() * 2,
            ease: "easeInOut",
          }}
        >
          <SparkleIcon size={sparkle.size} />
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedSparkles;