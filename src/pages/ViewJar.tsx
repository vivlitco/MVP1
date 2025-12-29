import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGhostSession } from '@/hooks/useGhostSession';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Gift, Sparkles, Copy, Check, Lock, X, ArrowLeft, Home, Image, Mic, Link2, Eye, EyeOff, LogIn, Heart } from 'lucide-react';
import JarVisual from '@/components/JarVisual';
import { Charms } from '@/components/Charms';
import { getThemeColors } from '@/lib/themes';
import { fireSparkles, fireHearts } from '@/lib/confetti';

interface Jar {
  id: string;
  name: string;
  theme: string;
  recipient_name: string | null;
  share_token: string;
  open_mode: string;
  user_id: string;
  password_hash: string | null;
  is_password_protected: boolean;
}

interface JarNote {
  id: string;
  content: string;
  content_type: string;
  media_url: string | null;
  note_order: number;
  opened_at: string | null;
}

interface JarCharm {
  id: string;
  charm_type: string;
  position_x: number;
  position_y: number;
  scale: number;
  rotation: number;
  color?: string;
}

interface UserJarState {
  id: string;
  notes_opened_today: number;
  last_opened_date: string | null;
  opened_note_ids: string[];
}

const ViewJar = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { ghostSessionId } = useGhostSession();
  
  const [jar, setJar] = useState<Jar | null>(null);
  const [notes, setNotes] = useState<JarNote[]>([]);
  const [charms, setCharms] = useState<JarCharm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedNote, setSelectedNote] = useState<JarNote | null>(null);
  const [revealedNote, setRevealedNote] = useState<JarNote | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Per-user state tracking
  const [userState, setUserState] = useState<UserJarState | null>(null);
  const [openedNoteIds, setOpenedNoteIds] = useState<Set<string>>(new Set());
  
  // Password protection
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Login requirement for shared jars
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchJar();
    }
  }, [token, authLoading, user]);

  const fetchJar = async () => {
    if (!token) return;

    try {
      const { data: jarData, error: jarError } = await supabase
        .from('jars')
        .select('*')
        .eq('share_token', token)
        .maybeSingle();

      if (jarError) throw jarError;
      if (!jarData) {
        toast.error('Jar not found');
        setLoading(false);
        return;
      }

      setJar(jarData);
      
      const isCreator = user?.id === jarData.user_id;
      
      // If not the creator and not logged in, require login for shared jars
      if (!isCreator && !user) {
        setRequiresLogin(true);
        setLoading(false);
        return;
      }
      
      // Check if jar is password protected and user is not the creator
      if (jarData.is_password_protected && jarData.password_hash && !isCreator) {
        setIsLocked(true);
        setLoading(false);
        return;
      }

      await Promise.all([
        fetchNotes(jarData.id),
        fetchCharms(jarData.id),
        fetchUserState(jarData.id),
      ]);
      
      // Auto-save shared jar to user's account if they're not the creator
      if (user && !isCreator) {
        await autoSaveSharedJar(jarData.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load jar');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (jarId: string) => {
    const { data: notesData, error: notesError } = await supabase
      .from('jar_notes')
      .select('*')
      .eq('jar_id', jarId)
      .order('note_order', { ascending: true });

    if (notesError) throw notesError;
    setNotes(notesData || []);
  };

  const fetchCharms = async (jarId: string) => {
    const { data: charmsData, error: charmsError } = await supabase
      .from('jar_charms')
      .select('*')
      .eq('jar_id', jarId);

    if (charmsError) {
      console.error('Failed to fetch charms:', charmsError);
      return;
    }
    setCharms(charmsData || []);
  };

  const fetchUserState = async (jarId: string) => {
    if (!user && !ghostSessionId) return;
    
    try {
      // Try to get existing user state
      let query = supabase
        .from('jar_user_state')
        .select('*')
        .eq('jar_id', jarId);
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else if (ghostSessionId) {
        query = query.eq('session_id', ghostSessionId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setUserState({
          id: data.id,
          notes_opened_today: data.notes_opened_today || 0,
          last_opened_date: data.last_opened_date,
          opened_note_ids: [],
        });
        
        // Check if we need to reset daily count
        const today = new Date().toISOString().split('T')[0];
        if (data.last_opened_date !== today) {
          await supabase
            .from('jar_user_state')
            .update({ notes_opened_today: 0, last_opened_date: today })
            .eq('id', data.id);
          setUserState(prev => prev ? { ...prev, notes_opened_today: 0, last_opened_date: today } : null);
        }
      } else {
        // Create new user state
        const insertData: any = {
          jar_id: jarId,
          notes_opened_today: 0,
          last_opened_date: new Date().toISOString().split('T')[0],
        };
        
        if (user) {
          insertData.user_id = user.id;
        } else if (ghostSessionId) {
          insertData.session_id = ghostSessionId;
        }
        
        const { data: newState, error: insertError } = await supabase
          .from('jar_user_state')
          .insert(insertData)
          .select()
          .single();
        
        if (insertError) {
          console.error('Failed to create user state:', insertError);
        } else {
          setUserState({
            id: newState.id,
            notes_opened_today: 0,
            last_opened_date: newState.last_opened_date,
            opened_note_ids: [],
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user state:', error);
    }
  };

  const autoSaveSharedJar = async (jarId: string) => {
    if (!user || !jar) return;
    
    try {
      // Check if already shared
      const { data: existingShare } = await supabase
        .from('jar_shares')
        .select('id')
        .eq('jar_id', jarId)
        .eq('shared_to_user_id', user.id)
        .maybeSingle();
      
      if (!existingShare) {
        // Create share record
        await supabase.from('jar_shares').insert({
          jar_id: jarId,
          shared_by_user_id: jar.user_id,
          shared_to_user_id: user.id,
          permission: 'view',
          accepted_at: new Date().toISOString(),
        });
        
        // Log activity
        await supabase.from('jar_activity').insert({
          jar_id: jarId,
          user_id: user.id,
          activity_type: 'received',
          metadata: { jar_name: jar.name },
        });
        
        toast.success('This jar has been saved to your account!', {
          icon: <Heart className="w-4 h-4 text-accent" fill="currentColor" />,
        });
      }
    } catch (error) {
      console.error('Failed to save shared jar:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!jar) return;
    
    const encodedInput = btoa(passwordInput);
    
    if (encodedInput === jar.password_hash) {
      setIsLocked(false);
      setPasswordError('');
      await Promise.all([
        fetchNotes(jar.id),
        fetchCharms(jar.id),
        fetchUserState(jar.id),
      ]);
      
      if (user && user.id !== jar.user_id) {
        await autoSaveSharedJar(jar.id);
      }
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const canOpenNote = useCallback(() => {
    if (!jar) return false;
    
    // Unlimited mode - always allow
    if (jar.open_mode === 'unlimited') return true;
    
    // Daily mode - check per-user state
    if (!userState) return true; // Allow if state not loaded yet
    
    return userState.notes_opened_today < 1;
  }, [jar, userState]);

  const handleShakeJar = useCallback(() => {
    if (!canOpenNote()) {
      toast.info("You've already opened today's note. Come back tomorrow!");
      return;
    }
    
    // For per-user tracking, count notes that THIS user has opened
    const unopenedNotes = notes.filter(n => !openedNoteIds.has(n.id));
    if (unopenedNotes.length === 0) {
      toast.info("You've opened all the notes in this jar!");
      return;
    }

    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 800);
  }, [canOpenNote, notes, openedNoteIds]);

  const handleNoteClick = async (note: JarNote) => {
    // If already opened by this user, just show it again
    if (openedNoteIds.has(note.id)) {
      setRevealedNote(note);
      fireSparkles(window.innerWidth / 2, window.innerHeight / 3);
      return;
    }

    // Check if can open new note
    if (!canOpenNote()) {
      toast.info("You've already opened today's note. Come back tomorrow!");
      return;
    }

    setSelectedNote(note);

    // Wait for animation then reveal
    setTimeout(async () => {
      try {
        // Update per-user state
        if (userState) {
          const today = new Date().toISOString().split('T')[0];
          await supabase
            .from('jar_user_state')
            .update({ 
              notes_opened_today: (userState.notes_opened_today || 0) + 1,
              last_opened_at: new Date().toISOString(),
              last_opened_date: today,
            })
            .eq('id', userState.id);
          
          setUserState(prev => prev ? {
            ...prev,
            notes_opened_today: (prev.notes_opened_today || 0) + 1,
            last_opened_date: today,
          } : null);
        }
        
        // Track opened note for this user
        setOpenedNoteIds(prev => new Set([...prev, note.id]));
        
        // Log activity
        if (user) {
          await supabase.from('jar_activity').insert({
            jar_id: jar!.id,
            user_id: user.id,
            activity_type: 'opened_note',
            metadata: { note_id: note.id },
          });
        }

        setRevealedNote(note);
        setSelectedNote(null);
        
        // Celebration animation
        fireHearts();
      } catch (error: any) {
        toast.error('Failed to open note');
        setSelectedNote(null);
      }
    }, 600);
  };

  const copyShareLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const renderNoteContent = (note: JarNote) => {
    switch (note.content_type) {
      case 'image':
        return (
          <div className="space-y-4">
            {note.media_url && (
              <img 
                src={note.media_url} 
                alt="Note image" 
                className="w-full max-h-64 object-contain rounded-lg"
              />
            )}
            {note.content && (
              <p className="font-heading text-lg leading-relaxed text-foreground italic">
                "{note.content}"
              </p>
            )}
          </div>
        );
      
      case 'voice':
        return (
          <div className="space-y-4">
            {note.media_url && (
              <div className="flex items-center justify-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Mic className="w-6 h-6 text-primary" />
                <audio controls src={note.media_url} className="flex-1" />
              </div>
            )}
            {note.content && (
              <p className="text-sm text-muted-foreground">{note.content}</p>
            )}
          </div>
        );
      
      case 'link':
        return (
          <div className="space-y-4">
            <a 
              href={note.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Link2 className="w-5 h-5 text-primary" />
              <span className="text-primary underline break-all">{note.content}</span>
            </a>
          </div>
        );
      
      default:
        return (
          <p className="font-heading text-xl md:text-2xl leading-relaxed text-foreground italic">
            "{note.content}"
          </p>
        );
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!jar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center py-12">
            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold mb-2">Jar Not Found</h2>
            <p className="text-muted-foreground">
              This jar doesn't exist or the link is incorrect.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login requirement screen
  if (requiresLogin) {
    const themeColors = getThemeColors(jar.theme);
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeColors} flex items-center justify-center p-4`}>
        <Card className="max-w-md w-full border-none shadow-float">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Gift className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h2 className="font-heading text-2xl font-semibold mb-2">{jar.name}</h2>
            {jar.recipient_name && (
              <p className="text-muted-foreground mb-2">For {jar.recipient_name}</p>
            )}
            
            <p className="text-sm text-muted-foreground mb-6">
              Someone special shared a jar of notes with you! 
              Sign in or create an account to open it.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/auth?redirect=/jar/${token}`)}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Open
              </Button>
              <p className="text-xs text-muted-foreground">
                Don't have an account? You can create one for free!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password lock screen
  if (isLocked) {
    const themeColors = getThemeColors(jar.theme);
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeColors} flex items-center justify-center p-4`}>
        <Card className="max-w-md w-full border-none shadow-float">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h2 className="font-heading text-2xl font-semibold mb-2">{jar.name}</h2>
            {jar.recipient_name && (
              <p className="text-muted-foreground mb-6">For {jar.recipient_name}</p>
            )}
            
            <p className="text-sm text-muted-foreground mb-6">
              This jar is password protected. Enter the password to view.
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              
              <Button
                onClick={handlePasswordSubmit}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Unlock Jar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userOpenedNotes = notes.filter(n => openedNoteIds.has(n.id));
  const userUnopenedCount = notes.length - userOpenedNotes.length;
  const themeColors = getThemeColors(jar.theme);
  const isUnlimited = jar.open_mode === 'unlimited';
  const isCreator = user?.id === jar.user_id;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors} p-4`}>
      <div className="max-w-lg mx-auto pt-4 pb-12">
        {/* Back Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-foreground/80 hover:text-foreground hover:bg-background/50"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="text-foreground/80 hover:text-foreground hover:bg-background/50"
          >
            <Home className="w-4 h-4 mr-1" />
            {user ? 'Dashboard' : 'Home'}
          </Button>
        </div>
        
        {/* Jar Header */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            {jar.name}
          </h1>
          {jar.recipient_name && (
            <p className="text-foreground/80">
              For {jar.recipient_name}
            </p>
          )}
          {jar.is_password_protected && (
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-foreground/60">
              <Lock className="w-3 h-3" />
              Protected
            </div>
          )}
        </div>

        {/* Revealed Note Modal */}
        {revealedNote && (
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div 
              className="max-w-md w-full animate-paper-unfold"
              style={{ perspective: '1000px' }}
            >
              <div 
                className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-lg overflow-hidden"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                  }}
                />
                
                <div className={`h-3 bg-gradient-to-r ${themeColors}`} />
                
                <div className="p-8 pt-6 text-center relative">
                  <button 
                    onClick={() => setRevealedNote(null)}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-foreground/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground/60" />
                  </button>
                  
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      {revealedNote.content_type === 'image' ? (
                        <Image className="w-6 h-6 text-primary" />
                      ) : revealedNote.content_type === 'voice' ? (
                        <Mic className="w-6 h-6 text-primary" />
                      ) : revealedNote.content_type === 'link' ? (
                        <Link2 className="w-6 h-6 text-primary" />
                      ) : (
                        <span className="text-2xl">💌</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    {renderNoteContent(revealedNote)}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 my-6 text-primary/40">
                    <div className="w-8 h-[1px] bg-current" />
                    <Sparkles className="w-4 h-4" />
                    <div className="w-8 h-[1px] bg-current" />
                  </div>
                  
                  <Button
                    onClick={() => setRevealedNote(null)}
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
                
                <div 
                  className="absolute bottom-0 right-0 w-8 h-8"
                  style={{
                    background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.04) 50%)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Interactive Jar */}
        <div className="mb-8 relative">
          <JarVisual
            notes={notes.map(n => ({
              ...n,
              opened_at: openedNoteIds.has(n.id) ? new Date().toISOString() : null,
            }))}
            theme={jar.theme}
            isShaking={isShaking}
            selectedNote={selectedNote}
            onNoteClick={handleNoteClick}
            onShake={handleShakeJar}
            canOpenNote={canOpenNote()}
          />
          
          {/* Charms overlay */}
          {charms.length > 0 && (
            <Charms charms={charms} />
          )}
        </div>

        {/* Instructions & Stats */}
        <Card className="border-none shadow-float animate-fade-in">
          <CardContent className="p-6">
            {/* Stats - Per user */}
            <div className="flex justify-center gap-8 mb-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{userOpenedNotes.length}</div>
                <div className="text-xs text-muted-foreground">Opened by you</div>
              </div>
              <div className="w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-accent">{userUnopenedCount}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>

            {/* Instructions */}
            {userUnopenedCount > 0 ? (
              <div className="text-center mb-6">
                {canOpenNote() ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {isUnlimited 
                        ? 'Shake the jar and click any note to reveal it!' 
                        : 'Shake the jar and click a note to reveal today\'s message!'}
                    </p>
                    <Button
                      onClick={handleShakeJar}
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Gift className="w-5 h-5 mr-2" />
                      Shake the Jar
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You've opened today's note.<br />
                      Come back tomorrow for another!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center mb-6 p-4 rounded-xl bg-muted/50">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium">All notes opened!</p>
                <p className="text-sm text-muted-foreground">
                  You've read all the messages in this jar.
                </p>
              </div>
            )}

            {/* Opened Notes History - Per user */}
            {userOpenedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Your opened notes (tap to view)</h3>
                {userOpenedNotes.map((note, index) => (
                  <div
                    key={note.id}
                    onClick={() => setRevealedNote(note)}
                    className="p-4 rounded-lg bg-muted/30 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground shrink-0">
                        {isUnlimited ? `#${index + 1}` : `Day ${index + 1}`}
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        {note.content_type === 'image' && <Image className="w-4 h-4 text-muted-foreground" />}
                        {note.content_type === 'voice' && <Mic className="w-4 h-4 text-muted-foreground" />}
                        {note.content_type === 'link' && <Link2 className="w-4 h-4 text-muted-foreground" />}
                        <p className="text-foreground/90 truncate">
                          {note.content_type === 'voice' ? 'Voice note' : 
                           note.content_type === 'image' ? 'Image' :
                           `"${note.content}"`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share Button - Only visible to creator */}
        {isCreator && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={copyShareLink}
              className="text-foreground/80 hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Share this jar
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewJar;
