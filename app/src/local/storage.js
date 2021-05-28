import AsyncStorage from '@react-native-async-storage/async-storage';
let storage_debug = false;

/**
 * Store the login state of the application for future use. Anything stored here can be retrieved
 * by calling getLoginState
 * 
 * @param {Object} login_info expects two items: 'signed_in' as a boolean and 'account_type' which can either be 'normal' or 'offline'
 */
export const storeLoginState = async (login_info) => {
    try {
        const jsonValue = JSON.stringify(login_info);
        await AsyncStorage.setItem('logged in', jsonValue);
    } catch (e) {
        console.log(e);
    }
}

/**
 * 
 * @param {function} callback returns an object containing a user's 'signed_in' state and their 'account_type'. 
 * See storeLoginState function to understand the possible values for each of these items.
 * @returns 
 */
export const getLoginState = async (callback) => {
    try {
        const jsonValue = await AsyncStorage.getItem('logged in')
        if (jsonValue == null) { // Default to not logged in
            callback({ 'signed_in': false, 'account_type': 'offline' });
        } else {
            callback(JSON.parse(jsonValue));
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * This function is a brute force method of converting strings stored using AsyncStorage
 * back into their origin Date object. See 'convertDateToString' function for more infromation
 * on how dates are stored internally to understand the code provided.
 * 
 * @param {any} key the key in a key-value pair of a javascript object
 * @param {any} value the value associated the key in a javascript object
 */
dateTimeReviver = function (key, value) {
    if (typeof value === 'string') {
        if (value.startsWith("__date__")) {
            let lastIndex = value.length - 2;
            let datestr = value.substring("__date__(\"".length, lastIndex);
            let date = new Date(datestr);
            return date;
        } else {
            return value;
        }
    } else {
        return value;
    }
}

/**
 * Reads the database from the phone's storage and returns the data as a javascript object.
 * NOTE: This should be the only way that the database is read from AsyncStorage. Do not try to do this any other way.
 * 
 * @param {function} callback function that accepts an object containing all of the database information
 */
export const getDB = async (callback) => {
    try {
        const jsonValue = await AsyncStorage.getItem('@db');
        if (jsonValue != null) {
            var db = JSON.parse(jsonValue, dateTimeReviver);
            callback(db);
        } else {
            callback({});
        }
    } catch (e) {
        console.log(e);
    }
}

/**
 * Converts all Date objects in the database to strings with special formatting.
 * Example: 10/26/2021 is converted to "__date__(10/26/2021)". This is necessary
 * because Date objects cannot be stored natively in JSON, which is what we need to
 * convert our database to in order to write with AsyncStorage. Therefore, we
 * need a good way of determining which strings are dates when they are read back in
 * from JSON which is done here with a very recognizable format.
 * 
 * @param {Object} db the database as a javascript object
 * @returns {db} the modified db is returned
 */
const convertDateToString = (db) => {
    for (let [key, value] of Object.entries(db)) {
        if (value instanceof Date) {
            db[key] = "__date__(" + JSON.stringify(value) + ")";
        } else if (value instanceof Object) {
            db[key] = convertDateToString(value);
        }
    }

    return db;
}

/**
 * Writes the database in its entirety to local phone storage.
 * NOTE: This should be the only way that you write the database to local storage. 
 * Do not try to do it on your own.
 * 
 * @param {Object} db the javascript object containing all the database info
 * @param {function} callback called when the data has finished being stored locally
 */
const setDB = async (db, callback) => {
    db = convertDateToString(db);
    await AsyncStorage.setItem('@db', JSON.stringify(db));
    callback();
}

/**
 * Adds or updates metainfo items of an object
 * 
 * @param {Object} local_data particular sub-object contained within the database that can have metadata added to it
 * @param {boolean} isSynced whether or not the data has been synced already with a remote database
 * @returns {Object} the modified local data
 */
const addOrUpdateMetainfo = (local_data, isSynced = false) => {
    if (local_data) {
        local_data['meta_modified'] = new Date();
        local_data['meta_synced'] = isSynced;
        return local_data;
    } else {
        return null;
    }
}

/**
 * Creates a new object with metadata items removed. The metadata items removed 
 * are the ones added in the function 'addOrUpdateMetainfo' 
 * 
 * @param {Object} db_item a particular sub-object in the database
 * @returns {Object} a new object with the metadata items removed
 */
export const stripMetadata = (db_item) => {
    if (typeof db_item == 'object') {
        let stripped_data = JSON.parse(JSON.stringify(db_item));
        if ('meta_modified' in db_item) {
            delete stripped_data['meta_modified'];
        }
        if ('meta_synced' in db_item) {
            delete stripped_data['meta_synced'];
        }
        return stripped_data;
    } else {
        throw 'Data is not an object! ' + typeof db_item;
    }
}

/**
 * Adds data to a specified collection and calls the callback function when
 * all data has finished being writen to disk
 * 
 * @param {string} accountName the name of the user's account
 * @param {string} location the period delimited location of a particular document/collection
 * @param {Object} data the data that will be added to the collection
 * @param {boolean} synced whether or not the data has already been synced with a remote database
 * @param {function} callback takes one parameter that is the id of the data added to the collection in the form of a string
 */
export const addLocalDB = async (accountName, location, data, synced, callback) => {
    // Create a copy so that we don't modify the original data
    let local_data = addOrUpdateMetainfo(data);
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Adding Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("Data: " + data);
                console.log("----------------------");
            }

            // Create account if not exists
            if (!(accountName in db)) {
                db[accountName] = {};
            }

            // Create location in account if not exists
            if (!(location in db[accountName])) {
                db[accountName][location] = {};
            }

            // Insert local_data in location
            let id = Object.values(db[accountName][location]).length

            if (synced == false) {
                if ('unsynced_documents' in db[accountName]) {
                    db[accountName]['unsynced_documents'] = [
                        ...db[accountName]['unsynced_documents'],
                        {'location': location, 'id': id, 'type': 'add'},
                    ];
                } else {
                    db[accountName]['unsynced_documents'] = [
                        {'location': location, 'id': id, 'type': 'add'}
                    ]
                }
            }

            local_data['meta_id'] = id;
            db[accountName][location][id.toString()] = local_data;

            setDB(db, () => {
                callback(id.toString());
            });
        });
    } catch (e) {
        console.log(e);
    }
}

