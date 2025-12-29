import { Heart, Star, Sparkles, Sun, Moon, Cloud, Flower2, Music, Gift, Candy, Cherry, Cookie, IceCream, Gem } from 'lucide-react';
import { NoteItem } from './NoteEditor';
import { CharmItem } from './CharmsPalette';
import { JAR_THEMES } from '@/lib/themes';

interface JarPreviewProps {
  notes: NoteItem[];
  charms: CharmItem[];
  theme: string;
  jarName: string;
  recipientName: string;
}

const CHARM_ICONS: Record<string, any> = {
  heart: Heart,
  star: Star,
  sparkle: Sparkles,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  flower: Flower2,
  music: Music,
  gift: Gift,
  candy: Candy,
  cherry: Cherry,
  cookie: Cookie,
  icecream: IceCream,
  gem: Gem,
};

const CHARM_COLORS: Record<string, string> = {
  heart: '#f472b6',
  star: '#facc15',
  sparkle: '#c084fc',
  sun: '#fbbf24',
  moon: '#a5b4fc',
  cloud: '#7dd3fc',
  flower: '#fb7185',
  music: '#a78bfa',
  gift: '#f87171',
  candy: '#f9a8d4',
  cherry: '#ef4444',
  cookie: '#d97706',
  icecream: '#fbcfe8',
  gem: '#22d3ee',
};

const THEME_COLORS: Record<string, { primary: string; notes: string[] }> = {
  warm: {
    primary: '#b45309',
    notes: ['#fcd34d', '#fdba74', '#fde047', '#fca5a5'],
  },
  lavender: {
    primary: '#6b21a8',
    notes: ['#d8b4fe', '#c4b5fd', '#f0abfc', '#f9a8d4'],
  },
  mint: {
    primary: '#047857',
    notes: ['#6ee7b7', '#5eead4', '#86efac', '#67e8f9'],
  },
  rose: {
    primary: '#be185d',
    notes: ['#fda4af', '#f9a8d4', '#fca5a5', '#f0abfc'],
  },
  ocean: {
    primary: '#0369a1',
    notes: ['#7dd3fc', '#67e8f9', '#a5f3fc', '#38bdf8'],
  },
  sunset: {
    primary: '#c2410c',
    notes: ['#fdba74', '#fcd34d', '#fbbf24', '#fb923c'],
  },
  forest: {
    primary: '#15803d',
    notes: ['#86efac', '#4ade80', '#a7f3d0', '#6ee7b7'],
  },
  candy: {
    primary: '#a21caf',
    notes: ['#f0abfc', '#e879f9', '#f5d0fe', '#d946ef'],
  },
  midnight: {
    primary: '#4338ca',
    notes: ['#a5b4fc', '#c7d2fe', '#818cf8', '#e0e7ff'],
  },
  golden: {
    primary: '#a16207',
    notes: ['#fde047', '#fef08a', '#facc15', '#fef9c3'],
  },
};

export const JarPreview = ({ notes, charms, theme, jarName, recipientName }: JarPreviewProps) => {
  const jarTheme = JAR_THEMES.find(t => t.id === theme) || JAR_THEMES[0];
  const colors = THEME_COLORS[theme] || THEME_COLORS.lavender;
  
  return (
    <div className="relative flex flex-col items-center justify-center h-full min-h-[450px]">
      {/* Floating decorations */}
      <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-accent/40 animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-16 right-6 w-4 h-4 rounded-full bg-primary/40 animate-float-slow" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-16 left-6 w-8 h-8 rounded-full bg-mint/50 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-24 right-4 w-5 h-5 rounded-full bg-secondary/50 animate-float-slow" style={{ animationDelay: '1.5s' }} />
      
      {/* Jar title */}
      <div className="text-center mb-4 z-10">
        <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">
          {jarName || 'Your Jar'}
        </h2>
        {recipientName && (
          <p className="text-sm text-muted-foreground mt-1">For {recipientName} 💝</p>
        )}
      </div>

      {/* Jar container */}
      <div className="relative w-72 h-96">
        {/* Charms around jar */}
        {charms.map((charm, index) => {
          const Icon = CHARM_ICONS[charm.type] || Heart;
          const color = CHARM_COLORS[charm.type] || '#f472b6';
          return (
            <div
              key={charm.id}
              className="absolute z-20 animate-float pointer-events-none"
              style={{
                left: `${charm.position_x}%`,
                top: `${charm.position_y}%`,
                transform: `rotate(${charm.rotation}deg)`,
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <Icon className="w-6 h-6 drop-shadow-lg" style={{ color }} fill={color} />
            </div>
          );
        })}

        {/* Original SVG Jar */}
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

        {/* Notes inside jar */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ top: '25%', left: '18%', width: '64%', height: '55%' }}>
          {notes.map((note, index) => {
            const noteColor = colors.notes[index % colors.notes.length];
            const x = 5 + (index % 3) * 28;
            const y = 65 - Math.floor(index / 3) * 22;
            const rotation = -15 + (index * 7) % 30;
            
            return (
              <div
                key={note.id}
                className="absolute w-14 h-10 transition-all duration-300 animate-note-pop"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `rotate(${rotation}deg)`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Paper note */}
                <div
                  className="w-full h-full rounded-md shadow-lg"
                  style={{
                    background: `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, ${noteColor} 100%)`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
                  }}
                >
                  {/* Colored accent strip */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-md"
                    style={{ backgroundColor: noteColor, opacity: 0.95 }}
                  />
                  {/* Paper fold */}
                  <div
                    className="absolute top-0 right-0 w-3 h-3"
                    style={{
                      background: 'linear-gradient(225deg, hsl(var(--background)) 0%, rgba(0,0,0,0.05) 100%)',
                      clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                    }}
                  />
                  {/* Lines */}
                  <div className="absolute inset-0 flex flex-col justify-center gap-1 px-2 py-1">
                    <div className="w-full h-px bg-foreground/10 rounded" />
                    <div className="w-3/4 h-px bg-foreground/8 rounded" />
                  </div>
                  {/* Type icon */}
                  {note.type === 'voice' && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[6px]">🎤</span>
                    </div>
                  )}
                  {note.type === 'image' && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[6px]">🖼</span>
                    </div>
                  )}
                  {note.type === 'link' && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[6px]">🔗</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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

      {/* Note count badge */}
      {notes.length > 0 && (
        <div className="mt-2 px-4 py-1.5 bg-gradient-to-r from-primary to-accent rounded-full shadow-float">
          <span className="text-sm font-medium text-primary-foreground">
            {notes.length} note{notes.length !== 1 ? 's' : ''} 💌
          </span>
        </div>
      )}

      {/* Empty state */}
      {notes.length === 0 && charms.length === 0 && (
        <p className="text-sm text-muted-foreground mt-4 text-center max-w-[200px]">
          Add notes and charms to fill your jar with love! ✨
        </p>
      )}
    </div>
  );
};
