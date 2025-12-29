import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Calendar, 
  Gift, 
  Users, 
  LogOut, 
  Sparkles,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    jarsCreated: 0,
    jarsShared: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Count jars created
      const { count: jarsCount } = await supabase
        .from('jars')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Count jars shared with user
      const { count: sharedCount } = await supabase
        .from('jar_shares')
        .select('*', { count: 'exact', head: true });

      setStats({
        jarsCreated: jarsCount || 0,
        jarsShared: sharedCount || 0,
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
    // This would require a backend function for proper deletion
    toast.info('Account deletion will be available soon. Please contact support for now.');
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Profile Header */}
        <Card className="border-none shadow-float mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
          <CardContent className="-mt-12 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  {user.user_metadata?.full_name || 'Lovely Human'}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="border-none shadow-soft mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-none shadow-soft mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/dashboard')}
              >
                <Gift className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {loadingStats ? '...' : stats.jarsCreated}
                </p>
                <p className="text-sm text-muted-foreground">Jars Created</p>
              </div>
              <div 
                className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/dashboard')}
              >
                <Users className="w-6 h-6 text-accent mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {loadingStats ? '...' : stats.jarsShared}
                </p>
                <p className="text-sm text-muted-foreground">Jars Shared</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-none shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/dashboard')}
            >
              <Gift className="w-4 h-4 mr-2" />
              View My Jars
            </Button>
            
            <Separator />
            
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your jars and data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;