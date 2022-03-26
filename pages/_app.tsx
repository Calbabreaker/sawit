import { NavBar } from "components/NavBar";
import "./globals.css";
import { auth, UserContext } from "lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

function MyApp({ Component, pageProps }) {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        onAuthStateChanged(auth, (userObj) => {
            setUser(userObj);
        });
    });

    return (
        <UserContext.Provider value={user}>
            <NavBar />
            <main className="m-4">
                <Component {...pageProps} />
            </main>
        </UserContext.Provider>
    );
}

export default MyApp;
