import { faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { database } from "lib/firebase";
import { UserContext } from "lib/context";
import Router from "next/router";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { TextEditor } from "./TextEditor";
import { ErrorText } from "./ErrorText";

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

    const createPost = handleSubmit(async (fields) => {
        const { title, content } = fields;
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

    const { isValid, isSubmitted, isSubmitting, isSubmitSuccessful, errors, isDirty } = formState;

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
            <button
                type="submit"
                disabled={!isValid || isSubmitting || isSubmitSuccessful}
                className="btn btn-primary mr-2"
            >
                Create New Post
            </button>
            {isSubmitting && (
                <FontAwesomeIcon icon={faSpinner} className="text-2xl ml-1 -mb-1 fa-spin" />
            )}
            {isSubmitSuccessful && (
                <FontAwesomeIcon icon={faCheck} color="#3b82f6" className="text-2xl ml-1 -mb-1" />
            )}
            {!isValid && (
                <ErrorText
                    text={Object.entries(errors)
                        .map(([_, error]) => error.message)
                        .join(", ")}
                />
            )}
            {isSubmitted && !isDirty && !isSubmitSuccessful && (
                <ErrorText text={"Failed to create post"} />
            )}
        </form>
    );
};
