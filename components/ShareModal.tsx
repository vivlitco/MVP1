import React, { useState } from 'react';
import { Jar } from '../types';
import { XMarkIcon, ClipboardIcon, CheckIcon, ShareIcon } from './icons';

interface ShareModalProps {
  jar: Jar;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ jar, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${window.location.pathname}?jarId=${jar.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/30 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md relative transform transition-transform duration-300 scale-95 animate-scale-in border border-white/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-purple-800 hover:text-purple-900 hover:scale-110 transition-all z-10 shadow-lg border border-white/50"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-pink-500/20 border border-pink-500/30">
                <ShareIcon className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="mt-4 text-3xl font-bold text-purple-900">Share Your Jar!</h3>
            <p className="mt-2 text-purple-800">Send this link to <span className="font-bold text-purple-900">{jar.recipientName}</span> to let them open their jar of notes.</p>
        </div>

        <div className="mt-6">
            <label htmlFor="share-link" className="sr-only">Share Link</label>
            <div className="flex rounded-lg shadow-sm">
                 <input
                    id="share-link"
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="block w-full flex-1 rounded-none rounded-l-lg bg-white/50 border border-black/20 text-purple-900 px-3 py-2 focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                 />
                 <button
                    type="button"
                    onClick={handleCopy}
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-lg border border-black/20 bg-gray-200 px-4 py-2 text-sm font-medium text-purple-800 hover:bg-gray-300 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                 >
                    {copied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardIcon className="h-5 w-5 text-purple-700" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                 </button>
            </div>
        </div>

      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ShareModal;