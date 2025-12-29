import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#c4a5de', '#ffc8dd', '#bde0fe', '#ffd6a5'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#c4a5de', '#ffc8dd', '#bde0fe', '#ffd6a5'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#c4a5de', '#ffc8dd', '#bde0fe', '#ffd6a5'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#c4a5de', '#ffc8dd', '#bde0fe', '#ffd6a5'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#c4a5de', '#ffc8dd', '#bde0fe', '#ffd6a5'],
  });
};

export const fireSparkles = (x: number, y: number) => {
  confetti({
    particleCount: 30,
    spread: 40,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: ['#c4a5de', '#ffc8dd', '#ffd6a5', '#fffaf0'],
    shapes: ['star'],
    scalar: 0.8,
    gravity: 0.5,
    drift: 0,
    ticks: 50,
  });
};

export const fireHearts = () => {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#ffc8dd', '#ff87ab', '#c4a5de'],
  };

  confetti({
    ...defaults,
    particleCount: 30,
    scalar: 1.2,
    shapes: ['circle'],
    origin: { y: 0.5 },
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 20,
      scalar: 0.75,
      shapes: ['circle'],
      origin: { y: 0.5 },
    });
  }, 100);
};
