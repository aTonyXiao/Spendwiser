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