import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Interactive3DJarProps {
  onInteraction?: (isInteracting: boolean) => void;
}

// Folded note component - abstract, no text visible
const FoldedNote = ({ 
  index, 
  isShaking,
  baseDelay 
}: { 
  index: number; 
  isShaking: boolean;
  baseDelay: number;
}) => {
  const colors = [
    'from-amber-200 to-amber-300',
    'from-rose-200 to-rose-300', 
    'from-violet-200 to-violet-300',
    'from-emerald-200 to-emerald-300',
    'from-sky-200 to-sky-300',
  ];
  
  const color = colors[index % colors.length];
  
  // Each note has unique position within jar bounds
  const positions = [
    { x: 35, y: 55, rotation: -15, scale: 0.9 },
    { x: 55, y: 45, rotation: 12, scale: 0.85 },
    { x: 45, y: 65, rotation: -8, scale: 0.95 },
    { x: 30, y: 40, rotation: 20, scale: 0.8 },
    { x: 60, y: 58, rotation: -22, scale: 0.88 },
  ];
  
  const pos = positions[index % positions.length];
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
      animate={isShaking ? {
        x: [0, -8, 8, -5, 5, 0],
        y: [0, -6, 4, -4, 6, 0],
        rotate: [pos.rotation, pos.rotation - 15, pos.rotation + 15, pos.rotation],
      } : {
        y: [0, -4, 0],
        rotate: [pos.rotation - 2, pos.rotation + 2, pos.rotation - 2],
      }}
      transition={isShaking ? {
        duration: 0.4,
        repeat: Infinity,
        delay: baseDelay + index * 0.05,
      } : {
        duration: 3 + index * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: baseDelay,
      }}
    >
      {/* Folded paper shape - no text, just abstract form */}
      <div 
        className={`relative bg-gradient-to-br ${color} rounded-sm shadow-md`}
        style={{
          width: `${20 * pos.scale}px`,
          height: `${14 * pos.scale}px`,
          transform: `rotate(${pos.rotation}deg)`,
        }}
      >
        {/* Paper fold corner */}
        <div 
          className="absolute top-0 right-0 bg-white/40"
          style={{
            width: `${6 * pos.scale}px`,
            height: `${6 * pos.scale}px`,
            clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
          }}
        />
        {/* Subtle shadow for depth */}
        <div 
          className="absolute inset-0 rounded-sm"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 100%)',
          }}
        />
      </div>
    </motion.div>
  );
};

// Rising note for click interaction
const RisingNote = ({ 
  onComplete 
}: { 
  onComplete: () => void;
}) => {
  return (
    <motion.div
      className="absolute left-1/2 pointer-events-none z-20"
      style={{ bottom: '45%' }}
      initial={{ y: 0, opacity: 1, x: '-50%' }}
      animate={{ 
        y: [-20, -60, -40, 0],
        opacity: [1, 1, 1, 0],
        rotate: [0, -10, 5, 0],
      }}
      transition={{ 
        duration: 1.5, 
        ease: "easeInOut",
      }}
      onAnimationComplete={onComplete}
    >
      <div className="w-6 h-5 bg-gradient-to-br from-rose-200 to-rose-300 rounded-sm shadow-lg">
        <div 
          className="absolute top-0 right-0 bg-white/50 w-2 h-2"
          style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
        />
      </div>
    </motion.div>
  );
};

// Sparkle component
const Sparkle = ({ 
  x, 
  y, 
  delay,
  size = 8 
}: { 
  x: number; 
  y: number; 
  delay: number;
  size?: number;
}) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffc700">
      <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z"/>
    </svg>
  </motion.div>
);

