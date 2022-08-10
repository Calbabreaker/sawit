import { Post } from "components/Post";
import { getDocs, collection, limit, query, where, documentId } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { PostData } from "lib/types";
import { GetServerSideProps } from "next/types";

interface Props {
    post: PostData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { id, name } = params;
    const snapshot = await getDocs(
        query(
            collection(database, "posts"),
            where(documentId(), "==", id),
            where("thread", "==", name),
            limit(1)
        )
    );

    const post = snapshotToJSON(snapshot.docs[0]) as PostData;
    if (!post) {
        return { notFound: true };
    } else {
        return { props: { post } };
    }
};

export default function PostPage({ post }: Props) {
    return <Post {...post}></Post>;
}
