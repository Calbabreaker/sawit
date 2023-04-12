import Link from "next/link";
import { PostData } from "lib/types";
import { VoteCounter } from "./VoteCounter";
import { useItemOptions, UserContext } from "lib/utils";
import { useContext } from "react";
import { MarkdownViewer } from "./Markdown";
import { format } from "timeago.js";
import { useRouter } from "next/router";
import { Popup } from "./Modals";
import { CreatePost, CreatePostValues, validateUrlImage } from "./CreatePost";
import { IMAGE_IDENTIFER, VALID_IMAGE_HOSTS } from "lib/firebase";

interface Props {
    data: PostData;
    onDelete: () => void;
    onEdit: (values: CreatePostValues) => void;
    setPreview?: (post: PostData) => void;
}

export const Post: React.FC<Props> = ({ data, setPreview, onDelete, onEdit }) => {
    let { content, title, username, thread, id } = data;
    const user = useContext(UserContext);

    const { deleting, editing, setEditing, deletePost } = useItemOptions(
        onDelete,
        `/api/post?thread=${thread}&post=${id}`
    );

    const isPreview = setPreview != null;
    const hoverStyle = isPreview && !editing ? "hover:border-gray-400 cursor-pointer" : "";
    const contentStyle = `my-2 ${isPreview ? "fade overflow-hidden max-h-80" : ""}`;

    const isImage = content.startsWith(IMAGE_IDENTIFER);
    if (isImage) {
        content = content.replace(IMAGE_IDENTIFER, "");
    }

    return (
        <div
            className={`flex bg-white rounded shadow border border-gray-300 ${hoverStyle}`}
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
                <TopPart data={data} />
                <h2 className="text-lg font-medium">{title}</h2>
                {isImage && validateUrlImage(content) == null ? (
                    <img src={content} className={contentStyle}></img>
                ) : (
                    <MarkdownViewer text={content} className={contentStyle} />
                )}
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
                            onSubmit={(values) => {
                                setEditing(false);
                                onEdit(values);
                            }}
                            isImage={isImage}
                            editOpts={{
                                values: { content, title },
                                id,
                            }}
                        />
                    </Popup>
                )}
            </div>
        </div>
    );
};

interface TopPartProps {
    data: PostData;
}

export const TopPart: React.FC<TopPartProps> = ({ data }) => {
    const { username, thread, createdAt } = data;
    const router = useRouter();

    function stopPropagation(e: React.MouseEvent) {
        e.stopPropagation();
    }

    return (
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
    );
};
