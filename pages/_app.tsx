import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Head from "next/head";
import Router from "next/router";
import nProgress from "nprogress";
import type { AppProps } from "next/app";
import { IUserContext, UserContext } from "lib/utils";
import { NavBar } from "components/NavBar";
import { Popup } from "components/Modals";
import { UsernameForm } from "components/UsernameForm";
import { auth, database } from "lib/firebase";
import { destroyCookie, setCookie } from "nookies";
import { doc, getDoc } from "firebase/firestore";
import { onIdTokenChanged } from "firebase/auth";
import { useEffect, useState } from "react";

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

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
        setUserCtx({ ...userCtx, username });
        setPopupOpen(false);
    }

    return (
        <UserContext.Provider value={userCtx}>
            <Head>
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            {popupOpen && (
                <Popup>
                    <UsernameForm setUsername={setUsername} />
                </Popup>
            )}
            <NavBar />
            <main className="p-4 flex justify-center">
                <div className="w-[46rem]">
                    <Component {...pageProps} />
                </div>
            </main>
        </UserContext.Provider>
    );
}
