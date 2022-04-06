import { NavBar } from "components/NavBar";
import "./globals.css";
import { auth, database } from "lib/firebase";
import { UserContext } from "lib/context";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { UserData } from "lib/types";
import { doc, getDoc } from "firebase/firestore";
import { Popup } from "components/Popup";
import { UsernameForm } from "components/UsernameForm";

function MyApp({ Component, pageProps }) {
    const [user, setUser] = useState<User>();
    const [username, setUsername] = useState<string>();
    const [usernameFormVisible, setUsernameFormVisible] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, async (userObj) => {
            setUser(userObj);
            if (userObj) {
                const snapshot = await getDoc(doc(database, "users", userObj.uid));
                const userData = snapshot.data() as UserData;
                if (!userData?.name) {
                    setUsernameFormVisible(true);
                }
            } else {
                setUsername(undefined);
            }
        });
    }, []);

    useEffect(() => {
        if (usernameFormVisible && username) {
            setUsernameFormVisible(false);
        }
    }, [username]);

    return (
        <UserContext.Provider value={{ username, setUsername, user }}>
            <NavBar />
            <main className="m-4">
                <Component {...pageProps} />
            </main>
            <Popup open={usernameFormVisible}>
                <h1 className="text-3xl mb-4 text-center">Please choose a username</h1>
                <UsernameForm />
            </Popup>
        </UserContext.Provider>
    );
}

export default MyApp;
