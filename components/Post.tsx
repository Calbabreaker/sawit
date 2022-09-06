import Link from "next/link";
import { PostData } from "lib/types";
import { VoteCounter } from "./VoteCounter";
import { UserContext } from "lib/utils";
import { useContext } from "react";
import { MarkdownViewer } from "./MarkdownViewer";
import { format } from "timeago.js";
import { useRouter } from "next/router";

interface Props {
    post: PostData;
    onDelete: () => void;
    setPreview?: (post: PostData) => void;
}

export const Post: React.FC<Props> = ({ post, setPreview, onDelete }) => {
    const { title, username, thread, upvotes, content = "", id, createdAt } = post;
    const user = useContext(UserContext);
    const router = useRouter();

    async function deletePost(e: React.MouseEvent) {
        e.stopPropagation();
        if (confirm("Are you sure want to delete it?")) {
            const res = await fetch(`/api/post?thread=${thread}&post=${id}`, { method: "DELETE" });
            if (!res.ok) return alert("Failed to delete post!");
            onDelete();
        }
    }

    function stopPropagation(e: React.MouseEvent) {
        e.stopPropagation();
    }

    const hoverClass = setPreview ? "hover:border-gray-400 cursor-pointer" : "";
    return (
        <div
            className={`flex bg-white rounded shadow border border-gray-300 ${hoverClass}`}
            onClick={setPreview ? () => setPreview(post) : null}
        >
            <div className="bg-blue-50 rounded p-2">
                <VoteCounter startUpvotes={upvotes} itemDBPath={`/threads/${thread}/posts/${id}`} />
            </div>
            <div className="p-2 w-full min-w-0">
                <div className="text-gray-500 text-xs mb-1">
                    {!router.query.thread && (
                        <span className="mr-1">
                            <Link href={`/t/${thread}`}>
                                <a
                                    className="hover:underline mx-1 font-bold text-black"
                                    onClick={stopPropagation}
                                >
                                    t/{thread}
                                </a>
                            </Link>
                            •
                        </span>
                    )}
                    Posted by
                    <Link href={`/user/${username}`}>
                        <a className="hover:underline mx-1" onClick={stopPropagation}>
                            {username}
                        </a>
                    </Link>
                    {format(createdAt)}
                </div>
                <h2 className="text-lg font-medium">{title}</h2>
                <MarkdownViewer
                    text={content}
                    className={"my-2 " + (setPreview && "fade overflow-hidden max-h-80")}
                />
                {user?.username == username && (
                    <button className="btn btn-small" onClick={deletePost}>
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};
