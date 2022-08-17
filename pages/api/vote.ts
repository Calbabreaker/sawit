import { NextApiRequest, NextApiResponse } from "next/types";
import { adminDatabase, adminAuth } from "lib/firebase_admin";
import { FieldValue } from "firebase-admin/firestore";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        const { thread, postID, up } = req.query;
        if (!thread || !postID || !up) throw null;

        const { userToken } = req.cookies;
        const { uid } = await adminAuth.verifyIdToken(userToken);

        const batch = adminDatabase.batch();
        const postRef = adminDatabase.doc(`/threads/${thread}/posts/${postID}`);
        const voteRef = postRef.collection("votes").doc(uid);
        const voteDoc = (await voteRef.get()).data();

        switch (req.method) {
            case "PUT":
                const isUp = up === "1";
                let incAmount = isUp ? 1 : -1;
                if (voteDoc) {
                    // If the upvote is opposite then multiply by two else do nothing
                    if (voteDoc.up === isUp) return res.status(200).end();
                    else incAmount *= 2;
                }

                batch.update(postRef, { upvotes: FieldValue.increment(incAmount) });
                batch.set(voteRef, { up: isUp });
                await batch.commit();
                res.status(200).end();
                break;
            case "DELETE":
                if (!voteDoc) throw null;
                batch.update(postRef, { upvotes: FieldValue.increment(voteDoc.up ? -1 : 1) });
                batch.delete(voteRef);
                res.status(200).end();
                break;
            default:
                res.setHeader("Allow", ["PUT", "DELETE"]);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (err) {
        res.status(400).json(err);
    }
}
