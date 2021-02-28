import React from 'react';
import { View, Button, Alert } from 'react-native';
import mainStyles from '../styles/mainStyles';
import { appBackend } from '../network/backend';
import * as Permissions from 'expo-permissions';

export function Settings(props) { 
    return(
        <View style={mainStyles.container}>
            <Button
                title="Tell a Friend!"
                // onPress={() => navigation.navigate('Login')}
            ></Button>
            <Button
                title="Notifications"
                onPress={() => {
                    props.navigation.navigate('Permissions');
                }}
            ></Button>
            <Button
                title="Privacy"
                // onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="Account"
                // onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="Help"
                // onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="About"
                // onPress={() => navigation.navigate('CreateAccount')}
            ></Button>
            <Button
                title="Reset Password"
                onPress={() => {
                    appBackend.resetPassword(null, (message) => {
                        Alert.alert(
                            "",
                            message,
                            [
                                { text: "OK", onPress: () => console.log("OK Pressed") }
                            ],
                            { cancelable: false }
                        );
                    });
                }}
            ></Button>
            <Button
                title="Logout"
                onPress={() => {
                    appBackend.signOut();
                    props.navigation.navigate('Login');
                }}
            ></Button>
        </View>
    );
}
