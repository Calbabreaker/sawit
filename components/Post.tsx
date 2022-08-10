import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { PostData } from "lib/types";

export const Post: React.FC<PostData> = ({ title, username, upvotes, thread, id }) => {
    return (
        <div className="flex">
            <div className="mr-4">
                <FontAwesomeIcon icon={faArrowUp} className="block mx-auto text-sm" />
                <span className="text-lg">{upvotes}</span>
                <FontAwesomeIcon icon={faArrowDown} className="block mx-auto text-sm" />
            </div>
            <div>
                <Link href={`/t/${thread}/post/${id}`}>
                    <a className="hover:underline text-2xl block">{title}</a>
                </Link>
                Posted by
                <Link href={`/user/${username}`}>
                    <a className="hover:underline mx-1">{username}</a>
                </Link>
            </div>
        </div>
    );
};
