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
import CountdownTimer from '@/components/CountdownTimer';
import { getThemeColors } from '@/lib/themes';
import { fireSparkles, fireHearts, fireNoteReveal } from '@/lib/confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface Jar {
  id: string;
  name: string;
  theme: string;
  share_token: string;
  open_mode: string;
  user_id: string;
  password_hash: string | null;
  is_password_protected: boolean | null;
  unlock_date: string | null;
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
      // Only select non-sensitive fields - exclude recipient_email, recipient_name, ghost_session_id
      const { data: jarData, error: jarError } = await supabase
        .from('jars')
        .select('id, name, theme, share_token, open_mode, user_id, password_hash, is_password_protected, unlock_date, created_at, updated_at')
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
    
    // Use secure password verification via database function
    const { data: isValid, error: verifyError } = await supabase
      .rpc('verify_jar_password', { 
        p_password: passwordInput, 
        p_hash: jar.password_hash 
      });
    
    if (verifyError) {
      setPasswordError('Error verifying password');
      console.error('Password verification error:', verifyError);
      return;
    }
    
    if (isValid) {
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
      fireNoteReveal();
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
        fireNoteReveal();
        setTimeout(() => fireHearts(), 400);
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
        // Validate URL to prevent XSS via javascript: or data: URLs
        const isValidHttpUrl = (url: string): boolean => {
          try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        };
        const safeUrl = isValidHttpUrl(note.content) ? note.content : '#';
        return (
          <div className="space-y-4">
            <a 
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              onClick={(e) => {
                if (!isValidHttpUrl(note.content)) {
                  e.preventDefault();
                  toast.error('This link is invalid or unsafe');
                }
              }}
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <Sparkles className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-plum)' }} />
      </div>
    );
  }

  if (!jar) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 16 }}>
        <div style={{ maxWidth: 400, width: '100%', background: 'white', border: '1px solid rgba(180,155,130,0.18)', borderRadius: 20, padding: 48, textAlign: 'center', boxShadow: '0 4px 24px rgba(120,80,100,0.07)' }}>
          <Gift className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--ink-muted)' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 8px' }}>Jar Not Found</h2>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--ink-secondary)', margin: 0 }}>
            This jar doesn't exist or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  // Login requirement screen
  if (requiresLogin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 16 }}>
        <div style={{ maxWidth: 400, width: '100%', background: 'white', border: '1px solid rgba(180,155,130,0.18)', borderRadius: 20, padding: 40, textAlign: 'center', boxShadow: '0 4px 24px rgba(120,80,100,0.08)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(140,90,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Gift className="w-9 h-9" style={{ color: 'var(--accent-plum)' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 8px' }}>{jar.name}</h2>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--ink-secondary)', margin: '0 0 24px', lineHeight: 1.6 }}>
            Someone special shared a jar of notes with you! Sign in to open it.
          </p>
          <button
            onClick={() => navigate(`/auth?redirect=/jar/${token}`)}
            style={{ width: '100%', background: 'var(--accent-plum)', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}
          >
            <LogIn className="w-4 h-4" /> Sign In to Open
          </button>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--ink-muted)', margin: 0 }}>
            Don't have an account? You can create one for free!
          </p>
        </div>
      </div>
    );
  }

  // Password lock screen
  if (isLocked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 16 }}>
        <div style={{ maxWidth: 400, width: '100%', background: 'white', border: '1px solid rgba(180,155,130,0.18)', borderRadius: 20, padding: 40, textAlign: 'center', boxShadow: '0 4px 24px rgba(120,80,100,0.08)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(140,90,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Lock className="w-9 h-9" style={{ color: 'var(--accent-plum)' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 8px' }}>{jar.name}</h2>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--ink-secondary)', margin: '0 0 24px', lineHeight: 1.6 }}>
            This jar is password protected. Enter the password to view.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="pr-10"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#dc2626', margin: 0 }}>{passwordError}</p>
            )}
            <button
              onClick={handlePasswordSubmit}
              style={{ background: 'var(--accent-plum)', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Unlock Jar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Time-lock check
  const isTimeLocked = jar.unlock_date && new Date(jar.unlock_date) > new Date();
  const isCreator = user?.id === jar.user_id;

  if (isTimeLocked && !isCreator) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: 16 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 24 }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: 'var(--ink-primary)', textAlign: 'center', marginBottom: 24 }}>{jar.name}</h1>
          <div style={{ background: 'white', border: '1px solid rgba(180,155,130,0.18)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(120,80,100,0.07)' }}>
            <CountdownTimer unlockDate={jar.unlock_date!} jarName={jar.name} />
          </div>
        </div>
      </div>
    );
  }

  const userOpenedNotes = notes.filter(n => openedNoteIds.has(n.id));
  const userUnopenedCount = notes.length - userOpenedNotes.length;
  const themeColors = getThemeColors(jar.theme);
  const isUnlimited = jar.open_mode === 'unlimited';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 48px' }}>
        {/* Back Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            <Home size={14} /> {user ? 'Dashboard' : 'Home'}
          </button>
        </div>

        {/* Jar Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
            {jar.name}
          </h1>
          {jar.is_password_protected && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--ink-muted)' }}>
              <Lock size={11} /> Protected
            </div>
          )}
        </div>

        {/* Revealed Note Modal */}
        {revealedNote && (
          <AnimatePresence>
            <motion.div
              style={{ position: 'fixed', inset: 0, background: 'rgba(30,10,50,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRevealedNote(null)}
            >
              <motion.div
                style={{ maxWidth: 420, width: '100%' }}
                initial={{ opacity: 0, scale: 0.5, rotateX: 30, y: 60 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -40 }}
                transition={{ type: 'spring', stiffness: 80, damping: 12 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, hsl(40, 40%, 98%) 0%, hsl(35, 30%, 96%) 50%, hsl(330, 20%, 97%) 100%)',
                    boxShadow: '0 30px 60px -12px rgba(30,10,50,0.3), 0 0 0 1px rgba(180,155,130,0.12)',
                  }}
                >
                  {/* Paper texture */}
                  <div
                    style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
                  />
                  {/* Accent strip using jar theme */}
                  <motion.div
                    className={`h-2 bg-gradient-to-r ${themeColors}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{ transformOrigin: 'left' }}
                  />
                  <div style={{ padding: '24px 32px 32px', textAlign: 'center', position: 'relative' }}>
                    <button
                      onClick={() => setRevealedNote(null)}
                      style={{ position: 'absolute', top: 12, right: 12, padding: 8, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <motion.div
                      style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(140,90,180,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {revealedNote.content_type === 'image' ? (
                          <Image className="w-7 h-7" style={{ color: 'var(--accent-plum)' }} />
                        ) : revealedNote.content_type === 'voice' ? (
                          <Mic className="w-7 h-7" style={{ color: 'var(--accent-plum)' }} />
                        ) : revealedNote.content_type === 'link' ? (
                          <Link2 className="w-7 h-7" style={{ color: 'var(--accent-plum)' }} />
                        ) : (
                          <span style={{ fontSize: 24 }}>💌</span>
                        )}
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {renderNoteContent(revealedNote)}
                    </motion.div>
                    <motion.div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '20px 0', color: 'var(--ink-muted)', opacity: 0.5 }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 0.5, scaleX: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div style={{ width: 32, height: 1, background: 'currentColor' }} />
                      <motion.div
                        animate={{ rotate: [0, 180, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      <div style={{ width: 32, height: 1, background: 'currentColor' }} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <button
                        onClick={() => setRevealedNote(null)}
                        style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 500, color: 'var(--accent-plum)', background: 'transparent', border: '1px solid rgba(140,90,180,0.3)', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Gift className="w-4 h-4" /> Close
                      </button>
                    </motion.div>
                  </div>
                  <div
                    style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, background: 'linear-gradient(135deg, transparent 50%, rgba(180,155,130,0.08) 50%)' }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Interactive Jar */}
        <div style={{ marginBottom: 24, position: 'relative' }}>
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
          {charms.length > 0 && <Charms charms={charms} />}
        </div>

        {/* Stats & Instructions */}
        <div style={{ background: 'white', border: '1px solid rgba(180,155,130,0.18)', borderRadius: 16, padding: 24, boxShadow: '0 2px 16px rgba(120,80,100,0.06)' }}>
          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 24, textAlign: 'center' }}>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--accent-plum)', margin: '0 0 2px' }}>{userOpenedNotes.length}</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--ink-muted)', margin: 0 }}>Opened by you</p>
            </div>
            <div style={{ width: 1, background: 'rgba(180,155,130,0.2)' }} />
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--accent-rose)', margin: '0 0 2px' }}>{userUnopenedCount}</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--ink-muted)', margin: 0 }}>Remaining</p>
            </div>
          </div>

          {/* Instructions */}
          {userUnopenedCount > 0 ? (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {canOpenNote() ? (
                <div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 16 }}>
                    {isUnlimited
                      ? 'Shake the jar and click any note to reveal it!'
                      : "Shake the jar and click a note to reveal today's message!"}
                  </p>
                  <button
                    onClick={handleShakeJar}
                    style={{ background: 'var(--accent-plum)', color: 'white', border: 'none', borderRadius: 8, padding: '12px 28px', fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Gift className="w-5 h-5" /> Shake the Jar
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(180,155,130,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Lock className="w-6 h-6" style={{ color: 'var(--ink-muted)' }} />
                  </div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.6 }}>
                    You've opened today's note.<br />Come back tomorrow for another!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: 24, padding: '16px', borderRadius: 12, background: 'rgba(140,90,180,0.06)' }}>
              <Sparkles className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent-plum)' }} />
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--ink-primary)', margin: '0 0 4px' }}>All notes opened!</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)', margin: 0 }}>
                You've read all the messages in this jar.
              </p>
            </div>
          )}

          {/* Opened Notes History */}
          {userOpenedNotes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 500, color: 'var(--ink-muted)', margin: '0 0 4px' }}>Your opened notes (tap to view)</p>
              {userOpenedNotes.map((note, index) => (
                <div
                  key={note.id}
                  onClick={() => setRevealedNote(note)}
                  style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(180,155,130,0.07)', border: '1px solid rgba(180,155,130,0.14)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(180,155,130,0.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(180,155,130,0.07)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--ink-muted)', flexShrink: 0 }}>
                      {isUnlimited ? `#${index + 1}` : `Day ${index + 1}`}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflow: 'hidden' }}>
                      {note.content_type === 'image' && <Image className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ink-muted)' }} />}
                      {note.content_type === 'voice' && <Mic className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ink-muted)' }} />}
                      {note.content_type === 'link' && <Link2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ink-muted)' }} />}
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
        </div>

        {/* Share — creator only */}
        {isCreator && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={copyShareLink}
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
            >
              {copied ? (
                <><Check className="w-4 h-4" style={{ color: 'var(--accent-plum)' }} /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Share this jar</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewJar;
