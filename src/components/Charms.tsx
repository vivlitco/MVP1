import { useState, useRef } from 'react';
import { Heart, Star, Sparkles, Flower2 } from 'lucide-react';
import { fireSparkles } from '@/lib/confetti';

interface Charm {
  id: string;
  charm_type: string;
  position_x: number;
  position_y: number;
  scale: number;
  rotation: number;
  color?: string;
}

interface CharmsProps {
  charms: Charm[];
  editable?: boolean;
  onCharmMove?: (id: string, x: number, y: number) => void;
  onCharmClick?: (id: string) => void;
}

const CHARM_ICONS: Record<string, React.ComponentType<any>> = {
  heart: Heart,
  star: Star,
  sparkle: Sparkles,
  flower: Flower2,
};

const CHARM_COLORS: Record<string, string> = {
  heart: 'text-pink-400',
  star: 'text-yellow-400',
  sparkle: 'text-purple-300',
  flower: 'text-rose-300',
};

export const Charms = ({ charms, editable = false, onCharmMove, onCharmClick }: CharmsProps) => {
  const [dragging, setDragging] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (id: string) => {
    if (editable) {
      setDragging(id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current || !onCharmMove) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onCharmMove(dragging, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleCharmClick = (id: string, e: React.MouseEvent) => {
    if (!editable) {
      // Fire sparkle animation on click
      fireSparkles(e.clientX, e.clientY);
    }
    onCharmClick?.(id);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {charms.map((charm) => {
        const Icon = CHARM_ICONS[charm.charm_type] || Sparkles;
        const colorClass = charm.color || CHARM_COLORS[charm.charm_type] || 'text-primary';
        
        return (
          <button
            key={charm.id}
            className={`absolute pointer-events-auto transition-transform duration-200 hover:scale-125 ${
              editable ? 'cursor-move' : 'cursor-pointer'
            } ${dragging === charm.id ? 'scale-125' : ''}`}
            style={{
              left: `${charm.position_x}%`,
              top: `${charm.position_y}%`,
              transform: `translate(-50%, -50%) rotate(${charm.rotation}deg) scale(${charm.scale})`,
            }}
            onMouseDown={() => handleMouseDown(charm.id)}
            onClick={(e) => handleCharmClick(charm.id, e)}
          >
            <Icon
              className={`w-6 h-6 ${colorClass} drop-shadow-lg animate-float`}
              style={{ animationDelay: `${Math.random() * 2}s` }}
              fill="currentColor"
            />
          </button>
        );
      })}
    </div>
  );
};

interface CharmPickerProps {
  onSelect: (type: string) => void;
}

export const CharmPicker = ({ onSelect }: CharmPickerProps) => {
  const charmTypes = ['heart', 'star', 'sparkle', 'flower'];
  
  return (
    <div className="flex gap-2 p-2 bg-card rounded-full shadow-soft">
      {charmTypes.map((type) => {
        const Icon = CHARM_ICONS[type];
        const colorClass = CHARM_COLORS[type];
        
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Icon className={`w-5 h-5 ${colorClass}`} fill="currentColor" />
          </button>
        );
      })}
    </div>
  );
};
