import AsyncStorage from '@react-native-async-storage/async-storage';
import { acc } from 'react-native-reanimated';

let storage_debug = true;

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

export const getDB = async (callback) => {
    try {
        const jsonValue = await AsyncStorage.getItem('@db');
        if (jsonValue != null) {
            var cards = JSON.parse(jsonValue);
            callback(cards);
        } else {
            callback({});
        }
    } catch (e) {
        console.log(e);
    }
}

const setDB = async (cards) => {
    await AsyncStorage.setItem('@db', cards);
    try {
        getDB((db) => {
            if (storage_debug)
                console.log(db);
        });
    } catch (e) {
        console.log(e);
    }
}

const addOrUpdateMetainfo = (data, isSynced = false) => {
    data['meta_modified'] = new Date();
    data['meta_synced'] = isSynced;
    return data;
}

export const addLocalDB = async (accountName, location, data, callback) => {
    data = addOrUpdateMetainfo(data);
    try {
        getDB((db) => {
            let key = accountName + "." + location;

            if (storage_debug) {
                console.log("----------------------");
                console.log("Adding Locally");
                console.log("Key: " + key);
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("----------------------");
            }

            // Create account if not exists
            if (!(accountName in db)) {
                db[accountName] = {};
            }

            // Create location in account if not exists
            barebonesLocation = location.substring(location.lastIndexOf('.') + 1);
            if (!(barebonesLocation in db[accountName])) {
                db[accountName][barebonesLocation] = {};
            }

            // Insert data in location
            let id = Object.values(db[accountName][barebonesLocation]).length.toString();
            db[accountName][barebonesLocation][id] = data;

            jsonValue = JSON.stringify(db);
            setDB(jsonValue);
            callback(id);
        });
    } catch (e) {
        console.log(e);
    }
}

const parseDocAndId = (location) => {
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

export const setLocalDB = async (accountName, location, data, merge = false) => {
    const [document, id] = parseDocAndId(location);
    data = addOrUpdateMetainfo(data);
    try {
        getDB((db) => {
            let key = accountName + "." + document;

            if (storage_debug) {
                console.log("----------------------");
                console.log("Setting Locally");
                console.log("Key: " + key);
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("----------------------");
            }

            // NOTE (Nathan W) the document **should** exist
            if (merge) {
                db[key][id] = {
                    ...db[key][id],
                    ...data,
                }
            } else {
                db[key][id] = data;
            }

            jsonValue = JSON.stringify(db);
            setDB(jsonValue);
        });
    } catch (e) {
        console.log(e);
    }
}


export const clearLocalDB = async () => {
    await AsyncStorage.removeItem("@db");
}

export const getLocalDB = async (accountName, location, callback) => {
    const [document, id] = parseDocAndId(location);
    try {
        getDB((db) => {
            let key = accountName + "." + document;

            if (storage_debug) {
                console.log("----------------------");
                console.log("Getting Locally");
                console.log("Key: " + key);
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log(db);
                console.log("----------------------");
            }

            // NOTE (Nathan W) the document **should** exist
            if (key in db && id in db[key]) {
                callback(db[key][id]);
            } else {
                callback(null);
            }
        });
    } catch (e) {
        console.log(e);
    }
}

export const getSubcollectionLocalDB = async (accountName, location, callback) => {
    location = location.substring(location.indexOf('.') + 1);
    try {
        getDB((db) => {
            // TODO: (Nathan W) Ask smarter people about why we don't need the account name here,
            // but we do for all others
            let key = location;

            if (storage_debug) {
                console.log("----------------------");
                console.log("Getting Subcollection Locally");
                console.log("Key: " + key);
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("----------------------");
            }

            if (key in db) {
                callback(Object.values(db[key]));
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
        getDB((db) => {
            let key = accountName + "." + location;

            if (storage_debug) {
                console.log("----------------------");
                console.log("Modifying Locally");
                console.log("Key: " + key);
                console.log("AccountName: " + accountName);
                console.log("Location: " + location);
                console.log("Old Id: " + oldId);
                console.log("New Id: " + newId);
                console.log("----------------------");
            }

            db[key][newId] = db[key][oldId];
            delete db[key][oldId];


            id = newId;
            db[key][id] = addOrUpdateMetainfo(db[key][id], isSynced);

            jsonValue = JSON.stringify(db);
            setDB(jsonValue);
        });
    } catch (e) {
        console.log(e);
    }
}