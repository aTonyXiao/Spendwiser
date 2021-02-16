import 'expo-firestore-offline-persistence' // hacky offline persistence for expo

import * as firebase from 'firebase';
import 'firebase/firestore';
import BaseBackend from './basebackend';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';


// Internal saved state of wether a user is logged in or not
let globalUserSignedIn = false;

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

// filter the databse collection depending on the given conditions
// each condition is an array in the format of [FIELD, OPERATOR, COMPARISON]
function filterDatabaseCollection(collection, conditions) {
    let filteredCollection = collection;
    for (let i = 0; i < conditions.length; i++) {
        let condition = conditions[i];
        filteredCollection = filteredCollection.where(condition[0], condition[1], condition[2]);
    }
    return filteredCollection;
}

async function loginWithFacebook() {
    await Facebook.initializeAsync({appId: '251267389794841', });

  const { type, token } = await Facebook.logInWithReadPermissionsAsync({
    permissions: ['public_profile'],
  });

  if (type === 'success') {
    // Build Firebase credential with the Facebook access token.
    const credential = firebase.auth.FacebookAuthProvider.credential(token);

    // Sign in with credential from the Facebook user.
    firebase
      .auth()
      .signInWithCredential(credential)
      .catch(error => {
          // Handle Errors here.
          console.log("Facebook login error...");
          console.log(error)
      });
  }
}

