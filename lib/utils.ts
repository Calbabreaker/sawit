import { GetServerSideProps } from "next";
import { createContext, useState } from "react";

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

interface ItemOptionsHook {
    deleting: boolean;
    editing: boolean;
    setEditing: (v: boolean) => void;
    deletePost: (e: React.MouseEvent) => void;
}

export function useItemOptions(onDelete: () => void, itemDBPath: string): ItemOptionsHook {
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);

    async function deletePost(e: React.MouseEvent) {
        e.stopPropagation();
        if (confirm("Are you sure want to delete it?")) {
            setDeleting(true);
            const res = await fetch(itemDBPath, { method: "DELETE" });
            if (!res.ok) {
                setDeleting(false);
                console.error(await res.text());
                alert("Failed to delete!");
            } else {
                onDelete();
            }
        }
    }

    return { deleting, setEditing, editing, deletePost };
}

export function makeAuthRedirectSSR(
    requireAuth: boolean,
    onOK?: GetServerSideProps
): GetServerSideProps {
    return async (ctx) => {
        const { req, query, resolvedUrl } = ctx;
        const isLoggedIn = Boolean(req.cookies.userToken);

        if (requireAuth ? !isLoggedIn : isLoggedIn) {
            const returnURL = (query.return as string) || "/";
            return {
                redirect: {
                    permanent: false,
                    destination: requireAuth ? `/login?return=${resolvedUrl}` : returnURL,
                },
            };
        } else {
            if (onOK) return onOK(ctx);
            else return { props: {} };
        }
    };
}
