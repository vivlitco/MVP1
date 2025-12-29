import { useState, useEffect, useRef, useCallback } from 'react';

interface JarNote {
  id: string;
  content: string;
  opened_at: string | null;
}

interface JarVisualProps {
  notes: JarNote[];
  theme: string;
  isShaking: boolean;
  selectedNote: JarNote | null;
  onNoteClick: (note: JarNote) => void;
  onShake: () => void;
  canOpenNote: boolean;
}

type NotePosition = { x: number; y: number; rotation: number; delay: number };

const THEME_COLORS: Record<string, { primary: string; notes: string[] }> = {
  warm: {
    primary: '#b45309',
    notes: ['bg-amber-300', 'bg-orange-300', 'bg-yellow-300', 'bg-rose-300'],
  },
  lavender: {
    primary: '#6b21a8',
    notes: ['bg-purple-300', 'bg-violet-300', 'bg-fuchsia-300', 'bg-pink-300'],
  },
  mint: {
    primary: '#047857',
    notes: ['bg-emerald-300', 'bg-teal-300', 'bg-green-300', 'bg-cyan-300'],
  },
  rose: {
    primary: '#be185d',
    notes: ['bg-rose-300', 'bg-pink-300', 'bg-red-300', 'bg-fuchsia-300'],
  },
};

