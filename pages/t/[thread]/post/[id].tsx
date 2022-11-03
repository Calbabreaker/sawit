import { CommentFeed } from "components/Feed";
import { MetaTags } from "components/MetaTags";
import { Post } from "components/Post";
import { VoteCtxHandler } from "components/VoteCounter";
import { getDoc, doc } from "firebase/firestore";
import { database, snapshotToJSON } from "lib/firebase";
import { PostData } from "lib/types";
import Router from "next/router";
import { GetServerSideProps } from "next/types";

interface Props {
    post: PostData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const { id, thread } = params;
    const snapshot = await getDoc(doc(database, `/threads/${thread}/posts/${id}`));

    if (!snapshot.exists()) return { notFound: true };
    const post = snapshotToJSON(snapshot) as PostData;
    return { props: { post } };
};

export default function PostPage({ post }: Props) {
    return (
        <>
            <MetaTags title={post.title} description={post.content} />
            <VoteCtxHandler upvotes={post.upvotes}>
                <Post
                    data={post}
                    onDelete={() => Router.push("/")}
                    onEdit={({ title, content }) => {
                        post.title = title;
                        post.content = content;
                    }}
                />
            </VoteCtxHandler>
            <CommentFeed postID={post.id} thread={post.thread} />
        </>
    );
}
