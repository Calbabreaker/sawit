import { NextApiRequest, NextApiResponse } from "next/types";
import { adminDatabase, verifyUser } from "lib/firebase_admin";
import { Timestamp } from "firebase-admin/firestore";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        const { thread, post, comment } = req.query;
        // Ensure thread and post (id) is provided
        // Throw null because dont care about nice error handling
        if (!thread || !post) throw null;

        const uid = verifyUser(req.cookies.userToken);
        const baseDBPath = `/threads/${thread}/posts/${post}/comments`;
        const commentRef = adminDatabase.doc(`${baseDBPath}/${comment}`);

        if (req.method == "PUT") {
            const { content } = req.body;
            if (content.length > 1000) throw null;

            // If comment provided update it else create a new one
            if (comment) {
                return adminDatabase.runTransaction(async (transaction) => {
                    const doc = await transaction.get(commentRef);
                    if (doc.get("uid") != uid) throw null;
                    transaction.update(commentRef, { content });
                });
            } else {
                const userDoc = await adminDatabase.doc(`/users/${uid}`).get();
                const doc = await adminDatabase.collection(baseDBPath).add({
                    username: userDoc.get("name"),
                    content,
                    uid,
                    createdAt: Timestamp.now(),
                    upvotes: 0,
                });

                return res.status(200).end(doc.id);
            }
        } else if (req.method == "DELETE") {
            const doc = await commentRef.get();
            if (doc.get("uid") != uid) throw null;
            await adminDatabase.recursiveDelete(commentRef);
        } else throw null;

        res.status(200).end();
    } catch (err) {
        console.error(err);
        res.status(400).end(null);
    }
}
