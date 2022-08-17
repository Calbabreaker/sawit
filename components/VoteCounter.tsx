import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc, getDoc } from "firebase/firestore";
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
    const [isVoteUp, setIsVoteUp] = useState(null);

    async function checkVoteDoc() {
        const voteDoc = await getDoc(
            doc(database, `/threads/${thread}/posts/${postID}/votes/${user.uid}`)
        );

        // If user voted before loaded
        if (isVoteUp != null) {
            setIsVoteUp(voteDoc.data()?.up);
        }
    }

    useEffect(() => {
        if (user) {
            checkVoteDoc();
        }
    }, []);

    async function vote(isUp: boolean) {
        if (!user) return Router.push("/login");

        let inc = isUp ? 1 : -1;
        const method = isUp === isVoteUp ? "DELETE" : "PUT";
        const res = await fetch(`/api/vote?thread=${thread}&postID=${postID}&up=${inc}`, {
            method,
        });

        if (!res.ok) {
            const data = await res.json();
            console.error(data);
            alert("Failed to vote!");
        } else {
            if (method === "PUT") {
                if (isVoteUp != null) inc *= 2; // Opposite so multiply by 2 to match
                setUpvotes(upvotes + inc);
                setIsVoteUp(isUp);
            } else {
                setUpvotes(upvotes - inc);
                setIsVoteUp(null);
            }
        }
    }

    const arrowClass =
        "block mx-auto text-base hover:border-gray-500 hover:cursor-pointer px-1 border border-dashed border-transparent";
    const selectedClass = "text-blue-500";

    return (
        <>
            <FontAwesomeIcon
                icon={faArrowUp}
                className={`${arrowClass} ${isVoteUp != null && isVoteUp ? selectedClass : ""}`}
                onClick={() => vote(true)}
            />
            <div className="text-center mx-auto">{upvotes}</div>
            <FontAwesomeIcon
                icon={faArrowDown}
                className={`${arrowClass} ${isVoteUp != null && !isVoteUp ? selectedClass : ""}`}
                onClick={() => vote(false)}
            />
        </>
    );
};
