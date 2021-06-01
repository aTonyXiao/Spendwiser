import React, { useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { appBackend } from '../network/backend';
import { useIsFocused } from '@react-navigation/native';

async function redirectToMain() {
    navigation.navigate('Main');
}

async function redirectToLogin() {
    navigation.navigate('Login');
}

let globalDebugRedirectBasedOnLoginStatus = false;
async function handleRedirectsBasedOnLoginStatus(navigation) {
    if (globalDebugRedirectBasedOnLoginStatus) {
        appBackend.userLoggedIn((loggedIn) => {
            console.log("Logged in?", loggedIn);
            if (loggedIn) {
                navigation.navigate('Main');
            } else {
                navigation.navigate('Login');
            }
        });
    }
}

/**
 * This is a loading screen
 * 
 * @module LoadingScreen
 * @param {Object} props - Cool props for this module
 */
function LoadingScreen({navigation}) {
    // In the future, this will be the way everything gets decided
    // as far as navigation goes.
    // For now, you can disable redirects based on login status by
    // setting the global boolean to false
    globalDebugRedirectBasedOnLoginStatus = true;
    const isFocused = useIsFocused();

    useEffect(() => {
        appBackend.onAuthStateChange(() => {
            handleRedirectsBasedOnLoginStatus(navigation);
        });
    }, [isFocused]);

    return (
        <View style={styles.screen}>
            <Image
                style={styles.image}
                source={require('../../assets/spendwiser_logo.png')}
            />
        </View>
    );
}

export {LoadingScreen};

const styles = StyleSheet.create({
    screen : {
        backgroundColor: 'white',
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
})
