import Link from "next/link";

export const NavBar: React.FC = () => {
    return (
        <nav className="bg-white shadow sticky top-0 w-full">
            <div className="px-4 py-2 max-w-5xl mx-auto flex justify-between">
                <a className="flex" href="/">
                    <span className="text-xl font-bold my-auto mx-3">Sawit</span>
                </a>
                <div className="my-auto flex">
                    <Link href="/login">
                        <button>Login</button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
