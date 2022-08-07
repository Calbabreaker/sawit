import { NavBar } from "components/NavBar";
import "./globals.css";
import { auth, database } from "lib/firebase";
import { UserContext } from "lib/context";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { UserData } from "lib/types";
import { doc, getDoc } from "firebase/firestore";

function MyApp({ Component, pageProps }) {
    const [user, setUser] = useState<User>();
    const [username, setUsername] = useState<string>();

    useEffect(() => {
        onAuthStateChanged(auth, async (userObj) => {
            setUser(userObj);
            if (userObj) {
                const snapshot = await getDoc(doc(database, "users", userObj.uid));
                const userData = snapshot.data() as UserData;
                setUsername(userData.name);
            }
        });
    }, []);

    return (
        <UserContext.Provider value={{ username, setUsername, user }}>
            <NavBar />
            <main className="m-4">
                <Component {...pageProps} />
            </main>
        </UserContext.Provider>
    );
}

export default MyApp;
