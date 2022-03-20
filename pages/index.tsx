import { Post } from "components/Post";

export default function Home() {
    return (
        <>
            <Post
                title="Hello There"
                username="Testuser"
                upvotes={1000}
                content="This is a testing test"
            />
        </>
    );
}
