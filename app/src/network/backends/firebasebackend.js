import * as firebase from 'firebase';
import 'firebase/firestore';

import BaseBackend from './basebackend';

// eventually replace w/ : https://github.com/dwyl/learn-json-web-tokens
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
};

// extract the database location from the string
function getDatabaseLocation(database, location) {
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
 * Firebase Backend designed around the Firebase Web SDK
 * Database functions are designed around the Firestore Collection/Document style
 * - Collections contain Documents
 * - Documents contain data and sometimes Collections
 * For more reference: https://firebase.google.com/docs/firestore/data-model
 */
export default class FirebaseBackend extends BaseBackend {

    /**
     * This function initializes the Backend
     */
    initializeApp () {
<<<<<<< HEAD
        // check if there is a Firebase 'App' already initialized
        if (firebase.apps.length == 0) {
            firebase.initializeApp(firebaseConfig); // if not, initialize
        } else {
            firebase.app(); //if there is, retrieve the default app
        }
        this.database = firebase.firestore(); // set the database to the firestore instance
=======
        !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
        this.database = firebase.firestore();
>>>>>>> main
    }

    /**
     * This function returns whether this Backend supports databases or not
     */
    doesSupportDatabase () {
        return true;
    }

    /**
     * This function gets the data of a Firestore document in JSON
     * reference: https://firebase.google.com/docs/firestore/quickstart
     *
     * @param {string} location - Location in the database in the form: 'COLLECTION.DOCUMENT.COLLECTION...'
     * @param {function} callback - Function that will be invoked to give the caller the data in JSON
     *
     * @example
     *   appBackend.dbGet("experimental.exp2", (data) => {
     *      console.log(data);
     *   });
     *
     */
    dbGet (location, callback) {
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.get().then((query) => {
            callback(query.data());
        }).catch((err) => {
            console.log(err);
        });
    }

    /**
     * This function sets the data of a Firestore document
     * reference: https://firebase.google.com/docs/firestore/quickstart
     *
     * @param {string} location - Location in the database in the form: 'COLLECTION.DOCUMENT.COLLECTION...'
     * @param {JSON} data - The data for the new document
     *
     * @example
     *   appBackend.dbSet("experimental.exp2", {
     *      hello: "what"
     *   });
     *
     */
    dbSet (location, data) {
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.set(data).catch((err) => {
            console.log(err);
        });
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
     *   appBackend.dbAdd("experimental.exp2.experimental2", {
     *      hello: "what"
     *   }, (id) => {
     *      console.log(id);
     *   });
     *
     */
    dbAdd (location, data, callback) {
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.add(data).then((query) => {
            callback(query.id);
        }).catch((err) => {
            console.log(err);
        });
    }
}