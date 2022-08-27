import { NextApiRequest, NextApiResponse } from "next/types";
import { adminAuth, adminDatabase } from "lib/firebase_admin";
import { Timestamp, DocumentReference, Transaction, FieldValue } from "firebase-admin/firestore";

function ensureOwner(
    ref: DocumentReference,
    uid: string,
    callback: (transaction: Transaction) => Promise<void>
): Promise<void> {
    return adminDatabase.runTransaction(async (transaction) => {
        const doc = await transaction.get(ref);
        if (doc.get("uid") != uid) throw null;
        await callback(transaction);
    });
}

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
                await ensureOwner(postRef, uid, async (transaction) => {
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
            await ensureOwner(postRef, uid, async (transaction) => {
                // Don't actually delete the document, just delete the content fields
                // To fully delete, need to delete all subcollections which will result in a lot of writes
                transaction.update(postRef, {
                    title: FieldValue.delete(),
                    content: FieldValue.delete(),
                    username: FieldValue.delete(),
                    uid: FieldValue.delete(),
                });
            });
        } else throw null;

        res.status(200).end();
    } catch (err) {
        res.status(400).end(null);
    }
}
