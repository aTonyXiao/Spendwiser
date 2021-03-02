import React, { useState }from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function Footer(props) { 
    const navigation = props.navigation;
    const {index, routes} = navigation.dangerouslyGetState();
    const page = routes[index].name;

    const storeInformation = props.storeInformation;

    return(
        <View style={styles.footerContainer}>
            {
                (page == 'Main') &&
                <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Ionicons
                        name="home"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>
            }
            {
                (page != 'Main') &&
                <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Ionicons
                        name="home-outline"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>
            }
            {
                (page == 'YourCards') &&
                <TouchableOpacity 
                    onPress={() => navigation.navigate('YourCards', { 
                        storeInformation: storeInformation
                    })}
                >
                    <Ionicons
                        name="card"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>
            }
            {
                (page != 'YourCards') &&
                <TouchableOpacity 
                    onPress={() => navigation.navigate('YourCards', { 
                        storeInformation: storeInformation
                    })}
                >
                    <Ionicons
                        name="card-outline"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>
            }
            {
                (page == 'Settings') &&
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Ionicons
                    name="settings"
                    color="black"
                    size={32}
                ></Ionicons>
            </TouchableOpacity>
            }
            {
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Ionicons
                        name="settings-outline"
                        color="black"
                        size={32}
                    ></Ionicons>
                </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    footerContainer : {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20,
    }
})