const JarVisual = ({ notes, theme, isShaking, selectedNote, onNoteClick, onShake, canOpenNote }: JarVisualProps) => {
  const [notePositions, setNotePositions] = useState<Record<string, NotePosition>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [shakeCount, setShakeCount] = useState(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const jarRef = useRef<HTMLDivElement>(null);
  
  const colors = THEME_COLORS[theme] || THEME_COLORS.lavender;
  const unopenedNotes = notes.filter(n => !n.opened_at);

  const generatePosition = useCallback((index: number, total: number): NotePosition => {
    // Fill from bottom up - keep notes well inside jar bounds
    // Container is 64% wide and 55% tall, notes are 16x12 (roughly 25% of container width)
    // So x should be 0-50% and y should be constrained too
    const rowHeight = 20;
    const baseY = 65 - (index * rowHeight);
    const clampedY = Math.max(5, Math.min(65, baseY + (Math.random() * 8 - 4)));
    
    // Keep x in safe range (0-50% to account for note width)
    const x = 5 + Math.random() * 50;
    
    return {
      x,
      y: clampedY,
      rotation: -20 + Math.random() * 40,
      delay: Math.random() * 2,
    };
  }, []);

  const generateShakePosition = useCallback((): NotePosition => {
    // Keep notes inside jar even during shake
    return {
      x: 5 + Math.random() * 50,
      y: 5 + Math.random() * 60,
      rotation: -35 + Math.random() * 70,
      delay: Math.random() * 2,
    };
  }, []);

  // Ensure every note has a stable position (keyed by note.id)
  useEffect(() => {
    setNotePositions(prev => {
      const next: Record<string, NotePosition> = {};
      const total = notes.length;
      notes.forEach((note, index) => {
        next[note.id] = prev[note.id] ?? generatePosition(index, total);
      });
      return next;
    });
  }, [notes, generatePosition]);

  // Randomize positions dramatically on each shake
  useEffect(() => {
    if (!isShaking) return;

    const shuffle = () => {
      setNotePositions(() => {
        const next: Record<string, NotePosition> = {};
        notes.forEach((note) => {
          next[note.id] = generateShakePosition();
        });
        return next;
      });
    };

    // Shuffle multiple times during shake for chaotic movement
    shuffle();
    const id = window.setInterval(shuffle, 120);
    return () => window.clearInterval(id);
  }, [isShaking, notes, generateShakePosition]);

  // Settle notes back to stacked positions after shake ends
  const prevShaking = useRef(isShaking);
  useEffect(() => {
    if (prevShaking.current && !isShaking) {
      // Shake just ended - reset to bottom-up positions
      setNotePositions(() => {
        const next: Record<string, NotePosition> = {};
        const total = notes.length;
        notes.forEach((note, index) => {
          next[note.id] = generatePosition(index, total);
        });
        return next;
      });
    }
    prevShaking.current = isShaking;
  }, [isShaking, notes, generatePosition]);

  // Device motion shake detection
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let shakeThreshold = 15;
    
    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;
      
      const x = acceleration.x || 0;
      const y = acceleration.y || 0;
      const z = acceleration.z || 0;
      
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);
      
      if ((deltaX > shakeThreshold && deltaY > shakeThreshold) || 
          (deltaX > shakeThreshold && deltaZ > shakeThreshold) || 
          (deltaY > shakeThreshold && deltaZ > shakeThreshold)) {
        if (canOpenNote) {
          onShake();
        }
      }
      
      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [onShake, canOpenNote]);

  // Mouse/touch drag to shake
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!canOpenNote) return;
    setIsDragging(true);
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    setShakeCount(0);
  }, [canOpenNote]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !canOpenNote) return;
    
    const deltaX = e.clientX - lastPositionRef.current.x;
    const deltaY = e.clientY - lastPositionRef.current.y;
    
    // Limit drag range
    const newX = Math.max(-30, Math.min(30, dragOffset.x + deltaX * 0.3));
    const newY = Math.max(-20, Math.min(20, dragOffset.y + deltaY * 0.3));
    
    setDragOffset({ x: newX, y: newY });
    
    // Detect shake motion (rapid direction changes)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > 20) {
      setShakeCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          onShake();
          return 0;
        }
        return newCount;
      });
    }
    
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, dragOffset, onShake, canOpenNote]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setShakeCount(0);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointerup', handlePointerUp);
      return () => document.removeEventListener('pointerup', handlePointerUp);
    }
  }, [isDragging, handlePointerUp]);

  return (
    <div 
      ref={jarRef}
      className={`relative w-72 h-96 mx-auto select-none ${isShaking ? 'animate-shake' : ''} ${canOpenNote ? 'cursor-grab active:cursor-grabbing' : 'opacity-80'}`}
      style={{ 
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Shake hint */}
      {canOpenNote && unopenedNotes.length > 0 && !isShaking && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground animate-pulse whitespace-nowrap">
          👆 Drag to shake!
        </div>
      )}

      {/* SVG Jar */}
      <svg 
        className="w-full h-full pointer-events-none" 
        viewBox="0 0 200 270" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Jar Lid */}
        <path 
          d="M150 50H50C41.7157 50 35 43.2843 35 35V20C35 11.7157 41.7157 5 50 5H150C158.284 5 165 11.7157 165 20V35C165 43.2843 158.284 50 150 50Z" 
          fill={colors.primary} 
          stroke={colors.primary} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M165 34.7551C165 44.5944 158.284 52.5102 150 52.5102H50C41.7157 52.5102 35 44.5944 35 34.7551" 
          stroke={colors.primary} 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        {/* Jar Body */}
        <path 
          d="M48.5 49.5C39.9558 54.5815 30 64.089 30 80 V245 A20 20 0 0 0 50 265 H150 A20 20 0 0 0 170 245 V80C170 64.089 160.044 54.5815 151.5 49.5" 
          fill={colors.primary} 
          fillOpacity="0.08" 
          stroke={colors.primary} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Glass shine */}
        <path 
          d="M45 90C53.6622 93.7533 55.3667 95.3378 55.5 110.5C55.6333 125.662 45 125 45 125" 
          stroke="white" 
          strokeOpacity="0.7" 
          strokeWidth="8" 
          strokeLinecap="round"
        />
      </svg>

      {/* Notes inside */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ top: '25%', left: '20%', width: '60%', height: '52%' }}>
        {notes.map((note, index) => {
          const pos = notePositions[note.id];
          if (!pos) return null;
          const noteColor = colors.notes[index % colors.notes.length];
          const isOpened = !!note.opened_at;
          const canClick = isOpened || canOpenNote;

          return (
            <button
              key={note.id}
              onClick={(e) => {
                e.stopPropagation();
                if (canClick) onNoteClick(note);
              }}
              disabled={!canClick}
              className={`group absolute w-16 h-12 pointer-events-auto transition-all duration-500 ease-out
                ${canClick ? 'cursor-pointer hover:z-10' : 'cursor-not-allowed'}
                ${isOpened ? 'opacity-90' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
            >
              {/* Rotator/tumbler layer */}
              <div
                className={`relative w-full h-full ${isShaking ? 'animate-note-tumble' : 'transition-transform duration-500 ease-out'}`}
                style={{
                  transform: !isShaking ? `rotate(${pos.rotation}deg)` : undefined,
                  ['--base-rotation' as string]: `${pos.rotation}deg`,
                  animationDelay: isShaking ? `${index * 0.08}s` : undefined,
                }}
              >
                {/* Scalable paper layer */}
                <div
                  className={`absolute inset-0 rounded-md shadow-lg transition-transform duration-300
                    ${canClick ? 'group-hover:scale-125' : ''}`}
                >
                  {/* Paper texture background */}
                  <div
                    className={`absolute inset-0 ${noteColor} rounded-md`}
                    style={{
                      background: `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 100%)`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}
                  />

                  {/* Colored accent strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${noteColor} rounded-l-md`}
                    style={{ opacity: 0.95 }}
                  />

                  {/* Paper fold effect */}
                  <div
                    className="absolute top-0 right-0 w-4 h-4"
                    style={{
                      background: 'linear-gradient(225deg, hsl(var(--background)) 0%, hsl(var(--foreground) / 0.06) 100%)',
                      clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                      borderRadius: '0 6px 0 0',
                    }}
                  />

                  {/* Note lines */}
                  <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-3 py-2">
                    <div className="w-full h-[1.5px] bg-primary/15 rounded" />
                    <div className="w-4/5 h-[1.5px] bg-primary/12 rounded" />
                    <div className="w-3/5 h-[1.5px] bg-primary/10 rounded" />
                  </div>

                  {/* Opened checkmark badge */}
                  {isOpened && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                      <span className="text-[10px] text-primary-foreground font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected note flying out */}
      {selectedNote && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 animate-note-pop">
          <div className={`w-20 h-14 ${colors.notes[0]} rounded-md shadow-lg flex items-center justify-center`}
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}
          >
            <span className="text-xl">✨</span>
          </div>
        </div>
      )}

      {/* Sparkles */}
      <svg className="absolute -top-2 -right-2 w-8 h-8 animate-sparkle pointer-events-none" style={{ animationDelay: '0s' }} viewBox="0 0 24 24" fill="#ffc700">
        <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z"/>
      </svg>
      <svg className="absolute top-1/4 -left-4 w-6 h-6 animate-sparkle pointer-events-none" style={{ animationDelay: '0.5s' }} viewBox="0 0 24 24" fill="#ffc700">
        <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z"/>
      </svg>
      <svg className="absolute bottom-1/4 -right-4 w-6 h-6 animate-sparkle pointer-events-none" style={{ animationDelay: '1s' }} viewBox="0 0 24 24" fill="#ffc700">
        <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z"/>
      </svg>
    </div>
  );
};

export default JarVisual;
