import { PostData } from "lib/types";
import { useState } from "react";
import { Post } from "./Post";
import { useTransition, animated } from "@react-spring/web";

interface Props {
    posts: PostData[];
}

export const PostList: React.FC<Props> = ({ posts: startPosts }) => {
    const [posts, setPosts] = useState(startPosts);

    const transitions = useTransition(posts, {
        enter: { opacity: 1 },
        leave: { opacity: 0 },
    });

    async function onDelete(i: number) {
        const newPosts = posts.concat();
        newPosts.splice(i, 1);
        setPosts(newPosts);
    }

    return (
        <div>
            {transitions((styles, post, _, i) => (
                <animated.div style={styles}>
                    <Post key={i} post={post} onDelete={() => onDelete(i)}></Post>
                </animated.div>
            ))}
        </div>
    );
};
