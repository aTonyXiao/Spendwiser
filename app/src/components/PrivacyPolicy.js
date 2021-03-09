import React from 'react';
import { Linking, Dimensions, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import HTML from 'react-native-render-html';
import {privacyContent} from '../privacyContent'
const width = Dimensions.get('window').width;

export function PrivacyPolicy(props) {
    const htmlPrivacy = privacyContent;

    openAppSettings = () => {
        if(Platform.OS=='ios'){
            Linking.openURL('app-settings:')
        } else{
            IntentLauncher.startActivityAsync(
            IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS
            );
        }
    }

    return(
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.button}
                onPress={() => {openAppSettings()}}
            >
            <Text>Change geolocation settings</Text>
            </TouchableOpacity>
            <ScrollView style={styles.htmlContainer}>
                <HTML source={{html: htmlPrivacy}} contentWidth={width} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: StatusBar.currentHeight,
    },
    button: {
        alignItems: "center",
        backgroundColor: "#28b573",
        padding: 10
    },
    htmlContainer: {
        padding: 10,
    },
});
