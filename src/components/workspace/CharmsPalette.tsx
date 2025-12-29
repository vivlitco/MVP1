import { Button } from '@/components/ui/button';
import { 
  Heart, Star, Sparkles, Sun, Moon, Cloud, Flower2, 
  Music, Gift, Candy, Cherry, Cookie, IceCream, Gem
} from 'lucide-react';

const CHARMS = [
  { id: 'heart', icon: Heart, color: 'text-pink-400', label: 'Heart' },
  { id: 'star', icon: Star, color: 'text-yellow-400', label: 'Star' },
  { id: 'sparkle', icon: Sparkles, color: 'text-purple-400', label: 'Sparkle' },
  { id: 'sun', icon: Sun, color: 'text-amber-400', label: 'Sun' },
  { id: 'moon', icon: Moon, color: 'text-indigo-300', label: 'Moon' },
  { id: 'cloud', icon: Cloud, color: 'text-sky-300', label: 'Cloud' },
  { id: 'flower', icon: Flower2, color: 'text-rose-400', label: 'Flower' },
  { id: 'music', icon: Music, color: 'text-violet-400', label: 'Music' },
  { id: 'gift', icon: Gift, color: 'text-red-400', label: 'Gift' },
  { id: 'candy', icon: Candy, color: 'text-pink-300', label: 'Candy' },
  { id: 'cherry', icon: Cherry, color: 'text-red-500', label: 'Cherry' },
  { id: 'cookie', icon: Cookie, color: 'text-amber-600', label: 'Cookie' },
  { id: 'icecream', icon: IceCream, color: 'text-pink-200', label: 'Ice Cream' },
  { id: 'gem', icon: Gem, color: 'text-cyan-400', label: 'Gem' },
];

export interface CharmItem {
  id: string;
  type: string;
  position_x: number;
  position_y: number;
  rotation: number;
}

interface CharmsPaletteProps {
  onAddCharm: (type: string) => void;
  charms: CharmItem[];
  onClearCharms: () => void;
}

export const CharmsPalette = ({ onAddCharm, charms, onClearCharms }: CharmsPaletteProps) => {
  return (
    <div className="space-y-4 p-4 bg-card rounded-2xl border border-border/50 shadow-soft">
      <div className="text-center mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">Decorate Your Jar ✨</h3>
        <p className="text-xs text-muted-foreground mt-1">Click to add charms around your jar</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {CHARMS.map((charm) => (
          <button
            key={charm.id}
            onClick={() => onAddCharm(charm.id)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 hover:scale-105 transition-all group"
            title={charm.label}
          >
            <charm.icon className={`w-6 h-6 ${charm.color} group-hover:animate-pulse`} fill="currentColor" />
            <span className="text-[10px] text-muted-foreground">{charm.label}</span>
          </button>
        ))}
      </div>

      {charms.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {charms.length} charm{charms.length !== 1 ? 's' : ''} added
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCharms}
              className="text-xs text-muted-foreground hover:text-destructive h-auto py-1"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { CHARMS };
