import { NextApiRequest, NextApiResponse } from "next/types";
import { adminAuth, adminDatabase } from "lib/firebase_admin";
import { Timestamp } from "firebase-admin/firestore";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        const { thread, post } = req.query;
        if (!thread) throw null;

        const { userToken } = req.cookies;
        const { uid } = await adminAuth.verifyIdToken(userToken);
        const postRef = adminDatabase.doc(`/threads/${thread}/posts/${post}`);

        if (req.method == "PUT") {
            const { title, content } = req.body;
            if (title.length > 100 && content.length > 10000) throw null;
            if (post) {
                return adminDatabase.runTransaction(async (transaction) => {
                    const doc = await transaction.get(postRef);
                    if (doc.get("uid") != uid) throw null;
                    transaction.update(postRef, { title, content });
                });
            } else {
                const userDoc = await adminDatabase.doc(`/users/${uid}`).get();
                const doc = await adminDatabase.collection(`/threads/${thread}/posts`).add({
                    username: userDoc.get("name"),
                    thread,
                    title,
                    content,
                    uid,
                    createdAt: Timestamp.now(),
                    upvotes: 0,
                });

                return res.status(200).end(doc.id);
            }
        } else if (req.method == "DELETE") {
            const doc = await postRef.get();
            if (doc.get("uid") != uid) throw null;
            await adminDatabase.recursiveDelete(postRef);
        } else throw null;

        res.status(200).end();
    } catch (err) {
        console.error(err);
        res.status(400).end(null);
    }
}
