const fs = require('fs');
const readline = require('readline');
const admin = require('firebase-admin');

// must provide the firebase-admin json key to utilize this middleware
let rawData = fs.readFileSync("firebase_admin.json");
let firebaseKey = JSON.parse(rawData);

// initialize with the provided credentials
admin.initializeApp({
    credential: admin.credential.cert(firebaseKey)
});

function getDatabaseLocation(location) {
    let database = admin.firestore();
    let locationList = location.split(".");
    let databaseLocation = database;
    for (let i = 0; i < locationList.length; i++) {
        if (i % 2 == 0) { // collection
            databaseLocation = databaseLocation.collection(locationList[i]);
        } else { // document
            databaseLocation = databaseLocation.doc(locationList[i]);
        }
    }
    return databaseLocation;
}

/**
 * This function adds a new Firestore document to a collection
 * reference: https://firebase.google.com/docs/firestore/quickstart
 *
 * @param {string} location - Location in the database in the form: 'COLLECTION.DOCUMENT.COLLECTION...'
 * @param {JSON} data - The data for the new document
 * @param {function} callback - Function that will be invoked to give the caller the new collection ID
 *
 * @example
 * appBackend.dbAdd("experimental.exp2.experimental2", {
 *     hello: "what"
 * }, (id) => {
 *     console.log(id);
 * });
 */
function dbAdd(location, data, callback) {
    /// Add data to our firebase storage
    let databaseLocation = getDatabaseLocation(location);
    databaseLocation.add(data).then((query) => {
        callback(query.id);
    }).catch((err) => {
        console.log(err);
    });
}

/**
 * Sets the data of a document
 * 
 * @param {string} location the period delimited path to a document
 * @param {Object} data any object data that should be assigned to the  {@link location}
 * @param {*} merge if false all data will be replaced with new {@link data} passed in
 * @param {*} callback  called when set operation is done
 */
function dbSet(location, data, merge, callback) {
    // Store on firebase if possible
    let databaseLocation = getDatabaseLocation(location);
    databaseLocation.set(data, { merge: merge }).catch((err) => {
        console.log(err);
    });
    callback();
}

/**
 * loads a card into firebase given card information 
 * @param {Object} card - an object with the following format:
 * 
 */
module.exports.loadCard = function(data) {
    dbAdd("cards", data, (docId) => {
        dbSet("cards." + docId, {cardId: docId, dateAdded: admin.firestore.Timestamp.now().toDate().toString()}, true, () => console.log("Added card!"));
    });
}