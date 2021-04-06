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

export const getCards = async (callback) => {
    try {
        const jsonValue = await AsyncStorage.getItem('@cards');
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

const setCards = async (cards) => {

    await AsyncStorage.setItem('@cards', cards);
    getCards((cards) => {
        console.log("Stored cards");
        console.log(cards);
    })
}

export const addCardToAccount = async (accountName, location, cardData) => {
    try {
        getCards((cards) => {
            console.log("Here we are adding cards");
            let key = accountName + "_" + location;
            if (!(key in cards)) {
                cards[key] = [];
            }

            cards[key].push(cardData);

            /*
            console.log(cards);
            const jsonValue = JSON.stringify(cards);

            cards[accountName + "_" + location] = [cardData];
            console.log(cards);
            */
            jsonValue = JSON.stringify(cards);
            setCards(jsonValue);

        });
    } catch (e) {
        console.log(e);
    }
}