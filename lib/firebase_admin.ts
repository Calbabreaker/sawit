import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

const privateKey = process.env.PRIVATE_KEY;
const clientEmail = process.env.CLIENT_EMAIL;
const projectId = process.env.PROJECT_ID;

if (!privateKey || !clientEmail || !projectId) {
    console.warn("Firebase Admin SDK credentials were not found. See README.md for instructions.");
}

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert({
            privateKey,
            clientEmail,
            projectId,
        }),
        databaseURL: `https://${projectId}.firebaseio.com`,
    });
}

export const adminAuth = getAuth();
export const adminDatabase = getFirestore();

export async function verifyUser(userToken?: string): Promise<string> {
    if (!userToken) throw null;
    const token = await adminAuth.verifyIdToken(userToken);
    return token.uid;
}
