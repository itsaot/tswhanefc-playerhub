
import React, { createContext, useState, useEffect, ReactNode } from 'react';

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
};

const defaultUser = {
  username: '',
  role: null as 'admin' | 'user' | null
};

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  isAdmin: () => false
});

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : defaultUser;
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const isAdmin = () => user.role === 'admin';

  return (
    <UserContext.Provider value={{ user, setUser, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
};
