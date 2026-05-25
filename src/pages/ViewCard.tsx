import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { fireGrandReveal, fireAmbientShimmer } from '@/lib/confetti';
import MagicSparkles from '@/components/ui/MagicSparkles';
import { JAR_THEMES } from '@/lib/themes';
import { Sparkles } from 'lucide-react';

const COVER_PRESETS: Record<string, { emoji: string; label: string }> = {
  floral: { emoji: '💐', label: 'Floral Bouquet' },
  hearts: { emoji: '💕', label: 'Love Hearts' },
  stars: { emoji: '🌟', label: 'Starry Night' },
  balloons: { emoji: '🎈', label: 'Balloons' },
  cake: { emoji: '🎂', label: 'Celebration' },
  butterfly: { emoji: '🦋', label: 'Butterflies' },
  sunset: { emoji: '🌅', label: 'Sunset' },
  rainbow: { emoji: '🌈', label: 'Rainbow' },
  sparkles: { emoji: '✨', label: 'Sparkles' },
};

interface CardData {
  id: string;
  cover_preset: string;
  theme: string;
  message: string;
  audio_url: string | null;
  cover_image_url: string | null;
  sender_name: string | null;
  recipient_name: string | null;
  is_opened: boolean;
}

const ViewCard = () => {
  const { token } = useParams<{ token: string }>();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'envelope' | 'breaking' | 'opening' | 'letter'>('envelope');
  const shimmerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!token) return;
      const { data, error } = await supabase
        .from('cards')
        .select('id, cover_preset, theme, message, audio_url, cover_image_url, sender_name, recipient_name, is_opened')
        .eq('share_token', token)
        .maybeSingle();

      if (error) console.error('Error fetching card:', error);
      if (data) {
        setCard(data);
        if (data.is_opened) setPhase('letter');
      }
      setLoading(false);
    };
    fetchCard();
  }, [token]);

  // Ambient shimmer on envelope phase
  useEffect(() => {
    if (phase === 'envelope') {
      shimmerRef.current = setInterval(() => fireAmbientShimmer(), 3000);
    }
    return () => {
      if (shimmerRef.current) clearInterval(shimmerRef.current);
    };
  }, [phase]);

  const handleOpen = async () => {
    if (phase !== 'envelope') return;
    
    // Phase 1: seal breaks
    setPhase('breaking');
    
    // Phase 2: flap opens
    setTimeout(() => setPhase('opening'), 800);
    
    // Phase 3: letter appears
    setTimeout(() => {
      setPhase('letter');
      fireGrandReveal();
    }, 2200);

    if (card && !card.is_opened) {
      await supabase.from('cards').update({ is_opened: true }).eq('id', card.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-6xl mb-4">💌</p>
          <h1 className="font-heading text-2xl font-bold text-foreground">Card not found</h1>
          <p className="text-muted-foreground mt-2">This card may have been removed.</p>
        </div>
      </div>
    );
  }

  const themeData = JAR_THEMES.find(t => t.id === card.theme) || JAR_THEMES[0];
  const preset = COVER_PRESETS[card.cover_preset] || COVER_PRESETS.floral;

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 50%, hsl(var(--muted)) 100%)',
      }}
    >
      <MagicSparkles count={20} />

      {/* Ambient glow orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${themeData.jarColor}40, transparent)` }}
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-15 blur-3xl top-20 right-20"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent)' }}
        animate={{ x: [0, -25, 20, 0], y: [0, 15, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, hsl(var(--foreground) / 0.1) 20px, hsl(var(--foreground) / 0.1) 21px)`,
        }}
      />

      <AnimatePresence mode="wait">
        {/* ───── ENVELOPE PHASE ───── */}
        {phase !== 'letter' && (
          <motion.div
            key="envelope"
            className="relative cursor-pointer group"
            onClick={handleOpen}
            exit={{ opacity: 0, y: -120, scale: 0.6, rotateX: 30, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } }}
            style={{ perspective: '1200px' }}
          >
            <EnvelopeView
              preset={preset}
              themeData={themeData}
              card={card}
              phase={phase}
            />
          </motion.div>
        )}

        {/* ───── LETTER PHASE ───── */}
        {phase === 'letter' && (
          <motion.div
            key="letter"
            className="w-full max-w-xl"
            initial={{ opacity: 0, y: 120, scale: 0.7, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 12, delay: 0.15 }}
          >
            <LetterView card={card} themeData={themeData} preset={preset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════ Envelope Component ═══════ */
const EnvelopeView = ({
  preset,
  themeData,
  card,
  phase,
}: {
  preset: { emoji: string };
  themeData: { jarColor: string; colors: string };
  card: CardData;
  phase: string;
}) => {
  const sealScale = useMotionValue(1);
  const sealOpacity = useTransform(sealScale, [1, 0], [1, 0]);
  
  return (
    <>
      <div className="relative">
        <motion.div
          className="relative w-[340px] sm:w-[420px] overflow-hidden rounded-sm"
          style={{
            aspectRatio: '16/10',
            background: `linear-gradient(145deg, hsl(35, 30%, 92%) 0%, hsl(35, 25%, 88%) 40%, hsl(30, 20%, 85%) 100%)`,
            boxShadow: `
              0 8px 32px hsl(var(--foreground) / 0.12),
              0 2px 8px hsl(var(--foreground) / 0.08),
              inset 0 1px 0 hsl(35, 40%, 96%)
            `,
          }}
          whileHover={phase === 'envelope' ? { scale: 1.03, y: -6, boxShadow: '0 20px 50px hsl(var(--foreground) / 0.18)' } : undefined}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Paper grain */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Diagonal lining */}
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(45deg, transparent, transparent 14px, hsl(210, 30%, 70% / 0.05) 14px, hsl(210, 30%, 70% / 0.05) 15px)`,
            }}
          />

          {/* Address area */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
            {card.recipient_name && (
              <motion.p
                className="font-script text-2xl sm:text-3xl text-foreground/70 mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                {card.recipient_name}
              </motion.p>
            )}
            {card.sender_name && (
              <motion.p
                className="text-sm text-muted-foreground italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                from {card.sender_name}
              </motion.p>
            )}
            <div className="mt-5 space-y-2.5 w-3/5">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="h-px rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, hsl(var(--foreground) / 0.12) 20%, hsl(var(--foreground) / 0.12) 80%, transparent 100%)`,
                    width: `${100 - i * 15}%`,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Stamp with gentle wobble */}
          <motion.div
            className="absolute top-4 right-4 w-14 h-16 rounded-[2px] z-20 flex items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${themeData.jarColor}dd, ${themeData.jarColor})`,
              border: `2px solid hsl(var(--foreground) / 0.1)`,
              boxShadow: `0 1px 3px hsl(var(--foreground) / 0.1)`,
            }}
            initial={{ rotate: 2, scale: 0 }}
            animate={{ rotate: [2, -1, 2], scale: 1 }}
            transition={{ rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.4, delay: 0.2, type: 'spring' } }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle, hsl(var(--background)) 1.5px, transparent 1.5px)`,
                backgroundSize: '6px 6px',
                backgroundPosition: '-1px -1px',
                mask: `
                  linear-gradient(to right, black 3px, transparent 3px, transparent calc(100% - 3px), black calc(100% - 3px)),
                  linear-gradient(to bottom, black 3px, transparent 3px, transparent calc(100% - 3px), black calc(100% - 3px))
                `,
                WebkitMask: `
                  linear-gradient(to right, black 3px, transparent 3px, transparent calc(100% - 3px), black calc(100% - 3px)),
                  linear-gradient(to bottom, black 3px, transparent 3px, transparent calc(100% - 3px), black calc(100% - 3px))
                `,
              }}
            />
            <span className="text-2xl relative z-10">{preset.emoji}</span>
          </motion.div>

          {/* Return address */}
          {card.sender_name && (
            <div className="absolute top-4 left-5 z-10">
              <p className="text-[10px] text-foreground/40 font-medium tracking-wide uppercase">From</p>
              <p className="text-xs text-foreground/50 font-script text-base">{card.sender_name}</p>
            </div>
          )}

          {/* Theme accent */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${themeData.colors} opacity-40`} />
        </motion.div>

        {/* Wax seal - positioned OUTSIDE the overflow-hidden envelope */}
        <motion.div
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center"
          animate={
            phase === 'breaking'
              ? { scale: [1, 1.3, 0], rotate: [0, 15, -30], opacity: [1, 0.8, 0] }
              : phase === 'envelope'
              ? { scale: [1, 1.05, 1] }
              : {}
          }
          transition={
            phase === 'breaking'
              ? { duration: 0.7, ease: 'easeOut' }
              : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center relative"
            style={{
              background: `radial-gradient(circle at 35% 35%, hsl(0, 50%, 48%), hsl(0, 55%, 35%))`,
              boxShadow: `0 3px 10px hsl(0, 50%, 30% / 0.4), inset 0 1px 2px hsl(0, 50%, 60% / 0.3)`,
            }}
          >
            <span className="text-white/90 font-heading text-lg font-bold select-none">V</span>
            <motion.div
              className="absolute inset-[-3px] rounded-full"
              style={{ border: `2px solid ${themeData.jarColor}60` }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      {/* "Tap to open" with pulsing */}
      {phase === 'envelope' && (
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.p
            className="text-sm text-muted-foreground font-medium"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            Tap to break the seal ✉️
          </motion.p>
          <motion.div
            className="mx-auto mt-3 w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1], borderColor: ['hsl(var(--primary) / 0.2)', 'hsl(var(--primary) / 0.5)', 'hsl(var(--primary) / 0.2)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-primary/50"
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Opening flap animation */}
      {phase === 'opening' && (
        <motion.div
          className="absolute -top-1 left-0 right-0 z-30"
          initial={{ rotateX: 0 }}
          animate={{ rotateX: 180 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: 'top center', perspective: '800px' }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '210px solid transparent',
              borderRight: '210px solid transparent',
              borderTop: `85px solid hsl(35, 22%, 82%)`,
              margin: '0 auto',
            }}
          />
        </motion.div>
      )}
    </>
  );
};

