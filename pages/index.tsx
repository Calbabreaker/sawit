import { Post } from "components/Post";
import { GetServerSideProps } from "next/types";
import { query, orderBy, limit, collection, limitToLast, getDocs } from "firebase/firestore";
import { db } from "lib/firebase";
import { IPost } from "lib/types";

interface Props {
    posts: IPost[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const snapshot = await getDocs(
        query(collection(db, "posts"), orderBy("upvotes"), limitToLast(10))
    );

    const posts = snapshot.docs.map((doc) => doc.data() as IPost);
    return {
        props: { posts },
    };
};

export default function Home({ posts }: Props) {
    return (
        <>
            {posts.map((post) => (
                <Post {...post}></Post>
            ))}
        </>
    );
}
