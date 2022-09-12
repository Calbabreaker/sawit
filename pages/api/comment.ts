import { NextApiRequest, NextApiResponse } from "next/types";
import { adminDatabase, verifyUser } from "lib/firebase_admin";
import { Timestamp } from "firebase-admin/firestore";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        const { thread, post, comment } = req.query;
        // Ensure thread and post (id) is provided
        if (!thread || !post) throw "Invalid query";

        const uid = await verifyUser(req.cookies.userToken);
        const baseDBPath = `/threads/${thread}/posts/${post}/comments`;
        const commentRef = adminDatabase.doc(`${baseDBPath}/${comment}`);

        if (req.method == "PUT") {
            const { content } = req.body;
            if (!content || content.length > 1000) throw "Invalid body";

            // If comment provided update it else create a new one
            if (comment) {
                await adminDatabase.runTransaction(async (transaction) => {
                    const doc = await transaction.get(commentRef);
                    if (doc.get("uid") != uid) throw "Not the owner";
                    transaction.update(commentRef, { content });
                });
            } else {
                const userDoc = await adminDatabase.doc(`/users/${uid}`).get();
                await adminDatabase.collection(baseDBPath).add({
                    username: userDoc.get("name"),
                    content,
                    uid,
                    createdAt: Timestamp.now(),
                    upvotes: 0,
                });
            }
        } else if (req.method == "DELETE") {
            const doc = await commentRef.get();
            if (doc.get("uid") != uid) throw "Not the owner";
            await adminDatabase.recursiveDelete(commentRef);
        } else throw "Invalid method";

        res.status(200).end();
    } catch (err) {
        res.status(400).end(err.message || err);
    }
}
