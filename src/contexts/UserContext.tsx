
import { createContext, Dispatch, SetStateAction } from "react";

type User = {
  username: string;
  role: "admin" | "user" | null;
};

type UserContextType = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
};

export const UserContext = createContext<UserContextType>({
  user: { username: "", role: null },
  setUser: () => {},
});
