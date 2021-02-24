import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function Footer(props) { 
    const navigation = props.navigation;

    return(
        <View style={styles.footerContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                <Ionicons
                    name="home-outline"
                    color="black"
                    size={32}
                ></Ionicons>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('YourCards')}>
                <Ionicons
                    name="card-outline"
                    color="black"
                    size={32}
                ></Ionicons>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Ionicons
                    name="settings-outline"
                    color="black"
                    size={32}
                ></Ionicons>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    footerContainer : {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20
    }
})