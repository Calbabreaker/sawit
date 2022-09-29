import { MetaTags } from "components/MetaTags";
import { PostFeed } from "components/Feed";
import { query, collectionGroup, where } from "firebase/firestore";
import { database, getDocByName, snapshotToJSON } from "lib/firebase";
import { UserData } from "lib/types";
import { GetServerSideProps } from "next/types";
import { useContext, useState } from "react";
import { UserContext } from "lib/utils";
import { Popup } from "components/Popup";
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

    function onEdit(description: string) {
        user.description = description;
        setEditing(false);
    }

    return (
        <>
            <MetaTags title={user.name} description={user.description} />
            <h1 className="text-2xl">User {user.name}</h1>
            <div className="mb-4">
                <MarkdownViewer text={user.description} />
                {userCtx && (
                    <button className="btn mt-2" onClick={() => setEditing(true)}>
                        Edit Description
                    </button>
                )}
            </div>
            {editing && (
                <Popup onClose={() => setEditing(false)}>
                    <EditDescription onEdit={onEdit} description={user.description} />
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
