import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Wand2, Check } from 'lucide-react';
import { toast } from 'sonner';

const RELATIONSHIPS = [
  'Partner', 'Best Friend', 'Parent', 'Sibling', 'Colleague', 'Acquaintance',
];
const OCCASIONS = [
  'Birthday', 'Anniversary', 'Encouragement', 'Farewell', 'Thank You', 'Just Because',
];
const TONES = ['Funny', 'Emotional', 'Poetic', 'Short & Sweet'];

interface AiMessageAssistantProps {
  onSelectMessage: (message: string) => void;
}

interface MessageOption {
  label: string;
  text: string;
}

const AiMessageAssistant = ({ onSelectMessage }: AiMessageAssistantProps) => {
  const [open, setOpen] = useState(false);
  const [relationship, setRelationship] = useState('');
  const [occasion, setOccasion] = useState('');
  const [tone, setTone] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MessageOption[]>([]);

  const canGenerate = relationship && occasion && tone;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: { relationship, occasion, tone, details: details.trim() || undefined },
      });

      if (error) throw error;
      
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.messages && Array.isArray(data.messages)) {
        setSuggestions(data.messages);
      } else {
        toast.error('Unexpected response format');
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      toast.error(err.message || 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (text: string) => {
    onSelectMessage(text);
    setOpen(false);
    setSuggestions([]);
    setRelationship('');
    setOccasion('');
    setTone('');
    setDetails('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Need ideas?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Writing Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Who is this for?</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">
              Any memories or details? <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="e.g. We used to bake cookies together every Sunday..."
              className="min-h-[70px] resize-none text-sm"
              maxLength={500}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Crafting messages...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Ideas
              </>
            )}
          </Button>

          {/* Loading state */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 rounded-xl bg-muted/30 animate-pulse">
                    <div className="h-3 bg-muted rounded w-24 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-xs text-muted-foreground font-medium">
                  ✨ Pick a message to use:
                </p>
                {suggestions.map((msg, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSelect(msg.text)}
                    className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-primary">{msg.label}</span>
                      <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiMessageAssistant;
