import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Plus, Sparkles, Edit, ExternalLink, Trash2, Lock, Clock, Users } from 'lucide-react';
import ShareDialog from '@/components/ShareDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getThemeColors } from '@/lib/themes';

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

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [myJars, setMyJars] = useState<Jar[]>([]);
  const [sharedJars, setSharedJars] = useState<SharedJar[]>([]);
  const [activities, setActivities] = useState<JarActivity[]>([]);
  const [loadingJars, setLoadingJars] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const convertGhostIfNeeded = async () => {
    if (typeof window === 'undefined' || !user) return;

    const sessionId = localStorage.getItem(GHOST_SESSION_KEY);
    if (!sessionId) return;

    const { error } = await supabase.rpc('convert_ghost_account', {
      p_session_id: sessionId,
      p_user_id: user.id,
    });

    if (error) {
      console.error('Ghost conversion failed:', error);
      return;
    }

    localStorage.removeItem(GHOST_SESSION_KEY);
    toast.success('Saved your guest jars to your account');
  };

  useEffect(() => {
    if (!user) return;

    (async () => {
      await convertGhostIfNeeded();
      await Promise.all([fetchMyJars(), fetchSharedJars(), fetchActivities()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMyJars = async () => {
    try {
      const { data, error } = await supabase
        .from('jars')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyJars(data || []);
    } catch (error: any) {
      toast.error('Failed to load jars');
    } finally {
      setLoadingJars(false);
    }
  };

  const fetchSharedJars = async () => {
    try {
      const userEmail = user?.email?.toLowerCase();
      const userId = user?.id;
      
      if (!userId || !userEmail) {
        console.log('No user email or id for fetching shared jars');
        return;
      }
      
      // Fetch shares by user_id OR by email (case-insensitive)
      const { data: shares, error } = await supabase
        .from('jar_shares')
        .select(`
          id,
          jar_id,
          shared_at,
          shared_by_user_id,
          shared_to_user_id,
          shared_to_email,
          jars (*)
        `);

      if (error) {
        console.error('Error fetching jar_shares:', error);
        throw error;
      }
      
      // Filter client-side for proper case-insensitive email matching
      const userShares = (shares || []).filter(s => 
        s.shared_to_user_id === userId || 
        (s.shared_to_email && s.shared_to_email.toLowerCase() === userEmail)
      );
      
      // Update shares that match by email to also have user_id
      const sharesToUpdate = userShares.filter(
        s => s.shared_to_email?.toLowerCase() === userEmail && !s.shared_to_user_id
      );
      
      for (const share of sharesToUpdate) {
        await supabase
          .from('jar_shares')
          .update({ shared_to_user_id: userId, accepted_at: new Date().toISOString() })
          .eq('id', share.id);
      }
      
      const sharedJarsData: SharedJar[] = userShares
        .filter(s => s.jars)
        .map(s => ({
          ...(s.jars as any),
          shared_at: s.shared_at,
        }));
      
      setSharedJars(sharedJarsData);
    } catch (error: any) {
      console.error('Failed to load shared jars:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('jar_activity')
        .select(`
          *,
          jars (name)
        `)
        .or(`user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const activitiesWithNames = (data || []).map(a => ({
        ...a,
        jar_name: (a.jars as any)?.name,
      }));
      
      setActivities(activitiesWithNames);
    } catch (error: any) {
      console.error('Failed to load activities:', error);
    }
  };

  const deleteJar = async (jarId: string) => {
    if (!confirm('Are you sure you want to delete this jar? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jars')
        .delete()
        .eq('id', jarId);

      if (error) throw error;
      setMyJars(myJars.filter(j => j.id !== jarId));
      toast.success('Jar deleted');
    } catch (error: any) {
      toast.error('Failed to delete jar');
    }
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

  const JarCard = ({ jar, showSharedInfo = false, sharedAt }: { jar: Jar; showSharedInfo?: boolean; sharedAt?: string }) => (
    <Card className="border-none shadow-soft overflow-hidden group hover:shadow-float transition-all duration-300">
      <div className={`h-2 bg-gradient-to-r ${getThemeColors(jar.theme)}`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          {jar.name}
          {jar.is_password_protected && (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
        </CardTitle>
        {jar.recipient_name && (
          <CardDescription>For {jar.recipient_name}</CardDescription>
        )}
        {showSharedInfo && sharedAt && (
          <CardDescription className="flex items-center gap-1 text-xs">
            <Users className="w-3 h-3" />
            Shared {new Date(sharedAt).toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-4">
          Created {new Date(jar.created_at).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/jar/${jar.share_token}`)}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </Button>
          {!showSharedInfo && (
            <>
              <ShareDialog 
                jarId={jar.id} 
                jarName={jar.name} 
                shareToken={jar.share_token}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/edit-jar/${jar.id}`)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteJar(jar.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Friend'}! ✨
          </h1>
          <p className="text-muted-foreground mt-2">
            Ready to create something special?
          </p>
        </div>

        {/* Quick Create */}
        <Card className="mb-8 border-none shadow-soft bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h2 className="font-heading text-xl font-semibold">Create a new jar</h2>
              <p className="text-muted-foreground text-sm">Fill it with love and share it with someone special</p>
            </div>
            <Button 
              onClick={() => navigate('/create-jar')}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Jar
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="my-jars" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="my-jars" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              My Jars
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Shared
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
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
                  <p className="text-muted-foreground mb-4">
                    Create your first jar to share heartfelt messages with someone special.
                  </p>
                  <Button 
                    onClick={() => navigate('/create-jar')}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Jar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myJars.map((jar) => (
                  <JarCard key={jar.id} jar={jar} />
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
                  <p className="text-muted-foreground">
                    When someone shares a jar with you, it will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedJars.map((jar) => (
                  <JarCard key={jar.id} jar={jar} showSharedInfo sharedAt={jar.shared_at} />
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
                  <p className="text-muted-foreground">
                    Your jar activity will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-soft">
                <CardContent className="py-4">
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{getActivityText(activity)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
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
