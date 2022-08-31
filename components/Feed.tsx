import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { DataType } from "lib/types";
import { getDocs, query, Query, startAfter, DocumentSnapshot, limit } from "firebase/firestore";
import { getSortQuery, LIMIT, snapshotToJSON } from "lib/firebase";
import { useRouter } from "next/router";

interface Props<T extends DataType> {
    queryTemplate: Query;
    Component: React.FC<{ item: T; onDelete: () => void }>;
}

export const Feed = <T extends DataType>({ queryTemplate, Component }: Props<T>) => {
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [isEnd, setIsEnd] = useState(false);
    const sort = useRef((router.query.sort as string) || "most");
    const blockGetMore = useRef(false);
    const lastSnapshot = useRef<DocumentSnapshot>();

    async function getMore(startFresh = lastSnapshot.current == null) {
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
            // Block forever if reach end
            blockGetMore.current = false;
        }

        if (!startFresh) newItems.unshift(...items);
        setItems(newItems);
    }

    function onScroll() {
        if (window.innerHeight + window.pageYOffset > document.body.offsetHeight - 20) {
            getMore();
        }
    }

    useEffect(() => {
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [items]);

    async function onDelete(i: number) {
        const newItems = items.concat();
        newItems.splice(i, 1);
        setItems(newItems);
    }

    function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
        sort.current = event.currentTarget.value;
        blockGetMore.current = false;
        setIsEnd(false);
        getMore(true);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, sort: sort.current },
        });
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
            {items.map((item, i) => (
                <Component key={item.id} item={item} onDelete={() => onDelete(i)} />
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
