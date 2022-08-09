import { IUserContext } from "lib/context";
import { adminAuth, adminDatabase } from "lib/firebase_admin";
import { UserData } from "lib/types";
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        if (typeof req.query.token !== "string") throw null;
        const token = await adminAuth.verifyIdToken(req.query.token);
        const snapshot = await adminDatabase.doc(`users/${token.uid}`).get();
        const userData = snapshot.data() as UserData;
        return res.status(200).send({
            uid: token.uid,
            username: userData?.name,
        } as IUserContext);
    } catch (err) {
        console.log(err);
        return res.status(400).send(null);
    }
}
