import { NextApiRequest, NextApiResponse } from "next/types";
import { adminDatabase, verifyUser } from "lib/firebase_admin";
import { Timestamp } from "firebase-admin/firestore";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    try {
        let name = req.query.name as string;
        if (!name || /[^\w-]/g.test(name)) throw "Invalid query";
        name = name.toLowerCase();

        const uid = await verifyUser(req.cookies.userToken);
        const threadRef = adminDatabase.doc(`threads/${name}`);

        if (req.method == "PUT") {
            const { description } = req.body;
            if (description.length > 10000) throw "Invalid body";

            await adminDatabase.runTransaction(async (transaction) => {
                const doc = await transaction.get(threadRef);
                if (doc.exists) throw "Already exists";
                transaction.set(threadRef, {
                    ownerUID: uid,
                    description,
                    moderatorUIDS: [uid],
                    createdAt: Timestamp.now(),
                });
            });
        } else if (req.method == "DELETE") {
            const doc = await threadRef.get();
            if (doc.get("ownerUID") != uid) throw "Not the owner";
            threadRef.delete();
        } else throw "Invalid method";

        res.status(200).end();
    } catch (err) {
        res.status(400).end(err.message || err);
    }
}
