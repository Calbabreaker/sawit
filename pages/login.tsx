import { googleProvider, auth } from "lib/firebase";
import { AuthProvider, signInWithPopup, signInAnonymously } from "firebase/auth";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    if ((req as any).user) {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
        };
    } else {
        return { props: {} };
    }
};

export default function Login() {
    function redirect() {
        location.href = "/";
    }

    function signIn(provider: AuthProvider) {
        signInWithPopup(auth, provider).then(redirect).catch(console.error);
    }

    return (
        <div className="flex justify-center">
            <div className="max-w-xl w-80 pt-16">
                <h1 className="text-3xl mb-8">Log into your account</h1>
                <button className="btn" onClick={() => signIn(googleProvider)}>
                    Log in with Google
                </button>
                {/* for testing only */}
                <button className="btn" onClick={() => signInAnonymously(auth).then(redirect)}>
                    Log in Anonymously
                </button>
            </div>
        </div>
    );
}
