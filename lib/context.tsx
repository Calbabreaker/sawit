import { createContext } from "react";

export interface IUserContext {
    uid: string;
    username?: string;
}

export const UserContext = createContext<IUserContext>(undefined);
