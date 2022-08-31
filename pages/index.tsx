import { collectionGroup } from "firebase/firestore";
import { database } from "lib/firebase";
import { MetaTags } from "components/MetaTags";
import { Feed } from "components/Feed";
import { Post } from "components/Post";

export default function Home() {
    return (
        <>
            <MetaTags title="Sawit Home" description="Get the best posts on our site" />
            <Feed queryTemplate={collectionGroup(database, "posts")} Component={Post} />
        </>
    );
}
