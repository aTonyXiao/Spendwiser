import 'expo-firestore-offline-persistence' // hacky offline persistence for expo

import * as firebase from 'firebase';
import 'firebase/firestore';
import BaseBackend from './basebackend';
import GoogleLogin from './firebase/google_login'
import FacebookLogin from './firebase/facebook_login'
import * as storage from '../../local/storage'

// This will be set through the onAuthStateChange function
let onAuthStateChangeCallback = null;
let syncing_items = []


/**
 * Extract the database location from the string
 */
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
 * Filter the databse collection depending on the given conditions
 * each condition is an array in the format of [FIELD, OPERATOR, COMPARISON]
 */
function filterDatabaseCollection(collection, conditions) {
    let filteredCollection = collection;
    for (let i = 0; i < conditions.length; i++) {
        let condition = conditions[i];
        filteredCollection = filteredCollection.where(condition[0], condition[1], condition[2]);
    }
    return filteredCollection;
}

/**
 * Firebase Backend designed around the Firebase Web SDK
 * Database functions are designed around the Firestore Collection/Document style
 * - Collections contain Documents
 * - Documents contain data and sometimes Collections
 * For more reference: https://firebase.google.com/docs/firestore/data-model
 */
class FirebaseBackend extends BaseBackend {
    /**
     * This function initializes the Backend
     */
    initializeApp() {
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
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                storage.storeLoginState({ 'signed_in': true, 'account_type': 'normal' });
            } else {
                // NOTE: (Nathan W) Don't overwrite login state here.
                // There may be pre-existing state where a user is logged
                // in as an offline account
            }
        });
    }

    /**
     * This function returns whether this Backend supports databases or not
     */
    doesSupportDatabase() {
        return true;
    }

    /**
     * This function allows the backend to keep a local copy of the database data it actively uses
     * 
     * @param {int} cacheSize - The size of the local copy of the cache in MB (leave blank for unlimited)
     */
    enableDatabaseCaching(cacheSize = -1) {
        try {
            this.database.settings({
                cacheSizeBytes: cacheSize < 0 ? firebase.firestore.CACHE_SIZE_UNLIMITED : cacheSize
            });
            this.database.enablePersistence()
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Look at the remote and local objects queried with a get request and attempts 
     * to consolidate both pieces of information into a single object that will be 
     * stored on both the local database and the remote database
     * @param {string} accountName 
     * @param {string} location 
     * @param {object} remote_data 
     * @param {object} local_data 
     */
    async consolidateLocalAndRemoteData(accountName, location, remote_data, local_data) {

        // Check if there are no changes b/w the two pieces of data
        if (remote_data == local_data) {
            console.log("no changes need to be made....returning");
            return new Promise((resolve, reject) => {resolve()});
        }
        
        // Check if the data exists locally at all
        else if ((typeof local_data == 'array' && local_data.isEmpty()) ||
                (Object.keys(local_data).length === 0)) {
            let [document, id] = storage.parseDocAndId(location);

            console.log("data does not exist locally...returning");
            return new Promise((resolve, reject) => {
                storage.addLocalDB(accountName, document, remote_data, (assigned_id) => {
                    storage.modifyDBEntryMetainfo(accountName, document, true, assigned_id, id, () => {
                        resolve();
                    });
                })
            });
        }

        // Check if the data locally exists, but has not been synced
        else if (local_data['meta_synced'] == false && remote_data) {
            let local_data_stripped = storage.stripMetadata(local_data);
            // The data exists locally AND remotely, but changes to the local version have
            // not been synced with the remote version

            // Update the remote data with our local changes
            console.log("data exists locally but has not been synced...returning");
            return new Promise((resolve, reject) => {
                this.dbSet(location, JSON.stringify(local_data_stripped), true, () => {
                    console.log("successful db set from consolidate");
                    let [document, old_id] = storage.parseDocAndId(location);
                    storage.modifyDBEntryMetainfo(accountName, document, true, old_id, old_id, () => {
                        console.log("resolving...");
                        resolve();
                    });
                });
            });
        } else if (local_data['meta_synced'] == false) {
            let local_data_stripped = storage.stripMetadata(local_data);
            // The remote data does not exist in any form yet.
            // Create it, then update our local data with the correct id
            console.log("data exists locally but has not been synced AND remote data does not exist...returning");
            return new Promise((resolve, reject) => {
                this.dbAdd(location, JSON.stringify(local_data_stripped), (id) => {
                    let [document, old_id] = storage.parseDocAndId(location);
                    storage.modifyDBEntryMetainfo(accountName, document, true, old_id, id, () => {
                        resolve();
                    });
                });
            })
        } else {
            console.log("no cases met....returning");
            return new Promise((resolve, reject) => {resolve()});
        }
    }


    async consolidateIndividualItem(accountName, location, local_item) {
        if (local_item['meta_synced'] == false && !syncing_items.includes(sync_id)) {
            let sync_id = JSON.stringify(local_item);
            try {
                var local_data_stripped = storage.stripMetadata(local_item);
            } catch (e) {
                console.log(e);
            }

            // Basically put a lock on the data we are syncing
            syncing_items.push(sync_id);

            return new Promise((resolve, reject) => {
                this.dbFirebaseAddWithMetadata(location, local_data_stripped, async (id) => {
                    storage.modifyDBEntryMetainfo(accountName, location, true, local_item['meta_id'], id, () => {
                        syncing_items = syncing_items.filter(item => item !== sync_id);
                        resolve();
                    });
                });
            });
        } else {
            return new Promise((resolve, reject) => {resolve()});
        }
    }

    /**
     * Consolidates a local collection with the firebase remote database by looking through
     * each item in the database, checking if it has been synced, and uploading unsynced items
     * to firebase
     * 
     * @param {string} accountName 
     * @param {string} location 
     * @param {Array} local_collection 
     */
    async consolidateLocalCollection(accountName, location, local_collection) {
        const promises = local_collection.map((item) => {console.log(item); return this.consolidateIndividualItem(accountName, location, item)});
        console.log(promises);
        await Promise.all(promises);
    }


    async consolidateRemoteCollectionDateModified(accountName, location, remote_item, local_item, remote_modified, local_modified) {
        // let sync_id = location + local_collection[j]['meta_id'];
        let sync_id = JSON.stringify(local_item);

        // If the remote item has been modified more recently AND we are not already trying to
        // sync our changes
        if (remote_modified > local_modified && !syncing_items.includes(sync_id)) {

            // Basically put a lock on the data we are syncing
            syncing_items.push(sync_id);

            return new Promise((resolve, reject) => {
                storage.setLocalDB(accountName,
                                location + "." + local_item['meta_id'],
                                remote_modified, true, () => {
                    // Unlock on the data we synced
                    syncing_items = syncing_items.filter(item => item !== sync_id);
                    storage.modifyDBEntryMetainfo(accountName, location,
                        true, local_item['meta_id'], remote_item['id'], () => {
                            resolve(true);
                        });
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                storage.modifyDBEntryMetainfo(accountName, location,
                        true, local_item['meta_id'], remote_item['id'], () => {
                            
                        resolve(true);
                });
            });
        }
    }

    async consolidateRemoteCollectionHelperHelper(accountName, location, remote_item, local_item) {
        if (remote_item['id'] == local_item['meta_id']) {
            // Note (Nathan W): Compare the remote collection item with a stripped version
            // of the local collection because we don't want to use the local item's metadata
            // in our comparison check
            // let local_data_stripped = storage.stripMetadata(local_item);

            // Note (Nathan W): Need to convert the remote string date to a date object
            // for comparison
            let remote_modified = new Date(remote_item['modified']);
            let local_modified = local_item['meta_modified'];

            return this.consolidateRemoteCollectionDateModified(accountName, location, 
                remote_item, local_item, remote_modified, local_modified);
        } else {
            return new Promise((resolve, reject) => {resolve(true)});
        }
    }

    async consolidateRemoteCollectionHelper(accountName, location, remote_item, local_collection) {
        const promises = local_collection.map((item) => {
            return this.consolidateRemoteCollectionHelperHelper(accountName, location, remote_item, item)
        });

        let values = await Promise.all(promises);
        if (values.includes('true')) {
            // Note (Nathan W): Item does not exist in our local database so we
            // need to add it and set the query id accordingly

            return new Promise((resolve, reject) => {
                storage.addLocalDB(accountName, location, remote_item, (local_id) => {
                    storage.modifyDBEntryMetainfo(accountName, location, true, local_id, remote_item['id'], () => {
                        resolve();
                    });
                });
            });
        } else {
            return new Promise((resolve, reject) => {resolve()});
        }
    }

    /**
     * Consolidates a remote collection with a local collection, making
     * changes to the local collection to match any additions/changes that occurred remotely 
     * 
     * @param {string} accountName the name of the user's account
     * @param {string} location the location/document that data can be found at
     * @param {Array} remote_collection the data retrieved from the location/document remotely from firebase
     * @param {Array} local_collection the data retrieved from the location/document locally
     */
    async consolidateRemoteCollection(accountName, location, remote_collection, local_collection) {
        // Note (Nathan W): This is very brute force, but I don't know if that's actually a problem
        const promises = remote_collection.map((item) => {
            return this.consolidateRemoteCollectionHelper(accountName, location, item, local_collection);
        });
        await Promise.all(promises);
    }

    async consolidateLocalAndRemoteCollections(accountName, location, remote_collection, local_collection) {
        // await this.consolidateLocalCollection(accountName, location, local_collection);
        // // await this.consolidateRemoteCollection(accountName, location, remote_collection, local_collection);
    }

    firebaseDbGet(location, ...conditionsWithCallback) {
        let callback = conditionsWithCallback.pop();
        let conditions = conditionsWithCallback;

        let databaseLocation = getDatabaseLocation(this.database, location);

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
            console.log("Invalid query")
            console.log(err);
            callback(null);
        });
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
    async dbGet(location, ...conditionsWithCallback) {
        // TODO (Nathan W): Check local storage first before going to the firebase db

        this.userAccountType((type) => {
            let callback = conditionsWithCallback.pop();
            let conditions = conditionsWithCallback;
            if (type == 'normal') {
                this.getUserID((accountId) => {
                    // Get the data from firebase

                    // Get the data (if any) from the local db
                    storage.getLocalDB(accountId, location, ...conditions, (local_data) => {
                        this.firebaseDbGet(location, ...conditions, async (remote_data) => {
                            console.log("Got data from firebase... consolidating...");
                            if (typeof remote_data == 'object' || typeof local_data == 'object') {
                                console.log("consolidating from a normal get");
                                await this.consolidateLocalAndRemoteData(accountId, location, remote_data, local_data);
                            } 
                            console.log("Finished consolidating...");
                            callback(remote_data);
                        });
                    })


                });
            } else {
                this.getUserID((accountId) => {
                    storage.getLocalDB(accountId, location, ...conditions, callback);
                });
            }
        })
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
     *  console.log(data);
     * })
     */
    dbGetSubCollections(location, callback) {
        // TODO (Nathan W): Check local storage first before going to the firebase db
        this.userAccountType((type) => {
            if (type == 'normal') {
                this.getUserID((accountId) => {
                    storage.getSubcollectionLocalDB(accountId, location, (local_collection) => {
                        let dbloc = getDatabaseLocation(this.database, location);

                        let remote_collection = [];
                        dbloc.get().then(async (query) => {
                            query.forEach(doc => {
                                var currentDoc = doc.data();
                                currentDoc["docId"] = doc.id;
                                remote_collection.push(currentDoc);
                            })

                            console.log("Consolidating local and remote collections from dbGetSubcollections...");
                            await this.consolidateLocalAndRemoteCollections(accountId, location, remote_collection, local_collection)

                            console.log("finsihed consolidating from dbGetSubcollections");
                            if (remote_collection.length == 0) {
                                callback(local_collection);
                            } else {
                                callback(remote_collection);
                            }
                        }).catch((err) => {
                            console.log(err);
                        })
                    });
                });
            } else {
                this.getUserID((accountId) => {
                    storage.getSubcollectionLocalDB(accountId, location, callback);
                });
            }
        })
    }

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
    dbDoesDocExist(location, callback) {
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.get().then((query) => {
            if (!query.exists) {
                console.log('No such document!');
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    /**
     * This function sets the data of a Firestore document
     * reference: https://firebase.google.com/docs/firestore/quickstart
     *
     * @param {string} location - Location in the database in the form: 'COLLECTION.DOCUMENT.COLLECTION...'
     * @param {JSON} data - The data for the new document
     * @param {boolean} merge - Whether to merge the new data with the current document's data
     *
     * @example
     * appBackend.dbSet("experimental.exp2", {
     *     hello: "what"
     * });
     */
    dbSet(location, data, merge = false, callback) {
        // TODO (Nathan W): How to handle differences in local ID and firebase ID?
        storage.getLoginState((state) => {
            this.getUserID((accountId) => {
                // Store locally
                console.log("Setting local db")
                storage.setLocalDB(accountId, location, data, merge, () => {

                    // Store on firebase if possible
                    console.log("Setting remote db")
                    let databaseLocation = getDatabaseLocation(this.database, location);
                    if (state.signed_in && !state.offline) {
                        databaseLocation.set(data, { merge: merge }).catch((err) => {
                            console.log(err);
                        });
                    }

                    callback();
                });
            });


            // TODO: (Nathan W) Store local copy as well
        })
    }

    dbFirebaseAdd(location, data, callback) {
        // Add data to our firebase storage
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.add(data).then((query) => {
            callback(query.id);
        }).catch((err) => {
            console.log(err);
        });
    }

    dbFirebaseAddWithMetadata(location, data, callback) {
        let sync_id = JSON.stringify(data);
        if (!syncing_items.includes(sync_id)) {
            syncing_items.push(sync_id);
            this.dbFirebaseAdd(location, data, (query_id) => {
                // Note (Nathan W): Add the query id as one of the keys in this item. We need it for easier data
                // consolidation between our local database and the remote one.
                this.dbSet(location + "." + query_id, {'id': query_id, 'modified': new Date()}, true, () => {
                    syncing_items = syncing_items.filter(item => item !== sync_id);
                    callback(query_id);
                });
            });
        }
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
    dbAdd(location, data, callback) {
        // Add card data to our internal storage
        this.getUserID((accountId) => {
            if (accountId != 'offline') {
                // Add data locally
                storage.addLocalDB(accountId, location, data, (local_query_id) => {
                    this.dbFirebaseAddWithMetadata(location, data, (query_id) => {
                        // We added data successfully, update our local storage metadata
                        storage.modifyDBEntryMetainfo(accountId, location, true, local_query_id, query_id, () => {
                            callback(query_id);
                        });
                    });
                });

            } else {
                storage.addLocalDB(accountId, location, data, (local_query_id) => {
                    callback(local_query_id);
                });
            }
        });
    }

    /**
     * Deletes a document at the given location
     * NOTE: this won't delete subcollections
     * 
     * @param {string} location - The document location to delete
     * 
     * @example
     * appBackend.dbDelete("users." + userId + ".cards." + docId);
     */
    dbDelete(location) {
        let databaseLocation = getDatabaseLocation(this.database, location);
        databaseLocation.delete();
    }

    /**
     * User sign up for an account using email and password
     * Reference: https://firebase.google.com/docs/auth/web/password-auth
     * 
     * @param {string} email - a (TODO: valid?) email of a 
     * @param {string} password - a (TODO: relatively complex?) password
     * @param {function} error_func - called when there is an error during sign in
     */
    signUp(email, password, error_func) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                var user = userCredential.user;
                console.log("Sign up successful");
                storage.storeLoginState({ 'signed_in': true, 'account_type': 'normal' });
            })
            .catch((error) => {
                var errorMessage = error.message;
                error_func(errorMessage);
            })
    }


    /**
     * Sign in to an existing user account
     * 
     * @param {string} email - the email of the user account
     * @param {string} password - the password of the user account
     * @param {function} error_func - called when there is an error during sign in
     */
    signIn(email, password, error_func) {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                storage.storeLoginState({ 'signed_in': true, 'account_type': 'normal' });
            })
            .catch((error) => {
                var errorMessage = error.message;
                error_func(errorMessage);
            });
    }

    /**
     * Uses the storage API to set the login state to 'logged in' and 'offline'
     */
    signInOffline() {
        storage.storeLoginState({ 'signed_in': true, 'account_type': 'offline' });
        if (onAuthStateChangeCallback) {
            console.log("calling back");
            onAuthStateChangeCallback();
        }
    }

    /**
     * Sign out the currently logged in user
     */
    signOut() {
        storage.getLoginState((state) => {
            if (state == null) return;

            if (state.signed_in && state.offline) {
                storage.storeLoginState({ 'signed_in': false, 'account_type': 'offline' });
                if (onAuthStateChangeCallback != null) {
                    onAuthStateChangeCallback();
                }
            } else {
                firebase.auth().signOut().then(() => {
                    // Sign-out successful.
                    storage.storeLoginState({ 'signed_in': false, 'account_type': 'normal' });
                    return;
                }).catch((error) => {
                    // An error happened.
                    // TODO: Is there a good way to handle this kind of error?
                    console.log(error);
                    return;
                });
            }
        });
    }

    /**
     * Get the login providers that are implemented
     */
    getLoginProviders() {
        return {
            google: new GoogleLogin(),
            facebook: new FacebookLogin(),
        };
    }

    userAccountType(callback) {
        storage.getLoginState((state) => {
            callback(state.account_type);
        })
    }

    /**
     * Resets the user's password.
     * 
     * @param {string} email - email of the user's account
     * @param {function} return_func - callback function on success and failure
     */
    resetPassword(email, return_func) {
        this.userAccountType((type) => {
            if (type == 'normal') {
                var auth = firebase.auth();
                if (email === null) {
                    var user = auth.currentUser;
                    email = user.email;
                }

                // remove leading/trailing whitespace
                email = email.trim();

                auth.sendPasswordResetEmail(email).then(function () {
                    return_func("Success! An email has been sent to reset your password");
                }).catch(function (error) {
                    return_func("Error! Invalid email address, please input a valid email");
                });
            } else {
                return_func("Error! Cannot reset the password of an offline account");
            }
        })
    }

    /**
     * Returns true or false depending on if the user is already logged in
     */
    userLoggedIn(callback) {
        storage.getLoginState((state) => {
            console.log(state);
            callback(state.signed_in);
        });
    }


    /**
     * Calls the supplied function if there is a change in the user's login status.
     * I.E. if a user logs in or logs out the function will be called
     * 
     * @param {requestCallback} callback - The function to callback when a user's
     * state changes. This can happen for a logged in user if the firebase 
     * authentication state changes. For an offline user, this is handled internally
     * and the callback function will be manually called when a login or logout function
     * is called.
     */
    onAuthStateChange(callback) {
        onAuthStateChangeCallback = callback;
        firebase.auth().onAuthStateChanged(callback);
    }

    /**
     * Returns a user id associated with the logged in user
     */
    getUserID(callback) {
        storage.getLoginState((state) => {
            if (state.account_type == 'offline') {
                callback('offline');
            } else {
                let user = firebase.auth().currentUser;
                if (user != null) {
                    // TODO: Some documentation states to use User.getToken() instead
                    // (https://firebase.google.com/docs/auth/web/manage-users), but
                    // there doesn't seem to be a function to do that in the User
                    // documentation:
                    // https://firebase.google.com/docs/reference/js/firebase.User#getidtoken
                    callback(user.uid);
                }
                return null;
            }
        });
    }

    /**
     * Get the current Timestamp
     */
    getTimestamp() {
        return firebase.firestore.Timestamp.now().toDate()
    }

    /**
     * 
     */
    getUserInfo() {
        let userData = firebase.auth().currentUser;

        return {
            name: userData.displayName,
            email: userData.email,
            emailVerified: userData.emailVerified,
            lastLogin: userData.lastLogin,
            photoURL: userData.photoURL,
        }
    }
}

export default FirebaseBackend;