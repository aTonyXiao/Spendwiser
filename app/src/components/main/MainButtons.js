import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

export function MainButtons(
    {
        userLocation,
        setUserLocation,
        region,
        setRegion,
        setModalVisible,
        setHelpModalVisible,
    }) {
    async function getUserLocation() {
        let location = await Location.getCurrentPositionAsync({});
        if (location.coords !== undefined) 
            setRegion({...region, longitude: location.coords.longitude, latitude: location.coords.latitude});
        setUserLocation(location.coords);
    }
    
    return (
        <View style={styles.buttonArea}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={{borderBottomWidth: 0.5, padding: 3}}
                    onPress={() => setHelpModalVisible(true)}
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
        justifyContent: 'flex-end',
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