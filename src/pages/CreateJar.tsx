import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useGhostSession } from '@/hooks/useGhostSession';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fireConfetti, fireSparkles, fireHearts } from '@/lib/confetti';
import MagicSparkles from '@/components/ui/MagicSparkles';

import { NoteEditor, NoteItem } from '@/components/workspace/NoteEditor';
import { CharmsPalette, CharmItem } from '@/components/workspace/CharmsPalette';
import { JarSettings } from '@/components/workspace/JarSettings';
import { JarPreview, JarSize } from '@/components/workspace/JarPreview';

import { 
  Sparkles, MessageSquare, Palette, Settings, Gift, Check, Heart, X, Type, Image as ImageIcon, Mic, Link2
} from 'lucide-react';

const CreateJar = () => {
  const { user } = useAuth();
  const { ghostSessionId, isGhost, createGhostRecord } = useGhostSession();
  const navigate = useNavigate();
  
  // Jar settings
  const [jarName, setJarName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [theme, setTheme] = useState('lavender');
  const [openMode, setOpenMode] = useState<'daily' | 'unlimited'>('daily');
  const [jarSize, setJarSize] = useState<JarSize>('medium');
  const [ribbonColor, setRibbonColor] = useState('');
  const [labelText, setLabelText] = useState('');
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(undefined);
  
  // Content
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [charms, setCharms] = useState<CharmItem[]>([]);
  
  // Password protection
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');

  // Recover pending jar data after auth
  useEffect(() => {
    const pendingJar = sessionStorage.getItem('pendingJar');
    if (pendingJar && user) {
      try {
        const data = JSON.parse(pendingJar);
        setJarName(data.jarName || '');
        setRecipientName(data.recipientName || '');
        setTheme(data.theme || 'lavender');
        setOpenMode(data.openMode || 'daily');
        if (data.notes) {
          setNotes(data.notes.map((n: any) => ({ ...n, id: crypto.randomUUID() })));
        }
        if (data.charms) {
          setCharms(data.charms.map((c: any) => ({ ...c, id: crypto.randomUUID() })));
        }
        setEnablePassword(data.enablePassword || false);
        setPassword(data.password || '');
        sessionStorage.removeItem('pendingJar');
        toast.success('Your jar has been restored!');
      } catch (e) {
        console.error('Failed to restore pending jar:', e);
      }
    }
  }, [user]);

  const addNote = (note: NoteItem) => {
    setNotes([...notes, note]);
    fireSparkles(window.innerWidth / 2, window.innerHeight / 2);
  };

  const removeNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note?.previewUrl) {
      URL.revokeObjectURL(note.previewUrl);
    }
    setNotes(notes.filter(n => n.id !== id));
  };

  const addCharm = (type: string) => {
    // Constrain charms within jar body (roughly 18%-82% x, 22%-90% y)
    const newCharm: CharmItem = {
      id: crypto.randomUUID(),
      type,
      position_x: 20 + Math.random() * 60,
      position_y: 25 + Math.random() * 60,
      rotation: Math.random() * 30 - 15,
    };
    setCharms([...charms, newCharm]);
    fireSparkles(window.innerWidth / 2, window.innerHeight / 2);
  };

  const uploadFile = async (file: File, jarId: string, effectiveUserId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${effectiveUserId}/${jarId}/${crypto.randomUUID()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('jar-media')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('jar-media')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (isGhost && enablePassword) {
      setShowAuthPrompt(true);
      return;
    }

    if (notes.length === 0) {
      toast.error('Please add at least one note');
      return;
    }

    if (enablePassword && password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      let userId = user?.id;
      
      if (isGhost) {
        await createGhostRecord();
        userId = '00000000-0000-0000-0000-000000000000';
      }

      if (!userId && !ghostSessionId) {
        navigate('/auth');
        return;
      }

      // Create the jar
      // Hash password securely using database function if password is enabled
      let passwordHash = null;
      if (enablePassword && password) {
        const { data: hashResult, error: hashError } = await supabase
          .rpc('hash_jar_password', { p_password: password });
        if (hashError) throw hashError;
        passwordHash = hashResult;
      }

      const jarData: any = {
        name: jarName || 'My Jar of Notes',
        theme,
        recipient_name: recipientName || null,
        open_mode: openMode,
        is_password_protected: enablePassword,
        password_hash: passwordHash,
        unlock_date: unlockDate ? unlockDate.toISOString() : null,
      };

      if (user) {
        jarData.user_id = user.id;
      } else if (ghostSessionId) {
        jarData.ghost_session_id = ghostSessionId;
        jarData.user_id = userId;
      }

      const { data: jar, error: jarError } = await supabase
        .from('jars')
        .insert(jarData)
        .select()
        .single();

      if (jarError) throw jarError;

      const effectiveUserId = user?.id || ghostSessionId || 'ghost';

      // Upload files and create notes
      const notesData = await Promise.all(
        notes.map(async (note, index) => {
          let mediaUrl = null;
          
          if (note.file) {
            mediaUrl = await uploadFile(note.file, jar.id, effectiveUserId);
          }
          
          return {
            jar_id: jar.id,
            content: note.content,
            content_type: note.type,
            media_url: mediaUrl,
            note_order: index,
            note_theme: note.theme || 'default',
          };
        })
      );

      const { error: notesError } = await supabase
        .from('jar_notes')
        .insert(notesData);

      if (notesError) throw notesError;

      // Add charms
      if (charms.length > 0) {
        const charmsData = charms.map(charm => ({
          jar_id: jar.id,
          charm_type: charm.type,
          position_x: charm.position_x,
          position_y: charm.position_y,
          scale: 1,
          rotation: charm.rotation,
        }));

        await supabase.from('jar_charms').insert(charmsData);
      }

      // Log activity
      if (user) {
        await supabase.from('jar_activity').insert({
          jar_id: jar.id,
          user_id: user.id,
          activity_type: 'created',
          metadata: { jar_name: jar.name },
        });
      }

      fireConfetti();
      fireHearts();
      toast.success('Your jar has been created! 🎉');
      
      setTimeout(() => {
        navigate(`/jar/${jar.share_token}`);
      }, 1500);
    } catch (error: any) {
      console.error('Create jar error:', error);
      toast.error(error.message || 'Failed to create jar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthPromptAction = (action: 'signup' | 'login') => {
    sessionStorage.setItem('pendingJar', JSON.stringify({
      jarName,
      recipientName,
      theme,
      openMode,
      notes: notes.map(n => ({ type: n.type, content: n.content, theme: n.theme })),
      charms: charms.map(c => ({ type: c.type, position_x: c.position_x, position_y: c.position_y, rotation: c.rotation })),
      enablePassword,
      password,
    }));
    navigate(`/auth?mode=${action}&redirect=/create-jar`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dreamy background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(300, 35%, 97%) 0%, hsl(330, 35%, 96%) 50%, hsl(280, 30%, 96%) 100%)'
        }}
      />
      
      {/* Magical sparkles */}
      <MagicSparkles count={15} />
      
      <Navbar />
      
      <main className="pt-20 pb-8 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="mb-2"
          >
            <X className="w-4 h-4 mr-2" style={{ display: 'none' }} />
            <span className="flex items-center gap-2">
              ← {user ? 'Dashboard' : 'Home'}
            </span>
          </Button>

          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-warm mb-4"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsl(43, 80%, 70% / 0.3)' }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium">Jar Workshop</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-primary fill-primary/30" />
              </motion.div>
            </motion.div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Create Your{' '}
              <span className="font-script gradient-text-gold text-4xl md:text-5xl lg:text-6xl">Jar of Love</span>
            </h1>
            {isGhost && (
              <motion.p 
                className="text-sm text-muted-foreground mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                ✨ Creating as guest — sign up anytime to save permanently!
              </motion.p>
            )}
          </motion.div>

          {/* Workspace layout */}
          <div className="grid lg:grid-cols-[320px_1fr_280px] gap-4 lg:gap-6">
            {/* Left Panel - Tools */}
            <div className="lg:order-1 order-2 min-w-0">
              <div className="sticky top-24">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="notes" className="gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Notes</span>
                    </TabsTrigger>
                    <TabsTrigger value="charms" className="gap-1.5">
                      <Palette className="w-4 h-4" />
                      <span className="hidden sm:inline">Charms</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-1.5">
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                    <TabsContent value="notes" className="mt-0">
                      <NoteEditor onAddNote={addNote} />
                      
                      {/* Added notes list */}
                      {notes.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground px-1">
                            Added Notes ({notes.length})
                          </h4>
                          {notes.map((note) => (
                            <div
                              key={note.id}
                              className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {note.type === 'text' && <Type className="w-4 h-4 text-primary" />}
                                {note.type === 'image' && <ImageIcon className="w-4 h-4 text-primary" />}
                                {note.type === 'voice' && <Mic className="w-4 h-4 text-primary" />}
                                {note.type === 'link' && <Link2 className="w-4 h-4 text-primary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{note.content || 'Empty note'}</p>
                                <p className="text-xs text-muted-foreground capitalize">{note.type}</p>
                              </div>
                              <button
                                onClick={() => removeNote(note.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="charms" className="mt-0">
                      <CharmsPalette
                        onAddCharm={addCharm}
                        charms={charms}
                        onClearCharms={() => setCharms([])}
                      />
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0">
                      <JarSettings
                        jarName={jarName}
                        setJarName={setJarName}
                        recipientName={recipientName}
                        setRecipientName={setRecipientName}
                        theme={theme}
                        setTheme={setTheme}
                        openMode={openMode}
                        setOpenMode={setOpenMode}
                        enablePassword={enablePassword}
                        setEnablePassword={setEnablePassword}
                        password={password}
                        setPassword={setPassword}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        isGhost={isGhost}
                        jarSize={jarSize}
                        setJarSize={setJarSize}
                        ribbonColor={ribbonColor}
                        setRibbonColor={setRibbonColor}
                        labelText={labelText}
                        setLabelText={setLabelText}
                        unlockDate={unlockDate}
                        setUnlockDate={setUnlockDate}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            {/* Center - Jar Preview */}
            <div className="lg:order-2 order-1">
              <div className="sticky top-24">
                <div className="bg-gradient-to-br from-muted/30 to-background rounded-3xl p-6 min-h-[500px] border border-border/30 shadow-soft">
                  <JarPreview
                    notes={notes}
                    charms={charms}
                    theme={theme}
                    jarName={jarName}
                    recipientName={recipientName}
                    jarSize={jarSize}
                    ribbonColor={ribbonColor}
                    labelText={labelText}
                  />
                </div>

                {/* Create button */}
                <div className="mt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || notes.length === 0}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-right transition-all duration-500 text-primary-foreground shadow-float"
                  >
                    {isSubmitting ? (
                      <Sparkles className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Create & Share Jar
                        <Gift className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  {notes.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Add at least one note to create your jar
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Summary (hidden on mobile) */}
            <div className="lg:order-3 hidden lg:block">
              <div className="sticky top-24">
                <div className="p-5 bg-card rounded-2xl border border-border/50 shadow-soft">
                  <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Your Jar
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Notes</span>
                      <span className="font-medium">{notes.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Charms</span>
                      <span className="font-medium">{charms.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-medium capitalize">{jarSize}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Theme</span>
                      <span className="font-medium capitalize">{theme}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Opening</span>
                      <span className="font-medium capitalize">{openMode}</span>
                    </div>
                    {ribbonColor && (
                      <div className="flex justify-between py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Ribbon</span>
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: ribbonColor }} />
                      </div>
                    )}
                    {labelText && (
                      <div className="flex justify-between py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Label</span>
                        <span className="font-medium text-xs truncate max-w-[120px]">{labelText}</span>
                      </div>
                    )}
                    {enablePassword && (
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Password</span>
                        <span className="font-medium text-primary">Protected 🔒</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10">
                    <p className="text-xs text-center text-muted-foreground">
                      ✨ Your jar will be shareable via a unique link
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth prompt dialog */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an account to continue</DialogTitle>
            <DialogDescription>
              Password protection requires an account. Your jar will be saved automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => handleAuthPromptAction('signup')}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Create Account
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAuthPromptAction('login')}
            >
              I already have an account
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEnablePassword(false);
                setShowAuthPrompt(false);
              }}
            >
              Continue without password protection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateJar;
