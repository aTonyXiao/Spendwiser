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

export default class FirebaseBackend extends BaseBackend {

    initializeApp () {
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.firestore();
    }

    doesSupportDatabase () {
        return true;
    }

    // This function requests data from a Firestore document
    // calls the callback w/ the document's data
    // ref: https://firebase.google.com/docs/firestore/quickstart
    // example:
    // appBackend().dbGet("collection.document", (data) => {
    //   console.log(data);
    // });
    dbGet (location, callback) {
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.get().then((query) => {
            callback(query.data());
        }).catch((err) => {
            console.log(err);
        });
    }

    // This function sets the data of a Firestore document
    // ref: https://firebase.google.com/docs/firestore/quickstart
    // example:
    // appBackend().dbSet("experimental.exp2", {
    //   hello: "what"
    // });
    dbSet (location, data) {
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.set(data).catch((err) => {
            console.log(err);
        });
    }

    // This function adds a new Firestore document, calls callback
    // with the new document id
    // ref: https://firebase.google.com/docs/firestore/quickstart
    // example:
    // appBackend().dbAdd("experimental.exp2.experimental2", {
    //   hello: "what"
    // }, (id) => {
    //   console.log(id);
    // });
    dbAdd (location, data, callback) {
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.set(data).then((query) => {
            callback(query.id);
        }).catch((err) => {
            console.log(err);
        });
    }
}