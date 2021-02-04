import * as firebase from 'firebase';
import 'firebase/firestore';

import BaseBackend from './basebackend';

// eventually replace w/ : https://github.com/dwyl/learn-json-web-tokens
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    // storageBucket: process.env.STORAGE_BUCKET,
    // messagingSenderId: process.env.MESSAGING_SENDER_ID,
    // appId: process.env.APP_ID,
    // measurementId: process.env.MEASUREMENT_ID,
};

export default class FirebaseBackend extends BaseBackend {

    initializeApp () {
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.firestore();
    }

    doesSupportDatabase () {
        return true;
    }

    queryDatabase (location, callback) {
        let locationList = location.split(".");
        let databaseLocation = this.database;
        for (let i = 0; i < locationList.length; i++) {
            if (i % 2 == 0) { // collection
                databaseLocation = databaseLocation.collection(locationList[i]);
            } else { // document
                databaseLocation = databaseLocation.doc(locationList[i]);
            }
        }
        databaseLocation.get().then((query) => {
            console.log(query);
        });
    }
}