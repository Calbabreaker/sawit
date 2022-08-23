import { NextApiRequest, NextApiResponse } from "next/types";
import { adminDatabase, adminAuth } from "lib/firebase_admin";
import { FieldValue } from "firebase-admin/firestore";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        const { thread, post } = req.query;
        const change = Number(req.query.change);
        if (!thread || !post || Math.abs(change) != 1) throw null;

        const { userToken } = req.cookies;
        const { uid } = await adminAuth.verifyIdToken(userToken);

        const postRef = adminDatabase.doc(`/threads/${thread}/posts/${post}`);
        const voteRef = postRef.collection("votes").doc(uid);

        if (req.method == "PUT") {
            await adminDatabase.runTransaction(async (transaction) => {
                const voteDoc = (await transaction.get(voteRef)).data();
                let incAmount = change;
                if (voteDoc) {
                    // If the upvote is opposite then multiply by two else do nothing
                    if (voteDoc.change === change) return res.status(200).end();
                    else incAmount *= 2;
                }

                transaction.update(postRef, { upvotes: FieldValue.increment(incAmount) });
                transaction.set(voteRef, { change });
            });
        } else if (req.method == "DELETE") {
            await adminDatabase.runTransaction(async (transaction) => {
                const voteDoc = (await transaction.get(voteRef)).data();
                if (!voteDoc) throw null;
                transaction.update(postRef, { upvotes: FieldValue.increment(voteDoc.change * -1) });
                transaction.delete(voteRef);
            });
        } else throw null;

        res.status(200).end();
    } catch (err) {
        res.status(400).end(null);
    }
}
