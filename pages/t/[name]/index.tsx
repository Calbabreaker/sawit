import { Post } from "components/Post";
import { getDocs, query, collection, orderBy, limitToLast, where, limit } from "firebase/firestore";
import { database, getDocByName, snapshotToJSON } from "lib/firebase";
import { PostData, ThreadData } from "lib/types";
import { GetServerSideProps } from "next/types";

interface Props {
    posts: PostData[];
    thread: ThreadData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { name } = params;

    const threadSnapshot = await getDocByName("threads", name);
    if (!threadSnapshot) return { notFound: true };
    const thread = snapshotToJSON(threadSnapshot) as ThreadData;

    const postSnapshot = await getDocs(
        query(
            collection(database, "posts"),
            where("thread", "==", name),
            orderBy("upvotes"),
            limitToLast(10)
        )
    );

    const posts = postSnapshot.docs.map(snapshotToJSON) as PostData[];
    return { props: { posts, thread } };
};

export default function Thread({ posts, thread }: Props) {
    return (
        <>
            <h1 className="text-2xl">Welcome to {thread.name}!</h1>
            <p className="mb-4">{thread.description}</p>
            {posts.map((post, i) => (
                <Post key={i} {...post}></Post>
            ))}
        </>
    );
}