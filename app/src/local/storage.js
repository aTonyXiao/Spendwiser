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
        let date_val = Date.parse(value);
        if (date_val) {
            return new Date(date_val);
        }
    }
    return value;
}

export const getDB = async (callback) => {
    try {
        const jsonValue = await AsyncStorage.getItem('@db');
        if (jsonValue != null) {
            var cards = JSON.parse(jsonValue, dateTimeReviver);
            callback(cards);
        } else {
            callback({});
        }
    } catch (e) {
        console.log(e);
    }
}

const setDB = async (cards, callback) => {
    await AsyncStorage.setItem('@db', cards);
    try {
        getDB((db) => {
            if (storage_debug)
                console.log(db);

            callback();
        });
    } catch (e) {
        console.log(e);
        callback();
    }
}

const addOrUpdateMetainfo = (local_data, isSynced = false) => {
    local_data['meta_modified'] = new Date();
    local_data['meta_synced'] = isSynced;
    return local_data;
}

export const stripMetadata = (data) => {
    let stripped_data = JSON.parse(JSON.stringify(data));
    if ('meta_modified' in data) {
        delete stripped_data['meta_modified'];
    }
    if ('meta_synced' in data) {
        delete stripped_data['meta_synced'];
    }
    return stripped_data;
}

export const addLocalDB = async (accountName, location, data, callback) => {
    // Create a copy so that we don't modify the original data
    let local_data = JSON.parse(JSON.stringify(data));

    local_data = addOrUpdateMetainfo(local_data);
    try {
        getDB(async (db) => {
            if (storage_debug) {
                console.log("----------------------");
                console.log("Adding Locally");
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("Data: ");
                console.log(local_data);
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
            let id = Object.values(db[accountName][location]).length.toString();
            db[accountName][location][id] = local_data;

            jsonValue = JSON.stringify(db);
            setDB(jsonValue, () => {
                callback(id);
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
                console.log("Data: ");
                console.log(local_data);
                console.log("----------------------");
            }

            // NOTE (Nathan W) the document **should** exist
            if (merge) {
                db[accountName][document][id] = {
                    ...db[accountName][document][id],
                    ...local_data,
                }
            } else {
                db[accountName][document][id] = local_data;
            }

            jsonValue = JSON.stringify(db);
            setDB(jsonValue, callback);
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
                console.log("----------------------");
            }

            let local_data = [];
            if (accountName in db && document in db[accountName] && id in db[accountName][document]) {
                local_data = db[accountName][document][id];
            } else if (accountName in db && location in db[accountName]) {
                local_data = Object.values(db[accountName][location]);
            }

            var comp_op = {
                '==': function (x, y) { return x == y},
                '>': function (x, y) { return x > y},
                '<': function (x, y) { return x < y},
            }

            let filtered_local_data = [];
            for (let i = 0; i < conditions.length; i++) {
                let condition = conditions[i];
                let key = condition[0];
                let op = condition[1];
                let value = condition[2];

                for (let j = 0; j < local_data.length; j++) {
                    let d = local_data[j];
                    const local_dataval = d[key];

                    // Convert to date objects if possible
                    if (typeof local_dataval == 'string') {
                        let local_dataval_date = Date.parse(local_dataval);
                        if (local_dataval_date) {
                            local_dataval = local_dataval_date;
                        }
                    }
                    if (typeof value == 'string') {
                        let value_date = Date.parse(value);
                        if (value_date) {
                            value = value_date;
                        }
                    }
                        
                    if (comp_op[op](local_dataval, value)) {
                        filtered_local_data.push(d); 
                    }
                }
            }

            if (conditions.length > 0) {
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

export const modifyDBEntryMetainfo = async (accountName, location, isSynced = false, oldId, newId) => {
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

            db[accountName][location][newId] = db[accountName][location][oldId];
            delete db[accountName][location][oldId];

            id = newId;
            db[accountName][location][id] = addOrUpdateMetainfo(db[accountName][location][id], isSynced);

            jsonValue = JSON.stringify(db);
            setDB(jsonValue, () => {

            });
        });
    } catch (e) {
        console.log(e);
    }
}

export const printLocalDB = async () => {
    try {
        getDB(async (db) => {
            console.log(db);
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
