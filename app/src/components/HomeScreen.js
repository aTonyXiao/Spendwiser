import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
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
    globalDebugRedirectBasedOnLoginStatus = true;
    appBackend.onAuthStateChange(() => {
        handleRedirectsBasedOnLoginStatus(navigation);
    });

    return (
        <View style={styles.screen}>
            <View style={styles.imageWrapper}>
                <Image
                    style={styles.image}
                    source={require('../../assets/spendwiser_logo.png')}
                />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.button}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                <Text style={styles.button}>Sign up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    screen : {
        backgroundColor: 'white',
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }, 
    button: {
        fontSize: 30,
        color: '#28b573',
        marginBottom: 25
    },
    imageWrapper : {
        position: 'absolute', 
        top: 35
    }
})
