import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Heart, Sparkles, Send, ArrowLeft, Image as ImageIcon, Type, Gift, Loader2, Users } from 'lucide-react';
import { getThemeColors } from '@/lib/themes';
import MagicSparkles from '@/components/ui/MagicSparkles';
import { fireSparkles, fireHearts } from '@/lib/confetti';

interface JarInfo {
  id: string;
  name: string;
  theme: string;
  recipient_name: string | null;
}

const ContributePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jarInfo, setJarInfo] = useState<JarInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributorName, setContributorName] = useState(user?.user_metadata?.full_name || '');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'text' | 'image'>('text');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notesAdded, setNotesAdded] = useState(0);
  const [contributorId, setContributorId] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchJarInfo();
  }, [token]);

  const fetchJarInfo = async () => {
    try {
      // Look up the contributor record by invite token
      const { data: contributor, error: contribError } = await supabase
        .from('jar_contributors')
        .select('id, jar_id, status')
        .eq('invite_token', token!)
        .maybeSingle();

      if (contribError) throw contribError;
      if (!contributor) {
        toast.error('Invalid or expired contribution link');
        setLoading(false);
        return;
      }

      setContributorId(contributor.id);

      // Mark contributor as joined if still invited
      if (contributor.status === 'invited') {
        await supabase
          .from('jar_contributors')
          .update({ 
            status: 'joined',
            user_id: user?.id || null,
            contributor_name: contributorName || null,
          })
          .eq('id', contributor.id);
      }

      // Fetch jar info (only non-sensitive fields)
      const { data: jar, error: jarError } = await supabase
        .from('jars')
        .select('id, name, theme, recipient_name')
        .eq('id', contributor.jar_id)
        .maybeSingle();

      if (jarError) throw jarError;
      if (!jar) {
        toast.error('Jar not found');
        setLoading(false);
        return;
      }

      setJarInfo(jar);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load jar');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmitNote = async () => {
    if (!jarInfo) return;

    if (noteType === 'text' && !noteContent.trim()) {
      toast.error('Please write a message');
      return;
    }
    if (noteType === 'image' && !imageFile) {
      toast.error('Please select an image');
      return;
    }

    setIsSubmitting(true);
    try {
      let mediaUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `contributors/${jarInfo.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('jar-media')
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('jar-media')
          .getPublicUrl(fileName);
        mediaUrl = urlData.publicUrl;
      }

      // Get current note count for ordering
      const { count } = await supabase
        .from('jar_notes')
        .select('id', { count: 'exact', head: true })
        .eq('jar_id', jarInfo.id);

      const { error: noteError } = await supabase
        .from('jar_notes')
        .insert({
          jar_id: jarInfo.id,
          content: noteContent || (noteType === 'image' ? `From ${contributorName || 'a friend'}` : ''),
          content_type: noteType,
          media_url: mediaUrl,
          note_order: (count || 0),
          note_theme: 'default',
        });

      if (noteError) throw noteError;

      // Log activity
      await supabase.from('jar_activity').insert({
        jar_id: jarInfo.id,
        user_id: user?.id || null,
        activity_type: 'contributed',
        metadata: { contributor_name: contributorName, contributor_id: contributorId },
      });

      fireHearts();
      fireSparkles(window.innerWidth / 2, window.innerHeight / 2);
      toast.success('Your note has been added! 💌');
      setNotesAdded(prev => prev + 1);
      setNoteContent('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error('Contribute error:', error);
      toast.error(error.message || 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!jarInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-none shadow-float">
          <CardContent className="p-8 text-center">
            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold mb-2">Link Not Found</h2>
            <p className="text-muted-foreground text-sm mb-4">
              This contribution link is invalid or has expired.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const themeColors = getThemeColors(jarInfo.theme);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors} relative overflow-hidden`}>
      <MagicSparkles count={10} />

      <div className="max-w-lg mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-warm mb-4">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Group Jar</span>
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            {jarInfo.name}
          </h1>
          {jarInfo.recipient_name && (
            <p className="text-muted-foreground text-sm">
              A special gift for <span className="font-medium text-foreground">{jarInfo.recipient_name}</span> 💝
            </p>
          )}
        </motion.div>

        {/* Success state */}
        {notesAdded > 0 && (
          <motion.div
            className="mb-6 p-4 rounded-2xl bg-card border border-border/50 shadow-soft text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Heart className="w-8 h-8 text-accent mx-auto mb-2" fill="currentColor" />
            <p className="text-sm font-medium">
              You've added {notesAdded} note{notesAdded > 1 ? 's' : ''}! 🎉
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add more or close this page when you're done.
            </p>
          </motion.div>
        )}

        {/* Contributor name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-soft mb-4">
            <CardContent className="p-4">
              <Label htmlFor="contributorName" className="text-xs mb-1.5 block">Your Name</Label>
              <Input
                id="contributorName"
                placeholder="Your name (shown to the jar owner)"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                className="bg-background/50 h-9 text-sm"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Note type selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-none shadow-soft">
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setNoteType('text')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    noteType === 'text' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span className="text-sm font-medium">Text</span>
                </button>
                <button
                  onClick={() => setNoteType('image')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    noteType === 'image' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
              </div>

              {noteType === 'text' ? (
                <Textarea
                  placeholder="Write a heartfelt message..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[120px] bg-background/50 text-sm"
                  maxLength={1000}
                />
              ) : (
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                      <button
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-foreground/50 text-background hover:bg-foreground/70"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                      <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Tap to upload a photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                  )}
                  <Input
                    placeholder="Add a caption (optional)"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="bg-background/50 h-9 text-sm"
                  />
                </div>
              )}

              <Button
                onClick={handleSubmitNote}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Add My Note
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ContributePage;
