import { MetaTags } from "components/MetaTags";
import { Post } from "components/Post";
import {
    getDocs,
    query,
    collection,
    orderBy,
    limitToLast,
    where,
    doc,
    getDoc,
} from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { PostData, ThreadData } from "lib/types";
import { GetServerSideProps } from "next/types";

interface Props {
    posts: PostData[];
    thread: ThreadData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { thread: threadName } = params;

    const threadSnapshot = await getDoc(doc(database, `/threads/${threadName}`));
    if (!threadSnapshot.data()) return { notFound: true };
    const thread = snapshotToJSON(threadSnapshot) as ThreadData;

    const postSnapshot = await getDocs(
        query(
            collection(database, "posts"),
            where("thread", "==", threadName),
            orderBy("upvotes", "desc"),
            limitToLast(10)
        )
    );

    const posts = postSnapshot.docs.map(snapshotToJSON) as PostData[];
    return { props: { posts, thread } };
};

export default function Thread({ posts, thread }: Props) {
    return (
        <>
            <MetaTags title={`t/${thread.id}`} description={thread.description} />
            <h1 className="text-2xl">Welcome to {thread.id}!</h1>
            <p className="mb-4">{thread.description}</p>
            {posts.map((post, i) => (
                <Post key={i} {...post}></Post>
            ))}
        </>
    );
}
