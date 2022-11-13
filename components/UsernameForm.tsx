import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserContext } from "lib/utils";
import { database, getDocByName, NAME_REGEX } from "lib/firebase";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormStatus } from "./FormStatus";

interface Props {
    setUsername: (name: string) => void;
}

interface FormValues {
    username: string;
}

export const UsernameForm: React.FC<Props> = ({ setUsername }) => {
    const { uid } = useContext(UserContext);

    const { register, handleSubmit, formState, trigger, setError } = useForm<FormValues>({
        mode: "onChange",
    });

    const onSubmit = handleSubmit(async ({ username }) => {
        if (await getDocByName("users", username)) {
            return setError("username", { message: "Username is already taken" });
        }

        const ref = doc(database, "users", uid);
        await setDoc(ref, {
            name: username,
            createdAt: serverTimestamp(),
            description: "My description",
        });
        setUsername(username);
    });

    useEffect(() => {
        trigger();
    }, []);

    return (
        <form className="p-4 text-center" onSubmit={onSubmit}>
            <h1 className="text-2xl mb-4">Set your username</h1>
            <input
                className="w-full p-2 border-gray-600 border rounded"
                placeholder="Username"
                {...register("username", {
                    required: true,
                    minLength: {
                        value: 3,
                        message: "Username must be greater than 3 characters",
                    },
                    maxLength: {
                        value: 24,
                        message: "Username must be less than 24 characters",
                    },
                    pattern: {
                        value: NAME_REGEX,
                        message: "Username can only contain letters, numbers, '-' and '_'",
                    },
                })}
            />
            <FormStatus formState={formState} buttonText="Set username" buttonClass="w-full my-2" />
        </form>
    );
};
