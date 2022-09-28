import { googleProvider, auth } from "lib/firebase";
import { AuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { GetServerSideProps } from "next";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Router from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MetaTags } from "components/MetaTags";
import { useForm } from "react-hook-form";
import { FormStatus } from "components/FormStatus";
import Link from "next/link";

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

interface FormValues {
    email: string;
    password: string;
}

export default function Login() {
    const { register, handleSubmit, formState, setError } = useForm<FormValues>({
        mode: "onChange",
    });

    function redirect() {
        Router.push((Router.query.return as string) || "/");
    }

    function login(provider: AuthProvider) {
        signInWithPopup(auth, provider).then(redirect).catch(console.error);
    }

    const loginSubmit = handleSubmit(async ({ email, password }) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            if (err.code == "auth/user-not-found") {
                return setError("email", { message: "User not found" });
            } else if (err.code == "auth/wrong-password") {
                return setError("password", { message: "Password is incorrect" });
            }

            throw err;
        }
        redirect();
    });

    return (
        <div className="flex justify-center text-center flex-col pt-16 items-center">
            <MetaTags title="Sawit Login" />
            <h1 className="text-3xl mb-8">Log into your account</h1>
            <div className="max-w-xl w-80">
                <button className="btn w-full" onClick={() => login(googleProvider)}>
                    <FontAwesomeIcon icon={faGoogle} className="w-4 my-auto mr-2" />
                    Log in with Google
                </button>

                <hr className="bg-slate-400 h-0.5 my-6 w-[95%] text-center mx-auto" />
                <form onSubmit={loginSubmit}>
                    <input
                        placeholder="Email"
                        className="input mb-2"
                        {...register("email", {
                            required: true,
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                        })}
                    />
                    <input
                        className="input mb-2"
                        placeholder="Password"
                        type="password"
                        {...register("password", {
                            required: true,
                            maxLength: {
                                value: 256,
                                message: "Password must be less than 256 characters",
                            },
                        })}
                    />
                    <FormStatus
                        formState={formState}
                        buttonText="Login"
                        buttonClass="w-full mb-2"
                    />
                </form>
                <div className="mt-2 text-gray-500">
                    Don't have an account?
                    <Link href="/signup">
                        <a className="mx-2 text-blue-500 hover:underline">Sign Up</a>
                    </Link>
                </div>
            </div>
        </div>
    );
}
