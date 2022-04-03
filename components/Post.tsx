import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Link from "next/link";
import { PostData } from "lib/types";

export const Post: React.FC<PostData> = ({ title, username, upvotes, content }) => {
    return (
        <div className="flex">
            <div className="mr-4">
                <FaArrowUp className="-mb-1 m-auto" />
                <span className="text-lg">{upvotes}</span>
                <FaArrowDown className="-mt-1 m-auto" />
            </div>
            <div>
                <p className="text-2xl">{title}</p>
                Posted by <Link href={`/u/${username}`}>{username}</Link>
            </div>
        </div>
    );
};
