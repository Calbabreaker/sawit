import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createContext } from "react";

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
export const db = getFirestore();

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export const UserContext = createContext<User>(undefined);
