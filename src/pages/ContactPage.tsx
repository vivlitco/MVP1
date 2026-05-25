import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send, Instagram, Linkedin, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  message: z.string().trim().min(1, 'Message is required').max(2000),
});

const card = {
  background: 'white',
  border: '1px solid rgba(180,155,130,0.18)',
  borderRadius: 16,
  padding: 28,
  boxShadow: '0 2px 16px rgba(120,80,100,0.06)',
};

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
      const { error } = await supabase.functions.invoke('contact-form', { body: result.data });
      if (error) throw error;
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.08, 1] }}
            style={{ textAlign: 'center', maxWidth: 420 }}
          >
            <div style={{ width: 72, height: 72, background: 'var(--accent-plum)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={34} color="white" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 14px' }}>
              Message{' '}
              <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>sent</span>
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.7, margin: '0 0 32px' }}>
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)', background: 'transparent', border: '1px solid rgba(180,155,130,0.3)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}
              >
                Send another
              </button>
              <button
                onClick={() => navigate('/')}
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 500, color: 'white', background: 'var(--accent-plum)', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}
              >
                Back to home
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />

      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '96px 24px 80px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 48 }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.25, 0.1, 0.08, 1] }}
          style={{ marginBottom: 56 }}
        >
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16 }}>
            Say hello
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 18px', lineHeight: 1.2 }}>
            Get in{' '}
            <span style={{ fontFamily: "'Dancing Script', cursive", color: 'var(--accent-plum)' }}>touch</span>
          </h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, color: 'var(--ink-secondary)', lineHeight: 1.75, margin: 0, maxWidth: 520 }}>
            Have a question, feedback, or just want to say hello? We'd love to hear from you.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 32, alignItems: 'start' }}
          className="contact-grid"
        >
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ease: [0.25, 0.1, 0.08, 1], duration: 0.8 }}
            style={{ ...card, display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Label htmlFor="name" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)' }}>Name</Label>
                <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#e05c5c', margin: 0 }}>{errors.name}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Label htmlFor="email" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)' }}>Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#e05c5c', margin: 0 }}>{errors.email}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="subject" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)' }}>Subject</Label>
              <Input id="subject" placeholder="What's this about?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={errors.subject ? 'border-destructive' : ''} />
              {errors.subject && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#e05c5c', margin: 0 }}>{errors.subject}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="message" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)' }}>Message</Label>
              <Textarea id="message" placeholder="Tell us what's on your mind..." rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={errors.message ? 'border-destructive' : ''} />
              {errors.message && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#e05c5c', margin: 0 }}>{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={sending}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                color: 'white',
                background: sending ? 'rgba(140,90,180,0.5)' : 'var(--accent-plum)',
                border: 'none',
                borderRadius: 8,
                padding: '13px 24px',
                cursor: sending ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!sending) e.currentTarget.style.opacity = '0.82'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {sending ? '✨ Sending…' : <><Send size={15} /> Send Message</>}
            </button>
          </motion.form>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, ease: [0.25, 0.1, 0.08, 1], duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Mail size={16} style={{ color: 'var(--accent-plum)' }} />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>Email us</h3>
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>hello@vivlit.com</p>
            </div>

            <div style={card}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--ink-primary)', margin: '0 0 16px' }}>Follow us</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="https://www.instagram.com/vivlit.co/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink-secondary)', fontFamily: 'Poppins, sans-serif', fontSize: 13, transition: 'opacity 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                  <Instagram size={15} /> @vivlit.co
                </a>
                <a href="https://www.linkedin.com/company/vivlit" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink-secondary)', fontFamily: 'Poppins, sans-serif', fontSize: 13, transition: 'opacity 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                  <Linkedin size={15} /> Vivlit
                </a>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(140,90,180,0.05)',
                border: '1px solid rgba(140,90,180,0.14)',
                borderRadius: 16,
                padding: 24,
                textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.7 }}>
                We typically respond within <strong style={{ color: 'var(--ink-primary)' }}>24 hours</strong>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
