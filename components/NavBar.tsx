import { UserContext } from "lib/context";
import Link from "next/link";
import { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "lib/firebase";

export const NavBar: React.FC = () => {
    const { username } = useContext(UserContext);

    return (
        <nav className="bg-white shadow sticky top-0 w-full">
            <div className="px-4 py-2 mx-auto flex justify-between">
                <Link href="/">
                    <a className="text-xl font-bold my-auto">Sawit</a>
                </Link>
                <div className="my-auto flex">
                    {username ? (
                        <>
                            <Link href={`/u/${username}`}>
                                <a className="hover:underline">{username}</a>
                            </Link>
                            <span className="mx-1">|</span>
                            <button className="hover:underline" onClick={() => signOut(auth)}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login">
                            <button className="hover:underline">Login</button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
