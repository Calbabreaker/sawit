import { IMAGE_HOSTS } from "lib/firebase";
import { PostType } from "lib/types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormStatus } from "./FormStatus";
import { MarkdownSupported } from "./Markdown";

interface Props {
    thread: string;
    onSubmit: (values: CreatePostValues, id: string) => void;
    // If the post is an image instead of content
    type?: PostType;
    // If this component is for editing a post intead of creating one
    editOpts?: {
        values: CreatePostValues;
        id: string;
    };
}

export interface CreatePostValues extends Record<string, string> {
    title: string;
    content: string;
}

export const CreatePost: React.FC<Props> = ({ thread, editOpts, type = "text", onSubmit }) => {
    const { register, handleSubmit, formState, trigger, unregister } = useForm<CreatePostValues>({
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
            body: new URLSearchParams({ ...fields, type }),
        });

        const data = await res.text();
        if (!res.ok) {
            alert("Failed to send request!");
            throw data;
        }

        onSubmit(fields, data);
    });

    useEffect(() => {
        trigger();
    }, []);

    useEffect(() => {
        unregister("content");
    }, [type]);

    return (
        <form className="bg-white p-4 shadow rounded" onSubmit={createPost}>
            <input
                placeholder="Title of post"
                className="input mb-2"
                {...register("title", {
                    required: "Title required",
                    maxLength: { value: 100, message: "Title too long" },
                })}
            />
            {type == "image" ? (
                <input
                    className="input mb-2"
                    placeholder={`URL for the image (only ${IMAGE_HOSTS.join(",")} supported)`}
                    {...register("content", {
                        required: "URL required",
                        validate: validateUrlImage,
                        maxLength: { value: 500, message: "URL too long" },
                    })}
                />
            ) : (
                <>
                    <textarea
                        className="input min-h-[16rem]"
                        placeholder="Content (optional)"
                        {...register("content", {
                            maxLength: { value: 10000, message: "Content too long" },
                        })}
                    />
                    <MarkdownSupported />
                </>
            )}
            <FormStatus formState={formState} buttonText="Submit Post" buttonClass="mt-2" />
        </form>
    );
};

export function validateUrlImage(content: string): string {
    try {
        if (!IMAGE_HOSTS.includes(new URL(content).hostname)) {
            return `Can only use images on ${IMAGE_HOSTS.join(", ")}`;
        }
    } catch {
        return "Not a valid URL";
    }
}
