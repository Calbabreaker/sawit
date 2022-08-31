import { MetaTags } from "components/MetaTags";
import { Feed } from "components/Feed";
import { collection, doc, getDoc } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { ThreadData } from "lib/types";
import Link from "next/link";
import { GetServerSideProps } from "next/types";
import { Post } from "components/Post";

interface Props {
    thread: ThreadData;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const { thread } = ctx.params;

    const threadSnapshot = await getDoc(doc(database, `/threads/${thread}`));
    if (!threadSnapshot.exists()) return { notFound: true };
    const threadData = snapshotToJSON(threadSnapshot) as ThreadData;

    return { props: { thread: threadData } };
};

export default function Thread({ thread }: Props) {
    return (
        <>
            <MetaTags title={`t/${thread.id}`} description={thread.description} />
            <div className="mb-8">
                <h1 className="text-2xl">Welcome to t/{thread.id}!</h1>
                <p className="mb-4">{thread.description}</p>
                <Link href={`${thread.id}/create`}>
                    <a className="btn btn-primary">Create Post</a>
                </Link>
            </div>
            <Feed
                queryTemplate={collection(database, `/threads/${thread.id}/posts`)}
                Component={Post}
            />
        </>
    );
}
