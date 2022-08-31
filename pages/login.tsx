import { googleProvider, auth } from "lib/firebase";
import { AuthProvider, signInWithPopup, signInAnonymously } from "firebase/auth";
import { GetServerSideProps } from "next";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Router from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MetaTags } from "components/MetaTags";

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    if (req.cookies.userToken) {
        return {
            redirect: {
                permanent: false,
                destination: (query.return as string) || "/",
            },
        };
    } else {
        return { props: {} };
    }
};

export default function Login() {
    function redirect() {
        Router.push((Router.query.return as string) || "/");
    }

    function signIn(provider: AuthProvider) {
        signInWithPopup(auth, provider).then(redirect).catch(console.error);
    }

    return (
        <div className="flex justify-center">
            <MetaTags title="Sawit Login" />
            <div className="max-w-xl w-80 pt-16">
                <h1 className="text-3xl mb-8">Log into your account</h1>
                <button className="btn" onClick={() => signIn(googleProvider)}>
                    <FontAwesomeIcon icon={faGoogle} className="w-4 my-auto mr-2" />
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
