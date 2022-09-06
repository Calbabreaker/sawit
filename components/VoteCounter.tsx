import { faArrowDown, faArrowUp, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc, getDoc } from "firebase/firestore";
import { VoteContext, UserContext } from "lib/utils";
import { database } from "lib/firebase";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";

interface Props {
    itemDBPath: string;
    startUpvotes?: number;
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

export const VoteCounter: React.FC<Props> = ({ itemDBPath, startUpvotes }) => {
    const user = useContext(UserContext);
    const voteCtx = useContext(VoteContext);

    const [upvotes, setUpvotes] = voteCtx?.upvotesState ?? useState(startUpvotes);
    const [voteChange, setVoteChange] = voteCtx?.voteChangeState ?? useState<number>(null);

    const [loading, setLoading] = voteCtx?.loadingState ?? useState(true);

    async function checkVoteDoc() {
        const voteDoc = await getDoc(doc(database, `${itemDBPath}/votes/${user.uid}`));
        setVoteChange(voteDoc.data()?.change);
        setLoading(false);
    }

    useEffect(() => {
        user && voteChange == null ? checkVoteDoc() : setLoading(false);
    }, []);

    async function vote(e: React.MouseEvent, change: number) {
        e.stopPropagation();
        if (!user) return Router.push(`/login/?return=${Router.asPath}`);
        if (loading) return;
        setLoading(true);

        // Compute vote change here since server api can't
        let newVoteChange = change;
        let inc = change;
        if (voteChange == change) {
            newVoteChange = null;
            inc *= -1;
        } else if (voteChange != null) inc *= 2;

        const res = await fetch(`/api/vote?itemDBPath=${itemDBPath}&change=${change}`, {
            method: change == voteChange ? "DELETE" : "PUT",
        });

        if (res.ok) {
            setUpvotes(upvotes + inc);
            setVoteChange(newVoteChange);
        } else {
            alert("Failed to vote!");
        }

        setLoading(false);
    }

    const arrowClass = `!block text-lg mx-auto px-1 border-transparent ${
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
                <div className={`text-center mx-auto`}>{shortenLength(upvotes)}</div>
            )}
            <FontAwesomeIcon
                icon={faArrowDown}
                className={`${arrowClass} ${voteChange == -1 && selectedClass}`}
                onClick={(e) => vote(e, -1)}
            />
        </>
    );
};
