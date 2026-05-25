import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Send, Instagram, Linkedin, Youtube, CheckCircle, Heart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  message: z.string().trim().min(1, 'Message is required').max(2000),
});

const ContactPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('contact-form', {
        body: result.data,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success('Message sent successfully! 💌');
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-28 pb-20 px-4 flex items-center justify-center min-h-[80vh]">
          <motion.div
            className="text-center space-y-6 max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-heading font-bold">
              Message <span className="gradient-text">Sent!</span>
            </h2>
            <p className="text-muted-foreground">
              Thank you for reaching out! We'll get back to you as soon as possible. 💜
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} variant="outline">
                Send Another Message
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost">
                Back to Home
              </Button>
            </div>
          </motion.div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question, feedback, or just want to say hello? We'd love to hear from you!
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-12">
            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="bg-card rounded-3xl p-8 border border-border/50 shadow-soft space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={errors.name ? 'border-destructive' : ''} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
                  {errors.name && <p id="name-error" className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={errors.email ? 'border-destructive' : ''} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
                  {errors.email && <p id="email-error" className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What's this about?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={errors.subject ? 'border-destructive' : ''} aria-invalid={!!errors.subject} />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us what's on your mind..." rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={errors.message ? 'border-destructive' : ''} aria-invalid={!!errors.message} />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>

              <Button type="submit" disabled={sending} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2" size="lg">
                {sending ? <span className="animate-spin">✨</span> : <><Send className="w-4 h-4" /> Send Message</>}
              </Button>
            </motion.form>

            {/* Contact info sidebar */}
            <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
                <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> Email Us
                </h3>
                <p className="text-muted-foreground text-sm">hello@vivlit.com</p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
                <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" /> Follow Us
                </h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm" aria-label="Instagram"><Instagram className="w-4 h-4" /> @vivlit.official</a>
                  <a href="#" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm" aria-label="LinkedIn"><Linkedin className="w-4 h-4" /> Vivlit</a>
                  <a href="#" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm" aria-label="YouTube"><Youtube className="w-4 h-4" /> Vivlit</a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
                <p className="text-sm text-foreground text-center">
                  We typically respond within <strong>24 hours</strong> 💌
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ContactPage;