/**
 * Determines if a document id has been modified by a sync event and returns the
 * updated id or the old id if nothing has changed
 * 
 * @param {Object} db the database in the form of a javascript object
 * @param {string} accountName the id of the user's account
 * @param {string} collection the location of the collection
 * @param {string} id the id of the data that should be accessed from the collection
 * @returns {string} the correct id of the document inside the collection
 */
const checkSyncMapping = (db, accountName, collection, id) => {
    if ('sync_mappings' in db[accountName]) {
        console.log("Checking sync mappings for document: " + collection + " id: " + id);
        sync_mappings = db[accountName]['sync_mappings'];
        for (let i = 0; i < sync_mappings.length; i++) {
            let mapping = sync_mappings[i];
            if (mapping['location'] == collection && mapping['oldId'] == id) {
                console.log("Found " + mapping['newId']);
                return mapping['newId'];
            }
        }
        return id;
    } else {
        return id;
    }
}

/**
 * Deletes data locally from the database based on the location provided
 * 
 * @param {string} accountName the id of the user's account
 * @param {string} location the period delimited string denoting the collection and document id
 */
export const deleteLocalDB = async (accountName, location) => {
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Deleting Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("----------------------");
            }
            let [collection, id] = parseCollectionAndDocId(location);
            id = checkSyncMapping(db, accountName, collection, id);
            
            console.log("deleting with document: " + collection + " id: " + id);
            if (accountName in db && collection in db[accountName] && id in db[accountName][collection]) {

                if ('unsynced_documents' in db[accountName]) {
                    db[accountName]['unsynced_documents'] = [
                        ...db[accountName]['unsynced_documents'],
                        {'location': collection, 'id': id, 'type': 'delete'},
                    ];
                } else {
                    db[accountName]['unsynced_documents'] = [
                        {'location': location, 'id': id, 'type': 'delete'}
                    ]
                }

                // Remove any unsynced documents that relate to the location being deleted
                db[accountName]['unsynced_documents'] = 
                db[accountName]['unsynced_documents'].filter((doc, index, arr) => {
                    if (doc['location'] == collection && doc['id'] == id) {
                        if (doc['type'] == 'delete') {
                            let item = db[accountName][collection][id];
                            console.log("Item at: " + doc['location'] + "." + doc['id'])
                            console.log(item);

                            if (item['meta_synced'] == false) {
                                return false; // Since this item was not synced, we can just delete it
                            } else {
                                return true; // Item WAS synced, need to perform the action remotely as well
                            }
                        } else {
                            return false; // Remove any extraneous unsynced actions on the item being deleted
                        }
                    } else {
                        return true;
                    }
                });

                delete db[accountName][collection][id];
            }

            setDB(db, () => {
            });
        });
    } catch (e) {
        console.log(e);
    }
}

