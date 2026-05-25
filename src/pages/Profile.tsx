import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Gift, Users, LogOut, Sparkles,
  Trash2, Heart,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ jarsCreated: 0, jarsShared: 0, cardsCreated: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [jarsRes, sharedRes, cardsRes] = await Promise.all([
        supabase.from('jars').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('jar_shares').select('*', { count: 'exact', head: true }),
        supabase.from('cards').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
      ]);
      setStats({
        jarsCreated: jarsRes.count || 0,
        jarsShared: sharedRes.count || 0,
        cardsCreated: cardsRes.count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const handleDeleteAccount = async () => {
    toast.info('Account deletion will be available soon. Please contact support for now.');
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const statItems = [
    { icon: Gift, label: 'Jars Created', value: stats.jarsCreated, gradient: 'from-primary/10 to-accent/10' },
    { icon: Heart, label: 'Cards Sent', value: stats.cardsCreated, gradient: 'from-accent/10 to-primary/10' },
    { icon: Users, label: 'Jars Shared', value: stats.jarsShared, gradient: 'from-primary/5 to-accent/15' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ background: 'white', border: '1px solid rgba(180,155,130,0.18)', borderRadius: 20, overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 20px rgba(120,80,100,0.07)' }}>
            <div style={{ height: 96, background: 'linear-gradient(135deg, rgba(140,90,180,0.12) 0%, rgba(200,120,150,0.08) 100%)' }} />
            <div style={{ padding: '0 24px 24px', marginTop: -48 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <Avatar className="h-24 w-24" style={{ border: '3px solid white', boxShadow: '0 2px 12px rgba(120,80,100,0.14)' }}>
                  <AvatarFallback style={{ background: 'var(--accent-plum)', color: 'white', fontSize: 22, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 4px' }}>
                    {user.user_metadata?.full_name || 'Lovely Human'}
                  </h1>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {statItems.map((item) => (
              <motion.div
                key={item.label}
                style={{ padding: 16, borderRadius: 14, background: 'white', border: '1px solid rgba(180,155,130,0.16)', cursor: 'pointer', boxShadow: '0 1px 8px rgba(120,80,100,0.05)' }}
                whileHover={{ scale: 1.04, y: -2 }}
                onClick={() => navigate('/dashboard')}
              >
                <item.icon className="w-5 h-5 mb-2" style={{ color: 'var(--accent-plum)' }} />
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 2px' }}>
                  {loadingStats ? '—' : item.value}
                </p>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--ink-muted)', margin: 0 }}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Account Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-soft mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="font-medium text-sm">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/dashboard')}>
                <Gift className="w-4 h-4 mr-2" /> View My Jars
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/create-card')}>
                <Heart className="w-4 h-4 mr-2" /> Create an E-Card
              </Button>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your jars and data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
