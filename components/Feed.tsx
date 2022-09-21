import { useContext, useEffect, useRef, useState } from "react";
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
import { CommentData, PostData } from "lib/types";
import { Popup } from "./Popup";
import { UserContext } from "lib/utils";
import { Comment } from "./Comment";
import { CreateComment } from "./CreateComment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { VoteCtxHandler } from "./VoteCounter";

interface UseFeedHook<T> {
    updateSort: (sort: string, pushState: boolean) => void;
    onDelete: (i: number) => void;
    getMore: (startFresh: boolean) => void;
    setItems: (items: T[]) => void;
    items: T[];
    sort: string;
    isEnd: boolean;
}

function useFeed<T>(queryTemplate: Query, onHistoryPopState?: () => boolean): UseFeedHook<T> {
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [isEnd, setIsEnd] = useState(false);
    const [sort, setSort] = useState<string>();
    const loadingPosts = useRef(false);
    const lastSnapshot = useRef<DocumentSnapshot>();

    async function getMore(startFresh = false) {
        if (startFresh) setIsEnd(false);
        else if (loadingPosts.current || isEnd) return;
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

        if (!startFresh) newItems.unshift(...items);
        setItems(newItems);
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
    }, [items]);

    useEffect(() => {
        updateSort();
    }, []);

    useEffect(() => {
        getMore(true);
    }, [sort]);

    function onDelete(i: number) {
        const newItems = items.concat();
        newItems.splice(i, 1);
        setItems(newItems);
    }

    function updateSort(newSort?: string, pushState = false) {
        if (!newSort) {
            newSort = new URLSearchParams(location.search).get("sort") ?? "most";
        }

        const newUrl = `${location.pathname}?sort=${newSort}`;
        if (pushState) history.pushState(history.state, undefined, newUrl);
        setSort(newSort);
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

    return { updateSort, onDelete, items, sort, isEnd, getMore, setItems };
}

interface SortSelectProps {
    updateSort: UseFeedHook<never>["updateSort"];
    sort: string;
}

const SortSelect: React.FC<SortSelectProps> = ({ sort, updateSort }) => {
    return (
        <div className="mb-2">
            <span>Sort by:</span>
            <select
                className="mx-2 bg-white rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                onChange={(e) => updateSort(e.currentTarget.value, true)}
                value={sort}
            >
                <option value="most">Most Upvoted</option>
                <option value="least">Least Upvoted</option>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
            </select>
        </div>
    );
};

export const LoadingStatus: React.FC<{ isEnd: boolean }> = ({ isEnd }) => {
    return (
        <div className="text-center">
            {isEnd ? (
                <p className="text-gray-500">There is none left</p>
            ) : (
                <FontAwesomeIcon icon={faSpinner} className="mx-auto text-lg fa-spin" />
            )}
        </div>
    );
};

interface PostFeedProps {
    queryTemplate: Query;
}

export const PostFeed: React.FC<PostFeedProps> = ({ queryTemplate }) => {
    function onPopState() {
        const postID = history.state.previewPostID;
        setPreviewPostID(postID);
        return postID != null;
    }

    const { items, onDelete, sort, updateSort, isEnd, setItems } = useFeed<PostData>(
        queryTemplate,
        onPopState
    );
    const [previewPostID, setPreviewPostID] = useState<string>(undefined);
    const router = useRouter();

    function setPreviewPost(post: PostData) {
        const newUrl = `/t/${post.thread}/post/${post.id}`;
        history.pushState({ previewPostID: post.id, prevState: history.state }, undefined, newUrl);
        document.title = post.title;
        setPreviewPostID(post.id);
    }

    function onClose() {
        history.pushState(history.state.prevState, undefined, router.asPath);
        setPreviewPostID(null);
    }

    function onEdit(title: string, content: string, i: number) {
        const newItems = items.slice();
        newItems[i].title = title;
        newItems[i].content = content;
        setItems(newItems);
    }

    // Uses react context to sync upvote info bewtween preview and snippet
    return (
        <div>
            <SortSelect sort={sort} updateSort={updateSort} />
            {items.map((data, i) => (
                <VoteCtxHandler key={data.id} upvotes={data.upvotes}>
                    <div className="mb-2">
                        <Post
                            data={data}
                            onDelete={() => onDelete(i)}
                            setPreview={setPreviewPost}
                            onEdit={(title, content) => onEdit(title, content, i)}
                        />
                    </div>
                    {previewPostID == data.id && (
                        <Popup onClose={onClose}>
                            <Post
                                data={data}
                                onDelete={() => {
                                    onDelete(i);
                                    history.back();
                                }}
                                onEdit={(title, content) => onEdit(title, content, i)}
                            />
                            <CommentFeed postID={data.id} thread={data.thread} />
                        </Popup>
                    )}
                </VoteCtxHandler>
            ))}
            <LoadingStatus isEnd={isEnd} />
        </div>
    );
};

interface CommentFeedProps {
    postID: string;
    thread: string;
}

export const CommentFeed: React.FC<CommentFeedProps> = ({ postID, thread }) => {
    const user = useContext(UserContext);

    const { items, sort, updateSort, isEnd, onDelete, getMore } = useFeed<CommentData>(
        collection(database, `/threads/${thread}/posts/${postID}/comments`)
    );

    function onCreate() {
        if (sort == "latest") getMore(true);
        else updateSort("latest", true);
    }

    return (
        <div className="p-4 bg-white rounded">
            <SortSelect sort={sort} updateSort={updateSort} />
            <div className="mb-4">
                {user && <CreateComment thread={thread} postID={postID} onSubmit={onCreate} />}
            </div>
            {items.map((data, i) => (
                <Comment
                    key={data.id}
                    data={data}
                    postID={postID}
                    thread={thread}
                    onDelete={() => onDelete(i)}
                />
            ))}
            <LoadingStatus isEnd={isEnd} />
        </div>
    );
};