/**
 * Splits a full period delimited location string into its
 * subparts: the collection path and the document id
 * 
 * @param {string} location the period delimited location of a document
 * @returns {Array} both the collection and the document id
 */
export const parseCollectionAndDocId = (location) => {
    // Extract the unique_id from location
    let loc = location.lastIndexOf('.');
    if (loc == -1) {
        console.log("Invalid location " + location + " in setLocalDB");
        return;
    }

    let collection = location.substring(0, loc);
    let id = location.substring(loc + 1);

    return [collection, id];
}

/**
 * 
 * @param {string} accountName the user's account id
 * @param {string} location the full period delimited path containing the collection and document id
 * @param {Object} local_data the data that should be set as the value for the document id
 * @param {boolean} merge whether or not to replace
 * @param {function} callback called when the data is finished being written to disk
 */
export const setLocalDB = async (accountName, location, local_data, merge = false, callback) => {
    const [collection, id] = parseCollectionAndDocId(location);
    local_data = addOrUpdateMetainfo(local_data);
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Setting Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("Document: " + collection);
                console.log("ID: " + id);
                console.log("----------------------");
            }

            // NOTE (Nathan W) the document **should** exist
            if (accountName in db && collection in db[accountName] && id in db[accountName][collection]) {
                if (merge) {
                    db[accountName][collection][id] = {
                        ...db[accountName][collection][id],
                        ...local_data,
                    }
                } else {
                    db[accountName][collection][id] = local_data;
                }

                if ('unsynced_documents' in db[accountName]) {
                    db[accountName]['unsynced_documents'] = [
                        ...db[accountName]['unsynced_documents'],
                        {'location': collection, 'id': id, 'type': 'set', 'merge': merge},
                    ];
                } else {
                    db[accountName]['unsynced_documents'] = [
                        {'location': location, 'id': id, 'type': 'set', 'merge': merge}
                    ]
                }

                setDB(db, () => {
                    callback();
                });
            }  else {
                callback();
            }

        });
    } catch (e) {
        console.log(e);
    }
}

/**
 * deletes the entire local database
 */
export const clearLocalDB = async () => {
    await AsyncStorage.removeItem("@db");
}

/**
 * returns the database item at a particular location
 * 
 * @param {string} accountName the account id of the signed in user
 * @param {string} location the period delimited path containing the collection and document id
 * @param  {...any} conditionWithCallback any filtering parameters ending with a callback function which will be called with each individual item found
 */
