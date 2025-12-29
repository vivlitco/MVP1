import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { JAR_THEMES } from '@/lib/themes';
import { Lock, Eye, EyeOff, Calendar, Infinity, ChevronDown, ChevronUp } from 'lucide-react';

interface JarSettingsProps {
  jarName: string;
  setJarName: (name: string) => void;
  recipientName: string;
  setRecipientName: (name: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  openMode: 'daily' | 'unlimited';
  setOpenMode: (mode: 'daily' | 'unlimited') => void;
  enablePassword: boolean;
  setEnablePassword: (enabled: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isGhost: boolean;
}

const OPEN_MODES = [
  { id: 'daily', label: 'One per day', description: 'Open one note each day', icon: Calendar },
  { id: 'unlimited', label: 'Unlimited', description: 'Open all anytime', icon: Infinity },
];

export const JarSettings = ({
  jarName,
  setJarName,
  recipientName,
  setRecipientName,
  theme,
  setTheme,
  openMode,
  setOpenMode,
  enablePassword,
  setEnablePassword,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isGhost,
}: JarSettingsProps) => {
  const [showAllThemes, setShowAllThemes] = useState(false);
  const displayedThemes = showAllThemes ? JAR_THEMES : JAR_THEMES.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Jar Name & Recipient */}
      <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-soft space-y-4">
        <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
          🏺 Jar Details
        </h3>
        
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="jarName" className="text-xs">Jar Name</Label>
            <Input
              id="jarName"
              placeholder="Birthday Wishes for Mom..."
              value={jarName}
              onChange={(e) => setJarName(e.target.value)}
              className="bg-background/50 h-9 text-sm"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="recipientName" className="text-xs">For (optional)</Label>
            <Input
              id="recipientName"
              placeholder="Mom, Best Friend..."
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="bg-background/50 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-soft space-y-3">
        <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
          🎨 Theme
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          {displayedThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-2 rounded-xl border-2 transition-all ${
                theme === t.id
                  ? 'border-primary shadow-soft scale-105'
                  : 'border-transparent hover:border-muted bg-muted/20'
              }`}
            >
              <div className={`h-5 rounded-lg bg-gradient-to-r ${t.colors}`} />
              <span className="text-[10px] text-muted-foreground mt-1 block truncate">{t.label}</span>
            </button>
          ))}
        </div>
        
        {JAR_THEMES.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllThemes(!showAllThemes)}
            className="w-full text-xs h-7 text-muted-foreground"
          >
            {showAllThemes ? (
              <>Show Less <ChevronUp className="w-3 h-3 ml-1" /></>
            ) : (
              <>Show All {JAR_THEMES.length} Themes <ChevronDown className="w-3 h-3 ml-1" /></>
            )}
          </Button>
        )}
      </div>

      {/* Opening Mode */}
      <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-soft space-y-3">
        <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
          📅 Opening Mode
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {OPEN_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setOpenMode(mode.id as 'daily' | 'unlimited')}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                openMode === mode.id
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50 bg-muted/20'
              }`}
            >
              <mode.icon className={`w-4 h-4 mb-1 ${openMode === mode.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="text-xs font-medium">{mode.label}</div>
              <div className="text-[10px] text-muted-foreground">{mode.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Password Protection */}
      <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password
          </h3>
          <button
            onClick={() => setEnablePassword(!enablePassword)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              enablePassword ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${
                enablePassword ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
        
        {enablePassword && (
          <div className="space-y-2 animate-fade-in">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Set a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-background/50 h-9 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isGhost && (
              <p className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1">
                ⚠️ Requires an account to save
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
