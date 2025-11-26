import React from 'react';
import { VivlitBunny } from './icons';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onNavigateToProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigateToProfile }) => {
  return (
    <header className="bg-white/60 backdrop-blur-lg sticky top-0 z-30 border-b border-purple-100/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <VivlitBunny className="w-12 h-12" />
            <span className="text-3xl font-bold text-purple-700 tracking-tight">Vivlit</span>
          </div>
          <button onClick={onNavigateToProfile} className="flex items-center group rounded-full p-1 transition-colors hover:bg-purple-100/50">
            <span className="text-md text-gray-700 mr-4 hidden sm:block group-hover:text-purple-600 transition-colors">{user.name}</span>
            <img 
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md group-hover:border-pink-300 transition-colors"
              src={user.avatarUrl}
              alt="User Avatar"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
