import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
    getDocs,
    query,
    Query,
    startAfter,
    DocumentSnapshot,
    limit,
    collection,
} from "firebase/firestore";
import { getSortQuery, LIMIT, snapshotToJSON, database } from "lib/firebase";
import { useRouter } from "next/router";
import { Post } from "./Post";
import { CommentData, DataType, PostData } from "lib/types";
import { Popup } from "./Popup";
import { VoteContext } from "lib/utils";
import { Comment } from "./Comment";

interface Props<T extends DataType> {
    queryTemplate: Query;
    render: (data: T, i: number, onDelete: (i: number) => Promise<void>) => JSX.Element;
}

const Feed = <T extends DataType>({ queryTemplate, render }: Props<T>) => {
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
            // Don't unset blockGetMore if at end to block forever
        } else {
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
            {posts.map((post, i) => render(post, i, onDelete))}
            <div className="text-center">
                {isEnd ? (
                    <p>You saw it all</p>
                ) : (
                    <FontAwesomeIcon icon={faSpinner} className="mx-auto text-lg fa-spin" />
                )}
            </div>
        </div>
    );
};

interface PostFeedProps {
    queryTemplate: Query;
}

export const PostFeed: React.FC<PostFeedProps> = ({ queryTemplate }) => {
    const [showPreview, setShowPreview] = useState(false);
    const previewPost = useRef<PostData>(undefined);
    const router = useRouter();

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

    const render: Props<PostData>["render"] = (data, i, onDelete) => (
        // Uses react context to sync upvote info bewtween preview and snippet
        <VoteCtxHandler key={data.id} post={data}>
            <div className="mb-2">
                <Post data={data} onDelete={() => onDelete(i)} setPreview={setPreviewPost} />
            </div>
            {showPreview && previewPost.current?.id == data.id && (
                <Popup onClose={() => history.back()}>
                    <Post data={data} onDelete={() => onDelete(i).then(history.back)} />
                    <CommentFeed postID={data.id} thread={data.thread} />
                </Popup>
            )}
        </VoteCtxHandler>
    );

    return <Feed queryTemplate={queryTemplate} render={render} />;
};

interface CommentFeedProps {
    postID: string;
    thread: string;
}

export const CommentFeed: React.FC<CommentFeedProps> = ({ postID, thread }) => {
    const render: Props<CommentData>["render"] = (data, i, onDelete) => (
        <Comment key={data.id} data={data} />
    );

    return (
        <div className="text-sm p-2">
            <div>Comments</div>
            <Feed
                queryTemplate={collection(database, `/threads/${thread}/posts/${postID}/comments`)}
                render={render}
            />
        </div>
    );
};

interface VCHProps {
    post: PostData;
    children: JSX.Element[];
}

const VoteCtxHandler: React.FC<VCHProps> = ({ post, children }) => {
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
