import { CreatePost } from "components/CreatePost";
import { getDoc, doc } from "firebase/firestore";
import { ThreadData } from "lib/types";
import { database, snapshotToJSON } from "lib/firebase";
import { MetaTags } from "components/MetaTags";
import { makeAuthRedirectSSR } from "lib/utils";
import Router from "next/router";
import { useState } from "react";

interface Props {
    thread: ThreadData;
}

export const getServerSideProps = makeAuthRedirectSSR(true, async ({ params }) => {
    const { thread: threadName } = params;

    const threadSnapshot = await getDoc(doc(database, `/threads/${threadName}`));
    if (!threadSnapshot) return { notFound: true };
    const thread = snapshotToJSON(threadSnapshot) as ThreadData;

    return { props: { thread } };
});

export default function Create({ thread }: Props) {
    let [postType, setPostType] = useState("text");

    return (
        <>
            <MetaTags title={`Create post in t/${thread.id}`} />
            <h1 className="text-2xl mb-4">
                Create a
                <select
                    className="select"
                    onChange={(e) => setPostType(e.currentTarget.value)}
                    value={postType}
                >
                    <option value="text">text</option>
                    <option value="image">image</option>
                </select>
                post in t/{thread.id}
            </h1>
            <CreatePost
                thread={thread.id}
                isImage={postType == "image"}
                onSubmit={(_, id) => Router.push(`/t/${thread.id}/post/${id}`)}
            />
        </>
    );
}
