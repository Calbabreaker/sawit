import Router from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormStatus } from "./FormStatus";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
    thread: string;
    editOpts?: {
        values: FormValues;
        onSubmit: (title: string, content: string) => void;
        id: string;
    };
}

interface FormValues extends Record<string, string> {
    title: string;
    content: string;
}

export const CreatePost: React.FC<Props> = ({ thread, editOpts }) => {
    const { register, handleSubmit, formState, trigger } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: editOpts?.values ?? { content: "" },
    });

    const createPost = handleSubmit(async (fields) => {
        let url = `/api/post?thread=${thread}`;
        if (editOpts) url += `&post=${editOpts.id}`;

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(fields),
        });

        const data = await res.text();
        if (!res.ok) throw console.error(data);

        if (editOpts) editOpts.onSubmit(fields.title, fields.content);
        else Router.push(`/t/${thread}/post/${data}`);
    });

    useEffect(() => {
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
            <a
                href="https://docs.github.com/en/articles/basic-writing-and-formatting-syntax"
                target="_blank"
                className="text-gray-400 block hover:underline mt-2"
            >
                <FontAwesomeIcon className="mr-1" icon={faMarkdown} />
                Markdown supported
            </a>
            <textarea
                className="rounded px-4 py-2 border border-black focus:ring h-full w-full min-h-[16rem] mb-2"
                placeholder="Content (optional)"
                {...register("content", {
                    maxLength: { value: 10000, message: "Content too long" },
                })}
            />
            <FormStatus formState={formState} buttonText="Submit Post" />
        </form>
    );
};
