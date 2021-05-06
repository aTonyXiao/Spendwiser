import AsyncStorage from '@react-native-async-storage/async-storage';
let storage_debug = false;

export const storeLoginState = async (login_info) => {
    try {
        const jsonValue = JSON.stringify(login_info);
        await AsyncStorage.setItem('logged in', jsonValue);
    } catch (e) {
        console.log(e);
    }
}


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

dateTimeReviver = function (key, value) {
    if (typeof value === 'string') {
        if (value.startsWith("__date__")) {
            console.log("Value: " + value);
            let lastIndex = value.length - 2;
            console.log("Value lenngth: " + value.length + " Index: " + lastIndex);
            let datestr = value.substring("__date__(\"".length, lastIndex);
            console.log("Key: " + key + ", Date string: " + datestr);
            let date = new Date(datestr);
            console.log("Converted to date: " + date);
            console.log("Date type: " + typeof date);
            return date;
        } else {
            return value;
        }
    } else {
        return value;
    }
}

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

const convertDateToString = (data) => {
    for (let [key, value] of Object.entries(data)) {
        if (value instanceof Date) {
            data[key] = "__date__(" + JSON.stringify(value) + ")";
        } else if (value instanceof Object) {
            data[key] = convertDateToString(value);
        }
    }

    return data;
}
const setDB = async (data, callback) => {
    data = convertDateToString(data);
    await AsyncStorage.setItem('@db', JSON.stringify(data));
    callback();
}

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
                console.log("Data: ");
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
            const [document, id] = parseDocAndId(location);
            if (accountName in db && document in db[accountName] && id in db[accountName][document]) {
                delete db[accountName][document][id];

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

            if (!(accountName in db && document in db[accountName])) {
                callback([]);
            }

            let local_data = [];
            if (accountName in db && document in db[accountName] && id in db[accountName][document]) {
                local_data = db[accountName][document][id];
            } else if (accountName in db && location in db[accountName]) {
                local_data = Object.values(db[accountName][location]);
            }

            var comp_op = {
                '==': function (x, y) { return x == y},
                '>': function (x, y) { 
                    console.log("Comparing: " + JSON.stringify(x) + " > " + JSON.stringify(y));
                    return x > y;
                },
                '<': function (x, y) { 
                    console.log("Comparing: " + JSON.stringify(x) + " < " + JSON.stringify(y));
                    return x < y;
                },
            }

            let filtered_local_data = [];

            for (let i = 0; i < conditions.length; i++) {
                let condition = conditions[i];
                let key = condition[0];
                let op = condition[1];
                let value = condition[2];

                let conditions_met = true;
                for (let j = 0; j < local_data.length; j++) {
                    let d = local_data[j];
                    const local_dataval = d[key];

                    console.log("Transaction date: " + local_dataval);
                    console.log("Key" + key + " DB type: " + typeof local_dataval);
                        
                    if (!comp_op[op](local_dataval, value)) {
                        conditions_met = false;
                        console.log("Failed comparison")
                    } else {
                        console.log("Successful comparison")
                    }

                    if (conditions_met) {
                        filtered_local_data.push(d);
                    }
                }
            }

            if (filtered_local_data.length > 0) {
                callback(filtered_local_data);
            } else {
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