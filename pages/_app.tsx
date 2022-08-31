import { NavBar } from "components/NavBar";
import "./globals.css";
import { IUserContext, UserContext } from "lib/utils";
import { onIdTokenChanged } from "firebase/auth";
import { destroyCookie, setCookie, parseCookies } from "nookies";
import { useEffect, useState } from "react";
import { auth, database } from "lib/firebase";
import type { AppContext, AppProps } from "next/app";
import App from "next/app";
import { Popup } from "components/Popup";
import { UsernameForm } from "components/UsernameForm";
import { ValidateResponse } from "./api/validate";
import { useRouter } from "next/router";
import Router from "next/router";
import nProgress from "nprogress";
import { doc, getDoc } from "firebase/firestore";

interface Props extends AppProps {
    userCtxIntial?: IUserContext;
}

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

function MyApp({ Component, pageProps, userCtxIntial }: Props) {
    const [userCtx, setUserCtx] = useState(userCtxIntial);

    useEffect(() => {
        return onIdTokenChanged(auth, async (user) => {
            if (user) {
                setCookie(null, "userToken", await user.getIdToken(), { path: "/" });
                setCookie(null, "refreshToken", user.refreshToken, { path: "/" });
                if (!userCtx) {
                    const snapshot = await getDoc(doc(database, `users/${user.uid}`));
                    setUserCtx({ uid: user.uid, username: snapshot.get("name") });
                }
            } else {
                destroyCookie(null, "userToken", { path: "/" });
                destroyCookie(null, "refreshToken", { path: "/" });
                setUserCtx(null);
            }
        });
    }, []);

    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (userCtx && !userCtx.username) setOpen(true);
    }, [userCtx]);

    function setUsername(username: string) {
        setUserCtx({ username, ...userCtx });
        setOpen(false);
    }

    const router = useRouter();
    const { username, thread } = router.query;
    let location = "";
    if (thread) location = `t/${thread}`;
    else if (username) location = `u/${username}`;
    else if (router.pathname === "/") location = "Home";

    return (
        <UserContext.Provider value={userCtx}>
            <Popup open={open}>
                <UsernameForm setUsername={setUsername} />
            </Popup>
            <NavBar location={location} />
            <main className="p-4">
                <Component {...pageProps} />
            </main>
        </UserContext.Provider>
    );
}

MyApp.getInitialProps = async (context: AppContext) => {
    const appProps = await App.getInitialProps(context);

    // Only run on server when initial app load
    if (typeof window == "undefined") {
        const { req } = context.ctx;
        const protocol = req.headers["x-forwarded-proto"] ?? "http";
        const baseUrl = `${protocol}://${req.headers.host}`;

        const { userToken, refreshToken } = parseCookies(context.ctx);
        if (refreshToken) {
            try {
                // Have to fetch next js api route since can't acess Admin SDK in this file
                const path = `${baseUrl}/api/validate?userToken=${userToken}&refreshToken=${refreshToken}`;
                console.log(path);
                const res = await fetch(path);
                console.log(res.status);
                const data = (await res.json()) as ValidateResponse;

                console.log(data);

                // Set the cookie when the server decides it needs to be refreshed
                if (data.token) setCookie(context.ctx, "userToken", data.token, { path: "/" });

                (req as any).user = data; // Pass user to getServerSideProps and stuff
                return { userCtxIntial: data, ...appProps } as Props;
            } catch (err) {}
        }
    }

    return { ...appProps };
};

export default MyApp;
