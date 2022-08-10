import { NavBar } from "components/NavBar";
import "./globals.css";
import { IUserContext, UserContext } from "lib/context";
import { onAuthStateChanged } from "firebase/auth";
import { destroyCookie, setCookie, parseCookies } from "nookies";
import { useEffect, useState } from "react";
import { auth } from "lib/firebase";
import type { AppContext, AppProps } from "next/app";
import App from "next/app";
import { Popup } from "components/Popup";
import { UsernameForm } from "components/UsernameForm";
import { ValidateResponse } from "./api/validate";
import { useRouter } from "next/router";

interface Props extends AppProps {
    userCtxIntial?: IUserContext;
}

function MyApp({ Component, pageProps, userCtxIntial }: Props) {
    const [userCtx, setUserCtx] = useState(userCtxIntial);

    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCookie(null, "refreshToken", user.refreshToken, { path: "/" });
            } else {
                destroyCookie(null, "userToken");
                destroyCookie(null, "refreshToken");
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
                // Have to fetch next js api route since can't acess Admin SDK here
                const path = `${baseUrl}/api/validate?userToken=${userToken}&refreshToken=${refreshToken}`;
                const res = await fetch(path);
                const data = (await res.json()) as ValidateResponse;

                // Set the cookie when the server decides it needs to be refreshed
                if (data.token) setCookie(context.ctx, "userToken", data.token);

                (req as any).user = data; // Pass user to getServerSideProps and stuff
                return { userCtxIntial: data, ...appProps } as Props;
            } catch (err) {}
        }
    }

    return { ...appProps };
};

export default MyApp;
