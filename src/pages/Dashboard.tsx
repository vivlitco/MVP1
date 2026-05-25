import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Plus, Sparkles, Edit, ExternalLink, Trash2, Lock, Clock, Users, Mail, Copy, Heart } from 'lucide-react';
import ShareDialog from '@/components/ShareDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getThemeColors } from '@/lib/themes';
import { motion } from 'framer-motion';

const GHOST_SESSION_KEY = 'vivlit_ghost_session';

interface Jar {
  id: string;
  name: string;
  theme: string;
  recipient_name: string | null;
  share_token: string;
  created_at: string;
  user_id: string;
  is_password_protected: boolean;
}

interface SharedJar extends Jar {
  shared_by_name?: string;
  shared_at: string;
}

interface JarActivity {
  id: string;
  jar_id: string;
  activity_type: string;
  metadata: any;
  created_at: string;
  jar_name?: string;
}

interface CardItem {
  id: string;
  cover_preset: string;
  theme: string;
  message: string;
  sender_name: string | null;
  recipient_name: string | null;
  share_token: string;
  created_at: string;
  is_opened: boolean;
}

const COVER_EMOJIS: Record<string, string> = {
  floral: '💐', hearts: '💕', stars: '🌟', balloons: '🎈', cake: '🎂',
  butterfly: '🦋', sunset: '🌅', rainbow: '🌈', sparkles: '✨',
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [myJars, setMyJars] = useState<Jar[]>([]);
  const [sharedJars, setSharedJars] = useState<SharedJar[]>([]);
  const [activities, setActivities] = useState<JarActivity[]>([]);
  const [myCards, setMyCards] = useState<CardItem[]>([]);
  const [loadingJars, setLoadingJars] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  const convertGhostIfNeeded = async () => {
    if (typeof window === 'undefined' || !user) return;
    const sessionId = localStorage.getItem(GHOST_SESSION_KEY);
    if (!sessionId) return;
    const { error } = await supabase.rpc('convert_ghost_account', {
      p_session_id: sessionId, p_user_id: user.id,
    });
    if (error) { console.error('Ghost conversion failed:', error); return; }
    localStorage.removeItem(GHOST_SESSION_KEY);
    toast.success('Saved your guest jars to your account');
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      await convertGhostIfNeeded();
      await Promise.all([fetchMyJars(), fetchSharedJars(), fetchActivities(), fetchMyCards()]);
    })();
  }, [user]);

  const fetchMyJars = async () => {
    try {
      const { data, error } = await supabase.from('jars').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      if (error) throw error;
      setMyJars(data || []);
    } catch { toast.error('Failed to load jars'); } finally { setLoadingJars(false); }
  };

  const fetchSharedJars = async () => {
    try {
      const userEmail = user?.email?.toLowerCase();
      const userId = user?.id;
      if (!userId || !userEmail) return;
      const { data: shares, error } = await supabase.from('jar_shares').select(`id, jar_id, shared_at, shared_by_user_id, shared_to_user_id, shared_to_email, jars (*)`);
      if (error) throw error;
      const userShares = (shares || []).filter(s => s.shared_to_user_id === userId || (s.shared_to_email && s.shared_to_email.toLowerCase() === userEmail));
      const sharesToUpdate = userShares.filter(s => s.shared_to_email?.toLowerCase() === userEmail && !s.shared_to_user_id);
      for (const share of sharesToUpdate) {
        await supabase.from('jar_shares').update({ shared_to_user_id: userId, accepted_at: new Date().toISOString() }).eq('id', share.id);
      }
      setSharedJars(userShares.filter(s => s.jars).map(s => ({ ...(s.jars as any), shared_at: s.shared_at })));
    } catch (error: any) { console.error('Failed to load shared jars:', error); }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase.from('jar_activity').select(`*, jars (name)`).or(`user_id.eq.${user?.id}`).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      setActivities((data || []).map(a => ({ ...a, jar_name: (a.jars as any)?.name })));
    } catch (error: any) { console.error('Failed to load activities:', error); }
  };

  const fetchMyCards = async () => {
    try {
      const { data, error } = await supabase.from('cards').select('id, cover_preset, theme, message, sender_name, recipient_name, share_token, created_at, is_opened').eq('user_id', user?.id).order('created_at', { ascending: false });
      if (error) throw error;
      setMyCards((data as CardItem[]) || []);
    } catch (error: any) { console.error('Failed to load cards:', error); }
  };

  const deleteJar = async (jarId: string) => {
    if (!confirm('Are you sure you want to delete this jar?')) return;
    try {
      const { error } = await supabase.from('jars').delete().eq('id', jarId);
      if (error) throw error;
      setMyJars(myJars.filter(j => j.id !== jarId));
      toast.success('Jar deleted');
    } catch { toast.error('Failed to delete jar'); }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      const { error } = await supabase.from('cards').delete().eq('id', cardId);
      if (error) throw error;
      setMyCards(myCards.filter(c => c.id !== cardId));
      toast.success('Card deleted');
    } catch { toast.error('Failed to delete card'); }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <Plus className="w-4 h-4" />;
      case 'edited': return <Edit className="w-4 h-4" />;
      case 'shared': return <Gift className="w-4 h-4" />;
      case 'received': return <Gift className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity: JarActivity) => {
    switch (activity.activity_type) {
      case 'created': return `Created "${activity.jar_name}"`;
      case 'edited': return `Edited "${activity.jar_name}"`;
      case 'shared': return `Shared "${activity.jar_name}"`;
      case 'received': return `Received "${activity.jar_name}"`;
      default: return `Activity on "${activity.jar_name}"`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const JarCard = ({ jar, showSharedInfo = false, sharedAt, index = 0 }: { jar: Jar; showSharedInfo?: boolean; sharedAt?: string; index?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-none shadow-soft overflow-hidden group hover:shadow-float transition-all duration-300">
        <div className={`h-2 bg-gradient-to-r ${getThemeColors(jar.theme)}`} />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            {jar.name}
            {jar.is_password_protected && <Lock className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
          {jar.recipient_name && <CardDescription>For {jar.recipient_name}</CardDescription>}
          {showSharedInfo && sharedAt && (
            <CardDescription className="flex items-center gap-1 text-xs">
              <Users className="w-3 h-3" /> Shared {new Date(sharedAt).toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-4">
            Created {new Date(jar.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/jar/${jar.share_token}`)} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-1" /> View
            </Button>
            {!showSharedInfo && (
              <>
                <ShareDialog jarId={jar.id} jarName={jar.name} shareToken={jar.share_token} />
                <Button variant="outline" size="sm" onClick={() => navigate(`/edit-jar/${jar.id}`)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteJar(jar.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 8px' }}>
            Welcome back,{' '}
            <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>
              {user.user_metadata?.full_name?.split(' ')[0] || 'Friend'}
            </span>
          </h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--ink-muted)', margin: 0 }}>Ready to create something special?</p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-border/20">
            <Gift className="w-5 h-5 text-primary mb-1" />
            <p className="text-2xl font-bold">{myJars.length}</p>
            <p className="text-xs text-muted-foreground">Jars</p>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/5 border border-border/20">
            <Heart className="w-5 h-5 text-accent mb-1" />
            <p className="text-2xl font-bold">{myCards.length}</p>
            <p className="text-xs text-muted-foreground">Cards</p>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/10 border border-border/20">
            <Users className="w-5 h-5 text-primary mb-1" />
            <p className="text-2xl font-bold">{sharedJars.length}</p>
            <p className="text-xs text-muted-foreground">Shared</p>
          </div>
        </motion.div>

        {/* Quick Create */}
        <motion.div
          className="grid sm:grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-none shadow-soft hover:shadow-float transition-all" style={{ background: 'white', border: '1px solid rgba(180,155,130,0.16)' }}>
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <h2 className="font-heading text-xl font-semibold">Create a new jar</h2>
                <p className="text-muted-foreground text-sm">Fill it with love</p>
              </div>
              <Button onClick={() => navigate('/create-jar')} className="hover:opacity-90" style={{ background: 'var(--accent-plum)', color: 'white', border: 'none' }}>
                <Plus className="w-4 h-4 mr-2" /> New Jar
              </Button>
            </CardContent>
          </Card>
          <Card className="border-none shadow-soft hover:shadow-float transition-all" style={{ background: 'white', border: '1px solid rgba(180,155,130,0.16)' }}>
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <h2 className="font-heading text-xl font-semibold">Send an e-card</h2>
                <p className="text-muted-foreground text-sm">Beautiful animated greeting</p>
              </div>
              <Button onClick={() => navigate('/create-card')} className="hover:opacity-90" style={{ background: 'var(--accent-plum)', color: 'white', border: 'none' }}>
                <Mail className="w-4 h-4 mr-2" /> New Card
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="my-jars" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="my-jars" className="flex items-center gap-2">
              <Gift className="w-4 h-4" /> My Jars
            </TabsTrigger>
            <TabsTrigger value="my-cards" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> My Cards
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Shared
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-jars">
            {loadingJars ? (
              <div className="flex justify-center py-8">
                <Sparkles className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : myJars.length === 0 ? (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Gift className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-lg font-medium mb-2">No jars yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first jar to share heartfelt messages.</p>
                  <Button onClick={() => navigate('/create-jar')} className="hover:opacity-90" style={{ background: 'var(--accent-plum)', color: 'white', border: 'none' }}>
                    <Plus className="w-4 h-4 mr-2" /> Create Your First Jar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myJars.map((jar, i) => (
                  <JarCard key={jar.id} jar={jar} index={i} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-cards">
            {myCards.length === 0 ? (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-lg font-medium mb-2">No cards yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first e-card to send a beautiful animated greeting.</p>
                  <Button onClick={() => navigate('/create-card')} className="hover:opacity-90" style={{ background: 'var(--accent-plum)', color: 'white', border: 'none' }}>
                    <Mail className="w-4 h-4 mr-2" /> Create Your First Card
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCards.map((card, i) => (
                  <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-none shadow-soft overflow-hidden group hover:shadow-float transition-all duration-300">
                      <div className={`h-2 bg-gradient-to-r ${getThemeColors(card.theme)}`} />
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-xl">{COVER_EMOJIS[card.cover_preset] || '💌'}</span>
                          {card.recipient_name ? `For ${card.recipient_name}` : 'E-Card'}
                          {card.is_opened && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Opened</span>
                          )}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                          {card.message.substring(0, 100)}{card.message.length > 100 ? '...' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground mb-4">
                          {card.sender_name && <span className="mr-2">From {card.sender_name}</span>}
                          <span>• {new Date(card.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/card/${card.share_token}`)} className="flex-1">
                            <ExternalLink className="w-4 h-4 mr-1" /> View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/card/${card.share_token}`);
                            toast.success('Link copied!');
                          }}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteCard(card.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shared">
            {sharedJars.length === 0 ? (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-lg font-medium mb-2">No shared jars</h3>
                  <p className="text-muted-foreground">When someone shares a jar with you, it will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedJars.map((jar, i) => (
                  <JarCard key={jar.id} jar={jar} showSharedInfo sharedAt={jar.shared_at} index={i} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            {activities.length === 0 ? (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-lg font-medium mb-2">No activity yet</h3>
                  <p className="text-muted-foreground">Your jar activity will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-soft">
                <CardContent className="py-4">
                  <div className="space-y-1">
                    {activities.map((activity, i) => (
                      <motion.div
                        key={activity.id}
                        className="flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{getActivityText(activity)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
