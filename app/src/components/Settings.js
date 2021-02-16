import React from 'react';
import { View, Button } from 'react-native';
import mainStyles from '../styles/mainStyles';
import {appBackend} from '../network/backend';

export function Settings(props) { 
    return(
        <View style={mainStyles.container}>
            <Button
                title="Tell a Friend!"
                // onPress={() => navigation.navigate('Login')}
            ></Button>
            <Button
                title="Notifications"
                // onPress={() => navigation.navigate('CreateAccount')}
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
                    appBackend.resetPassword(null, (error) => {
                        Alert.alert(
                            "Unable to Reset Password",
                            error,
                            [
                                { text: "OK", onPress: () => console.log("OK Pressed") }
                            ],
                            { cancelable: false }
                        );
                    });
                    Alert.alert(
                        "Email Sent",
                        "An email has been sent to you to reset password",
                        [
                            { text: "OK", onPress: () => console.log("OK Pressed") }
                        ],
                        { cancelable: false }
                    );
                }}
            ></Button>
            <Button
                title="Logout"
                onPress={() => {
                    appBackend.signOut();
                    props.navigation.navigate('Home');
                }}
            ></Button>
        </View>
    );
}
