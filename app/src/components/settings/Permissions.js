import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Alert, Switch, StyleSheet, Linking, AppState, SafeAreaView } from 'react-native';
import mainStyles from '../../styles/mainStyles';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';
import { BackButtonHeader } from '../util/BackButtonHeader';

export function AppPermissions(props) {
    const [notificationPermissions, setNotifiationPermission] = useState(false);
    const [photoPermissions, setPhotoPermissions] = useState(false);
    const [cameraRollPermissions, setCameraRollPermissions] = useState(false);
    const [locationPermissions, setLocationPermissions] = useState(false);
    const appState = useRef(AppState.currentState);
    const trackColor = {false: "#767577", true: "#81b0ff"};

    const handleAppStateChange = (nextAppState) => {
        if (
            appState.current.match(/background/) &&
            nextAppState === 'active'
          ) {
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
        <SafeAreaView style={mainStyles.screen}>
        <BackButtonHeader navigation={props.navigation} title={"Permissions"} titleStyle={mainStyles.titleAligned} />
        <View style={[mainStyles.bodyContainer, styles.container]}>

            <View style={styles.rowContainerTop}>
                <Text>Notifications</Text>
                <Switch
                    trackColor={trackColor}
                    thumbColor={notificationPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={openAppSettings}
                    value={notificationPermissions}
                />
            </View>

            <View style={styles.rowContainerTop}>
                <Text>Location</Text>
                <Switch
                    trackColor={trackColor}
                    thumbColor={locationPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={openAppSettings}
                    value={locationPermissions}
                />
            </View>

            <View style={styles.rowContainerTop}>
                <Text>Camera</Text>
                <Switch
                    trackColor={trackColor}
                    thumbColor={photoPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={openAppSettings}
                    value={photoPermissions}
                />
            </View>

            <View style={styles.rowContainerTop}>
                <Text>Camera Roll</Text>
                <Switch
                    trackColor={trackColor}
                    thumbColor={cameraRollPermissions ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={openAppSettings}
                    value={cameraRollPermissions}
                />
            </View>
        </View>
        </SafeAreaView>
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
