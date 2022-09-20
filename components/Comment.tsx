import { CommentData } from "lib/types";
import Link from "next/link";
import { format } from "timeago.js";
import { VoteCounter } from "./VoteCounter";

interface Props {
    data: CommentData;
    postID: string;
    thread: string;
}

export const Comment: React.FC<Props> = ({ data, postID, thread }) => {
    const { id, username, content, upvotes, createdAt } = data;
    return (
        <div className="px-2 py-1 border">
            <div className="text-xs text-gray-500">
                <Link href={`/u/${username}`}>
                    <a className="mr-1 hover:underline">/u/{username}</a>
                </Link>
                {format(createdAt)}
            </div>
            <p>{content}</p>
        </div>
    );
};
