import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { database } from "lib/firebase";
import { UserContext } from "lib/context";
import Router from "next/router";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { TextEditor } from "./TextEditor";
import { FormStatus } from "./FormStatus";

interface Props {
    thread: string;
}

interface FormValues {
    title: string;
    content: string;
}

export const CreatePost: React.FC<Props> = ({ thread }) => {
    const { uid, username } = useContext(UserContext);
    const { register, handleSubmit, formState, trigger, setValue } = useForm<FormValues>({
        mode: "onChange",
    });

    const createPost = handleSubmit(async ({ title, content }) => {
        const data = {
            username,
            thread,
            title,
            content,
            uid,
            createdAt: serverTimestamp(),
            upvotes: 0,
        };

        const doc = await addDoc(collection(database, `/threads/${thread}/posts`), data);
        Router.push(`/t/${thread}/post/${doc.id}`);
    });

    useEffect(() => {
        register("content", { maxLength: { value: 10000, message: "Content too long" } });
        trigger();
    }, []);

    return (
        <form className="bg-white p-4 shadow rounded" onSubmit={createPost}>
            <input
                placeholder="Title of post"
                className="rounded px-4 py-2 border border-black focus:ring w-full"
                {...register("title", {
                    required: "Title required",
                    maxLength: { value: 100, message: "Title too long" },
                })}
            />
            <TextEditor
                className="min-h-[16rem] my-4"
                placeholder="Content (optional)"
                onChange={(text) => setValue("content", text, { shouldValidate: true })}
            />
            <FormStatus formState={formState} buttonText="Create new post" />
        </form>
    );
};
