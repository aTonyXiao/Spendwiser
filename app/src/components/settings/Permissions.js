import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Alert, Switch, StyleSheet, Linking, AppState } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';

export function AppPermissions({}) {
    const [notificationPermissions, setNotifiationPermission] = useState(false);
    const [photoPermissions, setPhotoPermissions] = useState(false);
    const [cameraRollPermissions, setCameraRollPermissions] = useState(false);
    const [locationPermissions, setLocationPermissions] = useState(false);
    const appState = useRef(AppState.currentState);

    const handleAppStateChange = (nextAppState) => {
        if (
            appState.current.match(/background/) &&
            nextAppState === 'active'
          ) {
            console.log("Refreshing...");
            getCameraRollPermissions();
            getPhotoPermissions();
            getLocationPermissions();
            getNotificationPermissions();
          }
      
          appState.current = nextAppState;
    }

    const openAppSettings = () => {
        if(Platform.OS=='ios'){
            Linking.openURL('app-settings:')
        } else{
            IntentLauncher.startActivityAsync(
            IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS
            );
        }
    }

    // gets photo permissions
    const getPhotoPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status === 'granted') {
            setPhotoPermissions(true);
        } else {
            setPhotoPermissions(false);
        }
    }
    const getCameraRollPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status === 'granted') {
            setCameraRollPermissions(true);
        } else {
            setCameraRollPermissions(false);
        }
    }
    const getLocationPermissions = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            setLocationPermissions(true);
        } else {
            setLocationPermissions(false);
        }
    }

    const getNotificationPermissions = async () => {
        const settings = await Notifications.getPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
                allowAnnouncements: true,
              },
        });
        if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
            setNotifiationPermission(true);
        } else {
            setNotifiationPermission(false);
        }
    }

    

    useEffect(() => {
        AppState.addEventListener('change', handleAppStateChange);
        getCameraRollPermissions();
        getPhotoPermissions();
        getLocationPermissions();
        getNotificationPermissions();
        return () => {
          AppState.removeEventListener('change', handleAppStateChange);
        };
      }, []);

    return (
        <View style={styles.container}>
            <Text style={mainStyles.large_title}>Permissions</Text>

            <View style={styles.rowContainerTop}>
                <Text>Notifications</Text>
                <Switch
                    trackColor={{false: "#767577", true: "#81b0ff"}}
                    thumbColor={notificationPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={openAppSettings}
                    value={notificationPermissions}
                />
            </View>

            <View style={styles.rowContainerTop}>
                <Text>Location</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={locationPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={openAppSettings}
                    value={locationPermissions}
                />
            </View>

            <View style={styles.rowContainerTop}>
                <Text>Camera</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={photoPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={openAppSettings}
                    value={photoPermissions}
                />
            </View>

            <View style={styles.rowContainerTop}>
                <Text>Camera Roll</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={cameraRollPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={openAppSettings}
                    value={cameraRollPermissions}
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
