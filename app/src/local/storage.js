import AsyncStorage from '@react-native-async-storage/async-storage';

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
        callback(jsonValue != null ? JSON.parse(jsonValue) : null);
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
    } catch(e) {
        console.log(e);
    }
}

const setDB = async (cards) => {
    await AsyncStorage.setItem('@db', cards);
    try {
        getDB((db) => {
            console.log("Updated database");
            console.log(db);
        });
    } catch(e) {
        console.log(e);
    }
}

export const addLocalDB = async (accountName, location, data, callback) => {
    try {
        getDB((db) => {
            let key = accountName + "." + location;

            // Create the 'Document' if it doesn't already exist
            if (!(key in db)) {
                db[key] = {};
            }

            let id = Object.values(db[key]).length.toString();
            db[key][id] = data;

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

    console.log("Location info Info:");
    console.log("Document: " + document);
    console.log("ID: " + id);

    return [document, id];
}

export const setLocalDB = async (accountName, location, data, merge = false) => {
    const [document, id] = parseDocAndId(location);
    try {
        getDB((db) => {
            let key = accountName + "." + document;

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
    } catch(e) {
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

            // NOTE (Nathan W) the document **should** exist
            if (key in db && id in db[key]) {
                callback(db[key][id]);
            } else {
                callback(null);
            }
        });
    } catch(e) {
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

            console.log(db[key]);
            if (key in db) {
                callback(Object.values(db[key]));
            } else {
                callback([]);
            }
        });
    } catch(e) {
        console.log(e);
    }
}