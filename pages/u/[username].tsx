import { MetaTags } from "components/MetaTags";
import { PostFeed } from "components/Feed";
import { query, collectionGroup, where } from "firebase/firestore";
import { database, getDocByName, snapshotToJSON } from "lib/firebase";
import { UserData } from "lib/types";
import { GetServerSideProps } from "next/types";
import { useContext } from "react";
import { UserContext } from "lib/utils";
import { CenterModal } from "components/Modals";
import { EditDescriptionButton } from "components/EditDescription";
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

    return (
        <>
            <MetaTags title={user.name} description={user.description} />
            <CenterModal>
                <h1 className="text-xl mb-2">u/{user.name}</h1>
                <MarkdownViewer text={user.description} />
                {userCtx?.uid == user.id && (
                    <EditDescriptionButton docPath="/threads" data={user} />
                )}
            </CenterModal>
            <PostFeed
                queryTemplate={query(
                    collectionGroup(database, "posts"),
                    where("username", "==", user.name)
                )}
            />
        </>
    );
}
