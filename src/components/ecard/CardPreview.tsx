import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COVER_PRESETS = [
  { id: 'floral', label: 'Floral Bouquet', emoji: '💐' },
  { id: 'hearts', label: 'Love Hearts', emoji: '💕' },
  { id: 'stars', label: 'Starry Night', emoji: '🌟' },
  { id: 'balloons', label: 'Balloons', emoji: '🎈' },
  { id: 'cake', label: 'Celebration', emoji: '🎂' },
  { id: 'butterfly', label: 'Butterflies', emoji: '🦋' },
  { id: 'sunset', label: 'Sunset', emoji: '🌅' },
  { id: 'rainbow', label: 'Rainbow', emoji: '🌈' },
  { id: 'sparkles', label: 'Sparkles', emoji: '✨' },
];

export { COVER_PRESETS };

interface CardPreviewProps {
  coverPreset: string;
  theme: { id: string; label: string; colors: string; jarColor: string };
  message: string;
  senderName: string;
  recipientName: string;
  audioUrl: string | null;
  imageUrl?: string | null;
}

const CardPreview = ({
  coverPreset,
  theme,
  message,
  senderName,
  recipientName,
  audioUrl,
  imageUrl,
}: CardPreviewProps) => {
  const [showLetter, setShowLetter] = useState(false);
  const preset = COVER_PRESETS.find(p => p.id === coverPreset) || COVER_PRESETS[0];

  return (
    <div className="bg-gradient-to-br from-muted/40 to-background rounded-2xl p-5 sm:p-6 border border-border/30 shadow-soft">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <button
          onClick={() => setShowLetter(false)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            !showLetter
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ✉️ Envelope
        </button>
        <button
          onClick={() => setShowLetter(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            showLetter
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          📝 Letter
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showLetter ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, rotateY: -10 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            <EnvelopePreview
              preset={preset}
              theme={theme}
              senderName={senderName}
              recipientName={recipientName}
            />
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, rotateY: 10 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -10 }}
            transition={{ duration: 0.3 }}
          >
            <LetterPreview
              theme={theme}
              preset={preset}
              message={message}
              senderName={senderName}
              recipientName={recipientName}
              audioUrl={audioUrl}
              imageUrl={imageUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs text-muted-foreground mt-4">
        {showLetter ? 'This is what your recipient will read' : 'This is what your recipient will see first'}
      </p>
    </div>
  );
};

/* ── Envelope ── */
const EnvelopePreview = ({
  preset,
  theme,
  senderName,
  recipientName,
}: {
  preset: { emoji: string };
  theme: { jarColor: string; colors: string };
  senderName: string;
  recipientName: string;
}) => (
  <div
    className="relative w-full max-w-sm rounded-sm overflow-hidden"
    style={{
      aspectRatio: '16/10',
      background: `linear-gradient(145deg, hsl(35, 30%, 92%) 0%, hsl(35, 25%, 88%) 40%, hsl(30, 20%, 85%) 100%)`,
      boxShadow: `0 6px 24px hsl(var(--foreground) / 0.1), inset 0 1px 0 hsl(35, 40%, 96%)`,
    }}
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

    {/* Address */}
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
      {recipientName ? (
        <p className="font-script text-xl sm:text-2xl text-foreground/70 mb-0.5">{recipientName}</p>
      ) : (
        <p className="font-script text-xl text-foreground/25 italic">Recipient name</p>
      )}
      {senderName && (
        <p className="text-xs text-muted-foreground italic">from {senderName}</p>
      )}
      <div className="mt-4 space-y-2 w-3/5">
        {[1, 2].map(i => (
          <div
            key={i}
            className="h-px rounded-full mx-auto"
            style={{
              background: `linear-gradient(90deg, transparent 0%, hsl(var(--foreground) / 0.1) 20%, hsl(var(--foreground) / 0.1) 80%, transparent 100%)`,
              width: `${100 - i * 20}%`,
            }}
          />
        ))}
      </div>
    </div>

    {/* Stamp */}
    <div
      className="absolute top-3 right-3 w-10 h-12 rounded-[2px] z-20 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${theme.jarColor}dd, ${theme.jarColor})`,
        border: `1.5px solid hsl(var(--foreground) / 0.08)`,
      }}
    >
      <span className="text-lg">{preset.emoji}</span>
    </div>

    {/* Return address */}
    {senderName && (
      <div className="absolute top-3 left-4 z-10">
        <p className="text-[8px] text-foreground/30 uppercase tracking-wider">From</p>
        <p className="text-[10px] text-foreground/40 font-script text-sm">{senderName}</p>
      </div>
    )}

    {/* Theme accent line at bottom */}
    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors} opacity-40`} />
  </div>
);

/* ── Letter ── */
const LetterPreview = ({
  theme,
  preset,
  message,
  senderName,
  recipientName,
  audioUrl,
  imageUrl,
}: {
  theme: { colors: string; jarColor: string };
  preset: { emoji: string };
  message: string;
  senderName: string;
  recipientName: string;
  audioUrl: string | null;
  imageUrl?: string | null;
}) => (
  <div
    className="relative rounded-sm overflow-hidden"
    style={{
      background: `linear-gradient(180deg, hsl(40, 30%, 97%) 0%, hsl(35, 25%, 95%) 100%)`,
      boxShadow: `0 6px 24px hsl(var(--foreground) / 0.1), inset 0 1px 0 hsl(40, 50%, 99%)`,
    }}
  >
    {/* Ruled lines */}
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, hsl(210, 40%, 70%) 27px, hsl(210, 40%, 70%) 28px)`,
        backgroundPositionY: '40px',
      }}
    />
    {/* Red margin */}
    <div className="absolute top-0 bottom-0 left-10 w-px opacity-10" style={{ background: 'hsl(0, 60%, 55%)' }} />

    {/* Theme strip */}
    <div className={`h-1.5 bg-gradient-to-r ${theme.colors}`} />

    <div className="p-5 pl-14 relative z-10 min-h-[240px]">
      {recipientName ? (
        <p className="font-script text-lg text-foreground/70 mb-3">Dear {recipientName},</p>
      ) : (
        <p className="font-script text-lg text-foreground/25 italic mb-3">Dear recipient,</p>
      )}
      <p
        className="text-foreground/80 whitespace-pre-wrap leading-7 text-sm"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {message || (
          <span className="text-muted-foreground/40 italic">Your heartfelt message will appear here as you type...</span>
        )}
      </p>
      {imageUrl && (
        <div className="mt-4 rounded-lg overflow-hidden border border-border/20">
          <img src={imageUrl} alt="Card photo" className="w-full max-h-32 object-cover" />
        </div>
      )}
      {audioUrl && (
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
          🎵 Voice note attached
        </p>
      )}
      {senderName ? (
        <div className="mt-6 text-right">
          <p className="text-xs text-muted-foreground">With love,</p>
          <p className="font-script text-xl text-primary">{senderName}</p>
        </div>
      ) : (
        <div className="mt-6 text-right">
          <p className="text-xs text-muted-foreground/40 italic">Your signature</p>
        </div>
      )}

    </div>

    <div className={`h-1 bg-gradient-to-r ${theme.colors} opacity-50`} />
  </div>
);

export default CardPreview;
