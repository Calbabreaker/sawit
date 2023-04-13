import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import {
    getFirestore,
    Timestamp,
    DocumentSnapshot,
    query,
    collection,
    where,
    getDocs,
    limit,
    orderBy,
    QueryConstraint,
} from "firebase/firestore";
import { DataType } from "./types";

// ---------------------------------------------
// | Put your own firebase project config here |
// ---------------------------------------------
export const FIREBASE_CONFIG = {
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

export function snapshotToJSON<T extends DataType>(snapshot: DocumentSnapshot): T {
    const data = snapshot.data() as T & { createdAt: Timestamp };
    return {
        ...data,
        id: snapshot.id,
        createdAt: data.createdAt.toMillis(),
    };
}

export async function getDocByName(
    collectionName: string,
    name: string | string[]
): Promise<DocumentSnapshot> {
    const snapshot = await getDocs(
        query(collection(database, collectionName), where("name", "==", name), limit(1))
    );
    return snapshot.docs[0];
}

export const LIMIT = 10;
export const EMAIL_REGEX = /^\S+@\w+\.\w+$/;
export const NAME_REGEX = /^[\w-]+$/;
export const VALID_IMAGE_HOSTS = ["i.imgur.com"];

export function getSortQuery(sort?: string): QueryConstraint {
    switch (sort) {
        case "oldest":
            return orderBy("createdAt");
        case "latest":
            return orderBy("createdAt", "desc");
        case "least":
            return orderBy("upvotes");
        case "most":
            return orderBy("upvotes", "desc");
        default:
            throw "Invalid sort";
    }
}
