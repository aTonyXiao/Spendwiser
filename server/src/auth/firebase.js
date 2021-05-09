/** @module Firebase Middleware that utilizes firebase-admin for request token auth */

import fs from "fs";
import admin from "firebase-admin";

// must provide the firebase-admin json key to utilize this middleware
let rawData = fs.readFileSync(process.env.ADMIN_JSON);
let firebaseKey = JSON.parse(rawData);

// initialize with the provided credentials
admin.initializeApp({
    credential: admin.credential.cert(firebaseKey)
});

/**
 * Middleware that is utilized when authenticating requests (custom)
 */ 
function firebase (req, res, next) {
    try {
        // force the auth string to require Bearer by splitting using it
        const header = req.headers.authorization.split("Bearer ");

        // verify the token using firebase-admin using the header token
        admin.auth().verifyIdToken(header[1]).then((usr) => {
            req.user = usr; // success
            next();
        }).catch((err) => {
            res.sendStatus(401); // not authorized
        });
    } catch {
        res.sendStatus(401); // not authorized
    }
}

export default firebase;