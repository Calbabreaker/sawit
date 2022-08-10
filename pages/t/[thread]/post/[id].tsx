import { MetaTags } from "components/MetaTags";
import { Post } from "components/Post";
import { getDocs, collection, limit, query, where, documentId } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { PostData } from "lib/types";
import { GetServerSideProps } from "next/types";

interface Props {
    post: PostData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { id, thread } = params;
    const snapshot = await getDocs(
        query(
            collection(database, "posts"),
            where(documentId(), "==", id),
            where("thread", "==", thread),
            limit(1)
        )
    );

    if (!snapshot.docs[0]) return { notFound: true };

    const post = snapshotToJSON(snapshot.docs[0]) as PostData;
    return { props: { post } };
};

export default function PostPage({ post }: Props) {
    return (
        <>
            <MetaTags title={post.title} description={post.content} />
            <Post {...post}></Post>
        </>
    );
}
