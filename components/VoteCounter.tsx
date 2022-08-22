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
        if (!user) return;
        const voteDoc = await getDoc(
            doc(database, `/threads/${thread}/posts/${postID}/votes/${user.uid}`)
        );

        setVoteChange(voteDoc.data()?.change);
    }

    useEffect(() => {
        checkVoteDoc().then(() => setLoading(false));
    }, []);

    async function vote(change: number) {
        if (!user) return Router.push(`/login/?return=${Router.asPath}`);
        if (loading) return;
        setLoading(true);

        const batch = writeBatch(database);
        const postRef = doc(database, `/threads/${thread}/posts/${postID}`);
        const voteRef = doc(collection(postRef, "votes"), user.uid);

        let newVoteChange = change;
        if (voteChange == change) {
            newVoteChange = null;
            batch.delete(voteRef);
            change *= -1;
        } else {
            batch.set(voteRef, { change });
            if (voteChange != null) change *= 2;
        }

        batch.update(postRef, { upvotes: increment(change) });
        try {
            await batch.commit();
            setUpvotes(upvotes + change);
            setVoteChange(newVoteChange);
        } catch (err) {
            alert("Failed to vote!");
            console.error(err);
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
            <div className="text-center mx-auto">{upvotes}</div>
            <FontAwesomeIcon
                icon={faArrowDown}
                className={`${arrowClass} ${voteChange == -1 && selectedClass}`}
                onClick={() => vote(-1)}
            />
            {loading && <FontAwesomeIcon icon={faSpinner} className="text-sm px-1 fa-spin" />}
        </>
    );
};
