import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Copy, Check, Plus, Trash2, Link2, Loader2, Mail } from 'lucide-react';

interface Contributor {
  id: string;
  contributor_name: string | null;
  contributor_email: string | null;
  status: string;
  invite_token: string;
  created_at: string;
}

interface ContributorsPanelProps {
  jarId: string;
  isCollaborative: boolean;
  onToggleCollaborative: (val: boolean) => void;
}

export const ContributorsPanel = ({ jarId, isCollaborative, onToggleCollaborative }: ContributorsPanelProps) => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (jarId && isCollaborative) fetchContributors();
  }, [jarId, isCollaborative]);

  const fetchContributors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jar_contributors')
        .select('*')
        .eq('jar_id', jarId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setContributors(data || []);
    } catch (error: any) {
      console.error('Failed to fetch contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContributor = async () => {
    if (!newName.trim() && !newEmail.trim()) {
      toast.error('Please enter a name or email');
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('jar_contributors')
        .insert({
          jar_id: jarId,
          contributor_name: newName.trim() || null,
          contributor_email: newEmail.trim().toLowerCase() || null,
          status: 'invited',
        })
        .select()
        .single();

      if (error) throw error;
      setContributors(prev => [...prev, data]);
      setNewName('');
      setNewEmail('');
      toast.success('Contributor added! Share their invite link.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add contributor');
    } finally {
      setAdding(false);
    }
  };

  const removeContributor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jar_contributors')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setContributors(prev => prev.filter(c => c.id !== id));
      toast.success('Contributor removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove');
    }
  };

  const copyInviteLink = async (inviteToken: string) => {
    const url = `${window.location.origin}/contribute/${inviteToken}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(inviteToken);
    toast.success('Invite link copied!');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Toggle collaborative mode */}
      <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> Collaborative Jar
          </h3>
          <button
            onClick={() => onToggleCollaborative(!isCollaborative)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isCollaborative ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${isCollaborative ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Let friends & family add their own notes to this jar
        </p>
      </div>

      {isCollaborative && (
        <>
          {/* How it works info */}
          <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 shadow-soft">
            <h4 className="text-sm font-semibold mb-2 text-foreground">How Collaborative Jars Work</h4>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Add contributors by name (and optionally email)</li>
              <li>Copy their unique invite link and share it</li>
              <li>They can add text notes and photos to the jar</li>
              <li>You keep full control over settings, theme, and charms</li>
            </ol>
          </div>

          {/* Add new contributor */}
          <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-soft space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Invite a Contributor
            </h4>
            <div className="space-y-2">
              <Input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-background/50 h-9 text-sm"
              />
              <Input
                placeholder="Email (optional)"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-background/50 h-9 text-sm"
              />
            </div>
            <Button
              onClick={addContributor}
              disabled={adding}
              size="sm"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Add & Get Link</>}
            </Button>
          </div>

          {/* Contributors list */}
          {contributors.length > 0 && (
            <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-soft space-y-3">
              <h4 className="text-sm font-medium">
                Contributors ({contributors.length})
              </h4>
              <div className="space-y-2">
                {contributors.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {(c.contributor_name || c.contributor_email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {c.contributor_name || c.contributor_email || 'Unnamed'}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">{c.status}</p>
                    </div>
                    <button
                      onClick={() => copyInviteLink(c.invite_token)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      title="Copy invite link"
                    >
                      {copiedToken === c.invite_token ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => removeContributor(c.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
};
