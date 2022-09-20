import { useForm } from "react-hook-form";
import { FormStatus } from "./FormStatus";
import { useEffect } from "react";

interface Props {
    thread: string;
    postID: string;
    onCreate: () => void;
}

interface FormValues extends Record<string, string> {
    content: string;
}

export const CreateComment: React.FC<Props> = ({ thread, postID, onCreate }) => {
    const { register, handleSubmit, formState, trigger, reset } = useForm<FormValues>({
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

        onCreate();
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
            <FormStatus formState={formState} buttonText="Create comment" buttonClass="mb-4" />
        </form>
    );
};
