import { User } from "firebase/auth";
import { createContext } from "react";

interface IUserContext {
    username: string;
    setUsername: (value: string) => void;
    user: User;
}

export const UserContext = createContext<IUserContext>(undefined);
