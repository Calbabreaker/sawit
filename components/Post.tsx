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
                <div>
                    <Link href={`/t/${thread}/post/${id}`}>
                        <a className="hover:underline text-2xl">{title}</a>
                    </Link>
                </div>
                Posted by
                <Link href={`/user/${username}`}>
                    <a className="hover:underline mx-1 text-blue-600">{username}</a>
                </Link>
                in
                <Link href={`/t/${thread}`}>
                    <a className="hover:underline mx-1 text-blue-600">t/{thread}</a>
                </Link>
            </div>
        </div>
    );
};
