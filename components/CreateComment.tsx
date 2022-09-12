import { useForm } from "react-hook-form";
import { TextEditor } from "./TextEditor";
import { FormStatus } from "./FormStatus";
import { useEffect } from "react";

interface Props {
    thread: string;
    postID: string;
}

interface FormValues extends Record<string, string> {
    content: string;
}

export const CreateComment: React.FC<Props> = ({ thread, postID }) => {
    const { register, handleSubmit, formState, trigger, setValue } = useForm<FormValues>({
        mode: "onChange",
    });

    const createComment = handleSubmit(async (fields) => {
        const res = await fetch(`/api/comment?thread=${thread}&post=${postID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(fields),
        });

        const data = await res.text();
        if (!res.ok) {
            throw console.error(data);
        }

        alert("Sucess!");
    });

    useEffect(() => {
        register("content", {
            required: true,
            maxLength: { value: 1000, message: "Content too long" },
        });
        trigger();
    }, []);

    return (
        <form onSubmit={createComment}>
            <TextEditor
                className="min-h-[8rem] mb-2"
                placeholder="Comment"
                onChange={(text) => setValue("content", text, { shouldValidate: true })}
            />
            <FormStatus formState={formState} buttonText="Create comment" buttonClass="mb-4" />
        </form>
    );
};
