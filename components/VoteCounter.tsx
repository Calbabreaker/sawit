import { faArrowDown, faArrowUp, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { collection, doc, increment, getDoc, writeBatch } from "firebase/firestore";
import { UserContext } from "lib/context";
import { database } from "lib/firebase";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";

interface Props {
    upvotes: number;
    thread: string;
    postID: string;
}

export const VoteCounter: React.FC<Props> = ({ upvotes: startUpvotes, thread, postID }) => {
    const [upvotes, setUpvotes] = useState(startUpvotes);
    const user = useContext(UserContext);
    const [voteChange, setVoteChange] = useState<number>(null);
    const [loading, setLoading] = useState(true);

    async function checkVoteDoc() {
        const voteDoc = await getDoc(
            doc(database, `/threads/${thread}/posts/${postID}/votes/${user.uid}`)
        );

        setVoteChange(voteDoc.data()?.change);
        setLoading(false);
    }

    useEffect(() => {
        user ? checkVoteDoc() : setLoading(false);
    }, []);

    async function vote(change: number) {
        if (!user) return Router.push(`/login/?return=${Router.asPath}`);
        if (loading) return;
        setLoading(true);

        let newVoteChange = change;
        let inc = change;
        if (voteChange == change) {
            newVoteChange = null;
            inc *= -1;
        } else if (voteChange != null) inc *= 2;

        const res = await fetch(`/api/vote?thread=${thread}&post=${postID}&change=${change}`, {
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

    const arrowClass = `block mx-auto text-base px-1 border border-dashed border-transparent ${
        !loading && "hover:border-gray-500 hover:cursor-pointer"
    }`;
    const selectedClass = "text-blue-500";

    return (
        <>
            <FontAwesomeIcon
                icon={faArrowUp}
                className={`${arrowClass} ${voteChange == 1 && selectedClass}`}
                onClick={() => vote(1)}
            />

            {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="text-sm px-1 fa-spin" />
            ) : (
                <div className="text-center mx-auto">{upvotes}</div>
            )}
            <FontAwesomeIcon
                icon={faArrowDown}
                className={`${arrowClass} ${voteChange == -1 && selectedClass}`}
                onClick={() => vote(-1)}
            />
        </>
    );
};
