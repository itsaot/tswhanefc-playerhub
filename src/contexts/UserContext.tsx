
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { setupAdminSession } from '@/integrations/supabase/client';

export type UserContextType = {
  user: {
    username: string;
    role: 'admin' | 'user' | null;
  };
  setUser: React.Dispatch<React.SetStateAction<{
    username: string;
    role: 'admin' | 'user' | null;
  }>>;
  isAdmin: () => boolean;
  login: (username: string, role: 'admin' | 'user') => void;
  logout: () => void;
};

const defaultUser = {
  username: '',
  role: null as 'admin' | 'user' | null
};

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  isAdmin: () => false,
  login: () => {},
  logout: () => {}
});

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : defaultUser;
  });

  // Set up Supabase session when user changes
  useEffect(() => {
    // Make sure we're updating localStorage whenever user state changes
    localStorage.setItem('user', JSON.stringify(user));
    
    // If user has a role, set up admin session for Supabase
    if (user.role) {
      setupAdminSession(user.role, user.username);
    }
    
    // For debugging - log when user state changes
    console.log("User context updated:", user);
  }, [user]);

  const isAdmin = () => {
    // Make sure this is explicitly checking for 'admin' role
    return user.role === 'admin';
  };

  const login = (username: string, role: 'admin' | 'user') => {
    // Update user state
    const newUser = { username, role };
    setUser(newUser);
    
    // Set up Supabase session - make sure role is passed correctly
    setupAdminSession(role, username);
    
    console.log(`Logged in as ${role}: ${username}`);
  };

  const logout = () => {
    // Clear user state
    setUser(defaultUser);
    
    // Clear Supabase session
    setupAdminSession(null, '');
    
    console.log('Logged out');
  };

  return (
    <UserContext.Provider value={{ user, setUser, isAdmin, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
