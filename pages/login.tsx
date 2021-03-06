import { googleProvider, auth } from "lib/firebase";
import { UserContext } from "lib/context";
import { AuthProvider, signInWithPopup, signInAnonymously } from "firebase/auth";
import { useContext, useEffect } from "react";
import Router from "next/router";

export default function Login() {
    const { username } = useContext(UserContext);

    useEffect(() => {
        if (username) Router.push("/");
    }, [username]);

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
                {/* for testing only */}
                <button className="btn" onClick={() => signInAnonymously(auth)}>
                    Log in Anonymously
                </button>
            </div>
        </div>
    );
}
