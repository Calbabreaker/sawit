import { Post } from "components/Post";
import { GetServerSideProps } from "next/types";
import { query, orderBy, collection, limitToLast, getDocs } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { PostData } from "lib/types";

interface Props {
    posts: PostData[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const snapshot = await getDocs(
        query(collection(database, "posts"), orderBy("upvotes"), limitToLast(10))
    );

    const posts = snapshot.docs.map(snapshotToJSON) as PostData[];
    return {
        props: { posts },
    };
};

export default function Home({ posts }: Props) {
    return (
        <>
            {posts.map((post, i) => (
                <Post key={i} {...post}></Post>
            ))}
        </>
    );
}
