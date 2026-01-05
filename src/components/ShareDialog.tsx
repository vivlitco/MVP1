import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Share2, Mail, Users, Link2, Copy, Check, Send, Loader2 } from 'lucide-react';

interface ShareDialogProps {
  jarId: string;
  jarName: string;
  shareToken: string;
  children?: React.ReactNode;
}

const ShareDialog = ({ jarId, jarName, shareToken, children }: ShareDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Email sharing
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState(user?.user_metadata?.full_name || '');
  const [personalMessage, setPersonalMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Account sharing
  const [accountEmail, setAccountEmail] = useState('');
  const [sharingToAccount, setSharingToAccount] = useState(false);

  const shareUrl = `${window.location.origin}/jar/${shareToken}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmailShare = async () => {
    if (!recipientEmail) {
      toast.error('Please enter an email address');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to send emails');
      return;
    }

    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-jar-email', {
        body: {
          recipientEmail,
          senderName: senderName || 'Someone special',
          personalMessage,
          jarId, // Send jarId instead of shareUrl - the function builds the URL securely
        },
      });

      if (error) throw error;

      toast.success('Email sent successfully!');
      setRecipientEmail('');
      setPersonalMessage('');
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast.error(error?.message || 'Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const shareToAccount = async () => {
    if (!accountEmail) {
      toast.error('Please enter an email address');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to share');
      return;
    }

    setSharingToAccount(true);
    try {
      // Check if share already exists
      const { data: existingShare, error: checkError } = await supabase
        .from('jar_shares')
        .select('id')
        .eq('jar_id', jarId)
        .ilike('shared_to_email', accountEmail)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing share:', checkError);
      }

      if (existingShare) {
        toast.info('Already shared with this email');
        setSharingToAccount(false);
        return;
      }

      // Create share record with lowercase email for consistency
      const { error: insertError } = await supabase.from('jar_shares').insert({
        jar_id: jarId,
        shared_by_user_id: user.id,
        shared_to_email: accountEmail.toLowerCase().trim(),
        permission: 'view',
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      // Log activity
      await supabase.from('jar_activity').insert({
        jar_id: jarId,
        user_id: user.id,
        activity_type: 'shared',
        metadata: { method: 'account', recipient: accountEmail.toLowerCase().trim() },
      });

      toast.success(`Jar shared with ${accountEmail}!`);
      setAccountEmail('');
    } catch (error: any) {
      console.error('Failed to share:', error);
      toast.error(error?.message || 'Failed to share jar');
    } finally {
      setSharingToAccount(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share "{jarName}"
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to share this jar
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="text-xs sm:text-sm">
              <Link2 className="w-4 h-4 mr-1 hidden sm:inline" />
              Link
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs sm:text-sm">
              <Mail className="w-4 h-4 mr-1 hidden sm:inline" />
              Email
            </TabsTrigger>
            <TabsTrigger value="account" className="text-xs sm:text-sm">
              <Users className="w-4 h-4 mr-1 hidden sm:inline" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Copy Link */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={shareUrl} 
                  readOnly 
                  className="text-sm"
                />
                <Button onClick={copyLink} variant="outline" size="icon">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the jar
              </p>
            </div>
          </TabsContent>

          {/* Send via Email */}
          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient's Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="friend@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderName">Your Name</Label>
              <Input
                id="senderName"
                placeholder="Your name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personalMessage">Personal Message (optional)</Label>
              <Input
                id="personalMessage"
                placeholder="I made something special for you..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
              />
            </div>
            <Button 
              onClick={sendEmailShare} 
              disabled={sendingEmail || !recipientEmail}
              className="w-full"
            >
              {sendingEmail ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Email
            </Button>
          </TabsContent>

          {/* Share to Account */}
          <TabsContent value="account" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="accountEmail">User's Email</Label>
              <Input
                id="accountEmail"
                type="email"
                placeholder="user@example.com"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The jar will appear in their "Shared" tab when they sign in
              </p>
            </div>
            <Button 
              onClick={shareToAccount} 
              disabled={sharingToAccount || !accountEmail}
              className="w-full"
            >
              {sharingToAccount ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              Share to Account
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
