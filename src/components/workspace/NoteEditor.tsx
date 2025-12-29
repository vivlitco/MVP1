import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { NOTE_THEMES } from '@/lib/themes';
import { 
  Type, Image, Mic, Link2, X, Upload, Square, Plus, Sparkles
} from 'lucide-react';

export interface NoteItem {
  id: string;
  type: 'text' | 'image' | 'voice' | 'link';
  content: string;
  file?: File;
  previewUrl?: string;
  theme?: string;
}

interface NoteEditorProps {
  onAddNote: (note: NoteItem) => void;
}

const CONTENT_TYPES = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'link', label: 'Link', icon: Link2 },
];

export const NoteEditor = ({ onAddNote }: NoteEditorProps) => {
  const [noteType, setNoteType] = useState<NoteItem['type']>('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('default');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    isRecording, 
    audioUrl, 
    audioBlob, 
    formattedDuration,
    startRecording, 
    stopRecording, 
    clearRecording 
  } = useAudioRecorder();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
      setContent(selectedFile.name);
    }
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setContent('');
  };

  const handleAddNote = () => {
    if (noteType === 'voice' && audioBlob) {
      const voiceFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
      onAddNote({
        id: crypto.randomUUID(),
        type: 'voice',
        content: `Voice recording (${formattedDuration})`,
        file: voiceFile,
        previewUrl: audioUrl || undefined,
        theme: selectedTheme,
      });
      clearRecording();
    } else if (noteType === 'image' && file) {
      onAddNote({
        id: crypto.randomUUID(),
        type: 'image',
        content: content || file.name,
        file,
        previewUrl: previewUrl || undefined,
        theme: selectedTheme,
      });
      clearFile();
    } else if ((noteType === 'text' || noteType === 'link') && content.trim()) {
      onAddNote({
        id: crypto.randomUUID(),
        type: noteType,
        content: content.trim(),
        theme: selectedTheme,
      });
      setContent('');
    }
  };

  const canAdd = () => {
    if (noteType === 'voice') return !!audioBlob;
    if (noteType === 'image') return !!file;
    return content.trim().length > 0;
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-2xl border border-border/50 shadow-soft">
      {/* Type selector - wrapped for mobile */}
      <div className="flex flex-wrap gap-2">
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct.id}
            onClick={() => setNoteType(ct.id as NoteItem['type'])}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${
              noteType === ct.id 
                ? 'bg-primary text-primary-foreground shadow-soft' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <ct.icon className="w-3.5 h-3.5" />
            {ct.label}
          </button>
        ))}
      </div>

      {/* Content input based on type */}
      <div className="min-h-[120px]">
        {noteType === 'text' && (
          <Textarea
            placeholder="Write something sweet... 💕"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] text-base resize-none border-2 border-dashed border-primary/20 focus:border-primary/40 bg-background/50"
          />
        )}

        {noteType === 'link' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
              <Link2 className="w-5 h-5 text-primary" />
              <Input
                placeholder="https://youtube.com/..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Share a YouTube video, Spotify song, or any link
            </p>
          </div>
        )}

        {noteType === 'image' && (
          <div className="space-y-3">
            {previewUrl ? (
              <div className="relative group">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded-xl"
                />
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Drop an image or click to upload</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            )}
          </div>
        )}

        {noteType === 'voice' && (
          <div className="space-y-4">
            {audioUrl ? (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <audio controls src={audioUrl} className="flex-1 h-10" />
                <button
                  onClick={clearRecording}
                  className="p-2 hover:bg-background/50 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/30 rounded-xl">
                {isRecording ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-2 animate-pulse mx-auto">
                      <div className="w-4 h-4 rounded-full bg-destructive" />
                    </div>
                    <p className="text-2xl font-mono font-bold text-destructive">{formattedDuration}</p>
                    <button
                      onClick={stopRecording}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity mx-auto"
                    >
                      <Square className="w-4 h-4" fill="currentColor" />
                      Stop Recording
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startRecording}
                    className="flex flex-col items-center group"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-float">
                      <Mic className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Tap to record</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Theme selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Style:</span>
        <div className="flex gap-1.5">
          {NOTE_THEMES.map((nt) => (
            <button
              key={nt.id}
              onClick={() => setSelectedTheme(nt.id)}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                selectedTheme === nt.id ? 'border-primary scale-110 shadow-soft' : 'border-transparent'
              }`}
              style={{ backgroundColor: nt.accentColor }}
              title={nt.label}
            />
          ))}
        </div>
      </div>

      {/* Add button */}
      <Button
        onClick={handleAddNote}
        disabled={!canAdd()}
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2"
      >
        <Plus className="w-4 h-4" />
        Add to Jar
        <Sparkles className="w-4 h-4" />
      </Button>
    </div>
  );
};
