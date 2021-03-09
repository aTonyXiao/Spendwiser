import React from 'react';
import { Linking, View, Button, Text, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export function PrivacyPolicy(props) {
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
            <Button 
                onPress={() => {openAppSettings()}}
                title="Change geolocation settings"
            />
            <Text>We have a privacy policy, but shhhhhhh it's private</Text>
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
