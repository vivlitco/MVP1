import React, { useState } from 'react';
import { User } from '../types';
import { CameraIcon } from './icons';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onSignOut: () => void;
}

const avatars = [
  'https://picsum.photos/id/237/100/100',
  'https://picsum.photos/id/1027/100/100',
  'https://picsum.photos/id/1011/100/100',
  'https://picsum.photos/id/1005/100/100',
  'https://picsum.photos/id/103/100/100',
];

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, onBack, onSignOut }) => {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  const handleAvatarChange = () => {
    const currentIndex = avatars.indexOf(avatarUrl);
    const nextIndex = (currentIndex + 1) % avatars.length;
    setAvatarUrl(avatars[nextIndex]);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    onUpdateUser({ ...user, name: name.trim(), avatarUrl });
  };
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="bg-white/30 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-lg border border-white/50">
        <h2 className="text-4xl font-bold text-purple-900 mb-8">Your Profile</h2>

        <div className="flex flex-col items-center space-y-8">
          <div className="relative">
            <img src={avatarUrl} alt="Current Avatar" className="w-40 h-40 rounded-full object-cover border-4 border-white/50 shadow-lg" />
            <button 
              onClick={handleAvatarChange} 
              className="absolute bottom-1 right-1 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition-all transform hover:scale-110 shadow-md border-2 border-white"
              aria-label="Change avatar"
            >
                <CameraIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full">
            <label htmlFor="userName" className="block text-lg font-medium text-purple-800 mb-2">Your Name</label>
            <input
              id="userName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Jane Doe"
              className="w-full p-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition placeholder:text-purple-500/80 text-purple-900"
            />
          </div>

          <div className="w-full pt-4 space-y-4">
            <button onClick={handleSave} className="w-full px-8 py-3 bg-pink-500 text-white text-lg font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50">
              Save Changes
            </button>
            <button onClick={onSignOut} className="w-full px-8 py-3 bg-black/10 text-purple-800 font-bold rounded-full hover:bg-black/20 transition-all transform hover:scale-105">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
