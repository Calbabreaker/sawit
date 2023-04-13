import { collectionGroup } from "firebase/firestore";
import { database } from "lib/firebase";
import { MetaTags } from "components/MetaTags";
import { PostFeed } from "components/Feed";
import Link from "next/link";
import { CenterModal } from "components/Modals";

export default function Home() {
    return (
        <>
            <CenterModal>
                <h1 className="text-xl mb-2">Welcome to Sawit!</h1>
                <p>
                    Check out our main thread
                    <Link href="/t/sawit" className="m-1 link">
                        t/sawit
                    </Link>
                    or
                    <Link href="/new" className="ml-1 link">
                        create a new one
                    </Link>
                    .
                </p>
            </CenterModal>
            <MetaTags title="Sawit Home" description="Get the best posts on our site" />
            <PostFeed queryTemplate={collectionGroup(database, "posts")} />
        </>
    );
}
