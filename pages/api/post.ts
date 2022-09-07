import { NextApiRequest, NextApiResponse } from "next/types";
import { verifyUser, adminDatabase } from "lib/firebase_admin";
import { Timestamp } from "firebase-admin/firestore";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        const { thread, post } = req.query;
        // Ensure thread (id) is provided
        // Throw null because dont care about nice error handling
        if (!thread) throw null;

        const uid = await verifyUser(req.cookies.userToken);
        const baseDBPath = `/threads/${thread}/posts`;
        const postRef = adminDatabase.doc(`${baseDBPath}/${post}`);

        if (req.method == "PUT") {
            const { title, content } = req.body;
            if (title.length > 100 && content.length > 10000) throw null;

            // If post provided update it else create a new one
            if (post) {
                return adminDatabase.runTransaction(async (transaction) => {
                    const doc = await transaction.get(postRef);
                    if (doc.get("uid") != uid) throw null;
                    transaction.update(postRef, { title, content });
                });
            } else {
                const userDoc = await adminDatabase.doc(`/users/${uid}`).get();
                const doc = await adminDatabase.collection(baseDBPath).add({
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
        res.status(400).end(null);
    }
}
