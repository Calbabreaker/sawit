import { UserContext } from "lib/utils";
import Link from "next/link";
import { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "lib/firebase";
import { useRouter } from "next/router";

export const NavBar: React.FC = () => {
    const user = useContext(UserContext);

    const router = useRouter();
    const { username, thread } = router.query;
    let location = "";
    let url = "";
    if (thread) {
        location = `t/${thread}`;
        url = `/t/${thread}`;
    } else if (username) {
        location = `u/${username}`;
        url = `/user/${username}`;
    } else if (router.pathname === "/") location = "Home";

    return (
        <nav className="bg-white shadow sticky top-0 w-full z-10">
            <div className="px-4 py-2 mx-auto flex justify-between">
                <div>
                    <Link href="/">
                        <a className="text-xl font-bold my-auto">Sawit</a>
                    </Link>
                    <Link href={url}>
                        <a className="ml-4 hover:underline">{location}</a>
                    </Link>
                </div>
                <div className="my-auto flex">
                    {user?.username ? (
                        <>
                            <Link href={`/user/${user.username}`}>
                                <a className="hover:underline">{user.username}</a>
                            </Link>
                            <span className="mx-1">|</span>
                            <button className="hover:underline" onClick={() => signOut(auth)}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href={`/login/?return=${router.asPath}`}>
                            <a className="hover:underline">Login</a>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
