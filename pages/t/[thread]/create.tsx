import { CreatePost } from "components/CreatePost";
import { getDoc, doc } from "firebase/firestore";
import { ThreadData } from "lib/types";
import { database, snapshotToJSON } from "lib/firebase";
import { GetServerSideProps } from "next";
import { MetaTags } from "components/MetaTags";

interface Props {
    thread: ThreadData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, req }) => {
    const { thread: threadName } = params;

    if (!(req as any).user) {
        return {
            redirect: {
                permanent: false,
                destination: `/login?return=/t/${threadName}/create`,
            },
        };
    }

    const threadSnapshot = await getDoc(doc(database, `/threads/${threadName}`));
    if (!threadSnapshot) return { notFound: true };
    const thread = snapshotToJSON(threadSnapshot) as ThreadData;

    return { props: { thread } };
};

export default function Create({ thread }: Props) {
    return (
        <>
            <MetaTags title={`Create post in t/${thread.id}`} />
            <h1 className="text-2xl mb-4">Create a post in t/{thread.id}</h1>
            <CreatePost thread={thread.id} />
        </>
    );
}
