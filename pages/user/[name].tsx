import { Post } from "components/Post";
import { getDocs, query, collection, orderBy, limitToLast, where } from "firebase/firestore";
import { database, getDocByName, snapshotToJSON } from "lib/firebase";
import { PostData, UserData } from "lib/types";
import { GetServerSideProps } from "next/types";

interface Props {
    posts: PostData[];
    user: UserData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { name } = params;

    const userSnapshot = await getDocByName("users", name);
    if (!userSnapshot) return { notFound: true };
    const user = snapshotToJSON(userSnapshot) as UserData;

    const postSnapshot = await getDocs(
        query(
            collection(database, "posts"),
            where("username", "==", name),
            orderBy("upvotes"),
            limitToLast(10)
        )
    );

    const posts = postSnapshot.docs.map(snapshotToJSON) as PostData[];
    return { props: { posts, user } };
};

export default function Thread({ posts, user }: Props) {
    return (
        <>
            <h1 className="text-2xl">User {user.name}</h1>
            <p className="mb-4">{user.description}</p>
            {posts.map((post, i) => (
                <Post key={i} {...post}></Post>
            ))}
        </>
    );
}
