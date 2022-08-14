import { UserContext } from "lib/context";
import Link from "next/link";
import { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "lib/firebase";

interface Props {
    location: string;
}

export const NavBar: React.FC<Props> = ({ location }) => {
    const user = useContext(UserContext);

    return (
        <nav className="bg-white shadow sticky top-0 w-full z-10">
            <div className="px-4 py-2 mx-auto flex justify-between">
                <div>
                    <Link href="/">
                        <a className="text-xl font-bold my-auto">Sawit</a>
                    </Link>
                    <span className="mx-4">{location}</span>
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
                        <Link href="/login">
                            <button className="hover:underline">Login</button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
