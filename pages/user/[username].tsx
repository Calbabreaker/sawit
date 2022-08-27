import { MetaTags } from "components/MetaTags";
import { PostList } from "components/PostList";
import { getDocs, query, collectionGroup, orderBy, where, limit } from "firebase/firestore";
import { database, getDocByName, snapshotToJSON } from "lib/firebase";
import { PostData, UserData } from "lib/types";
import { GetServerSideProps } from "next/types";

interface Props {
    posts: PostData[];
    user: UserData;
}

const postQuery = (username: string) =>
    query(
        collectionGroup(database, "posts"),
        where("username", "==", username),
        orderBy("upvotes", "desc"),
        orderBy("createdAt"),
        limit(10)
    );

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { username } = params;

    const userSnapshot = await getDocByName("users", username);
    if (!userSnapshot) return { notFound: true };
    const user = snapshotToJSON(userSnapshot) as UserData;

    const postSnapshot = await getDocs(postQuery(user.name));

    const posts = postSnapshot.docs.map(snapshotToJSON) as PostData[];
    return { props: { posts, user } };
};

export default function Thread({ posts, user }: Props) {
    return (
        <>
            <MetaTags title={user.name} description={user.description} />
            <h1 className="text-2xl">User {user.name}</h1>
            <p className="mb-4">{user.description}</p>
            <PostList posts={posts} query={postQuery(user.name)} />
        </>
    );
}
