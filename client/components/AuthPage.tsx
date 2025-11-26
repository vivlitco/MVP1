import React, { useState } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';
import { VivlitBunny, VivlitLogo } from './icons';

interface AuthPageProps {
    onAuthSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            let user;
            if (isSignIn) {
                user = authService.signIn(email, password);
            } else {
                user = authService.signUp(name, email, password);
            }
            onAuthSuccess(user);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <VivlitBunny className="w-24 h-24 mx-auto" />
                    <VivlitLogo className="w-48 h-auto mx-auto mt-2 text-purple-800" />
                </div>

                <div className="bg-white/30 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/50">
                    <div className="border-b border-black/10 mb-6">
                        <div className="flex -mb-px space-x-6">
                            <button
                                onClick={() => setIsSignIn(true)}
                                className={`pb-3 text-lg font-bold transition-colors border-b-2 ${isSignIn ? 'border-pink-500 text-purple-900' : 'border-transparent text-purple-600 hover:text-purple-900'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsSignIn(false)}
                                className={`pb-3 text-lg font-bold transition-colors border-b-2 ${!isSignIn ? 'border-pink-500 text-purple-900' : 'border-transparent text-purple-600 hover:text-purple-900'}`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isSignIn && (
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-purple-800 mb-1">Name</label>
                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition placeholder:text-purple-500/80 text-purple-900" />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-purple-800 mb-1">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition placeholder:text-purple-500/80 text-purple-900" />
                        </div>
                         <div>
                            <label htmlFor="password"className="block text-sm font-medium text-purple-800 mb-1">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition placeholder:text-purple-500/80 text-purple-900" />
                        </div>

                        {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-lg text-center">{error}</p>}
                        
                        <div>
                            <button type="submit" className="w-full mt-2 px-8 py-3 bg-pink-500 text-white text-lg font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50">
                                {isSignIn ? 'Sign In' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
