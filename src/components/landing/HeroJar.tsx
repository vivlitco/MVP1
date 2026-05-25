import { motion, MotionValue } from 'framer-motion';

interface HeroJarProps {
  rotateY: MotionValue<number>;
  scale: MotionValue<number>;
  lidRotateX: MotionValue<number>;
}

const JAR_COLOR = '#7c3aed'; // deep violet — matches primary
const JAR_GLASS  = 'rgba(255, 252, 248, 0.55)';
const NOTE_COLORS = ['#fde68a', '#fbcfe8', '#c4b5fd', '#fed7aa', '#bfdbfe'];

const HeroJar = ({ rotateY, scale, lidRotateX }: HeroJarProps) => (
  <div className="hero-jar-stage" style={{ width: 280, height: 370, position: 'relative', margin: '0 auto' }}>

    {/* Ground shadow — softens as lid opens */}
    <div
      style={{
        position: 'absolute',
        bottom: -12,
        left: '15%',
        width: '70%',
        height: 20,
        background: 'radial-gradient(ellipse, var(--jar-shadow) 0%, transparent 75%)',
        filter: 'blur(4px)',
        zIndex: 0,
      }}
      aria-hidden="true"
    />

    {/* Jar body + lid wrapper with perspective rotation */}
    <motion.div
      className="hero-jar-inner"
      style={{ rotateY, scale, width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
    >
      {/* Lid — separate element, rotates open from bottom hinge */}
      <motion.div
        style={{
          rotateX: lidRotateX,
          transformOrigin: 'center bottom',
          transformStyle: 'preserve-3d',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          zIndex: 10,
        }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 280 80" fill="none" style={{ width: '100%', height: '100%' }}>
          {/* Lid main body */}
          <path
            d="M210 70H70C59.507 70 49 60.04 49 49V28C49 15.85 57.507 7 70 7H210C222.49 7 231 15.85 231 28V49C231 60.04 220.49 70 210 70Z"
            fill={JAR_COLOR}
            fillOpacity="0.92"
          />
          {/* Lid rim / threads */}
          <path
            d="M231 48.7C231 62.4 220.49 73.5 210 73.5H70C57.507 73.5 49 62.4 49 48.7"
            stroke={JAR_COLOR}
            strokeWidth="4"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
          {/* Lid highlight */}
          <path
            d="M70 18C80 16 100 14 140 14C170 14 195 16 210 18"
            stroke="white"
            strokeOpacity="0.35"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Jar body SVG */}
      <svg
        viewBox="0 0 280 370"
        fill="none"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        aria-hidden="true"
      >
        {/* Body */}
        <path
          d="M68 70C56 77 42 90 42 112V330A28 28 0 0 0 70 358H210A28 28 0 0 0 238 330V112C238 90 224 77 212 70"
          fill={JAR_GLASS}
          stroke={JAR_COLOR}
          strokeWidth="5"
          strokeOpacity="0.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glass highlight — left */}
        <path
          d="M63 130C73 135 75 138 75.5 158C76 178 63 177 63 177"
          stroke="white"
          strokeOpacity="0.65"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Glass highlight — right subtle */}
        <path
          d="M217 130C207 135 205 138 204.5 158"
          stroke="white"
          strokeOpacity="0.22"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Inner warm glow at bottom */}
        <ellipse
          cx="140"
          cy="318"
          rx="72"
          ry="18"
          fill="hsl(38,80%,85%)"
          fillOpacity="0.28"
        />

        {/* Static notes inside — visible through glass */}
        {NOTE_COLORS.map((color, i) => {
          const positions = [
            { x: 72,  y: 258, r: -18 },
            { x: 100, y: 272, r: 12 },
            { x: 130, y: 252, r: -6 },
            { x: 158, y: 268, r: 20 },
            { x: 118, y: 295, r: -14 },
          ];
          const p = positions[i];
          return (
            <rect
              key={i}
              x={p.x}
              y={p.y}
              width="42"
              height="30"
              rx="3"
              fill={color}
              fillOpacity="0.75"
              transform={`rotate(${p.r} ${p.x + 21} ${p.y + 15})`}
            />
          );
        })}
      </svg>
    </motion.div>
  </div>
);

export default HeroJar;
