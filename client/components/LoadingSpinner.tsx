import React from 'react';
import { VivlitBunny } from './icons';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <VivlitBunny className="w-24 h-24 animate-bounce-slow" />
      <p className="mt-4 text-purple-800 font-semibold">Generating magic...</p>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-8%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;