import { NextApiRequest, NextApiResponse } from "next/types";
import { adminDatabase, verifyUser } from "lib/firebase_admin";
import { FieldValue } from "firebase-admin/firestore";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        const { thread, post, comment } = req.query as Record<string, string>;
        const change = Number(req.query.change);
        if (!thread || !post || Math.abs(change) != 1) throw "Invalid query";

        const uid = await verifyUser(req.cookies.userToken);

        let itemPath = `/threads/${thread}/posts/${post}`;
        if (comment) itemPath += `/comments/${comment}`;
        const itemRef = adminDatabase.doc(itemPath);
        const voteColl = adminDatabase.collection(`/users/${uid}/votes`);
        const voteQuery = comment
            ? voteColl.where("threadPostComment", "==", thread + post + comment)
            : voteColl.where("threadPost", "==", thread + post);

        if (req.method == "PUT") {
            await adminDatabase.runTransaction(async (transaction) => {
                const voteDoc = (await transaction.get(voteQuery)).docs[0];
                let incAmount = change;
                if (voteDoc) {
                    // If the upvote is opposite then multiply by two else do nothing
                    if (voteDoc.get("change") === change) return res.status(200).end();
                    else incAmount *= 2;
                }

                const data = { change } as any;
                if (comment) data.threadPostComment = thread + post + comment;
                else data.threadPost = thread + post;

                const voteSnapshot = voteDoc ? voteColl.doc(voteDoc.id) : voteColl.doc();
                transaction.set(voteSnapshot, data);
                transaction.update(itemRef, { upvotes: FieldValue.increment(incAmount) });
            });
        } else if (req.method == "DELETE") {
            await adminDatabase.runTransaction(async (transaction) => {
                const voteDoc = (await transaction.get(voteQuery)).docs[0];
                if (!voteDoc) throw "Vote does not exist";
                transaction.update(itemRef, {
                    upvotes: FieldValue.increment(voteDoc.get("change") * -1),
                });
                transaction.delete(voteColl.doc(voteDoc.id));
            });
        } else throw "Invalid method";

        res.status(200).end();
    } catch (err) {
        res.status(400).end(err.message || err);
    }
}
