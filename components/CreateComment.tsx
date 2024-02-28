import { useForm } from "react-hook-form";
import { FormStatus } from "./FormStatus";
import { useEffect } from "react";

interface Props {
    thread: string;
    postID: string;
    onSubmit: (values: FormValues) => void;
    editOpts?: {
        values: FormValues;
        id: string;
    };
}

interface FormValues extends Record<string, string> {
    content: string;
}

export const CreateComment: React.FC<Props> = ({ thread, postID, onSubmit, editOpts }) => {
    const isEditing = editOpts != null;
    const { register, handleSubmit, formState, trigger, reset } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: editOpts?.values,
    });

    const createComment = handleSubmit(async (fields) => {
        let url = `/api/comment?thread=${thread}&post=${postID}`;
        if (isEditing) {
            url += `&comment=${editOpts.id}`;
        }

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(fields),
        });

        if (!res.ok) {
            alert("Failed to send request!");
            throw await res.text();
        }

        onSubmit(fields);
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
                className="input min-h-[8rem] mb-2"
                placeholder="Comment"
                {...register("content", {
                    required: true,
                    maxLength: { value: 1000, message: "Content too long" },
                })}
            />
            <FormStatus
                formState={formState}
                buttonText={isEditing ? "Edit Comment" : "Create Comment"}
            />
        </form>
    );
};
