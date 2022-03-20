import { NavBar } from "components/NavBar";
import "./globals.css";

function MyApp({ Component, pageProps }) {
    return (
        <>
            <NavBar />
            <main className="m-4">
                <Component {...pageProps} />
            </main>
        </>
    );
}

export default MyApp;
