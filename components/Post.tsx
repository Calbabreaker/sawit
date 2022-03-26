import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Link from "next/link";
import { IPost } from "lib/types";

export const Post: React.FC<IPost> = ({ title, username, upvotes, content }) => {
    return (
        <div className="flex">
            <div className="mr-4">
                <FaArrowUp className="-mb-1 m-auto" />
                <span className="text-lg">{upvotes}</span>
                <FaArrowDown className="-mt-1 m-auto" />
            </div>
            <div>
                <p className="text-2xl">{title}</p>
                <Link href={`u/${username}`}>{`u/${username}`}</Link>
            </div>
        </div>
    );
};
