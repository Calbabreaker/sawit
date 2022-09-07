import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getDocs, query, Query, startAfter, DocumentSnapshot, limit } from "firebase/firestore";
import { getSortQuery, LIMIT, snapshotToJSON } from "lib/firebase";
import { useRouter } from "next/router";
import { Post } from "./Post";
import { PostData } from "lib/types";
import { Popup } from "./Popup";
import { VoteContext } from "lib/utils";

interface Props {
    queryTemplate: Query;
}

export const PostFeed: React.FC<Props> = ({ queryTemplate }) => {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [isEnd, setIsEnd] = useState(false);
    const sort = useRef((router.query.sort as string) || "most");
    const blockGetMore = useRef(false);
    const lastSnapshot = useRef<DocumentSnapshot>();

    async function getMore(startFresh = false) {
        if (blockGetMore.current) return;
        blockGetMore.current = true;

        const constraints = [getSortQuery(sort.current), limit(LIMIT)];
        if (!startFresh) {
            constraints.push(startAfter(lastSnapshot.current));
        }

        const snapshot = await getDocs(query(queryTemplate, ...constraints));
        lastSnapshot.current = snapshot.docs[snapshot.docs.length - 1];

        const newItems = snapshot.docs.map(snapshotToJSON);
        if (newItems.length < LIMIT) {
            setIsEnd(true);
        } else {
            // Don't unblock if reach end to block forever
            blockGetMore.current = false;
        }

        if (!startFresh) newItems.unshift(...posts);
        setPosts(newItems);
    }

    function onScroll() {
        if (window.innerHeight + window.pageYOffset > document.body.offsetHeight - 20) {
            getMore();
        }
    }

    useEffect(() => {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [posts]);

    useEffect(() => {
        blockGetMore.current = false;
        setIsEnd(false);
        getMore(true);
    }, [router.query.sort]);

    async function onDelete(i: number) {
        const newItems = posts.concat();
        newItems.splice(i, 1);
        setPosts(newItems);
    }

    function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
        sort.current = event.currentTarget.value;
        router.push(
            {
                pathname: router.pathname,
                query: { ...router.query, sort: sort.current },
            },
            undefined,
            { shallow: true, scroll: false }
        );
    }

    const [showPreview, setShowPreview] = useState(false);
    const previewPost = useRef<PostData>(undefined);

    function setPreviewPost(post: PostData) {
        const newUrl = `/t/${post.thread}/post/${post.id}`;
        history.pushState({ isPreviewing: true }, undefined, newUrl);
        document.title = post.title;
        previewPost.current = post;
        setShowPreview(true);
    }

    function onPopState() {
        setShowPreview(history.state.isPreviewing || false);
    }

    useEffect(() => {
        router.beforePopState((state) => {
            // Disable nextjs routing if previewing post
            return state.as == router.asPath ? false : true;
        });

        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    return (
        <div>
            <div className="mb-2">
                <span>Sort by:</span>
                <select
                    className="mx-2 bg-white rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                    onChange={onSelectChange}
                    defaultValue={sort.current}
                >
                    <option value="most">Most Upvoted</option>
                    <option value="least">Least Upvoted</option>
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                </select>
            </div>
            {posts.map((post, i) => (
                <VoteCtxHandler key={post.id} post={post}>
                    <div className="mb-2">
                        <Post
                            post={post}
                            onDelete={() => onDelete(i)}
                            setPreview={setPreviewPost}
                        />
                    </div>
                    {showPreview && previewPost.current?.id == post.id && (
                        <Popup onClose={() => history.back()}>
                            <Post post={post} onDelete={() => onDelete(i).then(history.back)} />
                        </Popup>
                    )}
                </VoteCtxHandler>
            ))}
            <div className="text-center">
                {isEnd ? (
                    <p>Reached the end of the posts</p>
                ) : (
                    <FontAwesomeIcon icon={faSpinner} className="mx-auto text-lg fa-spin" />
                )}
            </div>
        </div>
    );
};

interface PCHProps {
    post: PostData;
    children: JSX.Element[];
}

const VoteCtxHandler: React.FC<PCHProps> = ({ post, children }) => {
    return (
        <VoteContext.Provider
            value={{
                upvotesState: useState(post.upvotes),
                voteChangeState: useState(undefined),
                loadingState: useState(true),
            }}
        >
            {children}
        </VoteContext.Provider>
    );
};
