import { FormStatus } from "components/FormStatus";
import { MetaTags } from "components/MetaTags";
import { doc, getDoc } from "firebase/firestore";
import { database } from "lib/firebase";
import { makeAuthRedirectSSR } from "lib/utils";
import Router from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export const getServerSideProps = makeAuthRedirectSSR(true);

interface FormValues {
    name: string;
    description: string;
}

export default function CreateThread({}) {
    const { register, handleSubmit, formState, trigger, setError } = useForm<FormValues>({
        mode: "onChange",
    });

    const createPost = handleSubmit(async ({ name, description }) => {
        name = name.toLowerCase();
        const ref = doc(database, "threads", name);
        const docCheck = await getDoc(ref);
        if (docCheck.exists()) {
            return setError("name", { message: "Thread already exists" });
        }

        const res = await fetch(`/api/thread?name=${name}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ description }),
        });

        if (!res.ok) {
            alert("Failed to send request!");
            throw await res.text();
        }

        Router.push(`/t/${name}`);
    });

    useEffect(() => {
        trigger();
    }, []);

    return (
        <>
            <MetaTags title="Create a new Sawit thread" />
            <h1 className="text-2xl mb-4">Create a new thread</h1>
            <form className="bg-white p-4 shadow rounded" onSubmit={createPost}>
                <input
                    placeholder="Name of thread (cannot be changed later)"
                    className="input mb-2"
                    {...register("name", {
                        required: "Name required",
                        maxLength: { value: 16, message: "Name too long" },
                        pattern: {
                            value: /[\w-]/g,
                            message: "Name can only contain letters, numbers, '-' and '_'",
                        },
                    })}
                />
                <textarea
                    className="input min-h-[16rem] mb-2"
                    placeholder="Description (optional)"
                    {...register("description", {
                        maxLength: { value: 10000, message: "Description too long" },
                    })}
                />
                <FormStatus formState={formState} buttonText="Create Thread" />
            </form>
        </>
    );
}
