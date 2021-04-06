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
}

export const addLocalDB = async (accountName, location, cardData) => {
    try {
        getDB((db) => {
            console.log("Here we are adding cards");
            let key = accountName + "_" + location;
            if (!(key in db)) {
                db[key] = [];
            }

            db[key].push(cardData);

            jsonValue = JSON.stringify(db);
            setDB(jsonValue);

        });
    } catch (e) {
        console.log(e);
    }
}