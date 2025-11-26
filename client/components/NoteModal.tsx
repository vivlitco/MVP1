import React, { useEffect, useState } from 'react';
import { Note, NoteType } from '../types';
import { XMarkIcon, SparklesIcon } from './icons';

interface NoteModalProps {
  note: Note | null;
  onClose: () => void;
}

const Sparkle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <SparklesIcon
    className="absolute text-pink-500/80"
    style={{
      ...style,
      animation: `sparkle-magic 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
    }}
  />
);


const NoteModal: React.FC<NoteModalProps> = ({ note, onClose }) => {
  const [sparkles, setSparkles] = useState<{ id: number; style: React.CSSProperties }[]>([]);

  useEffect(() => {
    if (note) {
      const colors = ['#ec4899', '#f97316', '#8b5cf6', '#14b8a6'];
      const newSparkles = Array.from({ length: 25 }).map((_, i) => {
        const angle = (i / 25) * 2 * Math.PI;
        const radius = Math.random() * 60 + 100; 
        const driftX = Math.random() * 100 - 50;
        const driftY = Math.random() * 100 - 50;
        const finalScale = Math.random() * 0.6 + 0.8;

        return {
          id: i,
          style: {
            top: `calc(50% + ${Math.sin(angle) * radius}px)`,
            left: `calc(50% + ${Math.cos(angle) * radius}px)`,
            width: `${Math.floor(Math.random() * 14 + 10)}px`,
            height: `${Math.floor(Math.random() * 14 + 10)}px`,
            color: colors[i % colors.length],
            '--drift-x': `${driftX}px`,
            '--drift-y': `${driftY}px`,
            '--scale': finalScale,
            animationDelay: `${Math.random() * 0.4}s`,
          } as React.CSSProperties,
        };
      });
      setSparkles(newSparkles);
    } else {
      setSparkles([]);
    }
  }, [note]);

  if (!note) return null;

  const renderContent = () => {
    switch (note.type) {
      case NoteType.TEXT:
        return <p style={{fontFamily: "'Dancing Script', cursive"}} className="text-4xl text-purple-900/90 whitespace-pre-wrap leading-relaxed text-center p-4">{note.content}</p>;
      case NoteType.IMAGE:
        return <img src={note.content} alt="note content" className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-lg" />;
      case NoteType.VIDEO:
        return <video src={note.content} controls className="max-w-full max-h-[70vh] rounded-xl shadow-lg" />;
      case NoteType.AUDIO:
        return <audio src={note.content} controls className="w-full" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-fuchsia-100/30 backdrop-blur-xl flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-rose-50 to-white rounded-3xl shadow-2xl shadow-purple-200/50 border border-white/80 p-6 md:p-8 w-full max-w-lg relative transform transition-transform duration-300 animate-swoop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {sparkles.map(s => <Sparkle key={s.id} style={s.style} />)}
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-rose-100/50 rounded-full flex items-center justify-center text-purple-700 hover:text-purple-900 hover:scale-110 transition-all z-10 shadow-md border border-white/50"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>
        <div className="mt-4 min-h-[100px] flex items-center justify-center">
          {renderContent()}
        </div>
      </div>
       <style>{`
        @keyframes swoop-in {
          from { 
            transform: scale(0.8) rotate(-10deg); 
            opacity: 0; 
          }
          to { 
            transform: scale(1) rotate(0deg); 
            opacity: 1; 
          }
        }
        .animate-swoop-in {
          animation: swoop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes sparkle-magic {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.5;
          }
          20% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--drift-x)), calc(-50% + var(--drift-y))) scale(var(--scale));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default NoteModal;