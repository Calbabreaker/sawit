import { Post } from "components/Post";
import { GetServerSideProps } from "next/types";
import { query, orderBy, limitToLast, getDocs, collectionGroup } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { PostData } from "lib/types";
import { MetaTags } from "components/MetaTags";

interface Props {
    posts: PostData[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const snapshot = await getDocs(
        query(collectionGroup(database, "posts"), orderBy("upvotes", "desc"), limitToLast(10))
    );

    const posts = snapshot.docs.map(snapshotToJSON) as PostData[];
    return { props: { posts } };
};

export default function Home({ posts }: Props) {
    return (
        <>
            <MetaTags title="Sawit Home" description="Get the best posts on our site" />
            {posts.map((post, i) => (
                <Post key={i} post={post} snippet={true}></Post>
            ))}
        </>
    );
}
