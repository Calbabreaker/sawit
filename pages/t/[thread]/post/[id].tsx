import { MetaTags } from "components/MetaTags";
import { Post } from "components/Post";
import { getDoc, doc } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { PostData } from "lib/types";
import { GetServerSideProps } from "next/types";

interface Props {
    post: PostData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { id, thread } = params;
    const snapshot = await getDoc(doc(database, `/threads/${thread}/posts/${id}`));

    const post = snapshotToJSON(snapshot) as PostData;
    return { props: { post } };
};

export default function PostPage({ post }: Props) {
    return (
        <>
            <MetaTags title={post.title} description={post.content} />
            <Post post={post} snippet={false}></Post>
        </>
    );
}