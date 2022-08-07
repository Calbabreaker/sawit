import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { PostData } from "lib/types";

export const Post: React.FC<PostData> = ({ title, username, upvotes, content }) => {
    return (
        <div className="flex">
            <div className="mr-4">
                <FontAwesomeIcon icon={faArrowUp} className="block text-lg mx-auto" />
                <span className="text-lg">{upvotes}</span>
                <FontAwesomeIcon icon={faArrowDown} className="block text-lg mx-auto" />
            </div>
            <div>
                <p className="text-2xl">{title}</p>
                Posted by
                <Link href={`/u/${username}`}>
                    <a className="hover:underline mx-1">{username}</a>
                </Link>
            </div>
        </div>
    );
};
