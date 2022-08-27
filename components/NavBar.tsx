import { UserContext } from "lib/utils";
import Link from "next/link";
import { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "lib/firebase";
import { useRouter } from "next/router";

interface Props {
    location: string;
}

export const NavBar: React.FC<Props> = ({ location }) => {
    const user = useContext(UserContext);
    const router = useRouter();

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
                        <Link href={`/login/?return=${router.asPath}`}>
                            <a className="hover:underline">Login</a>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
