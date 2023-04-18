import { MetaTags } from "components/MetaTags";
import { PostFeed } from "components/Feed";
import { query, collectionGroup, where } from "firebase/firestore";
import { database, getDocByName, snapshotToJSON } from "lib/firebase";
import { UserData } from "lib/types";
import { GetServerSideProps } from "next/types";
import { useContext, useState } from "react";
import { UserContext } from "lib/utils";
import { Modal, Popup } from "components/Modals";
import { EditDescription } from "components/EditDescription";
import { MarkdownViewer } from "components/Markdown";

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

export default function User({ user }: Props) {
    const userCtx = useContext(UserContext);
    const [editing, setEditing] = useState(false);

    return (
        <>
            <MetaTags title={user.name} description={user.description} />
            <Modal>
                <h1 className="text-xl mb-2">u/{user.name}</h1>
                <MarkdownViewer text={user.description} />
                {userCtx?.uid == user.id && (
                    <button className="btn btn-small mt-2" onClick={() => setEditing(true)}>
                        Edit Description
                    </button>
                )}
            </Modal>
            {editing && (
                <Popup onClose={() => setEditing(false)}>
                    <EditDescription
                        docPath={`/users/${user.id}`}
                        description={user.description}
                        onEdit={(d) => {
                            setEditing(false);
                            user.description = d;
                        }}
                    />
                </Popup>
            )}
            <PostFeed
                queryTemplate={query(
                    collectionGroup(database, "posts"),
                    where("username", "==", user.name)
                )}
            />
        </>
    );
}
