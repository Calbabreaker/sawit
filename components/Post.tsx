import { FaArrowDown, FaArrowUp } from "react-icons/fa";

interface PostProps {
    title: string;
    username: string;
    upvotes: number;
    content: string;
}

export const Post: React.FC<PostProps> = ({ title, username, upvotes, content }) => {
    return (
        <div className="flex">
            <div className="mr-4">
                <FaArrowUp className="-mb-1 m-auto" />
                <span className="text-lg">{upvotes}</span>
                <FaArrowDown className="-mt-1 m-auto" />
            </div>
            <div>
                <p className="text-2xl">{title}</p>
                <p>u/{username}</p>
            </div>
        </div>
    );
};
