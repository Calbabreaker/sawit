import { collectionGroup } from "firebase/firestore";
import { database } from "lib/firebase";
import { MetaTags } from "components/MetaTags";
import { PostFeed } from "components/Feed";

export default function Home() {
    return (
        <>
            <MetaTags title="Sawit Home" description="Get the best posts on our site" />
            <PostFeed queryTemplate={collectionGroup(database, "posts")} />
        </>
    );
}
