import { NavBar } from "components/NavBar";
import "./globals.css";
import { auth, db, UserContext } from "lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { UserData } from "lib/types";
import { collection, doc, getDoc } from "firebase/firestore";
import { Popup } from "components/Popup";
import { UsernameForm } from "components/UsernameForm";

function MyApp({ Component, pageProps }) {
    const [user, setUser] = useState<User>();
    const [usernameFormVisible, setUsernameFormVisible] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, async (userObj) => {
            if (userObj) {
                setUser(user);
                const snapshot = await getDoc(doc(collection(db, "user"), userObj.uid));
                const data = snapshot.data();
                if (data) {
                    setUserData(data as UserData);
                } else {
                    setUsernameFormVisible(true);
                }
            }
        });
    }, []);

    return (
        <UserContext.Provider value={user}>
            <NavBar />
            <main className="m-4">
                <Component {...pageProps} />
            </main>
            <Popup open={usernameFormVisible}>
                <UsernameForm />
            </Popup>
        </UserContext.Provider>
    );
}

export default MyApp;
