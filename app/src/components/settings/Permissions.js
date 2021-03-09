import React, { useState } from 'react';
import { View, Text, Alert, Switch, StyleSheet } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import * as Permissions from 'expo-permissions';

export function AppPermissions() {
    const [hasConstructed, setHasConstructed] = useState(false);

    const [notificationPermissions, askForNotificationPermission] =
          Permissions.usePermissions(Permissions.NOTIFICATIONS, {ask: false});
    const [cameraPermissions, askForCameraPermissions] =
          Permissions.usePermissions(Permissions.CAMERA, {ask: false});

    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const toggleNotifications = () => { 
        if (notificationsEnabled) { 
            Alert.alert("Notifications cannot be turned off");
        } else { 
            askForNotificationPermission();
            setNotificationsEnabled(true);
        }
    }

    const [cameraEnabled, setCameraEnabled] = useState(false);
    const toggleCamera = () => {
        if (cameraEnabled) {
            Alert.alert("Camera permissions cannot be turned off");
        } else { 
            askForCameraPermissions();
            setCameraEnabled(true);
        }
    }

    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else {
            // only do constructor if permissions both objects are loaded
            if ((notificationPermissions != undefined) 
                && (cameraPermissions != undefined)) { 
                
                    setNotificationsEnabled(notificationPermissions.granted 
                    || notificationPermissions.status == 'granted');

                setCameraEnabled(cameraPermissions.granted 
                    || cameraPermissions.status == 'granted');
    
                setHasConstructed(true);
            }
        }
    }
    constructor();

    return (
        <View style={mainStyles.container}>
            <Text style={mainStyles.large_title}>Notifications</Text>

            <View style={styles.rowContainerTop}>
                <Text>Notifications</Text>
                <Switch
                    trackColor={{false: "#767577", true: "#81b0ff"}}
                    thumbColor={notificationsEnabled ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={toggleNotifications}
                    value={notificationsEnabled}
                />
            </View>

            <View style={styles.rowContainerTop}>
                <Text>Camera</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={cameraEnabled ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={toggleCamera}
                    value={cameraEnabled}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    rowContainerTop: {
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        width: '100%', 
        padding: 20,
        paddingTop: 5,
        paddingBottom: 5,
    },
    rowContainer: {
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        width: '100%', 
        padding: 20,
        paddingTop: 5,
        paddingBottom: 5,
        borderTopWidth: 1,
        borderTopColor: 'lightgray',
    },
})
