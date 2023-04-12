import { CommentData } from "lib/types";
import { useItemOptions, UserContext } from "lib/utils";
import Link from "next/link";
import { useContext } from "react";
import { format } from "timeago.js";
import { CreateComment } from "./CreateComment";
import { Popup } from "./Modals";
import { VoteCounter, VoteCtxHandler } from "./VoteCounter";

interface Props {
    data: CommentData;
    postID: string;
    thread: string;
    onDelete: () => void;
}

export const Comment: React.FC<Props> = ({ data, postID, thread, onDelete }) => {
    const { id, username, content, createdAt } = data;
    const user = useContext(UserContext);

    const { deleting, editing, setEditing, deleteItem } = useItemOptions(
        onDelete,
        `/api/comment?thread=${thread}&post=${postID}&comment=${id}`
    );

    return (
        <div className="px-2 py-1 border mb-2">
            <div className="text-xs text-gray-500">
                <Link href={`/u/${username}`}>
                    <a className="mr-1 hover:underline">/u/{username}</a>
                </Link>
                {format(createdAt)}
            </div>
            <p>{content}</p>
            <div className="flex">
                <VoteCtxHandler upvotes={data.upvotes}>
                    <div className="flex -ml-1 mr-1">
                        <VoteCounter thread={thread} postID={postID} commentID={id} />
                    </div>
                </VoteCtxHandler>
                {user?.username == username && (
                    <div>
                        <button
                            className="btn btn-small mr-2"
                            onClick={deleteItem}
                            disabled={deleting}
                        >
                            Delete
                        </button>
                        <button className="btn btn-small" onClick={() => setEditing(true)}>
                            Edit
                        </button>
                    </div>
                )}
            </div>
            {editing && (
                <Popup onClose={() => setEditing(false)}>
                    <div className="p-4">
                        <CreateComment
                            thread={thread}
                            onSubmit={({ content }) => {
                                setEditing(false);
                                data.content = content;
                            }}
                            postID={postID}
                            editOpts={{
                                values: { content },
                                id,
                            }}
                        />
                    </div>
                </Popup>
            )}
        </div>
    );
};
