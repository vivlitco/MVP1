import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Sparkles, Save, Calendar, Infinity, Lock, Eye, EyeOff, Users, Settings, MessageSquare } from 'lucide-react';
import { JAR_THEMES } from '@/lib/themes';
import { ContributorsPanel } from '@/components/workspace/ContributorsPanel';
import ShareDialog from '@/components/ShareDialog';

const OPEN_MODES = [
  { id: 'daily', label: 'One per day', icon: Calendar },
  { id: 'unlimited', label: 'Unlimited', icon: Infinity },
];

interface JarNote {
  id: string;
  content: string;
  note_order: number;
  opened_at: string | null;
}

const EditJar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [jarName, setJarName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [theme, setTheme] = useState('lavender');
  const [openMode, setOpenMode] = useState<'daily' | 'unlimited'>('daily');
  const [notes, setNotes] = useState<{ id?: string; content: string; isNew?: boolean }[]>([]);
  const [deletedNoteIds, setDeletedNoteIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareToken, setShareToken] = useState('');
  const [isCollaborative, setIsCollaborative] = useState(false);
  
  // Password protection
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);

  const [activeTab, setActiveTab] = useState('notes');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchJar();
  }, [id, user]);

  const fetchJar = async () => {
    if (!id) return;

    try {
      const { data: jar, error: jarError } = await supabase
        .from('jars')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (jarError) throw jarError;
      if (!jar) {
        toast.error('Jar not found or access denied');
        navigate('/dashboard');
        return;
      }

      setJarName(jar.name);
      setRecipientName(jar.recipient_name || '');
      setTheme(jar.theme);
      setOpenMode(jar.open_mode as 'daily' | 'unlimited');
      setEnablePassword(jar.is_password_protected || false);
      setHasExistingPassword(!!jar.password_hash);
      setShareToken(jar.share_token);
      setIsCollaborative(jar.is_collaborative || false);

      const { data: notesData, error: notesError } = await supabase
        .from('jar_notes')
        .select('*')
        .eq('jar_id', id)
        .order('note_order', { ascending: true });

      if (notesError) throw notesError;
      setNotes(notesData?.map(n => ({ id: n.id, content: n.content })) || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load jar');
    } finally {
      setLoading(false);
    }
  };

  const addNote = () => {
    setNotes([...notes, { content: '', isNew: true }]);
  };

  const updateNote = (index: number, value: string) => {
    const updated = [...notes];
    updated[index].content = value;
    setNotes(updated);
  };

  const removeNote = (index: number) => {
    const note = notes[index];
    if (note.id) {
      setDeletedNoteIds([...deletedNoteIds, note.id]);
    }
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleToggleCollaborative = async (val: boolean) => {
    setIsCollaborative(val);
    if (id) {
      await supabase.from('jars').update({ is_collaborative: val }).eq('id', id);
    }
  };

  const handleSubmit = async () => {
    if (!user || !id) return;

    const validNotes = notes.filter(note => note.content.trim());
    if (validNotes.length === 0) {
      toast.error('Please add at least one note');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: any = {
        name: jarName || 'My Jar of Notes',
        theme,
        recipient_name: recipientName || null,
        open_mode: openMode,
        is_password_protected: enablePassword,
        is_collaborative: isCollaborative,
      };
      
      if (enablePassword && password) {
        const { data: hashResult, error: hashError } = await supabase
          .rpc('hash_jar_password', { p_password: password });
        if (hashError) throw hashError;
        updateData.password_hash = hashResult;
      } else if (!enablePassword) {
        updateData.password_hash = null;
      }
      
      const { error: jarError } = await supabase
        .from('jars')
        .update(updateData)
        .eq('id', id);

      if (jarError) throw jarError;

      if (deletedNoteIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('jar_notes')
          .delete()
          .in('id', deletedNoteIds);
        if (deleteError) throw deleteError;
      }

      for (let i = 0; i < validNotes.length; i++) {
        const note = validNotes[i];
        if (note.id && !note.isNew) {
          await supabase
            .from('jar_notes')
            .update({ content: note.content, note_order: i })
            .eq('id', note.id);
        } else {
          await supabase
            .from('jar_notes')
            .insert({ jar_id: id, content: note.content, note_order: i });
        }
      }

      toast.success('Jar updated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update jar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Sparkles className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          {shareToken && id && (
            <ShareDialog jarId={id} jarName={jarName} shareToken={shareToken} />
          )}
        </div>

        <Card className="border-none shadow-float">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Edit Jar</CardTitle>
            <CardDescription>
              Update your jar details, notes, and contributors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="notes" className="gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Notes</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1.5">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="contributors" className="gap-1.5">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Contributors</span>
                </TabsTrigger>
              </TabsList>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                {notes.map((note, index) => (
                  <div key={note.id || index} className="relative group">
                    <Textarea
                      placeholder="Write a heartfelt message..."
                      value={note.content}
                      onChange={(e) => updateNote(index, e.target.value)}
                      className="min-h-[80px] pr-10"
                    />
                    <button
                      onClick={() => removeNote(index)}
                      className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button variant="outline" onClick={addNote} className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="jarName">Jar Name</Label>
                  <Input id="jarName" placeholder="e.g., Birthday Wishes for Mom" value={jarName} onChange={(e) => setJarName(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient's Name</Label>
                  <Input id="recipientName" placeholder="e.g., Mom" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                </div>

                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {JAR_THEMES.map((t) => (
                      <button key={t.id} onClick={() => setTheme(t.id)} className={`p-2 rounded-lg border-2 transition-all ${theme === t.id ? 'border-primary scale-105' : 'border-transparent hover:border-muted'}`}>
                        <div className={`h-8 rounded bg-gradient-to-r ${t.colors}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Open Mode</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {OPEN_MODES.map((mode) => (
                      <button key={mode.id} onClick={() => setOpenMode(mode.id as 'daily' | 'unlimited')} className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${openMode === mode.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}>
                        <mode.icon className={`w-4 h-4 ${openMode === mode.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password Protection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Password Protection
                    </Label>
                    <button onClick={() => setEnablePassword(!enablePassword)} className={`relative w-11 h-6 rounded-full transition-colors ${enablePassword ? 'bg-primary' : 'bg-muted'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-background transition-transform ${enablePassword ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  {enablePassword && (
                    <div className="relative animate-fade-in">
                      <Input type={showPassword ? 'text' : 'password'} placeholder={hasExistingPassword ? 'Enter new password (leave blank to keep current)' : 'Enter a password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Contributors Tab */}
              <TabsContent value="contributors">
                {id && (
                  <ContributorsPanel
                    jarId={id}
                    isCollaborative={isCollaborative}
                    onToggleCollaborative={handleToggleCollaborative}
                  />
                )}
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            >
              {isSubmitting ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditJar;
