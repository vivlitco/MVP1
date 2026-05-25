import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Sparkles, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  form?: string;
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const initialMode = searchParams.get('mode');

  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(redirectTo);
  }, [user, navigate, redirectTo]);

  const clearErrors = () => setErrors({});

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!isLogin && !fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }

    try { emailSchema.parse(email); }
    catch (e) { if (e instanceof z.ZodError) newErrors.email = e.errors[0].message; }

    try { passwordSchema.parse(password); }
    catch (e) { if (e instanceof z.ZodError) newErrors.password = e.errors[0].message; }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    clearErrors();

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
            setErrors({ form: 'Incorrect email or password. Please try again.' });
          } else if (error.message.includes('Email not confirmed')) {
            setErrors({ form: 'Please check your inbox and confirm your email first.' });
          } else {
            setErrors({ form: error.message });
          }
        }
        // success: AuthContext handles redirect via useEffect
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('User already registered') || error.message.includes('already registered')) {
            setErrors({ form: 'An account with this email already exists.' });
            setTimeout(() => setIsLogin(true), 1500);
          } else {
            setErrors({ form: error.message });
          }
        } else {
          toast({
            title: 'Check your inbox ✨',
            description: 'We sent a confirmation email. Click the link to activate your account.',
          });
        }
      }
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>

        <div
          style={{
            background: 'white',
            border: '1px solid rgba(180,155,130,0.18)',
            borderRadius: 20,
            boxShadow: '0 4px 32px rgba(120,80,100,0.08)',
            padding: 36,
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: 40,
                  fontWeight: 700,
                  color: 'var(--ink-primary)',
                  lineHeight: 1,
                }}
              >
                Vivlit
              </span>
            </Link>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--ink-primary)',
              textAlign: 'center',
              margin: '0 0 6px',
            }}
          >
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 13,
              color: 'var(--ink-muted)',
              textAlign: 'center',
              margin: '0 0 28px',
            }}
          >
            {isLogin ? 'Sign in to continue' : 'Start creating heartfelt moments'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: undefined })); }}
                  className={errors.fullName ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                    <AlertCircle size={12} /> {errors.fullName}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined, form: undefined })); }}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                autoComplete="email"
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined, form: undefined })); }}
                  className={`pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Form-level error banner */}
            {errors.form && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-medium h-10 mt-2 hover:opacity-90 transition-opacity"
              style={{ background: 'var(--accent-plum)', color: 'white', border: 'none' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                isLogin ? 'Sign in' : 'Create account'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

