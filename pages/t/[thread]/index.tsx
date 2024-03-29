import { MetaTags } from "components/MetaTags";
import { PostFeed } from "components/Feed";
import { collection, doc, getDoc } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { ThreadData } from "lib/types";
import { GetServerSideProps } from "next/types";
import { Modal, Popup } from "components/Modals";
import { useContext, useState } from "react";
import { UserContext } from "lib/utils";
import { EditDescription } from "components/EditDescription";
import { MarkdownViewer } from "components/Markdown";
import Link from "next/link";

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
    const [editing, setEditing] = useState(false);

    return (
        <>
            <MetaTags title={`t/${thread.id}`} description={thread.description} />
            <Modal>
                <h1 className="text-xl mb-2">Welcome to t/{thread.id}!</h1>
                <MarkdownViewer text={thread.description} />
                {userCtx?.uid == thread.ownerUID && (
                    <button className="btn btn-small mt-2 w-36" onClick={() => setEditing(true)}>
                        Edit Description
                    </button>
                )}
                <Link href={`${thread.id}/create`} className="btn btn-primary mt-2 w-36">
                    Create Post
                </Link>
            </Modal>
            {editing && (
                <Popup onClose={() => setEditing(false)}>
                    <EditDescription
                        docPath={`/threads/${thread.id}`}
                        description={thread.description}
                        onEdit={(d) => {
                            setEditing(false);
                            thread.description = d;
                        }}
                    />
                </Popup>
            )}
            <PostFeed queryTemplate={collection(database, `/threads/${thread.id}/posts`)} />
        </>
    );
}
