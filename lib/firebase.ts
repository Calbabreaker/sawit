import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore, query, collection, where, getDocs } from "firebase/firestore";

// don't initialize if already did (from hot reloading)
if (getApps().length === 0) {
    initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
}

export const auth = getAuth();
export const database = getFirestore();

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

/**
 * Get user doc at users/{userID} by the username.
 *
 * @param username - The username of the user
 * @returns The user doc.
 */
export async function getUserByName(username: string) {
    const q = query(collection(database, "users"), where("name", "==", username));
    const snapshot = await getDocs(q);
    return snapshot.docs[0];
}
