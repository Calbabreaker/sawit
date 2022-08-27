import Link from "next/link";
import { PostData } from "lib/types";
import { VoteCounter } from "./VoteCounter";
import { UserContext } from "lib/utils";
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
            const res = await fetch(`/api/post?thread=${thread}&post=${id}`, { method: "DELETE" });
            if (!res.ok) return alert("Failed to delete post!");
            onDelete();
        }
    }

    return (
        <div className="flex mb-2 bg-white rounded shadow border border-gray-300">
            <div className="mr-2 bg-blue-50 rounded w-10 py-2">
                <VoteCounter thread={thread} postID={id} upvotes={upvotes} />
            </div>
            <div className="py-2 pr-2">
                <div className="text-gray-500 text-xs mb-1">
                    Posted by
                    {username ? (
                        <Link href={`/user/${username}`}>
                            <a className="hover:underline mx-1">{username}</a>
                        </Link>
                    ) : (
                        <span className="mx-1">deleted</span>
                    )}
                    in
                    <Link href={`/t/${thread}`}>
                        <a className="hover:underline mx-1">t/{thread}</a>
                    </Link>
                </div>
                <p className="text-lg font-medium">{title ?? "Deleted"}</p>
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
