import React from 'react';
import { View, Button, Alert, Text } from 'react-native';
import mainStyles from '../styles/mainStyles';
import { appBackend } from '../network/backend';

/**
 * Settings page that contains a plethora of navigations to different information and buttons
 * like 'Permissions', 'Privacy', etc.
 * 
 * @param {*} props - Not currently used for anything
 */
let Settings = (props) => { 
    return(
        <View style={mainStyles.container}>
            <Text style={mainStyles.large_title}>SpendWiser</Text>
            <Button
                title="Tell a Friend!"
                onPress={() => {
                    Alert.alert(
                        'Tell A Friend About Us!',
                        'Find a friend near you (use whatever transportation means are necessary) and tell them all about us. Thank you.',
                        [
                            { text: "OK" }
                        ],
                        { cancelable: false }
                    );
                }}
            ></Button>
            <Button
                title="Permissions"
                onPress={() => {
                    props.navigation.navigate('Permissions');
                }}
            ></Button>
            <Button
                title="Privacy"
                onPress={() => props.navigation.navigate('PrivacyPolicy')}
            ></Button>
            <Button
                title="Account"
                onPress={() => props.navigation.navigate('Account')}
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

export default { Settings };