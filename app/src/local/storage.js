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

var current_unique_id = 0;
export const addLocalDB = async (accountName, location, data, callback) => {
    try {
        getDB((db) => {
            let key = accountName + "." + location;

            // Create the 'Document' if it doesn't already exist
            if (!(key in db)) {
                db[key] = {};
            }

            current_unique_id++;
            db[key][current_unique_id.toString()] = data;

            jsonValue = JSON.stringify(db);
            setDB(jsonValue);

            callback(current_unique_id.toString());
        });
    } catch (e) {
        console.log(e);
    }
}

export const setLocalDB = async (accountName, location, data, merge = false) => {
    // Extract the unique_id from location
    let loc = location.lastIndexOf('.');
    if (loc == -1) {
        console.log("Invalid location " + location + " in setLocalDB");
        return;
    }

    let document = location.substring(0, loc);
    let id = location.substring(loc + 1);

    console.log("setLocalDB Info:");
    console.log("Document: " + document);
    console.log("ID: " + id);
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