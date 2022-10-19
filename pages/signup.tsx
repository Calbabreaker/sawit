import { googleProvider, auth, EMAIL_REGEX } from "lib/firebase";
import { AuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
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
    confirmPassword: string;
}

export default function SignUp() {
    const { register, handleSubmit, formState, watch, setError } = useForm<FormValues>({
        mode: "onChange",
    });
    const router = useRouter();

    function redirect() {
        router.push((router.query.return as string) || "/");
    }

    function signup(provider: AuthProvider) {
        signInWithPopup(auth, provider).then(redirect).catch(console.error);
    }

    const signUpSubmit = handleSubmit(async ({ email, password }) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            if (err.code == "auth/email-already-in-use") {
                return setError("email", { message: "Email is already in use" });
            } else {
                throw err;
            }
        }

        redirect();
    });

    return (
        <div className="flex justify-center text-center flex-col items-center pt-16">
            <MetaTags title="Sawit Login" />
            <h1 className="text-3xl mb-8">Sign up with an account</h1>
            <div className="max-w-xl w-80">
                <button className="btn w-full" onClick={() => signup(googleProvider)}>
                    <FontAwesomeIcon icon={faGoogle} className="w-4 my-auto mr-2" />
                    Sign up with Google
                </button>

                <hr className="bg-slate-400 h-0.5 my-6 w-[95%] text-center mx-auto" />
                <form onSubmit={signUpSubmit}>
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
                            minLength: {
                                value: 8,
                                message: "Password must have over 8 characters",
                            },
                            maxLength: {
                                value: 256,
                                message: "Password must be less than 256 characters",
                            },
                        })}
                    />
                    <input
                        className="input mb-2"
                        placeholder="Confirm Password"
                        type="password"
                        {...register("confirmPassword", {
                            required: true,
                            validate: (val) => {
                                if (watch("password") != val) {
                                    return "Passwords do not match";
                                }
                            },
                        })}
                    />
                    <FormStatus
                        formState={formState}
                        buttonText="Signup"
                        buttonClass="w-full mb-2"
                    />
                </form>
                <div className="mt-2 text-gray-500">
                    Already have an account?
                    <Link href={{ pathname: `/login`, query: router.query }}>
                        <a className="link ml-2">Login</a>
                    </Link>
                </div>
            </div>
        </div>
    );
}
