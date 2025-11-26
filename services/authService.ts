import { User } from '../types';

// In a real app, this would be a secure backend. For this demo, we use localStorage.
const USERS_KEY = 'vivlit_users';
const SESSION_KEY = 'vivlit_session_user';

// Helper to get all users from localStorage
const getUsers = (): (User & { password?: string })[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save users to localStorage
const saveUsers = (users: (User & { password?: string })[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// --- Public API ---

export const signUp = (name: string, email: string, password: string): User => {
  const users = getUsers();
  const lowercasedEmail = email.toLowerCase();

  if (users.some(u => u.email === lowercasedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const newUser: User & { password?: string } = {
    id: lowercasedEmail,
    name,
    email: lowercasedEmail,
    // Assign a random avatar on sign up
    avatarUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 300)}/100/100`,
    password, // Storing password in plain text - NOT FOR PRODUCTION
  };

  users.push(newUser);
  saveUsers(users);

  // Automatically sign in the user after they sign up
  const { password: _, ...userToReturn } = newUser;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(userToReturn));
  return userToReturn;
};

export const signIn = (email: string, password: string): User => {
  const users = getUsers();
  const lowercasedEmail = email.toLowerCase();
  const user = users.find(u => u.email === lowercasedEmail);

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  const { password: _, ...userToReturn } = user;
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

export const updateUser = (updatedUser: User): User | null => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if(userIndex === -1) {
        return null;
    }

    // Keep the password from the old record
    const password = users[userIndex].password;
    users[userIndex] = { ...updatedUser, password };
    saveUsers(users);

    // Update session storage as well
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
};
