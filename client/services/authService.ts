import { User } from '../types';
import { API } from './api';

const SESSION_KEY = 'vivlit_session_user';

// --- Public API ---

export const signUp = async (name: string, email: string, password: string): Promise<User> => {
  const response = await fetch(API.AUTH.SIGNUP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Signup failed');
  }

  const user = await response.json();
  // Transform _id to id
  const userToReturn = { ...user, id: user._id };
  delete userToReturn._id;

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(userToReturn));
  return userToReturn;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const response = await fetch(API.AUTH.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }

  const user = await response.json();
  // Transform _id to id
  const userToReturn = { ...user, id: user._id };
  delete userToReturn._id;

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(userToReturn));
  return userToReturn;
};

export const signOut = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = sessionStorage.getItem(SESSION_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const updateUser = async (updatedUser: User): Promise<User | null> => {
  // TODO: Implement backend update endpoint
  // For now, just update session storage to reflect changes locally
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};
