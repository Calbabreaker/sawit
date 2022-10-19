import { MetaTags } from "components/MetaTags";
import { PostFeed } from "components/Feed";
import { collection, doc, getDoc } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { ThreadData } from "lib/types";
import Link from "next/link";
import { GetServerSideProps } from "next/types";
import { CenterModal } from "components/Modals";
import { useContext } from "react";
import { UserContext } from "lib/utils";
import { EditDescriptionButton } from "components/EditDescription";

export interface Props {
    thread: ThreadData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { thread } = params;

    const threadSnapshot = await getDoc(doc(database, `/threads/${thread}`));
    if (!threadSnapshot.exists()) return { notFound: true };
    const threadData = snapshotToJSON(threadSnapshot) as ThreadData;

    return { props: { thread: threadData } };
};

export default function Thread({ thread }: Props) {
    const userCtx = useContext(UserContext);

    return (
        <>
            <MetaTags title={`t/${thread.id}`} description={thread.description} />
            <CenterModal>
                <h1 className="text-xl mb-2">Welcome to t/{thread.id}!</h1>
                <p>{thread.description}</p>
                {userCtx?.uid == thread.ownerUID && (
                    <EditDescriptionButton docPath="/threads" data={thread} />
                )}
                <Link href={`${thread.id}/create`}>
                    <button className="btn btn-primary mt-2">Create Post</button>
                </Link>
            </CenterModal>
            <PostFeed queryTemplate={collection(database, `/threads/${thread.id}/posts`)} />
        </>
    );
}
