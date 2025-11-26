import React from 'react';
import { User } from '../types';
import { VivlitLogo, HomeIcon, PlusCircleIcon } from './icons';

type View = 'HOME' | 'CREATE_JAR' | 'VIEW_JAR' | 'PROFILE';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: View) => void;
  isSharedView: boolean;
}

const NavLink: React.FC<{ icon: React.FC<{className?: string}>, text: string, onClick: () => void }> = ({ icon: Icon, text, onClick }) => (
    <button onClick={onClick} className="flex items-center gap-2 px-3 py-2 rounded-lg text-purple-700 hover:text-purple-900 bg-transparent hover:bg-white/40 transition-colors">
        <Icon className="w-6 h-6" />
        <span className="font-semibold hidden sm:inline">{text}</span>
    </button>
);

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, isSharedView }) => {
    if (isSharedView) {
        return (
             <nav className="bg-transparent fixed top-0 left-0 right-0 z-30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-24">
                        <VivlitLogo className="w-32 h-auto text-purple-800" />
                    </div>
                </div>
            </nav>
        )
    }
    
    if (!user) return null;

  return (
    <nav className="bg-white/30 backdrop-blur-xl fixed top-0 left-0 right-0 z-30 border-b border-white/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Left: Logo */}
          <button onClick={() => onNavigate('HOME')} className="flex items-center gap-3">
            <VivlitLogo className="w-32 h-auto text-purple-800" />
          </button>
          
          {/* Center: Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink icon={HomeIcon} text="Home" onClick={() => onNavigate('HOME')} />
            <NavLink icon={PlusCircleIcon} text="Create Jar" onClick={() => onNavigate('CREATE_JAR')} />
          </div>

          {/* Right: User Profile */}
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('PROFILE')} className="flex items-center group rounded-full p-1 transition-colors hover:bg-white/30">
              <span className="text-md text-purple-800 mr-4 hidden sm:block group-hover:text-purple-900 transition-colors">{user.name}</span>
              <img 
                className="h-12 w-12 rounded-full object-cover border-2 border-white/80 shadow-md group-hover:border-pink-300 transition-colors"
                src={user.avatarUrl}
                alt="User Avatar"
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
