import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { UserContext } from "lib/context";
import { database } from "lib/firebase";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { EditableText } from "./EditableText";

interface Props {
    thread: string;
}

interface FormValues {
    title: string;
    content: string;
}

export const CreatePost: React.FC<Props> = ({ thread }) => {
    const { uid, username } = useContext(UserContext);
    const { register, handleSubmit, formState, setValue } = useForm<FormValues>({
        mode: "onChange",
    });

    const createPost = handleSubmit(({ title, content }) => {
        const data = {
            username,
            thread,
            title,
            content,
            uid,
            createdAt: serverTimestamp(),
            upvotes: 0,
        };
        console.log(data);

        addDoc(collection(database, "posts"), data);
    });

    useEffect(() => {
        register("content", { maxLength: 10000 });
    }, []);

    return (
        <form onSubmit={createPost}>
            <input
                placeholder="Title of post"
                className="my-4 rounded px-4 py-2 border border-black focus:ring w-full"
                {...register("title", { required: true, minLength: 0, maxLength: 100 })}
            />
            <EditableText
                className="min-h-[16rem]"
                placeholder="Content (optional)"
                onChange={(text) => setValue("content", text, { shouldValidate: true })}
            />
            <button type="submit" disabled={!formState.isValid} className="my-4 btn btn-primary">
                Create New Post
            </button>
        </form>
    );
};
