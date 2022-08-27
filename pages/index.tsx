import { GetServerSideProps } from "next/types";
import { query, orderBy, getDocs, collectionGroup, collection, limit } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { PostData, ThreadData } from "lib/types";
import { MetaTags } from "components/MetaTags";
import { PostList } from "components/PostList";
import Link from "next/link";

interface Props {
    posts: PostData[];
    threads: ThreadData[];
}

const postsQuery = query(
    collectionGroup(database, "posts"),
    orderBy("upvotes", "desc"),
    orderBy("createdAt"),
    limit(10)
);

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const postsSnapshot = await getDocs(postsQuery);
    const posts = postsSnapshot.docs.map(snapshotToJSON) as PostData[];

    const threadsSnapshot = await getDocs(query(collection(database, "threads"), limit(10)));
    const threads = threadsSnapshot.docs.map(snapshotToJSON) as ThreadData[];
    return {
        props: { posts, threads },
    };
};

export default function Home({ posts, threads }: Props) {
    return (
        <>
            <MetaTags title="Sawit Home" description="Get the best posts on our site" />
            <div className="mb-4">
                <span className="mr-2">Threads:</span>
                {threads.map((thread, i) => (
                    <Link key={i} href={`/t/${thread.id}`}>
                        <a className="hover:underline mr-2">t/{thread.id}</a>
                    </Link>
                ))}
            </div>
            <PostList posts={posts} query={postsQuery} />
        </>
    );
}