const Interactive3DJar = ({ onInteraction }: Interactive3DJarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showRisingNote, setShowRisingNote] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for 3D rotation effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-8, 8]), springConfig);
  
  // Shine position based on mouse
  const shineX = useSpring(useTransform(mouseX, [-100, 100], [20, 80]), springConfig);
  const shineY = useSpring(useTransform(mouseY, [-100, 100], [20, 60]), springConfig);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
    onInteraction?.(false);
  };
  
  const handleClick = () => {
    if (!showRisingNote) {
      setIsClicked(true);
      setShowRisingNote(true);
      
      // Reset click state after animation
      setTimeout(() => setIsClicked(false), 400);
    }
  };
  
  // Lid animation values
  const lidY = useSpring(isClicked ? -12 : isHovered ? -6 : 0, springConfig);
  const lidRotate = useSpring(isClicked ? -8 : isHovered ? -3 : 0, springConfig);
  
  // Jar colors matching the brand
  const jarPrimaryColor = '#6b21a8'; // Purple/lavender theme
  const jarBodyOpacity = 0.15;
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-[400px] md:h-[500px] flex items-center justify-center cursor-pointer select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        onInteraction?.(true);
      }}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <motion.div 
        className="relative w-64 h-80 md:w-72 md:h-96"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
        animate={isHovered && !isClicked ? {
          y: [0, -6, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Jar glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-3xl blur-2xl"
          style={{
            background: `radial-gradient(ellipse at center, ${jarPrimaryColor}40 0%, transparent 70%)`,
            transform: 'translateZ(-20px) scale(1.2)',
          }}
          animate={isHovered ? { opacity: 0.8 } : { opacity: 0.5 }}
        />
        
        {/* Main jar SVG with 3D enhancements */}
        <motion.svg 
          className="w-full h-full"
          viewBox="0 0 200 270" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))' }}
        >
          <defs>
            {/* Glass gradient */}
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="50%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0.3" />
            </linearGradient>
            
            {/* Jar body gradient for depth */}
            <linearGradient id="jarBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={jarPrimaryColor} stopOpacity="0.2" />
              <stop offset="30%" stopColor={jarPrimaryColor} stopOpacity="0.08" />
              <stop offset="70%" stopColor={jarPrimaryColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={jarPrimaryColor} stopOpacity="0.15" />
            </linearGradient>
            
            {/* Lid gradient */}
            <linearGradient id="lidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            
            {/* Shine gradient */}
            <linearGradient id="shineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            
            {/* Inner glow for notes containment */}
            <radialGradient id="innerGlow" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          
          {/* Jar Body with glass effect */}
          <motion.path 
            d="M48.5 49.5C39.9558 54.5815 30 64.089 30 80 V245 A20 20 0 0 0 50 265 H150 A20 20 0 0 0 170 245 V80C170 64.089 160.044 54.5815 151.5 49.5" 
            fill="url(#jarBodyGradient)"
            stroke={jarPrimaryColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Inner warm glow where notes sit */}
          <ellipse 
            cx="100" 
            cy="170" 
            rx="55" 
            ry="70" 
            fill="url(#innerGlow)"
          />
          
          {/* Glass reflection - left side */}
          <motion.path 
            d="M45 90C53.6622 93.7533 55.3667 95.3378 55.5 110.5C55.6333 125.662 45 125 45 125" 
            stroke="white"
            strokeOpacity="0.7"
            strokeWidth="6"
            strokeLinecap="round"
            style={{
              filter: 'blur(1px)',
            }}
          />
          
          {/* Dynamic shine based on mouse */}
          <ellipse
            cx="60"
            cy="100"
            rx="8"
            ry="25"
            fill="white"
            fillOpacity="0.3"
            style={{
              filter: 'blur(3px)',
            }}
          />
          
          {/* Right edge highlight */}
          <path 
            d="M160 90 V200" 
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Bottom curve highlight */}
          <path 
            d="M60 250 Q100 260 140 250" 
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </motion.svg>
        
        {/* Separate Lid SVG for animation */}
        <motion.svg 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox="0 0 200 270" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ 
            y: lidY,
            rotateX: lidRotate,
            transformOrigin: 'center top',
          }}
        >
          <defs>
            <linearGradient id="lidGradientAnim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
          </defs>
          
          {/* Jar Lid */}
          <path 
            d="M150 50H50C41.7157 50 35 43.2843 35 35V20C35 11.7157 41.7157 5 50 5H150C158.284 5 165 11.7157 165 20V35C165 43.2843 158.284 50 150 50Z" 
            fill="url(#lidGradientAnim)"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}
          />
          
          {/* Lid top highlight */}
          <path 
            d="M55 15 H145" 
            stroke="white"
            strokeOpacity="0.4"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Lid bottom edge */}
          <path 
            d="M165 34.7551C165 44.5944 158.284 52.5102 150 52.5102H50C41.7157 52.5102 35 44.5944 35 34.7551" 
            stroke="#581c87"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Decorative knob on lid */}
          <ellipse 
            cx="100" 
            cy="12" 
            rx="15" 
            ry="6" 
            fill="#c084fc"
          />
          <ellipse 
            cx="100" 
            cy="10" 
            rx="10" 
            ry="4" 
            fill="#e9d5ff"
            fillOpacity="0.6"
          />
        </motion.svg>
        
        {/* Notes container - clipped to jar interior */}
        <div 
          className="absolute overflow-hidden pointer-events-none"
          style={{
            top: '22%',
            left: '18%',
            width: '64%',
            height: '55%',
            borderRadius: '0 0 12px 12px',
          }}
        >
          {/* Folded notes inside */}
          {[0, 1, 2, 3, 4].map((i) => (
            <FoldedNote 
              key={i} 
              index={i} 
              isShaking={isClicked}
              baseDelay={i * 0.2}
            />
          ))}
          
          {/* Rising note animation */}
          <AnimatePresence>
            {showRisingNote && (
              <RisingNote 
                onComplete={() => setShowRisingNote(false)} 
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* Sparkles around jar */}
        <Sparkle x={-5} y={15} delay={0} size={10} />
        <Sparkle x={105} y={25} delay={0.7} size={8} />
        <Sparkle x={-8} y={60} delay={1.4} size={6} />
        <Sparkle x={108} y={70} delay={2.1} size={9} />
        <Sparkle x={50} y={-5} delay={0.5} size={7} />
        
        {/* Floating hearts */}
        <motion.div 
          className="absolute -left-6 top-1/3 text-lg pointer-events-none"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 10, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          💕
        </motion.div>
        
        <motion.div 
          className="absolute -right-4 top-1/2 text-sm pointer-events-none"
          animate={{
            y: [0, -8, 0],
            rotate: [0, -15, 0],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          ✨
        </motion.div>
        
        <motion.div 
          className="absolute right-2 top-1/4 text-base pointer-events-none"
          animate={{
            y: [0, -12, 0],
            x: [0, 5, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          💜
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Interactive3DJar;
