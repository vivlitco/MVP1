import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useGhostSession } from '@/hooks/useGhostSession';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fireConfetti, fireHearts } from '@/lib/confetti';
import AiMessageAssistant from '@/components/AiMessageAssistant';
import MagicSparkles from '@/components/ui/MagicSparkles';
import CardPreview, { COVER_PRESETS } from '@/components/ecard/CardPreview';
import { JAR_THEMES } from '@/lib/themes';
import {
  Sparkles, Palette, MessageSquare, Share2, Check, Heart,
  Mic, Square, Trash2, Copy, ExternalLink, Mail, Send, Loader2,
  ArrowRight, ArrowLeft, ImagePlus, X,
} from 'lucide-react';

const STEPS = [
  { id: 'design', label: 'Design', icon: Palette, description: 'Choose style & names' },
  { id: 'message', label: 'Write', icon: MessageSquare, description: 'Compose your message' },
  { id: 'share', label: 'Share', icon: Share2, description: 'Send your card' },
];

const CreateCard = () => {
  const { user } = useAuth();
  const { ghostSessionId, isGhost, createGhostRecord } = useGhostSession();
  const navigate = useNavigate();
  const {
    isRecording, audioBlob, audioUrl, formattedDuration,
    startRecording, stopRecording, clearRecording,
  } = useAudioRecorder();

  const [coverPreset, setCoverPreset] = useState('floral');
  const [theme, setTheme] = useState('lavender');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdShareToken, setCreatedShareToken] = useState<string | null>(null);
  const [createdCardId, setCreatedCardId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Email sharing state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const selectedTheme = JAR_THEMES.find(t => t.id === theme) || JAR_THEMES[0];

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Please write a message for your card');
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

      const effectiveUserId = user?.id || ghostSessionId || 'guest';

      let uploadedAudioUrl: string | null = null;
      if (audioBlob) {
        const fileName = `${effectiveUserId}/cards/${crypto.randomUUID()}.webm`;
        const { error: uploadErr } = await supabase.storage
          .from('jar-media')
          .upload(fileName, audioBlob);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('jar-media').getPublicUrl(fileName);
        uploadedAudioUrl = urlData.publicUrl;
      }

      let uploadedImageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `${effectiveUserId}/cards/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('jar-media')
          .upload(fileName, imageFile);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('jar-media').getPublicUrl(fileName);
        uploadedImageUrl = urlData.publicUrl;
      }

      const cardData: any = {
        cover_preset: coverPreset,
        theme,
        message,
        audio_url: uploadedAudioUrl,
        cover_image_url: uploadedImageUrl,
        sender_name: senderName || null,
        recipient_name: recipientName || null,
      };

      if (user) {
        cardData.user_id = user.id;
      } else if (ghostSessionId) {
        cardData.ghost_session_id = ghostSessionId;
        cardData.user_id = userId;
      }

      const { data: card, error } = await supabase
        .from('cards')
        .insert(cardData)
        .select()
        .single();

      if (error) throw error;

      fireConfetti();
      fireHearts();
      setCreatedShareToken(card.share_token);
      setCreatedCardId(card.id);
      setCurrentStep(2);
      toast.success('Your e-card has been created! 🎉');
    } catch (error: any) {
      console.error('Create card error:', error);
      toast.error(error.message || 'Failed to create card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = createdShareToken
    ? `${window.location.origin}/card/${createdShareToken}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  };

  const sendCardEmail = async () => {
    if (!recipientEmail) { toast.error('Please enter an email'); return; }
    if (!user) { toast.error('Log in to send emails'); return; }
    if (!createdCardId) return;

    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-card-email', {
        body: {
          recipientEmail,
          senderName: senderName || 'Someone special',
          personalMessage: emailMessage || null,
          cardId: createdCardId,
        },
      });
      if (error) throw error;
      toast.success('Email sent! 💌');
      setRecipientEmail('');
      setEmailMessage('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const canProceedFromDesign = true;
  const canProceedFromMessage = message.trim().length > 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(300, 35%, 97%) 0%, hsl(330, 35%, 96%) 50%, hsl(280, 30%, 96%) 100%)',
        }}
      />
      <MagicSparkles count={10} />
      <Navbar />

      <main className="pt-20 pb-8 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <Button variant="ghost" onClick={() => navigate(user ? '/dashboard' : '/')} className="mb-2">
            ← {user ? 'Dashboard' : 'Home'}
          </Button>

          {/* Header */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-3" whileHover={{ scale: 1.05 }}>
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Card Studio</span>
              <Heart className="w-4 h-4 text-primary fill-primary/30" />
            </motion.div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Create Your <span className="font-script gradient-text-gold text-4xl md:text-5xl">E-Card</span>
            </h1>
            {isGhost && (
              <p className="text-sm text-muted-foreground mt-2">✨ Creating as guest — sign up to save!</p>
            )}
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStep;
              const isComplete = i < currentStep || (i === 2 && !!createdShareToken);
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (i === 2 && !createdShareToken) return;
                    setCurrentStep(i);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : isComplete
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isComplete && !isActive ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Workspace */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left - Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="sticky top-24">
                <CardPreview
                  coverPreset={coverPreset}
                  theme={selectedTheme}
                  message={message}
                  senderName={senderName}
                  recipientName={recipientName}
                  audioUrl={audioUrl}
                  imageUrl={imagePreviewUrl}
                />
              </div>
            </motion.div>

            {/* Right - Steps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 p-5 sm:p-6 shadow-soft">
                {/* Step 0: Design */}
                {currentStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="font-heading text-lg font-semibold mb-1">Design Your Card</h2>
                      <p className="text-sm text-muted-foreground">Personalize the envelope and colors</p>
                    </div>

                    {/* Names */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Your Name</Label>
                        <Input
                          value={senderName}
                          onChange={e => setSenderName(e.target.value)}
                          placeholder="From..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Recipient</Label>
                        <Input
                          value={recipientName}
                          onChange={e => setRecipientName(e.target.value)}
                          placeholder="To..."
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Cover preset */}
                    <div>
                      <Label className="text-xs mb-2 block">Stamp Design</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {COVER_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => setCoverPreset(preset.id)}
                            className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                              coverPreset === preset.id
                                ? 'border-primary bg-primary/10 shadow-sm scale-105'
                                : 'border-border/50 hover:border-primary/40 hover:bg-muted/30'
                            }`}
                          >
                            <span className="text-xl block mb-0.5">{preset.emoji}</span>
                            <span className="text-[10px] text-muted-foreground leading-tight">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme */}
                    <div>
                      <Label className="text-xs mb-2 block">Color Theme</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {JAR_THEMES.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`h-9 rounded-xl bg-gradient-to-r ${t.colors} border-2 transition-all ${
                              theme === t.id ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent hover:scale-105'
                            }`}
                            title={t.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Image upload */}
                    <div>
                      <Label className="text-xs mb-2 block">Add a Photo (Optional)</Label>
                      {imagePreviewUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-border/30 bg-muted/20">
                          <img src={imagePreviewUrl} alt="Card image" className="w-full max-h-40 object-cover" />
                          <button
                            onClick={() => { setImageFile(null); setImagePreviewUrl(null); }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background text-destructive shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-muted/20 cursor-pointer transition-all">
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Upload a photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error('Image must be under 5MB');
                                  return;
                                }
                                setImageFile(file);
                                setImagePreviewUrl(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Next */}
                    <Button
                      onClick={() => setCurrentStep(1)}
                      disabled={!canProceedFromDesign}
                      className="w-full gap-2"
                      size="lg"
                    >
                      Write Your Message
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 1: Message */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="font-heading text-lg font-semibold mb-1">Write Your Message</h2>
                      <p className="text-sm text-muted-foreground">Pour your heart out ✨</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs">Your Message</Label>
                        <AiMessageAssistant onSelectMessage={(msg) => setMessage(msg)} />
                      </div>
                      <Textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Write something heartfelt..."
                        className="min-h-[180px] resize-none text-base"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                        maxLength={2000}
                      />
                      {/* Character count bar */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                            style={{ width: `${Math.min((message.length / 2000) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{message.length}/2000</span>
                      </div>
                    </div>

                    {/* Audio */}
                    <div>
                      <Label className="text-xs mb-2 block">Voice Note (Optional)</Label>
                      {audioUrl ? (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30">
                          <audio src={audioUrl} className="flex-1 h-8" controls />
                          <Button variant="ghost" size="icon" onClick={clearRecording} className="h-8 w-8">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant={isRecording ? 'destructive' : 'outline'}
                          onClick={isRecording ? stopRecording : startRecording}
                          className="w-full gap-2"
                          size="sm"
                        >
                          {isRecording ? (
                            <>
                              <Square className="w-3.5 h-3.5" /> Stop ({formattedDuration})
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5" /> Record Voice Note
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setCurrentStep(0)} className="gap-1.5">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      {!createdShareToken ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting || !canProceedFromMessage}
                          size="lg"
                          className="flex-1 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-right transition-all duration-500 text-primary-foreground shadow-float gap-2"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              Create E-Card
                              <Heart className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button onClick={() => setCurrentStep(2)} className="flex-1 gap-2">
                          Go to Share <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Share */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-5"
                  >
                    {createdShareToken ? (
                      <>
                        <div className="text-center py-3">
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-5xl mb-3"
                          >
                            💌
                          </motion.div>
                          <h2 className="font-heading text-xl font-semibold">Card Created!</h2>
                          <p className="text-muted-foreground text-sm mt-1">Share the love ✨</p>
                        </div>

                        {/* Copy link */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Share Link</Label>
                          <div className="flex gap-2">
                            <Input value={shareUrl} readOnly className="flex-1 text-sm font-mono" />
                            <Button variant="outline" onClick={copyLink} size="icon">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Email */}
                        {user && (
                          <div className="space-y-3 pt-3 border-t border-border/30">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" /> Send via Email
                            </Label>
                            <Input
                              type="email"
                              placeholder="recipient@example.com"
                              value={recipientEmail}
                              onChange={e => setRecipientEmail(e.target.value)}
                            />
                            <Input
                              placeholder="Add a personal note (optional)"
                              value={emailMessage}
                              onChange={e => setEmailMessage(e.target.value)}
                            />
                            <Button
                              onClick={sendCardEmail}
                              disabled={sendingEmail || !recipientEmail}
                              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
                            >
                              {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              {sendingEmail ? 'Sending...' : 'Send E-Card'}
                            </Button>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
                            onClick={() => navigate(`/card/${createdShareToken}`)}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Preview Card
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setCreatedShareToken(null);
                              setCreatedCardId(null);
                              setMessage('');
                              setCoverPreset('floral');
                              setTheme('lavender');
                              clearRecording();
                              setSenderName('');
                              setRecipientName('');
                              setRecipientEmail('');
                              setEmailMessage('');
                              setImageFile(null);
                              setImagePreviewUrl(null);
                              setCurrentStep(0);
                            }}
                          >
                            Create Another
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10 space-y-3">
                        <p className="text-4xl">✉️</p>
                        <p className="text-muted-foreground text-sm">Complete your card first, then share it here</p>
                        <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                          <ArrowLeft className="w-4 h-4" /> Go Back
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCard;
