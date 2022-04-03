import { googleProvider, auth, UserContext } from "lib/firebase";
import { AuthProvider, signInWithPopup } from "firebase/auth";
import { useContext, useEffect } from "react";
import Router from "next/router";

export default function Login() {
    const user = useContext(UserContext);

    useEffect(() => {
        if (user) Router.push("/");
    }, [user]);

    function signIn(provider: AuthProvider) {
        signInWithPopup(auth, provider).catch(console.error);
    }

    return (
        <div className="flex justify-center">
            <div className="max-w-xl w-80 pt-16">
                <h1 className="text-3xl mb-8">Log into your account</h1>
                <button className="btn" onClick={() => signIn(googleProvider)}>
                    Log in with Google
                </button>
            </div>
        </div>
    );
}
