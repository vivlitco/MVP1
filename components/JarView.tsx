import React, { useState, useMemo, useEffect } from 'react';
import { Jar, Note, JarDirection } from '../types';
import NoteModal from './NoteModal';
import { ArrowLeftIcon, ShareIcon } from './icons';

const NoteInJar: React.FC<{
  note: Note;
  onClick: () => void;
  style: React.CSSProperties;
  isRevealed: boolean;
}> = ({ onClick, style, isRevealed }) => {
  const animatedStyle: React.CSSProperties = { 
    ...style,
    transition: 'all 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
  };

  if (isRevealed) {
    animatedStyle.transform = `translateY(-25px) ${style.transform || ''}`;
    animatedStyle.opacity = 0.3;
    animatedStyle.filter = 'grayscale(80%)';
  }

  return (
    <button
      onClick={onClick}
      style={animatedStyle}
      className="absolute w-20 h-16 bg-white/40 backdrop-blur-md rounded-lg shadow-lg transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-black/50 flex items-center justify-center p-1 border border-white/50 group"
    >
      <div className="absolute inset-0 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100" 
            style={{background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%)'}}>
      </div>
      <svg className="w-10 h-10 text-purple-700/70" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
      </svg>
    </button>
  );
};

interface JarViewProps {
  jar: Jar;
  onBack: () => void;
  onShare: (jar: Jar) => void;
  isSharedView: boolean;
}

const JarView: React.FC<JarViewProps> = ({ jar, onBack, onShare, isSharedView }) => {
  const [openedNote, setOpenedNote] = useState<Note | null>(null);
  const [revealedNotes, setRevealedNotes] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const notePositions = useMemo(() => {
    return jar.notes.map(() => ({
      top: `${Math.random() * 65 + 15}%`,
      left: `${Math.random() * 70 + 10}%`,
      transform: `rotate(${Math.random() * 40 - 20}deg)`,
    }));
  }, [jar.id]);

  const handleNoteClick = (note: Note) => {
    setOpenedNote(note);
    setRevealedNotes(prev => new Set(prev).add(note.id));
  };
  
  const unrevealedNotesCount = jar.notes.length - revealedNotes.size;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
       <div className="flex justify-between items-center mb-6">
        {!isSharedView ? (
           <button onClick={onBack} className="flex items-center text-purple-700 hover:text-purple-900 font-semibold transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Home
            </button>
        ) : <div />}
        
        {!isSharedView && jar.direction === JarDirection.SENT && (
            <button
                onClick={() => onShare(jar)}
                className="flex items-center px-5 py-2.5 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30"
            >
                <ShareIcon className="w-5 h-5 mr-2" />
                Share Jar
            </button>
        )}
       </div>

      <div className="text-center mb-8" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.1)' }}>
        <h2 className="text-4xl md:text-5xl font-bold text-purple-900">{jar.name}</h2>
        {isSharedView && <p className="mt-3 text-lg text-purple-800">A special jar from <span className="font-bold text-purple-900">{jar.senderName}</span></p>}
        <p className="mt-4 text-xl text-purple-800/90 italic max-w-2xl mx-auto">"{jar.coverNote}"</p>
         <p className="mt-6 text-purple-700 font-semibold text-lg">{unrevealedNotesCount} {unrevealedNotesCount === 1 ? 'note' : 'notes'} left to discover!</p>
      </div>
      
      <div className="relative w-full max-w-2xl mx-auto h-[500px] mt-10">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full relative">
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-violet-400 rounded-full blur-3xl animate-pulse-slow opacity-50"></div>
                <div 
                    className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent backdrop-blur-lg border-2 border-white/50 rounded-[60px] rounded-t-[100px]"
                    style={{
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                    }}
                ></div>
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-48 h-10 bg-white/30 backdrop-blur-sm rounded-full border-2 border-white/50 shadow-lg"></div>
            </div>
        </div>
        
        {isClient && jar.notes.map((note, index) => (
          <NoteInJar 
            key={note.id}
            note={note}
            onClick={() => handleNoteClick(note)}
            style={notePositions[index]}
            isRevealed={revealedNotes.has(note.id)}
          />
        ))}
      </div>

      <NoteModal note={openedNote} onClose={() => setOpenedNote(null)} />
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default JarView;