/* ═══════ Letter Component ═══════ */
const LetterView = ({
  card,
  themeData,
  preset,
}: {
  card: CardData;
  themeData: { colors: string; jarColor: string };
  preset: { emoji: string };
}) => (
  <div
    className="relative rounded-sm overflow-hidden"
    style={{
      background: `linear-gradient(180deg, hsl(40, 30%, 97%) 0%, hsl(35, 25%, 95%) 100%)`,
      boxShadow: `
        0 20px 60px hsl(var(--foreground) / 0.16),
        0 6px 16px hsl(var(--foreground) / 0.08),
        inset 0 1px 0 hsl(40, 50%, 99%)
      `,
    }}
  >
    {/* Paper texture */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />

    {/* Ruled lines */}
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 31px, hsl(210, 40%, 70%) 31px, hsl(210, 40%, 70%) 32px)`,
        backgroundPositionY: '60px',
      }}
    />

    {/* Red margin */}
    <div className="absolute top-0 bottom-0 left-16 w-px opacity-10" style={{ background: 'hsl(0, 60%, 55%)' }} />

    {/* Header strip */}
    <div className={`h-2 bg-gradient-to-r ${themeData.colors}`} />

    {/* Content */}
    <div className="p-8 sm:p-10 pl-20 sm:pl-24 relative z-10">
      {/* Greeting - staggered word reveal */}
      {card.recipient_name && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className="mb-6"
        >
          <p className="font-script text-2xl sm:text-3xl text-foreground/80">
            Dear {card.recipient_name},
          </p>
        </motion.div>
      )}

      {/* Message - fade in line by line */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <p
          className="text-foreground/85 whitespace-pre-wrap leading-[32px] text-base sm:text-lg"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {card.message}
        </p>
      </motion.div>

      {/* Image */}
      {card.cover_image_url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="mt-6 rounded-lg overflow-hidden border border-foreground/5 shadow-md"
        >
          <img src={card.cover_image_url} alt="Card photo" className="w-full max-h-64 object-cover" />
        </motion.div>
      )}

      {/* Audio */}
      {card.audio_url && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 pt-4 border-t border-foreground/5"
        >
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🎵
            </motion.span>
            A voice note for you
          </p>
          <audio src={card.audio_url} controls className="w-full max-w-xs" />
        </motion.div>
      )}

      {/* Signature */}
      {card.sender_name && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, type: 'spring' }}
          className="mt-8 text-right"
        >
          <p className="text-muted-foreground text-sm mb-1">With love,</p>
          <motion.p
            className="font-script text-3xl text-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          >
            {card.sender_name}
          </motion.p>
        </motion.div>
      )}

      {/* Decorative divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="mt-8 flex items-center justify-center gap-3"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-foreground/10" />
        <motion.span
          className="text-xl opacity-30"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦
        </motion.span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-foreground/10" />
      </motion.div>
    </div>

    {/* Bottom strip */}
    <div className={`h-1.5 bg-gradient-to-r ${themeData.colors} opacity-60`} />
  </div>
);

export default ViewCard;
