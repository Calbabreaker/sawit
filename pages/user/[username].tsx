import { MetaTags } from "components/MetaTags";
import { Feed } from "components/Feed";
import { query, collectionGroup, where } from "firebase/firestore";
import { database, getDocByName, snapshotToJSON } from "lib/firebase";
import { UserData } from "lib/types";
import { GetServerSideProps } from "next/types";
import { Post } from "components/Post";

interface Props {
    user: UserData;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const { username } = ctx.params;

    const userSnapshot = await getDocByName("users", username);
    if (!userSnapshot) return { notFound: true };
    const user = snapshotToJSON(userSnapshot) as UserData;

    return { props: { user } };
};

export default function Thread({ user }: Props) {
    return (
        <>
            <MetaTags title={user.name} description={user.description} />
            <h1 className="text-2xl">User {user.name}</h1>
            <p className="mb-4">{user.description}</p>
            <Feed
                queryTemplate={query(
                    collectionGroup(database, "posts"),
                    where("username", "==", user.name)
                )}
                Component={Post}
            />
        </>
    );
}
