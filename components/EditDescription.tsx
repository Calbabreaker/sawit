import { useForm } from "react-hook-form";
import { FormStatus } from "./FormStatus";
import { useContext, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "lib/firebase";
import { UserContext } from "lib/utils";
import { MarkdownSupported } from "./Markdown";

interface Props {
    description: string;
    onEdit: (description: string) => void;
}

interface FormValues extends Record<string, string> {
    description: string;
}

export const EditDescription: React.FC<Props> = ({ description, onEdit }) => {
    const userCtx = useContext(UserContext);

    const { register, handleSubmit, formState, trigger } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: { description },
    });

    const createComment = handleSubmit(async ({ description }) => {
        const ref = doc(database, "users", userCtx.uid);
        await updateDoc(ref, {
            description,
        });

        onEdit(description);
    });

    useEffect(() => {
        trigger();
    }, []);

    return (
        <form className="bg-white p-4" onSubmit={createComment}>
            <MarkdownSupported />
            <textarea
                className="input min-h-[8rem] mb-2"
                placeholder="Description"
                {...register("description", {
                    maxLength: { value: 10000, message: "Description too long" },
                })}
            />
            <FormStatus formState={formState} buttonText="Set description" />
        </form>
    );
};
