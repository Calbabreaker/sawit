import { UserContext } from "lib/utils";
import Link from "next/link";
import { useContext, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "lib/firebase";
import { useRouter } from "next/router";
import { Logo } from "./Logo";

export const NavBar: React.FC = () => {
    const userCtx = useContext(UserContext);

    const router = useRouter();
    const { username, thread } = router.query;
    let location = "";
    if (thread) {
        location = `t/${thread}`;
    } else if (username) {
        location = `u/${username}`;
    } else if (router.pathname === "/") location = "Home";

    const [dropDownVisible, setDropdownVisible] = useState(false);

    return (
        <nav className="bg-white shadow sticky top-0 w-full z-10">
            <div className="px-4 py-2 mx-auto flex justify-between">
                <div className="flex">
                    <Link href="/" legacyBehavior>
                        <div className="cursor-pointer flex">
                            <div className="w-6 my-auto mr-2">
                                <Logo />
                            </div>
                            <a className="text-xl font-bold my-auto">Sawit</a>
                        </div>
                    </Link>
                    <span className="ml-4 my-auto">{location}</span>
                </div>
                <div className="my-auto flex">
                    {userCtx?.username ? (
                        <>
                            <button
                                className="hover:underline"
                                onClick={() => setDropdownVisible(!dropDownVisible)}
                            >
                                {userCtx.username}
                            </button>
                        </>
                    ) : (
                        <Link
                            href={{
                                pathname: "/login",
                                query: { return: router.query.return || router.asPath },
                            }}
                            className="hover:underline"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
            {dropDownVisible && userCtx && (
                <div className="absolute w-32 right-0 z-10 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 text-gray-700 text-sm">
                    <Link
                        href={`/u/${userCtx.username}`}
                        className="hover:underline block px-4 py-2"
                    >
                        My profile
                    </Link>
                    <button
                        className="hover:underline block px-4 py-2"
                        onClick={() => signOut(auth)}
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};
