import { doc, setDoc } from "firebase/firestore";
import { UserContext } from "lib/context";
import { database, getUserByName } from "lib/firebase";
import { UserData } from "lib/types";
import { FormEvent, useContext, useState } from "react";

export const UsernameForm: React.FC = () => {
    const { setUsername, user } = useContext(UserContext);
    const [inputValue, setInputValue] = useState("");

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (/[^\w-]/g.test(inputValue)) {
            return alert("Username can only contain letters, numbers, '-' and '_'");
        } else if (inputValue.length < 3 || inputValue.length > 16) {
            return alert("Username must be between 3 and 16 characters");
        } else if (await getUserByName(inputValue)) {
            return alert("Username has already been used.");
        }

        const ref = doc(database, "users", user.uid);
        await setDoc(ref, { name: inputValue, createdAt: Date.now(), description: "" } as UserData);
        setUsername(inputValue);
    }

    return (
        <form className="w-full flex justify-evenly" onSubmit={onSubmit}>
            <input
                className="w-full mr-4 p-2 border-gray-600 border rounded"
                type="text"
                placeholder="Username"
                onChange={(event) => setInputValue(event.currentTarget.value)}
            />
            <input className="btn btn-primary" type="submit" value="Submit" />
        </form>
    );
};
