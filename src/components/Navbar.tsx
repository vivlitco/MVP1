import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Heart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  useSpring,
} from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const NAV_LINKS = [
  { label: 'Create Jar', href: '/create-jar' },
  { label: 'E-Cards',    href: '/create-card' },
  { label: 'Gallery',    href: '/gallery' },
  { label: 'Features',   href: '/features' },
  { label: 'About',      href: '/about' },
  { label: 'Contact',    href: '/contact' },
];

/**
 * Progressive Atmospheric Navbar
 *
 * During the hero animation (480vh section):
 *   — Only logo + avatar are visible
 *   — No background, no blur, no links
 *
 * After the hero card fades out (~432–466vh):
 *   — Background materialises, links fade in
 *
 * On non-home pages: always fully materialised.
 */

// Hero is 480vh. Card fades out at 90%–97% = 432–465.6vh.
const HERO_START_VH = 432; // vh at which materialisation begins
const HERO_END_VH   = 466; // vh at which navbar is fully visible

const Navbar = () => {
  const { user, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  // 0 = logo+avatar only (hero active)
  // 1 = fully materialised (hero done or non-home)
  const mat = useMotionValue(isHome ? 0 : 1);
  const matSpring = useSpring(mat, { stiffness: 50, damping: 22 });
  const [linksInteractive, setLinksInteractive] = useState(!isHome);

  useEffect(() => {
    const unsub = mat.on('change', (v) => setLinksInteractive(v > 0.5));
    return unsub;
  }, [mat]);

  useEffect(() => {
    if (!isHome) {
      mat.set(1);
      return;
    }
    const calc = () => {
      const start = window.innerHeight * (HERO_START_VH / 100);
      const end   = window.innerHeight * (HERO_END_VH   / 100);
      mat.set(Math.max(0, Math.min(1, (window.scrollY - start) / (end - start))));
    };
    calc();
    window.addEventListener('scroll', calc, { passive: true });
    return () => window.removeEventListener('scroll', calc);
  }, [isHome, mat]);

  useEffect(() => {
    if (isHome) {
      const start = window.innerHeight * (HERO_START_VH / 100);
      const end   = window.innerHeight * (HERO_END_VH   / 100);
      mat.set(Math.max(0, Math.min(1, (window.scrollY - start) / (end - start))));
    } else {
      mat.set(1);
    }
  }, [location.pathname]);

  // ── Derived animated values ──────────────────────────────
  // Logo + avatar: always visible (from mount animation onward)
  // Background + links: only appear as mat approaches 1
  const bgOpacity     = useTransform(matSpring, [0, 1], [0,    0.90]);
  const blurPx        = useTransform(matSpring, [0, 1], [0,    14]);
  const shadowOpacity = useTransform(matSpring, [0, 1], [0,    0.14]);
  // Links: invisible until mat > 0.4, fully visible at mat = 1
  const linkOpacity   = useTransform(matSpring, [0, 0.4, 1], [0, 0, 0.88]);

  const bgColor    = useMotionTemplate`rgba(255, 252, 248, ${bgOpacity})`;
  const blurFilter = useMotionTemplate`blur(${blurPx}px) saturate(1.5)`;
  const shadowLine = useMotionTemplate`0 1px 0 rgba(180, 155, 130, ${shadowOpacity})`;

  // ── Auth helpers ─────────────────────────────────────────
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

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 1.6, ease: [0.25, 0.1, 0.08, 1] }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
    >
      {/* Materialising background layer */}
      <motion.div
        style={{
          background:             bgColor,
          backdropFilter:         blurFilter,
          WebkitBackdropFilter:   blurFilter,
          boxShadow:              shadowLine,
        }}
      >
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '15px 36px',
            maxWidth:       1280,
            margin:         '0 auto',
          }}
        >
          {/* ── Logo ── */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize:   28,
                fontWeight: 700,
                color:      'var(--ink-primary)',
                display:    'inline-block',
              }}
            >
              Vivlit
            </span>
          </Link>

          {/* ── Desktop nav links — centre ── */}
          <motion.div
            className="hidden md:flex"
            style={{
              gap:           36,
              opacity:       linkOpacity,
              pointerEvents: linksInteractive ? 'auto' : 'none',
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  fontFamily:     'Poppins, sans-serif',
                  fontSize:       13,
                  fontWeight:     400,
                  color:          'var(--ink-secondary)',
                  textDecoration: 'none',
                  letterSpacing:  '0.018em',
                  transition:     'opacity 0.22s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>

          {/* ── Right: mobile toggle + auth ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden"
              style={{
                background: 'transparent',
                border:     'none',
                cursor:     'pointer',
                padding:    4,
                color:      'var(--ink-muted)',
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        style={{
                          background:  'transparent',
                          border:      'none',
                          cursor:      'pointer',
                          padding:     0,
                          borderRadius: '50%',
                        }}
                      >
                        <Avatar
                          style={{
                            width:  36,
                            height: 36,
                            border: '1.5px solid rgba(120,80,160,0.22)',
                          }}
                        >
                          <AvatarFallback
                            style={{
                              background: 'linear-gradient(135deg, var(--accent-plum), var(--accent-rose))',
                              color:      'white',
                              fontSize:   12,
                              fontWeight: 600,
                              fontFamily: 'Poppins, sans-serif',
                            }}
                          >
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {user.user_metadata?.full_name && (
                            <p className="font-medium text-sm">{user.user_metadata.full_name}</p>
                          )}
                          <p className="w-[200px] truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer">
                          <Heart className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={signOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Link to="/auth" style={{ textDecoration: 'none' }}>
                      <button
                        style={{
                          fontFamily:     'Poppins, sans-serif',
                          fontSize:       13,
                          fontWeight:     400,
                          color:          'var(--ink-secondary)',
                          background:     'transparent',
                          border:         'none',
                          cursor:         'pointer',
                          padding:        '6px 14px',
                          letterSpacing:  '0.01em',
                          transition:     'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.55')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Sign in
                      </button>
                    </Link>
                    <Link to="/auth" style={{ textDecoration: 'none' }}>
                      <button
                        style={{
                          fontFamily:   'Poppins, sans-serif',
                          fontSize:     13,
                          fontWeight:   500,
                          color:        'white',
                          background:   'var(--accent-plum)',
                          border:       'none',
                          cursor:       'pointer',
                          padding:      '7px 18px',
                          borderRadius: 6,
                          letterSpacing: '0.01em',
                          transition:   'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Get started
                      </button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          style={{
            background:    'rgba(255, 252, 248, 0.97)',
            backdropFilter: 'blur(20px)',
            borderTop:     '1px solid rgba(180,155,130,0.12)',
          }}
        >
          <div style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column' }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  fontFamily:     'Poppins, sans-serif',
                  fontSize:       14,
                  fontWeight:     400,
                  color:          'var(--ink-secondary)',
                  textDecoration: 'none',
                  padding:        '11px 0',
                  borderBottom:   '1px solid rgba(180,155,130,0.08)',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
