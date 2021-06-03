import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

/**
 * Display buttons for main screen, including buttons for help, re-center, and store list.
 * @param {Object} obj - Object from Main Screen to be passed to Main Modals
 * @param {Object} obj.navigation - Navigation prop to redirect users to other pages
 * @param {function} obj.setUserLocation - Function in main screen to update the user's location
 * @param {Object} obj.region - Current region that the main screen's Google Map is set to
 * @param {function} obj.setRegion - Function to update the region state in main screen
 * @param {array} obj.storeArr - Function to update if the MainModals should be visible
 * @param {boolean} obj.internetState - State of the app's internet connection
 * @param {function} obj.tryToGetStoresFromLocation - Function in main screen to be called when re-centering the user's location
 * @module MainButtons
 * @see MainScreen
 * @see MainModals
 */
export function MainButtons(
    {
        navigation,
        setUserLocation,
        region,
        setRegion,
        setModalVisible,
        internetState,
        tryToGetStoresFromLocation,
    }) {
    /**
     * Function to re-center user's location on Google Maps
     * If location permission denied, shows an alert to enable permissions
     */
    async function getUserLocation() {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Denied \n Unable to retrieve location!',
                'You will not be able to re-center your location until you enable permissions.\n\n Click again after enabling to retrieve nearby stores.',
                [
                    { text: "Dismiss" },
                    {
                        text: "Enable Permissions",
                        onPress: () => navigation.navigate('Permissions'),
                    }
                ],
                { cancelable: false }
            );
        } else {
            let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Balanced});
            if (location.coords !== undefined) {
                setRegion({...region, longitude: location.coords.longitude, latitude: location.coords.latitude});
                setUserLocation(location.coords);
                tryToGetStoresFromLocation();
            }
        }
    }
    
    return (
        <View style={styles.buttonArea}>
            <View style={styles.internet}>
                <Ionicons
                    name={internetState ? "cloud-done-outline" : "cloud-offline-outline"}
                    color={'black'}
                    size={25}
                ></Ionicons>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={{borderBottomWidth: 0.5, padding: 3}}
                    // onPress={() => setHelpModalVisible(true)}
                    onPress={() => navigation.navigate('MainHelp')}
                >
                    <Ionicons
                        name="help-circle-outline"
                        color={'black'}
                        size={30}
                    ></Ionicons>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{borderBottomWidth: 0.5, padding: 3}}
                    onPress={() => getUserLocation()}
                >
                    <Ionicons
                        name="person-circle-outline"
                        color={'black'}
                        size={28}
                    ></Ionicons>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{padding: 3}}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons
                        name="search-circle-outline"
                        color={'black'}
                        size={30}
                    ></Ionicons>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonArea: {
        top: Constants.statusBarHeight,
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    internet: {
        position: 'relative',
        borderRadius: 5,
        backgroundColor: 'white',
        height: 35,
        width: 40,
        margin: 10,
        paddingHorizontal: 5,
        borderWidth: 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainer: {
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 5,
        backgroundColor: 'white',
        margin: 10,
        paddingHorizontal: 5,
        borderWidth: 0.5,
    },
});