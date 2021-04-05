// ref: https://github.com/brix/crypto-js
import aes from 'crypto-js/aes';
import utf8 from 'crypto-js/enc-utf8';

// can change this later
function objectToString(object) {
    return String(object);
}

/**
 * Base backend class for different backend types
 * Database functions are designed around the Firestore Collection/Document style
 * - Collections contain Documents
 * - Documents contain data and sometimes Collections
 * For more reference: https://firebase.google.com/docs/firestore/data-model
 */
class BaseBackend {

    constructor () {
        this.privateKey = "private";
    }

    /**
     * This function initializes the Backend
     */
    initializeApp () {}

    /**
     * This function sets the private key for the backend
     * 
     * @param {string} key - The new private key
     */
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
     * Function returns checks if a document exists. 
     * 
     * @param {string} location - Location in the form of 'COLLECTION.DOCUMENT'
     * 
     * @param {string} location - Location in the form 'COLLECTION.DOCUMENT.COLLECTION'
     * @param {function} callback - Called back when check is finished, parameter is set if exists or not
     * 
     * @example
     * var docExists = appBackend.dbDoesDocExist("kTNvGsDcTefsM4w88bdMQoUFsEg1", (exists) => {
     *     if (exists) console.log("Doc exists!");
     * });
    */
   dbDoesDocExist(location, callback) {}

    /**
     * This function sets the data of a 'document'
     *
     * @param {string} location - Location in the database in the form: 'COLLECTION.DOCUMENT.COLLECTION...'
     * @param {JSON} data - The data for the document
     * @param {boolean} merge - Whether to merge the new data with the current document's data
     *
     * @example
     * appBackend.dbSet("experimental.exp2", {
     *     hello: "what"
     * });
     */
    dbSet (location, data, merge = false) {}

    /**
     * This function adds a new 'document' to a 'collection'
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
    dbAdd (location, data, callback) {}

    /**
     * This function gets the data of a database 'document' in JSON or the all of the data of the 'document' data of a collection
     * where the callback is called for each document in the collection (for encrypted data)
     *
     * @param {string} location - Location in the database in the form: 'COLLECTION.DOCUMENT.COLLECTION...'
     * @param {function} callback - Function that will be invoked to give the caller the data in JSON
     *
     * @example
     * appBackend.dbGetEncrypted("experimental.exp2", (data) => {
     *     console.log(data);
     * });
     */
    dbGetEncrypted (location, callback) {
        let newCallback = (data) => {
            let newData = {};
            for (let key of Object.keys(data)) {
                newData[key] = aes.decrypt(objectToString(data[key]), this.privateKey).toString(utf8);
            }
            callback(newData);
        };
        this.dbGet(location, newCallback);
    }

    /**
     * This function sets the data of a 'document' (for encrypted data)
     *
     * @param {string} location - Location in the database in the form: 'COLLECTION.DOCUMENT.COLLECTION...'
     * @param {JSON} data - The data for the document
     * @param {boolean} merge - Whether to merge the new data with the current document's data
     *
     * @example
     * appBackend.dbSet("experimental.exp2", {
     *     hello: "what"
     * });
     */
    dbSetEncrypted (location, data, merge = false) {
        let newData = {};
        for (let key of Object.keys(data)) {
            newData[key] = aes.encrypt(objectToString(data[key]), this.privateKey).toString();
        }
        this.dbSet(location, newData, merge);
    }

    /**
     * This function adds a new 'document' to a 'collection' (for encrypted data)
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
    dbAddEncrypted (location, data, callback) {
        let newData = {};
        for (let key of Object.keys(data)) {
            newData[key] = aes.encrypt(objectToString(data[key]), this.privateKey).toString();
        }
        this.dbAdd(location, newData, callback);
    }

    /**
     * User sign up for an account using email and password
     * 
     * @param {string} email - email of a propsective user
     * @param {string} password - a password 
     * @param {function} error_func - called when there is an error during sign up 
     * (e.g. email is incorrect or password is not complicated enough)
     */
    signUp(username, password, error_func) {}

    /**
     * Sign in to an existing user account
     * 
     * @param {string} email - the email of the user account
     * @param {string} password - the password of the user account
     * @param {function} error_func - called when there is an error during sign in
     */
    signIn(email, password, error_func) {}
        
    /**
     * Sign in with an offline user account. The user will not be able to access the
     * credit card database and will only be given manual card-add functionality.
     * 
     * The onAuthStateChange function which can be supplied in @onAuthStateChange will
     * be called upon changing this login state.
     */
    signInOffline() {}

    /**
     * Sign out the currently logged in user
     */
    signOut() {}

    /**
     * @typedef {Object} LoginProviders
     * @property {?LoginAuthorizer} google - google's authentication service
     * @property {?LoginAuthorizer} facebook - facebook's authentication service
     */

    /**
     * Get the login providers that are implemented
     * 
     * @returns {LoginProviders} - object containing the backend's supported login providers
     */
    getLoginProviders() {}
    
    /**
      * Resets the user's password.
      * 
      * @param {string} email - the email of the account to reset password
      * @param {function} error_func - called when there is an error duing password reset
      */
    resetPassword(email, return_func) {}

    /**
     * Get the user's log in status
     * 
     * @param {callback} - callback function that will be called on login info retreival containing one boolean argument.
     * 
     */
    userLoggedIn(callback) {}

    /**
     * Get the user's account type
     * @param {function} callback function with one argument in which a string containing the account type will be given.
     */
    userAccountType(callback) {}

    /**
     * Calls the supplied function if there is a change in the user's login status.
     * I.E. if a user logs in or logs out the function will be called
     * 
     * @param {requestCallback} callback - The function to callback when a user's
     * state changes
     */
    onAuthStateChange(callback) {}

    /**
     * Gets a user id associated with the logged in user
     * 
     * @returns {string} - string containing the user id of the logged in user
     */
    getUserID(callback) {}

    /** 
     * @typedef {Object} UserInfo
     * @property {string} name - The name of the signed-in user
     * @property {string} email - The email of the signed-in user
     * @property {boolean} emailVerified - True if the email has been verified, false if not
     * @property {string} lastLogin - Timestamp of the last time this user has logged in
     * @property {?string} photoURL - URL of a profile photo, if there is one
     */

    /**
     * Gets all useful information about a signed in user.
     * 
     * @return {UserInfo} userInfo 
     */
    getUserInfo() {}
    /**
     * Get the current Timestamp
     */
    getTimestamp() {
        return firebase.firestore.Timestamp.now();
    }
}

export default BaseBackend;
