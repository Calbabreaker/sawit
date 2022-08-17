import Link from "next/link";
import { PostData } from "lib/types";
import { database } from "lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { VoteCounter } from "./VoteCounter";
import { UserContext } from "lib/context";
import { useContext } from "react";

interface Props {
    post: PostData;
    isSnippet?: boolean;
    onDelete: () => void;
}

export const Post: React.FC<Props> = ({
    post: { title, username, upvotes, thread, content, id },
    isSnippet = true,
    onDelete,
}) => {
    const user = useContext(UserContext);

    async function deletePost() {
        if (confirm("Are you sure want to delete it?")) {
            await deleteDoc(doc(database, `/threads/${thread}/posts/${id}`));
            onDelete();
        }
    }

    return (
        <div className="flex mb-2 bg-white rounded shadow border border-gray-300">
            <div className="mr-2 bg-blue-50 p-1 rounded">
                <VoteCounter thread={thread} postID={id} upvotes={upvotes} />
            </div>
            <div className="py-2 pr-2">
                <div className="text-gray-500 text-xs mb-1">
                    Posted by
                    <Link href={`/user/${username}`}>
                        <a className="hover:underline mx-1">{username}</a>
                    </Link>
                    in
                    <Link href={`/t/${thread}`}>
                        <a className="hover:underline mx-1">t/{thread}</a>
                    </Link>
                </div>
                <p className="text-lg font-medium">{title}</p>
                <div className="text-sm my-2 break-all">
                    {isSnippet ? (
                        <div className="fade overflow-hidden max-h-80">{content}</div>
                    ) : (
                        <div>{content}</div>
                    )}
                </div>
                <Link href={`/t/${thread}/post/${id}`}>
                    <a className="hover:underline">Comments</a>
                </Link>

                {user?.username == username && (
                    <button className="btn btn-small mx-2" onClick={deletePost}>
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};
