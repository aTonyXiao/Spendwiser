import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Switch, StyleSheet } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';

export function AppPermissions() {
    const [hasConstructed, setHasConstructed] = useState(false);

    const [notificationPermissions, askForNotificationPermission] =
          Permissions.usePermissions(Permissions.NOTIFICATIONS, {ask: false});
    const [photoPermissions, setPhotoPermissions] = useState(false);
    const [cameraRollPermissions, setCameraRollPermissions] = useState(false);


    // gets photo permissions
    getPhotoPermissions = async () => { 
        let permissions = await ImagePicker.getCameraPermissionsAsync();
        setPhotoPermissions(permissions.granted);
    }
    // function for toggle button
    const togglePhotoPermissions = () => {
        if (photoPermissions) {
            Alert.alert("Turn this off from the settings application");
        } else {
            getPhotoPermissions();
        }
    }

    getCameraRollPermissions = async () => { 
        let permissions = await ImagePicker.getCameraPermissionsAsync();
        setCameraRollPermissions(permissions.granted);
    }
    const toggleCameraRollPermissions = () => {
        if (cameraRollPermissions) {
            Alert.alert("Turn this off from the settings application");
        } else {
            getCameraRollPermissions();
        }
    }

    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const toggleNotifications = () => { 
        if (notificationsEnabled) { 
            Alert.alert("Notifications cannot be turned off");
        } else { 
            askForNotificationPermission();
            setNotificationsEnabled(true);
        }
    }

    // simulate constructor
    const constructor = () => { 
        if (hasConstructed) { 
            return;
        } else {
            if (notificationPermissions != undefined) { 
                setNotificationsEnabled(notificationPermissions.granted 
                    || notificationPermissions.status == 'granted');

                getCameraRollPermissions();
                getPhotoPermissions();

                setHasConstructed(true);
            }
        }
    }
    constructor();

    return (
        <View style={styles.container}>
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
                <Text>Camera Roll</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={cameraRollPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={toggleCameraRollPermissions}
                    value={cameraRollPermissions}
                />
            </View>

            <View style={styles.rowContainerTop}>
                <Text>Camera</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={photoPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={togglePhotoPermissions}
                    value={photoPermissions}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
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
