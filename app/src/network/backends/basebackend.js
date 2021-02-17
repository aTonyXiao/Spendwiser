// https://github.com/brix/crypto-js
import aes from 'crypto-js/aes';

/**
 * Base backend class for different backend types
 * Database functions are designed around the Firestore Collection/Document style
 * - Collections contain Documents
 * - Documents contain data and sometimes Collections
 * For more reference: https://firebase.google.com/docs/firestore/data-model
 */
export default class BaseBackend {
    /**
     * This function initializes the Backend
     */
    initializeApp () {
        this.privateKey = "private";
    }

    setPrivateKey (key) {
        this.privateKey = key;
    }

    /**
     * This function returns whether this Backend supports databases or not
     */
    doesSupportDatabase () {}

    /**
     * This function allows the backend to keep a local copy of the database data it actively uses
     * 
     * @param {int} cacheSize - The size of the local copy of the cache in MB (leave blank for unlimited)
     * 
     */
    enableDatabaseCaching (cacheSize) {}

    /**
     * This function gets the data of a database 'document' in JSON or the all of the data of the 'document' data of a collection
     * where the callback is called for each document in the collection
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
    dbGet (location, ...conditionsWithCallback) {}

    /**
     * This function gets data for each document in a subcollection of a 'document'. 
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
    dbGetSubCollections(location, callback) {}

    /**
     * This function sets the data of a 'document'
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
    dbSet (location, data) {}

    /**
     * This function adds a new 'document' to a 'collection'
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
    dbAdd (location, data, callback) {}

    dbGetEncrypted (location, ...conditionsWithCallback) {
        let callback = conditionsWithCallback[conditionsWithCallback.length - 1];
        conditionsWithCallback[conditionsWithCallback.length - 1] = (data) => {
            let newData = {};
            for (let key of Object.keys(data)) {
                newData[key] = aes.decrypt(JSON.stringify(data[key]), this.privateKey)
            }
            callback(newData);
        };
        this.dbGet(location, conditionsWithCallback);
    }

    dbAddEncrypted (location, data, callback) {
        let newData = {};
        for (let key of Object.keys(data)) {
            newData[key] = aes.encrypt(JSON.stringify(data[key]), this.privateKey)
        }
        console.log(newData);
    }

    /**
     * User sign up for an account using email and password
     * 
     * @param {string} email - a (TODO: valid?) email of a 
     * @param {string} password - a (TODO: relatively complex?) password
     * @param {function} error_func - called when there is an error during sign up
     */
    signUp(username, password, error_func) {}

    /**
      * Use facebook account to sign in
      */
    signInWithFacebook() {}

    /**
      * Use google account to sign in
      */
    signInWithGoogle() {}

    /**
     * Sign in to an existing user account
     * @param {string} email - the email of the user account
     * @param {string} password - the password of the user account
     * @param {function} error_func - called when there is an error during sign in
     */
    signIn(email, password, error_func) {}
        
    /**
     * Sign out the currently logged in user
     */
    signOut() {}


    /**
      * Resets the user's password.
      * @param {string} email - the email of the account to reset password
      * @param {function} error_func - called when there is an error duing password reset
      */
    resetPassword(email, return_func) {}

    /**
     * Returns true or false depending on if the user is already logged in
     */
    userLoggedIn() {}

    /**
     * Calls the supplied function if there is a change in the user's login status.
     * I.E. if a user logs in or logs out the function will be called
     * @param {requestCallback} callback - The function to callback when a user's
     * state changes
     */
    onAuthStateChange(func) {}

    /**
     * returns a user id associated with the logged in user
     */
    getUserID() {}
}