import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore, query, collection, where, getDocs } from "firebase/firestore";

// Put your own firebase project config here
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB6K1CvQAIP_l_H6jqzY4_HzDwfpFxY0N0",
    authDomain: "sawit-692ca.firebaseapp.com",
    projectId: "sawit-692ca",
    storageBucket: "sawit-692ca.appspot.com",
    messagingSenderId: "576475445650",
    appId: "1:576475445650:web:65f0506c59981f80bea94b",
};

// Don't initialize if already did (from hot reloading)
if (getApps().length === 0) {
    initializeApp(FIREBASE_CONFIG);
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
    const q = query(collection(getFirestore(), "users"), where("name", "==", username));
    const snapshot = await getDocs(q);
    return snapshot.docs[0];
}
