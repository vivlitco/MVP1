import React from 'react';
import { XMarkIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

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
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 border border-red-500/30">
              <svg className="h-8 w-8 text-red-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 className="mt-4 text-3xl font-bold text-purple-900">{title}</h3>
            <p className="mt-2 text-purple-800">{message}</p>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
            <button onClick={onClose} className="px-6 py-2.5 bg-black/10 text-purple-800 font-bold rounded-full hover:bg-black/20 transition-all transform hover:scale-105">
                Cancel
            </button>
            <button onClick={onConfirm} className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-full hover:bg-red-500 transition-all transform hover:scale-105 shadow-lg shadow-red-500/30 hover:shadow-red-500/50">
                Delete
            </button>
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

export default ConfirmationModal;