import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createContext } from "react";

// don't initialize if already did (from hot reloading)
if (getApps().length === 0) {
    initializeApp({
    });
}

export const auth = getAuth();
export const db = getFirestore();

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export const UserContext = createContext<User>(undefined);
