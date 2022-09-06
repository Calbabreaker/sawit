import { createContext } from "react";

export interface IUserContext {
    uid: string;
    username?: string;
}

export const UserContext = createContext<IUserContext>(undefined);

export interface IVoteContext {
    upvotesState: [number, (upvotes: number) => void];
    voteChangeState: [number, (upvotes: number) => void];
    loadingState: [boolean, (loading: boolean) => void];
}

export const VoteContext = createContext<IVoteContext>(undefined);
