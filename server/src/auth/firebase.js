import fs from "fs";
import * as admin from "firebase-admin";

let rawData = fs.readFileSync("firebase_admin.json");
let firebaseKey = JSON.parse(rawData);

admin.initializeApp({
    credential: admin.credential.cert(firebaseKey)
})

function firebase (req, res, next) {
    try {
        // force it to be at index 1
        const header = req.headers.split("Bearer ");
        admin.auth().verifyIdToken(header[1]).then((usr) => {
            req.user = usr;
            next();
        }).catch((err) => {
            res.sendStatus(401);
        });
    } catch {
        res.sendStatus(401);
    }
}

export default firebase;