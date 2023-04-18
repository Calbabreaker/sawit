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
import { Popup } from "./Modals";
import { UserContext } from "lib/utils";
import { Comment } from "./Comment";
import { CreateComment } from "./CreateComment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { VoteCtxHandler } from "./VoteCounter";
import { CreatePostValues } from "./CreatePost";

interface UseFeedHook<T> {
    updateSort: (sort: string, pushState: boolean) => void;
    onDelete: (i: number) => void;
    getMore: (startFresh: boolean) => void;
    items: T[];
    sort: string;
    isEnd: boolean;
}

function useFeed<T>(queryTemplate: Query, onHistoryPopState?: () => boolean): UseFeedHook<T> {
    const router = useRouter();
    const [items, setItems] = useState<T[]>([]);
    const [isEnd, setIsEnd] = useState(false);
    const sort = useRef<string>();
    const blockGetItems = useRef(false);
    const lastSnapshot = useRef<DocumentSnapshot>();

    async function getMore(startFresh = false) {
        if (blockGetItems.current) return;
        if (startFresh) setIsEnd(false);
        blockGetItems.current = true;

        const constraints = [getSortQuery(sort.current), limit(LIMIT)];
        if (!startFresh) {
            constraints.push(startAfter(lastSnapshot.current));
        }

        const snapshot = await getDocs(query(queryTemplate, ...constraints));
        lastSnapshot.current = snapshot.docs[snapshot.docs.length - 1];

        const newItems = snapshot.docs.map(snapshotToJSON) as T[];
        if (newItems.length < LIMIT) {
            setIsEnd(true);
        } else {
            // This makes it so that getMore blocks forever if reach end of items
            blockGetItems.current = false;
        }

        setItems((oldItems) => {
            if (!startFresh) newItems.unshift(...oldItems);
            return newItems;
        });
    }

    function onScroll() {
        if (window.innerHeight + window.pageYOffset > document.body.offsetHeight - 20) {
            getMore();
        }
    }

    useEffect(() => {
        updateSort();
        window.addEventListener("scroll", onScroll);
        window.addEventListener("popstate", onPopState);
        // Disable nextjs routing if on same page
        router.beforePopState((state) => state.as != router.asPath);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("popstate", onPopState);
            router.beforePopState(undefined);
        };
    }, []);

    function onDelete(i: number) {
        const newItems = items.concat();
        newItems.splice(i, 1);
        setItems(newItems);
    }

    function updateSort(newSort?: string, pushState = false) {
        if (!newSort) {
            newSort = new URLSearchParams(location.search).get("sort") ?? "most";
        }

        if (pushState) {
            const newUrl = `${location.pathname}?sort=${newSort}`;
            history.pushState(history.state, undefined, newUrl);
        }

        blockGetItems.current = false;
        sort.current = newSort;
        getMore(true);
    }

    function onPopState() {
        if (onHistoryPopState) {
            // onHistoryPopState returns true to block
            if (onHistoryPopState()) return;
        }
        updateSort();
    }

    return { updateSort, onDelete, items, sort: sort.current, isEnd, getMore };
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
                className="select"
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
                <p className="text-gray-500">You reached the end.</p>
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

    const { items, onDelete, sort, updateSort, isEnd } = useFeed<PostData>(
        queryTemplate,
        onPopState
    );
    const [previewPostID, setPreviewPostID] = useState<string>(undefined);
    const router = useRouter();
    const titleBefore = useRef<string>();

    function setPreviewPost(post: PostData) {
        const newUrl = `/t/${post.thread}/post/${post.id}`;
        history.pushState({ previewPostID: post.id, prevState: history.state }, undefined, newUrl);

        titleBefore.current = document.title;
        document.title = post.title;

        setPreviewPostID(post.id);
    }

    function onClose() {
        history.pushState(history.state.prevState, undefined, router.asPath);
        document.title = titleBefore.current;
        setPreviewPostID(null);
    }

    function onEdit(data: PostData, { title, content }: CreatePostValues) {
        data.title = title;
        data.content = content;
    }

    return (
        <div className="w-full">
            <SortSelect sort={sort} updateSort={updateSort} />
            {items.map((data, i) => (
                // Uses react context to sync upvote info bewtween preview and snippet
                <VoteCtxHandler key={data.id} upvotes={data.upvotes}>
                    <div className="mb-2">
                        <Post
                            data={data}
                            onDelete={() => onDelete(i)}
                            setPreview={setPreviewPost}
                            onEdit={(values) => onEdit(data, values)}
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
                                onEdit={(values) => onEdit(data, values)}
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
