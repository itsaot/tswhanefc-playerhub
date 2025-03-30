
import React, { createContext, Dispatch, SetStateAction, useState } from "react";

type User = {
  username: string;
  role: "admin" | "user" | null;
};

type UserContextType = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  isAdmin: () => boolean;
};

export const UserContext = createContext<UserContextType>({
  user: { username: "", role: null },
  setUser: () => {},
  isAdmin: () => false,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({ username: "demo", role: "user" });

  const isAdmin = () => user.role === "admin";

  return (
    <UserContext.Provider value={{ user, setUser, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
};
