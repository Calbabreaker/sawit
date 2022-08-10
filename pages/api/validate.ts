import { IUserContext } from "lib/context";
import { adminAuth, adminDatabase } from "lib/firebase_admin";
import { FIREBASE_CONFIG } from "lib/firebase";
import { UserData } from "lib/types";
import { NextApiRequest, NextApiResponse } from "next/types";

async function refreshUserToken(refreshToken: string): Promise<string> {
    const path = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_CONFIG.apiKey}`;
    const res = await fetch(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    });

    const data = await res.json();
    if (!res.ok) throw new Error("Failed to refresh token. " + JSON.stringify(data));
    return data.id_token;
}

export interface ValidateResponse extends IUserContext {
    token?: string;
}

async function validate(userToken: string, refreshToken: string): Promise<ValidateResponse> {
    const token = await adminAuth.verifyIdToken(userToken).catch(async (err) => {
        // Refresh the token if expired or invalid
        if (err.code == "auth/id-token-expired" || err.code == "auth/argument-error") {
            userToken = await refreshUserToken(refreshToken);
            return await adminAuth.verifyIdToken(userToken);
        } else {
            throw err;
        }
    });

    const snapshot = await adminDatabase.doc(`users/${token.uid}`).get();
    const userData = snapshot.data() as UserData;
    return {
        uid: token.uid,
        username: userData?.name,
    };
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        const { userToken, refreshToken } = req.query;
        if (!refreshToken) throw null;

        const data = await validate(userToken as string, refreshToken as string);
        return res.status(200).send(data);
    } catch (err) {
        console.error(err);
        return res.status(400).send(null);
    }
}
