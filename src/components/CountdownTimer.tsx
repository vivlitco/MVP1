import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  unlockDate: string;
  jarName: string;
}

const CountdownTimer = ({ unlockDate, jarName }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(unlockDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [unlockDate]);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Lock className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-2">
        No peeking! 🤫
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        This jar is time-locked with love. It unlocks in...
      </p>

      <div className="flex gap-3 mb-8">
        {units.map((unit, i) => (
          <motion.div
            key={unit.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-card border border-border/50 shadow-soft flex items-center justify-center mb-1">
              <motion.span
                key={unit.value}
                className="font-heading text-2xl md:text-3xl font-bold text-primary"
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{unit.label}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="flex items-center gap-2 text-sm text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="w-4 h-4 text-primary" />
        <span>Something wonderful is waiting for you</span>
        <Sparkles className="w-4 h-4 text-primary" />
      </motion.div>
    </motion.div>
  );
};

export default CountdownTimer;
