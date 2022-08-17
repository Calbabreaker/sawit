import { MetaTags } from "components/MetaTags";
import { PostList } from "components/PostList";
import { getDocs, query, collectionGroup, orderBy, limitToLast, where } from "firebase/firestore";
import { database, getDocByName, snapshotToJSON } from "lib/firebase";
import { PostData, UserData } from "lib/types";
import { GetServerSideProps } from "next/types";

interface Props {
    posts: PostData[];
    user: UserData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { username } = params;

    const userSnapshot = await getDocByName("users", username);
    if (!userSnapshot) return { notFound: true };
    const user = snapshotToJSON(userSnapshot) as UserData;

    const postSnapshot = await getDocs(
        query(
            collectionGroup(database, "posts"),
            where("username", "==", username),
            orderBy("upvotes", "desc"),
            limitToLast(10)
        )
    );

    const posts = postSnapshot.docs.map(snapshotToJSON) as PostData[];
    return { props: { posts, user } };
};

export default function Thread({ posts, user }: Props) {
    return (
        <>
            <MetaTags title={user.name} description={user.description} />
            <h1 className="text-2xl">User {user.name}</h1>
            <p className="mb-4">{user.description}</p>
            <PostList posts={posts} />
        </>
    );
}
