import { useForm } from "react-hook-form";
import { FormStatus } from "./FormStatus";
import { useEffect } from "react";

interface Props {
    thread: string;
    postID: string;
    onSubmit: (content: string) => void;
    editOpts?: {
        values: FormValues;
        id: string;
    };
}

interface FormValues extends Record<string, string> {
    content: string;
}

export const CreateComment: React.FC<Props> = ({ thread, postID, onSubmit, editOpts }) => {
    const { register, handleSubmit, formState, trigger, reset } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: editOpts?.values,
    });

    const createComment = handleSubmit(async (fields) => {
        let url = `/api/comment?thread=${thread}&post=${postID}`;
        if (editOpts) url += `&comment=${editOpts.id}`;

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(fields),
        });

        if (!res.ok) throw console.error(await res.text());

        onSubmit(fields.content);
    });

    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            setTimeout(reset, 5000);
        }
    }, [formState]);

    useEffect(() => {
        trigger();
    }, []);

    return (
        <form onSubmit={createComment}>
            <textarea
                className="rounded px-4 py-2 border border-black focus:ring h-full w-full min-h-[8rem] mb-2"
                placeholder="Comment"
                {...register("content", {
                    required: true,
                    maxLength: { value: 1000, message: "Content too long" },
                })}
            />
            <FormStatus formState={formState} buttonText="Submit Comment" />
        </form>
    );
};
