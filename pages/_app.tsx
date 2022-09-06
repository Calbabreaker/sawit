import { NavBar } from "components/NavBar";
import "./globals.css";
import { IUserContext, UserContext } from "lib/utils";
import { onIdTokenChanged } from "firebase/auth";
import { destroyCookie, setCookie } from "nookies";
import { useEffect, useState } from "react";
import { auth, database } from "lib/firebase";
import type { AppProps } from "next/app";
import { Popup } from "components/Popup";
import { UsernameForm } from "components/UsernameForm";
import Router from "next/router";
import nProgress from "nprogress";
import { doc, getDoc } from "firebase/firestore";
import "@fortawesome/fontawesome-svg-core/styles.css";

// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

export default function MyApp({ Component, pageProps }: AppProps) {
    const [userCtx, setUserCtx] = useState<IUserContext>();

    useEffect(() => {
        return onIdTokenChanged(auth, async (user) => {
            if (user) {
                setCookie(null, "userToken", await user.getIdToken(), { path: "/" });
                if (!userCtx) {
                    const snapshot = await getDoc(doc(database, `users/${user.uid}`));
                    setUserCtx({ uid: user.uid, username: snapshot.get("name") });
                }
            } else {
                destroyCookie(null, "userToken", { path: "/" });
                setUserCtx(null);
            }
        });
    }, []);

    const [popupOpen, setPopupOpen] = useState(false);
    useEffect(() => {
        if (userCtx && !userCtx.username) setPopupOpen(true);
    }, [userCtx]);

    function setUsername(username: string) {
        setUserCtx({ username, ...userCtx });
        setPopupOpen(false);
    }

    return (
        <UserContext.Provider value={userCtx}>
            {popupOpen && (
                <Popup>
                    <UsernameForm setUsername={setUsername} />
                </Popup>
            )}
            <NavBar />
            <main className="p-4">
                <Component {...pageProps} />
            </main>
        </UserContext.Provider>
    );
}
