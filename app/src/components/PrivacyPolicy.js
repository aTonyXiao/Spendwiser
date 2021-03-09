import React from 'react';
import { Linking, Dimensions, ScrollView, Button, Text, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import HTML from 'react-native-render-html';
import {privacyContent} from '../privacyContent'
const width = Dimensions.get('window').width;

export function PrivacyPolicy(props) {
    const htmlPrivacy = privacyContent;

    openAppSettings = () => {
        console.log(htmlPrivacy);
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
            <Button 
                onPress={() => {openAppSettings()}}
                title="Change geolocation settings"
            />
            <ScrollView>
                <HTML source={{html: htmlPrivacy}} contentWidth={width} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: StatusBar.currentHeight,
    },
    settingsContainer: {

    }
});
