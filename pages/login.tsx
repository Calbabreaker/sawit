import { googleProvider, auth, EMAIL_REGEX } from "lib/firebase";
import { AuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MetaTags } from "components/MetaTags";
import { useForm } from "react-hook-form";
import { FormStatus } from "components/FormStatus";
import Link from "next/link";
import { makeAuthRedirectSSR } from "lib/utils";

export const getServerSideProps = makeAuthRedirectSSR(false);

interface FormValues {
    email: string;
    password: string;
}

export default function Login() {
    const { register, handleSubmit, formState, setError } = useForm<FormValues>({
        mode: "onChange",
    });
    const router = useRouter();

    function redirect() {
        router.push((router.query.return as string) || "/");
    }

    function login(provider: AuthProvider) {
        signInWithPopup(auth, provider).then(redirect).catch(console.error);
    }

    const loginSubmit = handleSubmit(async ({ email, password }) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            switch (err.code) {
                case "auth/user-not-found":
                    return setError("email", { message: "User not found" });
                case "auth/wrong-password":
                    return setError("password", { message: "Password is incorrect" });
                default:
                    throw err;
            }
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
                            pattern: { value: EMAIL_REGEX, message: "Invalid email" },
                        })}
                    />
                    <input
                        className="input mb-2"
                        placeholder="Password"
                        type="password"
                        {...register("password", {
                            required: true,
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
                    <Link href={{ pathname: `/signup`, query: router.query }}>
                        <a className="link ml-2">Sign Up</a>
                    </Link>
                </div>
            </div>
        </div>
    );
}