// https://docs.expo.io/versions/latest/sdk/google/
async function loginWithGoogle() {

    // Note: Had to put the isoClientId into the Firebase Console Google Sign in Safelist
    // https://console.firebase.google.com/project/spendwiser-88be1/authentication/providers
    // This is because the project used to sign in with the expo-google-signin is different than
    // our firebase project...I think.
    const { type, accessToken, user } = await Google.logInAsync({
        iosClientId: '989741516714-hqrk7f1k8vkab4c6g8h0qai6nl1cv41f.apps.googleusercontent.com',
        iosStandaloneAppClientId: '989741516714-fqhdv9b748k8gt5tpclgt2ji79r9pj9r.apps.googleusercontent.com',
    });

    if (type === 'success') {
        const credential = firebase.auth.GoogleAuthProvider.credential(null, accessToken);
        console.log(credential);
        firebase
            .auth()
            .signInWithCredential(credential)
            .catch(error => {
                console.log("Google login error...");
                console.log(error);
            });
    }
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
        // eventually replace w/ : https://github.com/dwyl/learn-json-web-tokens
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
        this.database = firebase.firestore(); // set the database to the firestore instance

        // https://firebase.google.com/docs/auth/web/manage-users
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log("User is signed in");
                globalUserSignedIn = true;
            } else {
                console.log("User is not signed in");
                globalUserSignedIn = false;
            }
        });
    }

    /**
     * This function returns whether this Backend supports databases or not
     */
    doesSupportDatabase () {
        return true;
    }

    /**
     * This function allows the backend to keep a local copy of the database data it actively uses
     * 
     * @param {int} cacheSize - The size of the local copy of the cache in MB (leave blank for unlimited)
     * 
     */
    enableDatabaseCaching (cacheSize = -1) {
        this.database.settings({
            cacheSizeBytes: cacheSize < 0 ? firebase.firestore.CACHE_SIZE_UNLIMITED : cacheSize
        });
        this.database.enablePersistence();
    }

    /**
     * This function gets the data of a database 'document' in JSON or the all of the data of the 'document' data of a collection
     * where the callback is called for each document in the collection
     * reference: https://firebase.google.com/docs/firestore/quickstart
     *
     * @param {string} location - Location in the database in the form: 'COLLECTION.DOCUMENT.COLLECTION...'
     * @param {Array} conditions - Conditions for what documents to select from a collection, array in the form of: [FIELD, OPERATOR, COMPARISON]
     *                             (e.g. ["name", "==", "Something"] **see https://firebase.google.com/docs/firestore/query-data/queries)
     * @param {function} callback - Function that will be invoked to give the caller the data in JSON
     *
     * @example
     * appBackend.dbGet("experimental.exp2", (data) => {
     *     console.log(data);
     * });
     * 
     * @example
     * // conditions/queries can be stacked by adding more parameters after each other (before the callback)
     * appBackend.dbGet("experimental", ["hello", "==", "what2"], (data) => {
     *   console.log(data);
     * });
     */
    dbGet (location, ...conditionsWithCallback) {
        let databaseLocation = getDatabaseLocation(this.database, location);
        let callback = conditionsWithCallback.pop();
        let conditions = conditionsWithCallback;

        // filter if there are conditions
        if (conditions.length > 0) {
            databaseLocation = filterDatabaseCollection(databaseLocation, conditions);
        }

        // get the data
        databaseLocation.get().then((query) => {
            if (typeof query.get === "function") { // hacky way of checking if a doc
                callback(query.data());
            } else {
                query.forEach(doc => {
                    callback(doc.data());
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }


    // TODO: simple callback rework (data passed in as a firebase document object, could be more flexible) //
    /**
     * This function gets data for each document in a subcollection of a Firestore document. 
     * Needed because for a subcollection there is no '.data()'
     * 
     * @param {string} location - Location in the form 'COLLECTION.DOCUMENT.COLLECTION'
     * @param {function} callback - Function to be invoked on each document of a subcollection
     * 
     * @example
     * appBackend.dbGetSubCollections("users.test.cards",(data) => { 
     *  console.log(data.data());
     * })
     */
    dbGetSubCollections(location, callback) { 
        let dbloc = getDatabaseLocation(this.database, location);

        let collection = [];
        dbloc.get().then((query) => {
            query.forEach(doc => {
                collection.push(doc.data());
            })
            callback(collection);
        }).catch((err) => { 
            console.log(err);
        })
    }

    // TODO: - I kinda strayed from syntax here... is this okay?
    /** 
     *  Function returns checks if a document exists. 
     * 
     * @param {string} location - Location in the form of 'COLLECTION.DOCUMENT'
     * 
     * @returns {boolean} - true if document exists, false if not
     * 
     * @example
     * var docExists = appBackend.dbDoesDocExist("kTNvGsDcTefsM4w88bdMQoUFsEg1");
    */
    async dbDoesDocExist(userId) { 
        return new Promise((resolve, reject) => { 
            const ref = this.database.collection('users').doc(userId); // TODO change this to be a location
            ref.get().then((doc) => {
                if (!doc.exists) {
                    console.log('No such document!');
                    resolve(false);
                }

                resolve(true);
            })
        })
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

    dbDelete(location) { 
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.delete();
        // TODO this won't delete subcollections
    }

    /**
     * User sign up for an account using email and password
     * 
     * @param {string} email - a (TODO: valid?) email of a 
     * @param {string} password - a (TODO: relatively complex?) password
     * 
     * https://firebase.google.com/docs/auth/web/password-auth
     */
    signUp(email, password) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            console.log("Sign up successful")
            console.log(user);
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Unable to sign up: " + errorCode + ", " + errorMessage);
        })
    }


    
    /**
     * Use facebook account to sign in
     */
    signInWithFacebook() {
        loginWithFacebook();
    }

    /**
     * Use google account to sign in
     */
    signInWithGoogle() {
        loginWithGoogle();
    }
    

    /**
     * Sign in to an existing user account
     * @param {string} email - the email of the user account
     * @param {string} password - the password of the user account
     */
    signIn(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
                // ...
                console.log("Successful sign in...");
                return;
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;

                console.log("Failed to sign in. Error " + errorCode + ": " + errorMessage);
            });
    }

    /**
     * Sign out the currently logged in user
     */
    signOut() {
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
            console.log('Sign out successful');
            return;
        }).catch((error) => {
            // An error happened.
            // TODO: Is there a good way to handle this kind of error?
            console.log(error);
            return;
        });  
    }

    /**
     * Returns true or false depending on if the user is already logged in
     */
    userLoggedIn() {
        return globalUserSignedIn;
    }

    /**
     * Calls the supplied function if there is a change in the user's login status.
     * I.E. if a user logs in or logs out the function will be called
     * @param {requestCallback} callback - The function to callback when a user's
     * state changes
     */
    onAuthStateChange(callback) {
        firebase.auth().onAuthStateChanged(callback);
    }

    /**
     * returns a user id associated with the logged in user
     */
    getUserID() {
        let user = firebase.auth().currentUser;
        if (user != null) {
            // TODO: Some documentation states to use User.getToken() instead
            // (https://firebase.google.com/docs/auth/web/manage-users), but
            // there doesn't seem to be a function to do that in the User
            // documentation:
            // https://firebase.google.com/docs/reference/js/firebase.User#getidtoken
            return user.uid;
        }
        return null;
    }
}
