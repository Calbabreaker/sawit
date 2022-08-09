import { NavBar } from "components/NavBar";
import "./globals.css";
import { IUserContext, UserContext } from "lib/context";
import { onIdTokenChanged } from "firebase/auth";
import { destroyCookie, setCookie, parseCookies } from "nookies";
import { useEffect, useState } from "react";
import { auth } from "lib/firebase";
import type { AppContext, AppProps } from "next/app";
import App from "next/app";
import { Popup } from "components/Popup";
import { UsernameForm } from "components/UsernameForm";

const cookieName = "firebaseToken";

interface Props extends AppProps {
    userCtxIntial?: IUserContext;
}

function MyApp({ Component, pageProps, userCtxIntial }: Props) {
    const [userCtx, setUserCtx] = useState(userCtxIntial);

    useEffect(() => {
        return onIdTokenChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                setCookie(null, cookieName, token, { path: "/" });
            } else {
                destroyCookie(null, cookieName);
                setUserCtx(null);
            }
        });
    }, []);

    // Force the token to refresh every 10 minutes otherwise it will expire
    useEffect(() => {
        const handle = setInterval(async () => {
            if (auth.currentUser) await auth.currentUser.getIdToken(true);
        }, 10 * 60 * 1000);
        return () => clearInterval(handle);
    }, []);

    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (userCtx && !userCtx.username) setOpen(true);
    }, [userCtx]);

    function setUsername(username: string) {
        setUserCtx({ username, ...userCtx });
        setOpen(false);
    }

    return (
        <UserContext.Provider value={userCtx}>
            <Popup open={open}>
                <UsernameForm setUsername={setUsername} />
            </Popup>
            <NavBar />
            <main className="m-4">
                <Component {...pageProps} />
            </main>
        </UserContext.Provider>
    );
}

MyApp.getInitialProps = async (context: AppContext) => {
    const appProps = await App.getInitialProps(context);

    // Only run on server when initial website load
    if (typeof window == "undefined") {
        const { req } = context.ctx;
        const protocol = req.headers["x-forwarded-proto"] ?? "http";
        const baseUrl = `${protocol}://${req.headers.host}`;

        const cookies = parseCookies(context.ctx);
        if (cookies[cookieName]) {
            try {
                // Have to fetch next js api route since can't acess Admin SDK here
                const res = await fetch(`${baseUrl}/api/validate?token=${cookies[cookieName]}`);
                const userCtxIntial = await res.json();
                (req as any).user = userCtxIntial; // Pass user to getServerSideProps and stuff
                return { userCtxIntial, ...appProps } as Props;
            } catch (err) {}
        }
    }

    return { ...appProps };
};

export default MyApp;