export const getLocalDB = async (accountName, location, ...conditionWithCallback) => {

    const [collection, id] = parseCollectionAndDocId(location);
    try {
        getDB(async (db) => {
            let callback = conditionWithCallback.pop();
            let conditions = conditionWithCallback;
            if (storage_debug) {
                console.log("----------------------");
                console.log("Getting Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("Document: " + collection);
                console.log("Id: " + id);
                console.log("Conditions: " + JSON.stringify(conditions));
                console.log("----------------------");
            }

            if (!(accountName in db)) {
                db[accountName] = {};
            }

            let local_data = null;
            // Normal get operation that will return one item
            if (accountName in db && collection in db[accountName] && id in db[accountName][collection]) {
                local_data = db[accountName][collection][id];
            }
            // Get operation that will most likely filter the data and receive a
            // callback for each item in the array that meets certain conditions
            else if (accountName in db && location in db[accountName]) {
                local_data = Object.values(db[accountName][location]);
            }
            // NOTE: Look into the db's mappings from localdb generated id's to remote generated id's that
            // have been replaced. Components can reference old id's if they are not updated after a sync
            // operation but they still want to refer to the data
            else if ('sync_mappings' in db[accountName]) {
                sync_mappings = db[accountName]['sync_mappings'];
                sync_mappings.forEach((mapping) => {
                    if (mapping['location'] == collection && mapping['oldId'] == id) {
                        if (accountName in db && collection in db[accountName] && mapping['newId'] in db[accountName][collection]) {
                            local_data = db[accountName][collection][mapping['newId']];
                        }
                    }
                });
            }

            var comp_op = {
                '==': function (x, y) { return x == y},
                '>': function (x, y) { 
                    return x > y;
                },
                '<': function (x, y) { 
                    return x < y;
                },
            }

            // NOTE (Nathan W): This was originally typeof. It stopped working???
            if (local_data instanceof Array) {
                for (let j = 0; j < local_data.length; j++) {
                    // console.log(item);
                    let item = local_data[j];
                    let conditions_met = true;
                    for (let i = 0; i < conditions.length; i++) {
                        let condition = conditions[i];
                        let key = condition[0];
                        let op = condition[1];
                        let value = condition[2];
                        var db_value = item[key];

                        if (comp_op[op](db_value, value)) {
                            conditions_met = true && conditions_met;
                        } else {
                            conditions_met = false;
                        }
                    }

                    if (conditions_met) {
                        console.log(conditions_met);
                        returned_filtered_data = true;
                        callback(item);
                    }
                }
            }

            if (conditions.length == 0) {
                callback(local_data);
            }
        });
    } catch (e) {
        console.log(e);
    }
}

/**
 * gets all the items contained within a collection
 * 
 * @param {string} accountName the user id of the signed in user
 * @param {string} collection the period delimited collection
 * @param {function} callback called with one parameter containing the array of items contained within a collection
 */
export const getSubcollectionLocalDB = async (accountName, collection, callback) => {
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Getting Subcollection Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + collection);
                console.log("----------------------");
            }

            if (accountName in db && collection in db[accountName]) {
                callback(Object.values(db[accountName][collection]));
            } else {
                callback([]);
            }
        });
    } catch (e) {
        console.log(e);
    }
}

/**
 *  takes an array of items and puts them in a the specified collection
 * 
 * @param {string} accountName the id of the currently signed in user
 * @param {string} collection the period delimited path to the collection
 * @param {Array} dataArr contains all the items that should be added to a collection
 * @param {function} callback called when the data is written to storage
 */
export const setSubcollectionLocalDB = async (accountName, collection, dataArr, callback) => {
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Setting Subcollection Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + collection);
                console.log("----------------------");
            }

            if (!(accountName in db)) {
                db[accountName] = {};
            }

            if (accountName in db && collection in db[accountName]) {
                db[accountName][collection] = [
                    ...db[accountName][collection],
                    ...dataArr
                ]
            } else {
                db[accountName][collection] = dataArr;
            }

            setDB(db, callback);
        });
    } catch (e) {
        console.log(e);
    }
}

/**
 * 
 * @param {Object} db the database read from local storage
 * @param {string} accountName the id of the currently signed in user
 * @param {string} collection the period delimited path to a collection
 * @param {string} oldId the original id of the document
 * @param {string} newId the updated id of the document
 */
const addDocIDMapping = (db, accountName, collection, oldId, newId) => {
    if (!('sync_mappings' in db[accountName])) {
        db[accountName]['sync_mappings'] = [];
    }

    db[accountName]['sync_mappings'] = [
        ...db[accountName]['sync_mappings'],
        {'location': collection, 'oldId': oldId, 'newId': newId},
    ];
} 

/**
 * Updates the metainfo of a particular item in the database
 * 
 * @param {string} accountName the user id of the signed in user
 * @param {string} collection the period delimited path of the collection
 * @param {boolean} isSynced whether or not a document has been synced with the remote database already
 * @param {string} oldId the original id of the document
 * @param {string} newId the new/updated id of the document
 * @param {function} callback called when finished writing to local storage
 */
export const modifyDBEntryMetainfo = async (accountName, collection, isSynced = false, oldId, newId, callback) => {
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Modifying Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + collection);
                console.log("Old Id: " + oldId);
                console.log("New Id: " + newId);
                console.log("----------------------");
            }

            if (accountName in db && collection in db[accountName] && oldId in db[accountName][collection]) {
                db[accountName][collection][newId] = db[accountName][collection][oldId];
                db[accountName][collection][newId]['meta_id'] = newId;
                delete db[accountName][collection][oldId];
                let id = newId;
                db[accountName][collection][id] = addOrUpdateMetainfo(db[accountName][collection][id], isSynced);
                addDocIDMapping(db, accountName, collection, oldId, newId);
            }

            setDB(db, () => {
                callback();
            });
        });
    } catch (e) {
        console.log(e);
    }
}

