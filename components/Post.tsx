import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { PostData } from "lib/types";

interface Props {
    post: PostData;
    snippet: boolean;
}

export const Post: React.FC<Props> = ({
    post: { title, username, upvotes, thread, content, id },
    snippet,
}) => {
    return (
        <div className="flex mb-2 bg-white rounded shadow border border-gray-300">
            <div className="mr-2 bg-blue-50 p-2 rounded">
                <FontAwesomeIcon icon={faArrowUp} className="block mx-auto text-sm" />
                <div className="text-center mx-auto">{upvotes}</div>
                <FontAwesomeIcon icon={faArrowDown} className="block mx-auto text-sm" />
            </div>
            <div className="py-2 pr-2">
                <div className="text-gray-500 text-xs mb-1">
                    Posted by
                    <Link href={`/user/${username}`}>
                        <a className="hover:underline mx-1">{username}</a>
                    </Link>
                    in
                    <Link href={`/t/${thread}`}>
                        <a className="hover:underline mx-1">t/{thread}</a>
                    </Link>
                </div>
                <p className="text-lg font-medium">{title}</p>
                <div className="text-sm my-2 break-all">
                    {snippet ? (
                        <div className="fade overflow-hidden max-h-80">{content}</div>
                    ) : (
                        <div>{content}</div>
                    )}
                </div>
                <Link href={`/t/${thread}/post/${id}`}>
                    <a className="hover:underline">Comments</a>
                </Link>
            </div>
        </div>
    );
};
