import React, {useState} from 'react';
import { View, Button, Text, Alert, StyleSheet, StatusBar } from 'react-native';
import * as Permissions from 'expo-permissions';

export function AppPermissions() {
    const [ notificationPermissions, askForNotificationPermission ] =
          Permissions.usePermissions(Permissions.NOTIFICATIONS, {ask: false});
    const [ cameraPermissions, askForCameraPermissions ] =
          Permissions.usePermissions(Permissions.CAMERA, {ask: false});

 
    return (
        <View style={styles.container}>
            <Button
                title="Notifications"
                onPress={() => {
                    console.log(notificationPermissions);
                    if (!notificationPermissions.granted || notificationPermissions.status !== 'granted') {
                        askForNotificationPermission();
                    } else {
                        Alert.alert("Notifications have already been allowed");
                    }
                }}
            />
            <View style={{height:20}} />
            <Button
                title="Camera"
                onPress={() => {
                    if (!cameraPermissions.granted || cameraPermissions.status !== 'granted') {
                        askForCameraPermissions();
                    } else {
                        Alert.alert("Camera permissions have already been allowed");
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: StatusBar.currentHeight,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
