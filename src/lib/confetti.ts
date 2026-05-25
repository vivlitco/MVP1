import confetti from 'canvas-confetti';

/* ── Utility ── */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const PASTEL_COLORS = ['#c4a5de', '#ffc8dd', '#bde0fe', '#ffd6a5', '#fffaf0', '#f9a8d4', '#ddd6fe'];
const WARM_COLORS = ['#ffc8dd', '#ff87ab', '#c4a5de', '#f9a8d4', '#fbcfe8'];
const GOLD_COLORS = ['#ffd700', '#ffb347', '#ffeaa7', '#ffd6a5', '#f5e6cc'];

/* ── Classic big celebration ── */
export const fireConfetti = () => {
  const count = 200;
  const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

  const fire = (ratio: number, opts: confetti.Options) =>
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * ratio) });

  fire(0.25, { spread: 26, startVelocity: 55, colors: PASTEL_COLORS });
  fire(0.2, { spread: 60, colors: PASTEL_COLORS });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: PASTEL_COLORS });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: PASTEL_COLORS });
  fire(0.1, { spread: 120, startVelocity: 45, colors: PASTEL_COLORS });
};

/* ── Sparkles at a point ── */
export const fireSparkles = (x: number, y: number) => {
  const origin = { x: x / window.innerWidth, y: y / window.innerHeight };
  confetti({
    particleCount: 40,
    spread: 50,
    origin,
    colors: PASTEL_COLORS,
    shapes: ['star'],
    scalar: 0.9,
    gravity: 0.4,
    drift: 0,
    ticks: 60,
  });
};

/* ── Floating hearts ── */
export const fireHearts = () => {
  const defaults = {
    spread: 360,
    ticks: 120,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: WARM_COLORS,
  };

  confetti({ ...defaults, particleCount: 35, scalar: 1.2, shapes: ['circle'], origin: { y: 0.5 } });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 25, scalar: 0.75, shapes: ['circle'], origin: { y: 0.5 } });
  }, 120);
};

/* ── Grand multi-burst for card reveals ── */
export const fireGrandReveal = () => {
  // Initial upward burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: PASTEL_COLORS,
    startVelocity: 50,
    gravity: 0.6,
    scalar: 1.1,
    ticks: 100,
    shapes: ['star', 'circle'],
  });

  // Left burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: GOLD_COLORS,
      startVelocity: 45,
      gravity: 0.5,
      scalar: 0.9,
      ticks: 80,
    });
  }, 200);

  // Right burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: GOLD_COLORS,
      startVelocity: 45,
      gravity: 0.5,
      scalar: 0.9,
      ticks: 80,
    });
  }, 350);

  // Gentle shower
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { x: 0.5, y: 0 },
      colors: [...PASTEL_COLORS, ...WARM_COLORS],
      startVelocity: 15,
      gravity: 0.3,
      scalar: 0.7,
      ticks: 200,
      drift: 0.5,
    });
  }, 600);

  // Final sparkle pop
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 360,
      origin: { x: 0.5, y: 0.5 },
      colors: GOLD_COLORS,
      shapes: ['star'],
      scalar: 1.3,
      gravity: 0,
      decay: 0.92,
      startVelocity: 25,
      ticks: 100,
    });
  }, 900);
};

/* ── Gentle note reveal sparkle ── */
export const fireNoteReveal = () => {
  // Upward stars
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { x: 0.5, y: 0.55 },
    colors: GOLD_COLORS,
    shapes: ['star'],
    scalar: 1,
    gravity: 0.3,
    startVelocity: 35,
    ticks: 80,
  });

  // Soft heart burst
  setTimeout(() => {
    confetti({
      particleCount: 20,
      spread: 360,
      origin: { x: 0.5, y: 0.45 },
      colors: WARM_COLORS,
      shapes: ['circle'],
      scalar: 0.8,
      gravity: 0,
      decay: 0.93,
      startVelocity: 20,
      ticks: 100,
    });
  }, 300);
};

/* ── Gentle ambient shimmer (for envelope idle) ── */
export const fireAmbientShimmer = () => {
  confetti({
    particleCount: 8,
    spread: 360,
    origin: { x: rand(0.3, 0.7), y: rand(0.3, 0.6) },
    colors: GOLD_COLORS,
    shapes: ['star'],
    scalar: 0.5,
    gravity: 0.1,
    decay: 0.95,
    startVelocity: 8,
    ticks: 60,
  });
};
