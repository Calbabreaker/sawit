import { useForm } from "react-hook-form";
import { FormStatus } from "./FormStatus";
import { useEffect, useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { MarkdownSupported } from "./Markdown";
import { Popup } from "./Modals";
import { database } from "lib/firebase";

interface FormValues extends Record<string, string> {
    description: string;
}

interface EditProps {
    docPath: string;
    data: any;
}

export const EditDescriptionButton: React.FC<EditProps> = ({ docPath, data }) => {
    const [editing, setEditing] = useState(false);

    const { register, handleSubmit, formState, trigger } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: { description: data.description },
    });

    const setDesc = handleSubmit(async ({ description }) => {
        await updateDoc(doc(database, docPath), {
            description,
        });

        data.description = description;
        setEditing(false);
    });

    useEffect(() => {
        trigger();
    }, []);

    return (
        <>
            <button className="btn btn-small mt-2" onClick={() => setEditing(true)}>
                Edit Description
            </button>
            {editing && (
                <Popup onClose={() => setEditing(false)}>
                    <form className="bg-white p-4 text-left" onSubmit={setDesc}>
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
                </Popup>
            )}
        </>
    );
};
