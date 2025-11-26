import React, { useState, useEffect } from 'react';
import { VivlitLogo, PencilIcon, PlusCircleIcon, ShareIcon } from './icons';

interface LandingPageProps {
  onEnter: () => void;
  onGoToCreate: () => void;
}

const phrases = [
    "A secret place for your notes...",
    "A time capsule of memories...",
    "A heartfelt gift for someone special.",
];

const StepCard: React.FC<{ icon: React.FC<{className?: string}>, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-white/30 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50 text-left transition-all duration-300 hover:shadow-violet-500/20 hover:-translate-y-2">
        <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/30">
            <Icon className="w-8 h-8 text-pink-600" />
        </div>
        <h3 className="text-2xl font-bold text-purple-900 mb-3">{title}</h3>
        <p className="text-purple-800/90 leading-relaxed">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onGoToCreate }) => {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = phrases[phraseIndex];
        const timeout = setTimeout(() => {
            if (isDeleting) {
                if (typedText.length > 0) {
                    setTypedText(currentPhrase.substring(0, typedText.length - 1));
                } else {
                    setIsDeleting(false);
                    setPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
                }
            } else {
                if (typedText.length < currentPhrase.length) {
                    setTypedText(currentPhrase.substring(0, typedText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            }
        }, isDeleting ? 75 : 120);

        return () => clearTimeout(timeout);
    }, [typedText, isDeleting, phraseIndex]);

  return (
    <>
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="text-center max-w-3xl w-full z-10">
                <VivlitLogo className="w-full max-w-lg h-auto animate-logo-glow text-purple-800 mx-auto" />

                <p className="mt-8 text-xl md:text-2xl text-purple-800/90 max-w-2xl mx-auto h-16 flex items-center justify-center" style={{ textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>
                    <span className="border-r-2 border-purple-800/90 animate-blink">{typedText}</span>
                </p>
                
                <button
                onClick={onEnter}
                className="mt-12 px-10 py-4 bg-pink-500 text-white text-xl font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/60 focus:outline-none focus:ring-4 focus:ring-pink-400/50"
                >
                Begin Your Journey
                </button>
            </div>
        </div>
        
        <section className="py-24 px-4 text-center bg-white/10">
            <h2 className="text-4xl font-bold text-purple-900 mb-4">Three Simple Steps to Magic</h2>
            <p className="max-w-3xl mx-auto text-lg text-purple-800/90 mb-16">
                Create a timeless gift they can cherish forever, filled with memories and love.
            </p>
            <div className="container mx-auto grid md:grid-cols-3 gap-10 max-w-6xl">
                <StepCard icon={PencilIcon} title="1. Craft Your Jar" description="Give your jar a name and a heartfelt cover note to set the mood for the memories inside." />
                <StepCard icon={PlusCircleIcon} title="2. Fill with Memories" description="Add notes, photos, videos, and even voice messages. Each one a precious memory." />
                <StepCard icon={ShareIcon} title="3. Share the Love" description="Send a secret link to someone special, allowing them to open their personal jar of notes." />
            </div>
        </section>

        <section className="py-20 px-4 text-center">
            <h2 className="text-4xl font-bold text-purple-900 mb-4">Ready to Create Magic?</h2>
            <p className="max-w-2xl mx-auto text-lg text-purple-800/90 mb-8">
                Start your first jar right now. No account needed to begin creating.
            </p>
            <button
                onClick={onGoToCreate}
                className="px-10 py-4 bg-violet-500 text-white text-xl font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/60 focus:outline-none focus:ring-4 focus:ring-violet-400/50"
                >
                Make Your First Jar
            </button>
        </section>

        <footer className="text-center py-8 text-purple-700/80">
            <p>&copy; {new Date().getFullYear()} Vivlit. Made with love.</p>
        </footer>


        <style>{`
            .animate-logo-glow {
                animation: logo-glow 4s ease-in-out infinite;
            }

            @keyframes logo-glow {
                0%, 100% {
                    filter: drop-shadow(0 0 4px rgba(91, 33, 182, 0.4)) drop-shadow(0 0 8px rgba(219, 39, 119, 0.3));
                }
                50% {
                    filter: drop-shadow(0 0 8px rgba(91, 33, 182, 0.6)) drop-shadow(0 0 16px rgba(219, 39, 119, 0.5));
                }
            }

            @keyframes blink {
                50% { border-color: transparent; }
            }
            .animate-blink {
                animation: blink 0.8s step-end infinite;
            }
        `}</style>
    </>
  );
};

export default LandingPage;