import Router from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { TextEditor } from "./TextEditor";
import { FormStatus } from "./FormStatus";

interface Props {
    thread: string;
}

interface FormValues {
    title: string;
    content: string;
    [key: string]: string;
}

export const CreatePost: React.FC<Props> = ({ thread }) => {
    const { register, handleSubmit, formState, trigger, setValue } = useForm<FormValues>({
        mode: "onChange",
    });

    const createPost = handleSubmit(async (fields) => {
        const res = await fetch(`/api/post?thread=${thread}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(fields),
        });

        if (!res.ok) throw "API fetch error";

        const id = await res.text();
        Router.push(`/t/${thread}/post/${id}`);
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
