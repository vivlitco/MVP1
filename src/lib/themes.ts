export interface JarTheme {
  id: string;
  label: string;
  colors: string;
  jarColor: string;
  noteColors: string[];
}

export interface NoteTheme {
  id: string;
  label: string;
  bgClass: string;
  textClass: string;
  accentColor: string;
}

export const JAR_THEMES: JarTheme[] = [
  { 
    id: 'warm', 
    label: 'Warm Sunset', 
    colors: 'from-secondary to-accent',
    jarColor: '#ffd6a5',
    noteColors: ['#fff5e6', '#ffe4cc', '#ffd9b3', '#ffce99'],
  },
  { 
    id: 'lavender', 
    label: 'Lavender Dreams', 
    colors: 'from-primary to-primary-light',
    jarColor: '#c4a5de',
    noteColors: ['#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc'],
  },
  { 
    id: 'mint', 
    label: 'Fresh Mint', 
    colors: 'from-mint to-primary-light',
    jarColor: '#bde0fe',
    noteColors: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7'],
  },
  { 
    id: 'rose', 
    label: 'Rose Garden', 
    colors: 'from-accent to-secondary',
    jarColor: '#ffc8dd',
    noteColors: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4'],
  },
  { 
    id: 'ocean', 
    label: 'Ocean Breeze', 
    colors: 'from-blue-300 to-cyan-200',
    jarColor: '#7dd3fc',
    noteColors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8'],
  },
  { 
    id: 'sunset', 
    label: 'Golden Sunset', 
    colors: 'from-orange-300 to-pink-300',
    jarColor: '#fdba74',
    noteColors: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24'],
  },
  { 
    id: 'forest', 
    label: 'Forest Glade', 
    colors: 'from-green-300 to-emerald-200',
    jarColor: '#86efac',
    noteColors: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80'],
  },
  { 
    id: 'candy', 
    label: 'Candy Shop', 
    colors: 'from-pink-300 to-purple-300',
    jarColor: '#f0abfc',
    noteColors: ['#fdf4ff', '#fae8ff', '#f5d0fe', '#e879f9'],
  },
  { 
    id: 'midnight', 
    label: 'Midnight Stars', 
    colors: 'from-indigo-400 to-purple-400',
    jarColor: '#a5b4fc',
    noteColors: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc'],
  },
  { 
    id: 'golden', 
    label: 'Golden Hour', 
    colors: 'from-amber-300 to-yellow-200',
    jarColor: '#fcd34d',
    noteColors: ['#fefce8', '#fef9c3', '#fef08a', '#fde047'],
  },
];

export const NOTE_THEMES: NoteTheme[] = [
  { id: 'default', label: 'Classic', bgClass: 'from-amber-50 via-white to-orange-50', textClass: 'text-foreground', accentColor: '#c4a5de' },
  { id: 'romantic', label: 'Romantic', bgClass: 'from-pink-50 via-rose-50 to-red-50', textClass: 'text-rose-900', accentColor: '#f43f5e' },
  { id: 'dreamy', label: 'Dreamy', bgClass: 'from-purple-50 via-violet-50 to-indigo-50', textClass: 'text-purple-900', accentColor: '#8b5cf6' },
  { id: 'fresh', label: 'Fresh', bgClass: 'from-green-50 via-emerald-50 to-teal-50', textClass: 'text-emerald-900', accentColor: '#10b981' },
  { id: 'sunny', label: 'Sunny', bgClass: 'from-yellow-50 via-amber-50 to-orange-50', textClass: 'text-amber-900', accentColor: '#f59e0b' },
  { id: 'ocean', label: 'Ocean', bgClass: 'from-blue-50 via-cyan-50 to-sky-50', textClass: 'text-blue-900', accentColor: '#0ea5e9' },
];

export const getThemeColors = (themeId: string): string => {
  const theme = JAR_THEMES.find(t => t.id === themeId);
  return theme?.colors || JAR_THEMES[0].colors;
};

export const getTheme = (themeId: string): JarTheme => {
  return JAR_THEMES.find(t => t.id === themeId) || JAR_THEMES[0];
};

export const getNoteTheme = (themeId: string): NoteTheme => {
  return NOTE_THEMES.find(t => t.id === themeId) || NOTE_THEMES[0];
};
