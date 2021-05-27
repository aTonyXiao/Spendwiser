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
 * 
 * @param {Object} local_data particular sub-object contained within the database that can have metadata added to it
 * @param {boolean} isSynced 
 * @returns 
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

export const stripMetadata = (data) => {
    if (typeof data == 'object') {
        let stripped_data = JSON.parse(JSON.stringify(data));
        if ('meta_modified' in data) {
            delete stripped_data['meta_modified'];
        }
        if ('meta_synced' in data) {
            delete stripped_data['meta_synced'];
        }
        return stripped_data;
    } else {
        throw 'Data is not an object! ' + typeof data;
    }
}

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

const checkSyncMapping = (db, accountName, document, id) => {
    if ('sync_mappings' in db[accountName]) {
        console.log("Checking sync mappings for document: " + document + " id: " + id);
        sync_mappings = db[accountName]['sync_mappings'];
        for (let i = 0; i < sync_mappings.length; i++) {
            let mapping = sync_mappings[i];
            if (mapping['location'] == document && mapping['oldId'] == id) {
                console.log("Found " + mapping['newId']);
                return mapping['newId'];
            }
        }
        return id;
    } else {
        return id;
    }
}
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
            let [document, id] = parseDocAndId(location);
            id = checkSyncMapping(db, accountName, document, id);
            
            console.log("deleting with document: " + document + " id: " + id);
            if (accountName in db && document in db[accountName] && id in db[accountName][document]) {

                if ('unsynced_documents' in db[accountName]) {
                    db[accountName]['unsynced_documents'] = [
                        ...db[accountName]['unsynced_documents'],
                        {'location': document, 'id': id, 'type': 'delete'},
                    ];
                } else {
                    db[accountName]['unsynced_documents'] = [
                        {'location': location, 'id': id, 'type': 'delete'}
                    ]
                }

                // Remove any unsynced documents that relate to the location being deleted
                db[accountName]['unsynced_documents'] = 
                db[accountName]['unsynced_documents'].filter((doc, index, arr) => {
                    if (doc['location'] == document && doc['id'] == id) {
                        if (doc['type'] == 'delete') {
                            let item = db[accountName][document][id];
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

                delete db[accountName][document][id];
            }

            setDB(db, () => {
            });
        });
    } catch (e) {
        console.log(e);
    }
}

export const parseDocAndId = (location) => {
    // Extract the unique_id from location
    let loc = location.lastIndexOf('.');
    if (loc == -1) {
        console.log("Invalid location " + location + " in setLocalDB");
        return;
    }

    let document = location.substring(0, loc);
    let id = location.substring(loc + 1);

    return [document, id];
}

export const setLocalDB = async (accountName, location, local_data, merge = false, callback) => {
    const [document, id] = parseDocAndId(location);
    local_data = addOrUpdateMetainfo(local_data);
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Setting Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("Document: " + document);
                console.log("ID: " + id);
                console.log("----------------------");
            }

            // NOTE (Nathan W) the document **should** exist
            if (accountName in db && document in db[accountName] && id in db[accountName][document]) {
                if (merge) {
                    db[accountName][document][id] = {
                        ...db[accountName][document][id],
                        ...local_data,
                    }
                } else {
                    db[accountName][document][id] = local_data;
                }

                if ('unsynced_documents' in db[accountName]) {
                    db[accountName]['unsynced_documents'] = [
                        ...db[accountName]['unsynced_documents'],
                        {'location': document, 'id': id, 'type': 'set', 'merge': merge},
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


export const clearLocalDB = async () => {
    await AsyncStorage.removeItem("@db");
}

export const getLocalDB = async (accountName, location, ...conditionWithCallback) => {

    const [document, id] = parseDocAndId(location);
    try {
        getDB(async (db) => {
            let callback = conditionWithCallback.pop();
            let conditions = conditionWithCallback;
            if (storage_debug) {
                console.log("----------------------");
                console.log("Getting Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("Document: " + document);
                console.log("Id: " + id);
                console.log("Conditions: " + JSON.stringify(conditions));
                console.log("----------------------");
            }

            if (!(accountName in db)) {
                db[accountName] = {};
            }

            let local_data = null;
            // Normal get operation that will return one item
            if (accountName in db && document in db[accountName] && id in db[accountName][document]) {
                local_data = db[accountName][document][id];
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
                    if (mapping['location'] == document && mapping['oldId'] == id) {
                        if (accountName in db && document in db[accountName] && mapping['newId'] in db[accountName][document]) {
                            local_data = db[accountName][document][mapping['newId']];
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


            let returned_filtered_data = false;
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

export const getSubcollectionLocalDB = async (accountName, location, callback) => {
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Getting Subcollection Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("----------------------");
            }

            if (accountName in db && location in db[accountName]) {
                callback(Object.values(db[accountName][location]));
            } else {
                callback([]);
            }
        });
    } catch (e) {
        console.log(e);
    }
}

export const setSubcollectionLocalDB = async (accountName, location, dataArr, callback) => {
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Setting Subcollection Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("----------------------");
            }

            if (!(accountName in db)) {
                db[accountName] = {};
            }

            if (accountName in db && location in db[accountName]) {
                db[accountName][location] = [
                    ...db[accountName][location],
                    ...dataArr
                ]
            } else {
                db[accountName][location] = dataArr;
            }

            setDB(db, callback);
        });
    } catch (e) {
        console.log(e);
    }
}

const addDocIDMapping = (db, accountName, location, oldId, newId) => {
    if (!('sync_mappings' in db[accountName])) {
        db[accountName]['sync_mappings'] = [];
    }

    db[accountName]['sync_mappings'] = [
        ...db[accountName]['sync_mappings'],
        {'location': location, 'oldId': oldId, 'newId': newId},
    ];
} 

export const modifyDBEntryMetainfo = async (accountName, location, isSynced = false, oldId, newId, callback) => {
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Modifying Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("Old Id: " + oldId);
                console.log("New Id: " + newId);
                console.log("----------------------");
            }

            if (accountName in db && location in db[accountName] && oldId in db[accountName][location]) {
                db[accountName][location][newId] = db[accountName][location][oldId];
                db[accountName][location][newId]['meta_id'] = newId;
                delete db[accountName][location][oldId];
                let id = newId;
                db[accountName][location][id] = addOrUpdateMetainfo(db[accountName][location][id], isSynced);
                addDocIDMapping(db, accountName, location, oldId, newId);
            }

            setDB(db, () => {
                callback();
            });
        });
    } catch (e) {
        console.log(e);
    }
}

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

export const replaceUnsyncedDocumentsId = async (accountName, location, local_id, remote_id, callback) => {
    try {
        getDB((db) => {
            if (accountName in db && 'unsynced_documents' in db[accountName]) {
                let u_docs = db[accountName]['unsynced_documents'];
                for (let i = 0; i < u_docs.length; i++) {
                    let doc = u_docs[i];

                    if (doc['location'] == location && doc['id'] == local_id) {
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