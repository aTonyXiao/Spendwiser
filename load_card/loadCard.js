const fs = require('fs');
const readline = require('readline');

const setupFirebase = () => {
    const firebaseConfig = {
        apiKey: process.env.REACT_NATIVE_API_KEY,
        authDomain: process.env.REACT_NATIVE_AUTH_DOMAIN,
        projectId: process.env.REACT_NATIVE_PROJECT_ID,
        storageBucket: process.env.REACT_NATIVE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_NATIVE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_NATIVE_APP_ID,
        measurementId: process.env.REACT_NATIVE_MEASUREMENT_ID,
    };

    // check if there is a Firebase 'App' already initialized
    if (firebase.apps.length == 0) {
        firebase.initializeApp(firebaseConfig); // if not, initialize
    } else {
        firebase.app(); //if there is, retrieve the default app
    }
    let database = firebase.firestore(); // set the database to the firestore instance

    return database
}

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


addToFirebase = (location, data, database, callback) => {
    // Add data to our firebase storage
    let databaseLocation = getDatabaseLocation(database, location);
    databaseLocation.add(data).then((query) => {
        callback(query.id);
    }).catch((err) => {
        console.log(err);
    });
}


/**
 * loads a card into firebase given card information 
 * @param {Object} card - an object with the following format:
 * 
 */
exports.load_card = function(data) {
    console.log(data)

    database = setupFirebase();

    addToFirebase("cards", data, database, () => {
        console.log('success');
    })
}