/**
 * Retuns all the unsynced documents that have not been pushed to the remote database
 * 
 * @param {string} accountName the user id of the signed in user
 * @param {function} callback called with one parameter containing an array of unsynced documents
 */
export const getUnsyncedDocuments = async (accountName, callback) => {
    try {
        getDB((db) => {
            if (accountName in db && 'unsynced_documents' in db[accountName]) {
                callback(db[accountName]['unsynced_documents']);
            } else {
                callback([]);
            }
        });
    } catch (e) {
        console.log(e);
        callback([]);
    }
}

/**
 * Replaces all instances of a docid within the unsynced documents array with the one generated remotely 
 * 
 * @param {string} accountName the user id of the signed in user
 * @param {string} collection the period delimited path to the collection
 * @param {string} local_id the id of the local document 
 * @param {string} remote_id the id of the remote document that corresponds to the same local document
 * @param {function} callback called when finished writing to local storage
 */
export const replaceUnsyncedDocumentsId = async (accountName, collection, local_id, remote_id, callback) => {
    try {
        getDB((db) => {
            if (accountName in db && 'unsynced_documents' in db[accountName]) {
                let u_docs = db[accountName]['unsynced_documents'];
                for (let i = 0; i < u_docs.length; i++) {
                    let doc = u_docs[i];

                    if (doc['location'] == collection && doc['id'] == local_id) {
                        doc['id'] = remote_id;
                    }
                }
                setDB(db, () => {
                    callback();
                });
            } else {
                callback();
            }
        });
    } catch (e) {
        console.log(e);
        callback();
    }
}

export const removeDocumentFromUnsyncedList = (accountName, location, id, callback) => {
    try {
        getDB((db) => {
            console.log("got the db");

            if (accountName in db && 'unsynced_documents' in db[accountName]) {
                console.log("accountName and unsynced_documents are in the db");
                let unsynced_documents = db[accountName]['unsynced_documents'];
                db[accountName]['unsynced_documents'] = unsynced_documents.filter((doc) => doc['location'] != location && doc['id'] != id);
                setDB(db, callback);
            } else {
                callback();
            }
        });
    } catch (e) {
        console.log(e);
        callback();
    }
}

export const printLocalDB = async () => {
    try {
        getDB(async (db) => {
            console.log((db));
        });
    } catch (e) {
        console.log(e);
    }
}


/**
 * Function to store local variable that keeps track of if user wants
 * to see help menu for adding card by camera
 * @param {boolean} showCameraHelpMenu - true to show, false to hide on startup
 */
export const setShowCameraHelpMenu = async (showCameraHelpMenu) => {
    try {
        const jsonValue = JSON.stringify(showCameraHelpMenu);
        await AsyncStorage.setItem('showCameraHelpMenu', jsonValue);
    } catch (e) {
        console.log(e);
    }
}

/**
 * Function to get local variable that keeps track of if user wants
 * to see help menu for adding card by camera
 * @param {function} - callback function to apply to return value
 */
export const getShowCameraHelpMenu = async (callback) => {
    try {
        const jsonValue = await AsyncStorage.getItem('showCameraHelpMenu');
        if (jsonValue == null) {
            callback(true);
        } else {
            callback(JSON.parse(jsonValue));
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}


/**
 * Function to store limits for each category
 * @param {Array<int>} categoriesLimit - limit in dollars for each category
 */
 export const storeCategoriesLimit = async (categoriesLimit) => {
    try {
        const jsonValue = JSON.stringify(categoriesLimit);
        await AsyncStorage.setItem('categoriesLimit', jsonValue);
    } catch (e) {
        console.log(e);
    }
}

/**
 * Function to get limits for each category
 * @param {function} - callback function to apply to return value
 */
 export const getCategoriesLimit = async (callback) => {
    try {
        const jsonValue = await AsyncStorage.getItem('categoriesLimit');
        if (jsonValue == null) {
            callback(null);
        } else {
            callback(JSON.parse(jsonValue));
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}