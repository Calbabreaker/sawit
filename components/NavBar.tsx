import { UserContext } from "lib/firebase";
import Link from "next/link";
import { useContext } from "react";

export const NavBar: React.FC = () => {
    const user = useContext(UserContext);

    return (
        <nav className="bg-white shadow sticky top-0 w-full">
            <div className="px-4 py-2 mx-auto flex justify-between">
                <Link href="/">
                    <a className="text-xl font-bold my-auto">Sawit</a>
                </Link>
                <div className="my-auto flex">
                    {user ? (
                        <div>{user.name}</div>
                    ) : (
                        <Link href="/login">
                            <button>Login</button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
