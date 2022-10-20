import { useForm } from "react-hook-form";
import { FormStatus } from "./FormStatus";
import { useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { MarkdownSupported } from "./Markdown";
import { database } from "lib/firebase";

interface FormValues extends Record<string, string> {
    description: string;
}

interface EditProps {
    docPath: string;
    onEdit: (description: string) => void;
    description: string;
}

export const EditDescription: React.FC<EditProps> = ({ docPath, onEdit, description }) => {
    const { register, handleSubmit, formState, trigger } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: { description },
    });

    const setDesc = handleSubmit(async ({ description }) => {
        await updateDoc(doc(database, docPath), {
            description,
        });

        onEdit(description);
    });

    useEffect(() => {
        trigger();
    }, []);

    return (
        <form className="bg-white p-4" onSubmit={setDesc}>
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
