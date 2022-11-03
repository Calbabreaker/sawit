import { faArrowDown, faArrowUp, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { collection, getDocs, query, where } from "firebase/firestore";
import { VoteContext, UserContext } from "lib/utils";
import { database } from "lib/firebase";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";

interface Props {
    thread: string;
    postID: string;
    commentID?: string;
}

function shortenLength(n: number): string {
    const nstr = n.toString();
    let dp: number, unit: string;
    if (n > 999999) {
        dp = nstr.length - 6;
        unit = "M";
    } else if (n > 999) {
        dp = nstr.length - 3;
        unit = "k";
    } else {
        return nstr;
    }

    return `${nstr.substring(0, dp)}.${nstr.substring(dp, dp + 1)}${unit}`;
}

export const VoteCounter: React.FC<Props> = ({ thread, postID, commentID }) => {
    const userCtx = useContext(UserContext);
    const voteCtx = useContext(VoteContext);

    const [upvotes, setUpvotes] = voteCtx.upvotesState;
    const [voteChange, setVoteChange] = voteCtx.voteChangeState;
    const [loading, setLoading] = voteCtx.loadingState;

    async function getVoteDoc() {
        if (voteChange != null || loading) return;
        setLoading(true);

        const whereClause = commentID
            ? where("threadPostComment", "==", thread + postID + commentID)
            : where("threadPost", "==", thread + postID);

        const voteSnapshot = await getDocs(
            query(collection(database, `/users/${userCtx.uid}/votes`), whereClause)
        );

        setVoteChange(voteSnapshot.docs[0]?.get("change"));
        setLoading(false);
    }

    useEffect(() => {
        if (userCtx) getVoteDoc();
        else setVoteChange(null);
    }, [userCtx]);

    async function vote(e: React.MouseEvent, change: number) {
        e.stopPropagation();
        if (loading) return;
        if (!userCtx) return Router.push(`/login/?return=${Router.asPath}`);
        setLoading(true);

        // Compute vote change here since server api can't
        let newVoteChange = change;
        let inc = change;
        if (voteChange == change) {
            newVoteChange = null;
            inc *= -1;
        } else if (voteChange != null) inc *= 2;

        let url = `/api/vote?thread=${thread}&post=${postID}&change=${change}`;
        if (commentID) url += `&comment=${commentID}`;
        const res = await fetch(url, {
            method: change == voteChange ? "DELETE" : "PUT",
        });

        if (res.ok) {
            setUpvotes(upvotes + inc);
            setVoteChange(newVoteChange);
        } else {
            alert("Failed to vote!");
            const data = await res.text();
            console.error(data);
        }

        setLoading(false);
    }

    const arrowClass = `!block text-lg mx-auto border-transparent my-auto px-1 ${
        !loading && "hover:bg-gray-400/40 hover:cursor-pointer"
    }`;
    const selectedClass = "text-blue-500";

    return (
        <>
            <FontAwesomeIcon
                icon={faArrowUp}
                className={`${arrowClass} ${voteChange == 1 && selectedClass}`}
                onClick={(e) => vote(e, 1)}
            />
            {loading ? (
                <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-base my-1 mx-auto fa-spin !block"
                />
            ) : (
                <div className="text-center mx-0.5">{shortenLength(upvotes)}</div>
            )}
            <FontAwesomeIcon
                icon={faArrowDown}
                className={`${arrowClass} ${voteChange == -1 && selectedClass}`}
                onClick={(e) => vote(e, -1)}
            />
        </>
    );
};

interface VCHProps {
    upvotes: number;
    children: React.ReactNode;
}

export const VoteCtxHandler: React.FC<VCHProps> = ({ upvotes, children }) => {
    return (
        <VoteContext.Provider
            value={{
                upvotesState: useState(upvotes),
                voteChangeState: useState(undefined),
                loadingState: useState(false),
            }}
        >
            {children}
        </VoteContext.Provider>
    );
};
