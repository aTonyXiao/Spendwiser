import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import mainStyles from '../styles/mainStyles';
import { appBackend } from '../network/backend';

async function redirectToMain() {
    navigation.navigate('Main');
}

async function redirectToLogin() {
    navigation.navigate('Login');
}

let globalDebugRedirectBasedOnLoginStatus = false;
async function handleRedirectsBasedOnLoginStatus(navigation) {
    if (globalDebugRedirectBasedOnLoginStatus) {
        if (appBackend.userLoggedIn()) {
            console.log(appBackend.getUserID());
            navigation.navigate('Main');
        } else {
            navigation.navigate('Login');
        }
    }
}

export function HomeScreen({navigation}) {
    // In the future, this will be the way everything gets decided
    // as far as navigation goes.
    // For now, you can disable redirects based on login status by
    // setting the global boolean to false
    globalDebugRedirectBasedOnLoginStatus = false;
    appBackend.onAuthStateChange(() => {
        handleRedirectsBasedOnLoginStatus(navigation);
    });
    return (
        <View style={styles.screen}>
            <Image source={require('../../assets/spendwiser_logo.png')} />
            <View style={{marginBottom: 10}}>
                <Button
                    title="Login"
                    onPress={() => navigation.navigate('Login')}
                ></Button>
            </View>
            <Button
                title="Create an Account"
                onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="Temp to Main"
                onPress={() => navigation.navigate('Main')}
            ></Button>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
