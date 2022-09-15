import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
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
import { UserContext, VoteContext } from "lib/utils";
import { Comment } from "./Comment";
import { CreateComment } from "./CreateComment";

interface Props<T extends DataType> {
    queryTemplate: Query;
    render: (data: T, i: number, onDelete: (i: number) => Promise<void>) => JSX.Element;
    onHistoryPopState?: () => boolean | void;
}

const Feed = <T extends DataType>({ queryTemplate, render, onHistoryPopState }: Props<T>) => {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [isEnd, setIsEnd] = useState(false);
    const [sort, setSort] = useState<string>();
    const loadingPosts = useRef(false);
    const lastSnapshot = useRef<DocumentSnapshot>();

    async function getMore(startFresh = false) {
        if (loadingPosts.current || isEnd) return;
        loadingPosts.current = true;

        const constraints = [getSortQuery(sort), limit(LIMIT)];
        if (!startFresh) {
            constraints.push(startAfter(lastSnapshot.current));
        }

        const snapshot = await getDocs(query(queryTemplate, ...constraints));
        lastSnapshot.current = snapshot.docs[snapshot.docs.length - 1];

        const newItems = snapshot.docs.map(snapshotToJSON);
        if (newItems.length < LIMIT) {
            setIsEnd(true);
        }

        if (!startFresh) newItems.unshift(...posts);
        setPosts(newItems);
        loadingPosts.current = false;
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
        updateSort();
    }, []);

    useEffect(() => {
        getMore(true);
    }, [sort]);

    async function onDelete(i: number) {
        const newItems = posts.concat();
        newItems.splice(i, 1);
        setPosts(newItems);
    }

    function updateSort() {
        const urlParams = new URLSearchParams(location.search);
        setIsEnd(false);
        setSort(urlParams.get("sort"));
    }

    function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
        const newUrl = `${location.pathname}?sort=${event.currentTarget.value}`;
        history.pushState(history.state, undefined, newUrl);
        updateSort();
    }

    useEffect(() => {
        router.beforePopState((state) => {
            // Disable nextjs routing if on same page
            return state.as == router.asPath ? false : true;
        });

        window.addEventListener("popstate", onPopState);
        return () => {
            window.removeEventListener("popstate", onPopState);
            router.beforePopState(undefined);
        };
    }, []);

    function onPopState() {
        if (onHistoryPopState) {
            // onHistoryPopState returns true to block
            if (onHistoryPopState()) return;
        }
        updateSort();
    }

    return (
        <div>
            <div className="mb-2">
                <span>Sort by:</span>
                <select
                    className="mx-2 bg-white rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                    onChange={onSelectChange}
                    defaultValue={sort}
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
                    <p className="text-gray-500">There is none left</p>
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
    const [previewPostID, setPreviewPostID] = useState<string>(undefined);
    const router = useRouter();

    function setPreviewPost(post: PostData) {
        const newUrl = `/t/${post.thread}/post/${post.id}`;
        history.pushState({ previewPostID: post.id, prevState: history.state }, undefined, newUrl);
        document.title = post.title;
        setPreviewPostID(post.id);
    }

    function onPopState() {
        const postID = history.state.previewPostID;
        setPreviewPostID(postID);
        return postID != null;
    }

    function onClose() {
        history.pushState(history.state.prevState, undefined, router.asPath);
        setPreviewPostID(null);
    }

    const render: Props<PostData>["render"] = (data, i, onDelete) => (
        // Uses react context to sync upvote info bewtween preview and snippet
        <VoteCtxHandler key={data.id} post={data}>
            <div className="mb-2">
                <Post data={data} onDelete={() => onDelete(i)} setPreview={setPreviewPost} />
            </div>
            {previewPostID == data.id && (
                <Popup onClose={onClose}>
                    <Post data={data} onDelete={() => onDelete(i).then(history.back)} />
                    <CommentFeed postID={data.id} thread={data.thread} />
                </Popup>
            )}
        </VoteCtxHandler>
    );

    return <Feed queryTemplate={queryTemplate} render={render} onHistoryPopState={onPopState} />;
};

interface CommentFeedProps {
    postID: string;
    thread: string;
}

export const CommentFeed: React.FC<CommentFeedProps> = ({ postID, thread }) => {
    const user = useContext(UserContext);

    const render: Props<CommentData>["render"] = (data, i, onDelete) => (
        <Comment key={data.id} data={data} postID={postID} thread={thread} />
    );

    return (
        <div className="p-4 bg-white rounded mt-2">
            {user && <CreateComment thread={thread} postID={postID} />}
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
                loadingState: useState(false),
            }}
        >
            {children}
        </VoteContext.Provider>
    );
};
