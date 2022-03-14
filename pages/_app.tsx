import { NavBar } from "components/NavBar";
import "./globals.css";

function MyApp({ Component, pageProps }) {
    return (
        <>
            <NavBar />
            <main>
                <Component {...pageProps} />
            </main>
        </>
    );
}

export default MyApp;
