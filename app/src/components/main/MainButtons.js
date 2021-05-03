import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export function MainButtons(
    {
        userLocation,
        region,
        setRegion,
        setModalVisible,
    }) {
    return (
        <View style={styles.buttonArea}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={{borderBottomWidth: 0.5, padding: 2}}
                    onPress={() => console.log("pressed for help")}
                >
                    <Ionicons
                        name="help-circle-outline"
                        color={'black'}
                        size={30}
                    ></Ionicons>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{borderBottomWidth: 0.5, padding: 2}}
                    onPress={() => {
                        if (userLocation.latitude !== undefined)
                            setRegion({...region, longitude: userLocation.longitude, latitude: userLocation.latitude});
                        }}
                >
                    <Ionicons
                        name="navigate-circle-outline"
                        color={'black'}
                        size={30}
                    ></Ionicons>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{padding: 2}}
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
        padding: 5,
        margin: 10,
        borderWidth: 0.5,
    },
});