import { PostData } from "lib/types";
import { useEffect, useRef, useState } from "react";
import { Post } from "./Post";
import { useTransition, animated } from "@react-spring/web";
import { Timestamp, DocumentData, Query, startAfter, query, getDocs } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { snapshotToJSON } from "lib/firebase";

interface Props {
    posts: PostData[];
    query: Query<DocumentData>;
}

export const PostList: React.FC<Props> = ({ posts: startPosts, query: queryTemplate }) => {
    const [posts, setPosts] = useState(startPosts);
    const [isEnd, setIsEnd] = useState(false);
    const loading = useRef(false);

    async function getMore() {
        loading.current = true;
        const lastPost = posts[posts.length - 1];

        const snapshot = await getDocs(
            query(
                queryTemplate,
                startAfter(lastPost.upvotes, Timestamp.fromMillis(lastPost.createdAt))
            )
        );

        const newPosts = snapshot.docs.map(snapshotToJSON) as PostData[];

        posts.push(...newPosts);
        setPosts(posts);
        loading.current = false;
        if (newPosts.length < 10) {
            setIsEnd(true);
        }
    }

    function onScroll() {
        if (
            window.innerHeight + window.pageYOffset > document.body.offsetHeight - 100 &&
            !loading.current &&
            !isEnd
        ) {
            getMore();
        }
    }

    useEffect(() => {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

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
            <div className="text-center">
                {isEnd ? (
                    <p>Reached the end of the posts</p>
                ) : (
                    <FontAwesomeIcon icon={faSpinner} className="text-2xl ml-1 -mb-1 fa-spin" />
                )}
            </div>
        </div>
    );
};
