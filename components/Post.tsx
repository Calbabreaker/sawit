import Link from "next/link";
import { PostData } from "lib/types";
import { VoteCounter } from "./VoteCounter";
import { useItemOptions, UserContext } from "lib/utils";
import { useContext, useState } from "react";
import { MarkdownViewer } from "./Markdown";
import { format } from "timeago.js";
import { useRouter } from "next/router";
import { Popup } from "./Popup";
import { CreatePost } from "./CreatePost";

interface Props {
    data: PostData;
    onDelete: () => void;
    onEdit: (title: string, content: string) => void;
    setPreview?: (post: PostData) => void;
}

export const Post: React.FC<Props> = ({ data, setPreview, onDelete, onEdit }) => {
    const { title, username, thread, content, id, createdAt } = data;
    const user = useContext(UserContext);
    const router = useRouter();

    function stopPropagation(e: React.MouseEvent) {
        e.stopPropagation();
    }

    const { deleting, editing, setEditing, deletePost } = useItemOptions(
        onDelete,
        `/api/post?thread=${thread}&post=${id}`
    );

    const hoverClass = setPreview && !editing ? "hover:border-gray-400 cursor-pointer" : "";

    return (
        <div
            className={`flex bg-white rounded shadow border border-gray-300 ${hoverClass}`}
            onClick={() => {
                if (setPreview && !editing) {
                    setPreview(data);
                }
            }}
        >
            <div className="bg-blue-50 rounded p-2">
                <VoteCounter thread={thread} postID={id} />
            </div>
            <div className="p-2 w-full min-w-0">
                <div className="text-gray-500 text-xs mb-1">
                    {!router.query.thread && (
                        <span className="mr-1">
                            <Link href={`/t/${thread}`}>
                                <a
                                    className="hover:underline font-bold text-black mr-1"
                                    onClick={stopPropagation}
                                >
                                    t/{thread}
                                </a>
                            </Link>
                            •
                        </span>
                    )}
                    Posted by
                    <Link href={`/u/${username}`}>
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
                    <div>
                        <button
                            className="btn btn-small mr-2"
                            onClick={deletePost}
                            disabled={deleting}
                        >
                            Delete
                        </button>
                        <button
                            className="btn btn-small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditing(true);
                            }}
                        >
                            Edit
                        </button>
                    </div>
                )}
                {editing && (
                    <Popup onClose={() => setEditing(false)}>
                        <CreatePost
                            thread={thread}
                            editOpts={{
                                values: { content, title },
                                onSubmit: (title, content) => {
                                    setEditing(false);
                                    onEdit(title, content);
                                },
                                id,
                            }}
                        />
                    </Popup>
                )}
            </div>
        </div>
    );
};
