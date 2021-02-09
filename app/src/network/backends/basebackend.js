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
    initializeApp () {}

    /**
     * This function returns whether this Backend supports databases or not
     */
    doesSupportDatabase () {}

    /**
     * This function gets the data of a database 'document' in JSON
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
    dbGet (location, callback) {}

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

    /**
     * User sign up for an account using email and password
     * 
     * @param {string} email - a (TODO: valid?) email of a 
     * @param {string} password - a (TODO: relatively complex?) password
     */
    signUp(username, password) {}

    /**
     * Sign out the currently logged in user
     */
    signOut() {}
    
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
