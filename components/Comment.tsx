import { CommentData } from "lib/types";
import Link from "next/link";
import { VoteCounter } from "./VoteCounter";

interface Props {
    data: CommentData;
    postID: string;
    thread: string;
}

export const Comment: React.FC<Props> = ({ data, postID, thread }) => {
    const { id, username, content, upvotes } = data;
    return (
        <div className="p-2 border">
            <Link href={`/user/${username}`}>
                <a className="hover:underline">/u/{username}</a>
            </Link>
            <p>{content}</p>
        </div>
    );
};
